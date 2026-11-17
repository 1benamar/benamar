// Versión publicable de benamar.es en dist/: cada idioma con su propia URL (/, /ca/, /en/, /fr/, /ro/),
// el texto ya traducido en el HTML (Google lo lee sin JavaScript), hreflang entre idiomas, los artículos
// con el diseño nuevo y un sitemap con todas las páginas y sus alternativas.
// Uso: node tools/publicar.mjs   (ejecuta antes paises.mjs, legal.mjs y servicios.mjs)
// Después se copia dist/ junto con assets/, css/, js/ y favicon.svg a la carpeta de benamar.es.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const SITE = 'https://benamar.es';
const pp = path.posix;

for (const g of ['paises.mjs', 'legal.mjs', 'servicios.mjs']) execFileSync('node', [path.join(RAIZ, 'tools', g)], { stdio: 'ignore' });
fs.rmSync(DIST, { recursive: true, force: true });

const LANGS = ['es', 'ca', 'en', 'fr', 'ro'];
const DIR = { es: '/', ca: '/ca/', en: '/en/', fr: '/fr/', ro: '/ro/' };
const LOCALE = { es: 'es_ES', ca: 'ca_ES', en: 'en_GB', fr: 'fr_FR', ro: 'ro_RO' };
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(RAIZ, 'js/lang.js'), 'utf8'), ctx);
const D = { ca: ctx.window.I18N_CA, en: ctx.window.I18N_EN, fr: ctx.window.I18N_FR, ro: ctx.window.I18N_RO };

// Páginas y sus nombres por idioma (inglés y francés conservan las URL de la web antigua)
const SLUG = {
  'diseno-web-barcelona.html': { en: 'web-design-barcelona.html', fr: 'creation-site-web-barcelone.html' },
  'landing-pages-barcelona.html': { en: 'landing-pages-barcelona.html', fr: 'landing-pages-barcelone.html' },
  'gestion-redes-sociales-barcelona.html': { en: 'social-media-management-barcelona.html', fr: 'gestion-reseaux-sociaux-barcelone.html' },
  'posicionamiento-seo-barcelona.html': { en: 'seo-barcelona.html', fr: 'referencement-seo-barcelone.html' },
};
const PAGES = ['index.html', 'espana.html', 'marruecos.html', 'rumania.html', 'aviso-legal.html', 'privacidad.html', ...Object.keys(SLUG)];
const pageUrl = (lang, file) => DIR[lang] + (file === 'index.html' ? '' : ((SLUG[file] || {})[lang] || file));

// ── Utilidades de HTML ──
const read = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8').replace(/\r\n/g, '\n');
function closeOf(html, tag, from) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (m[1]) { if (--depth === 0) return { start: m.index, end: re.lastIndex }; }
    else if (!m[0].endsWith('/>')) depth++;
  }
  throw new Error('Sin cierre para <' + tag + '>');
}
// Recorre los elementos cuya etiqueta de apertura cumple test(tag); fn devuelve el HTML que los sustituye (o null)
function eachElement(html, startRe, fn) {
  const hits = [...html.matchAll(startRe)].map((m) => ({ i: m.index, e: m.index + m[0].length, tag: m[1], m }));
  for (const h of hits.reverse()) {
    const c = closeOf(html, h.tag, h.e);
    const out = fn({ open: h.m[0], inner: html.slice(h.e, c.start), close: html.slice(c.start, c.end), m: h.m });
    if (out != null) html = html.slice(0, h.i) + out + html.slice(c.end);
  }
  return html;
}
const setAttr = (tag, attr, val) => (new RegExp(`\\s${attr}="[^"]*"`).test(tag)
  ? tag.replace(new RegExp(`(\\s${attr}=")[^"]*(")`), (_, a, b) => a + val.replace(/"/g, '&quot;') + b)
  : tag.replace(/\/?>$/, (e) => ` ${attr}="${val.replace(/"/g, '&quot;')}"${e}`));
const getAttr = (tag, attr) => (tag.match(new RegExp(`\\s${attr}="([^"]*)"`)) || [])[1];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function translate(html, lang) {
  if (lang === 'es') return html;
  const d = D[lang];
  html = eachElement(html, /<([a-zA-Z][\w-]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>/g, ({ open, close, m }) => (d[m[2]] != null ? open + d[m[2]] + close : null));
  html = html.replace(/<[a-zA-Z][^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tag, spec) => {
    for (const pair of spec.split(';')) { const [a, k] = pair.split(':').map((s) => s.trim()); if (d[k] != null) tag = setAttr(tag, a, d[k]); }
    return tag;
  });
  const tk = (html.match(/<html[^>]*data-title-key="([^"]+)"/) || [])[1] || '_title';
  const dk = (html.match(/<html[^>]*data-desc-key="([^"]+)"/) || [])[1] || '_desc';
  if (d[tk]) html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(d[tk])}</title>`);
  if (d[dk]) html = html.replace(/(<meta name="description" content=")[^"]*/, (_, a) => a + esc(d[dk]));
  return html;
}
// Deja solo el bloque del idioma de la página (páginas legales y de servicio)
const strip = (html, lang) => eachElement(html, /<(div)\b[^>]*\sdata-(?:l|legal)="([a-z]{2})"[^>]*>/g, ({ m }) => (m[2] === lang ? null : ''));

// Rutas relativas: se resuelven desde la raíz del código fuente y se reescriben para la carpeta de destino
function mapPath(lang, abs) {
  if (abs === '/' || abs === '/index.html') return DIR[lang];
  const f = abs.slice(1);
  return PAGES.includes(f) ? pageUrl(lang, f) : abs;
}
function rebaseUrl(u, fromDir, toDir, lang) {
  if (!u || /^([a-z][a-z0-9+.-]*:|#|\/)/i.test(u)) return u;
  const m = u.match(/^([^?#]*)(.*)$/);
  let p = m[1];
  let abs = p === '' || p === '.' || p === './' ? fromDir : pp.join(fromDir, p) + (p.endsWith('/') && !pp.join(fromDir, p).endsWith('/') ? '/' : '');
  abs = mapPath(lang, abs);
  let rel = abs.endsWith('/') ? (pp.relative(toDir, abs) || '.') + '/' : pp.relative(toDir, abs);
  if (rel === './' && !m[2]) rel = './';
  return rel + m[2];
}
function rebase(html, fromDir, toDir, lang) {
  html = html.replace(/(\s(?:href|src|action|poster)=")([^"]*)"/g, (_, a, u) => a + rebaseUrl(u, fromDir, toDir, lang) + '"');
  html = html.replace(/(\s(?:srcset|imagesrcset)=")([^"]*)"/g, (_, a, v) => a + v.split(',').map((part) => {
    const [u, ...rest] = part.trim().split(/\s+/);
    return [rebaseUrl(u, fromDir, toDir, lang), ...rest].join(' ');
  }).join(', ') + '"');
  return html;
}
// Enlaces de idioma: botones que pasan a ser enlaces a la misma página en cada idioma
function switcher(html, lang, urlFor) {
  return eachElement(html, /<(button)\b[^>]*\sdata-lang="([a-z]{2})"[^>]*>/g, ({ inner, m }) => {
    const x = m[2];
    return `<a href="${urlFor(x)}" data-lang="${x}" hreflang="${x}" lang="${x}"${x === lang ? ' aria-current="page"' : ''}>${inner}</a>`;
  });
}
function headFor(html, lang, url, alts, ogTitle, ogDesc) {
  const esUrl = (html.match(/<link rel="canonical" href="([^"]*)">/) || [])[1];
  if (esUrl && esUrl !== url) html = html.split(esUrl + '"').join(url + '"');
  html = html.replace(/<html lang="[a-z]{2}"/, `<html lang="${lang}"`)
    .replace(/(<link rel="canonical" href=")[^"]*(">)/, (_, a, b) => a + url + b)
    .replace(/(<meta property="og:url" content=")[^"]*/, (_, a) => a + url)
    .replace(/(<meta property="og:locale" content=")[^"]*/, (_, a) => a + LOCALE[lang])
    .replace(/(<meta property="og:title" content=")[^"]*/, (_, a) => a + esc(ogTitle))
    .replace(/(<meta property="og:description" content=")[^"]*/, (_, a) => a + esc(ogDesc))
    .replace(/(<script src="[^"]*i18n\.js[^"]*"[^>]*data-base=")[^"]*("[^>]*data-langs=")[^"]*/, (_, a, b) => a + lang + b + lang);
  const links = Object.entries(alts).map(([l, u]) => `  <link rel="alternate" hreflang="${l}" href="${u}">`).join('\n');
  return html.replace(/(  <link rel="canonical"[^\n]*\n)/, (l) => l + links + '\n');
}
const titleOf = (html) => (html.match(/<title>([^<]*)<\/title>/) || [])[1].replace(/&amp;/g, '&');
const descOf = (html) => (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
const write = (rootPath, html) => {
  const f = path.join(DIST, rootPath.endsWith('/') ? rootPath + 'index.html' : rootPath);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html.replace(/\n/g, '\r\n'));
};

const SITEMAP = [];
// ── Páginas de la web en los cinco idiomas ──
for (const file of PAGES) {
  const src = read(file);
  const alts = Object.fromEntries([...LANGS.map((l) => [l, SITE + pageUrl(l, file)]), ['x-default', SITE + pageUrl('es', file)]]);
  for (const lang of LANGS) {
    const url = SITE + pageUrl(lang, file);
    let h = strip(translate(src, lang), lang);
    h = headFor(h, lang, url, alts, titleOf(h), descOf(h));
    h = rebase(h, '/', DIR[lang], lang);
    h = switcher(h, lang, (x) => pageUrl(x, file));
    write(pageUrl(lang, file), h);
  }
  SITEMAP.push(alts);
}

// ── Artículos con el diseño nuevo (texto de la web antigua, en castellano, inglés y francés) ──
const VIEJOS = path.join(RAIZ, '_fuentes/articulos-viejos');
const ART_DIR = { es: '/articulos/', en: '/en/articles/', fr: '/fr/articles/' };
const SRV_DE = { 'landing-page-o-web-corporativa': 'landing-pages-barcelona.html', 'cuanto-tarda-el-seo-en-dar-resultados': 'posicionamiento-seo-barcelona.html', 'por-que-las-redes-de-su-negocio-se-quedan-paradas': 'gestion-redes-sociales-barcelona.html', 'que-debe-tener-la-web-de-una-empresa': 'diseno-web-barcelona.html' };
const COLOR = { 'diseno-web-barcelona.html': 'es', 'landing-pages-barcelona.html': 'ma', 'gestion-redes-sociales-barcelona.html': 'ro', 'posicionamiento-seo-barcelona.html': 'umber' };
// Plazos al día con la web (17-11-2026)
const PARCHE = { es: [['entre tres y seis meses', 'entre uno y tres meses'], ['dos y cuatro semanas', 'una y dos semanas']], en: [['between three and six months', 'between one and three months'], ['two and four weeks', 'one and two weeks']], fr: [['entre trois et six mois', 'entre un et trois mois'], ['de trois à six mois', 'd’un à trois mois'], ['deux et quatre semaines', 'une et deux semaines']] };
const AUI = {
  es: { back: 'Todos los artículos', srvT: '¿Le ayudamos con esto?', srvV: 'Ver el servicio', cta: 'Pedir una propuesta', mas: 'Más artículos', leer: 'Leer el artículo', tag: 'Artículos' },
  en: { back: 'All articles', srvT: 'Shall we help you with this?', srvV: 'See the service', cta: 'Request a proposal', mas: 'More articles', leer: 'Read the article', tag: 'Articles' },
  fr: { back: 'Tous les articles', srvT: 'On vous aide sur ce sujet ?', srvV: 'Voir le service', cta: 'Demander une proposition', mas: 'Plus d’articles', leer: 'Lire l’article', tag: 'Articles' },
};
const txt = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const ART = { es: [], en: [], fr: [] };
for (const lang of ['es', 'en', 'fr']) {
  const dir = path.join(VIEJOS, ART_DIR[lang]);
  for (const f of fs.readdirSync(dir).filter((x) => x !== 'index.html')) {
    let s = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    for (const [a, b] of PARCHE[lang]) s = s.split(a).join(b);
    const alt = Object.fromEntries([...s.matchAll(/hreflang="([a-z-]+)" href="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const esSlug = alt.es.split('/').pop().replace('.html', '');
    const body = eachElement(s, /<(div) class="post-body"[^>]*>/g, ({ inner }) => `@@BODY@@${inner}@@BODY@@`).split('@@BODY@@')[1];
    const img = s.match(/<figure class="post-figure">\s*(<img [^>]*>)/)[1];
    ART[lang].push({
      file: f, url: ART_DIR[lang] + f, alt, srv: SRV_DE[esSlug],
      title: txt(s.match(/<title>([^<]*)/)[1]).replace(/ — BENAMAR$/, ''), desc: s.match(/name="description" content="([^"]*)"/)[1],
      h1: txt(s.match(/<h1 class="post-title"[^>]*>([\s\S]*?)<\/h1>/)[1]), lead: txt(s.match(/<p class="post-lead"[^>]*>([\s\S]*?)<\/p>/)[1]),
      cat: txt(s.match(/<span class="post-category">([^<]*)/)[1]), date: s.match(/<time datetime="([^"]*)">([^<]*)<\/time>/).slice(1, 3),
      mins: txt((s.match(/<p class="post-meta">[\s\S]*?<\/time>[\s\S]*?<\/span>([^<]*)<\/p>/) || [])[1] || ''),
      img: getAttr(img, 'src'), imgAlt: getAttr(img, 'alt'), w: getAttr(img, 'width'), h: getAttr(img, 'height'), body: body.trim(),
    });
  }
}
const shellSrc = read('index.html');
function shell(lang, title, desc, url, alts, ld) {
  let h = translate(shellSrc, lang);
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`).replace(/(<meta name="description" content=")[^"]*/, (_, a) => a + esc(desc))
    .replace(/  <link rel="preload" as="image"[^\n]*\n/g, '')
    .replace(/  <script type="application\/ld\+json">[\s\S]*?<\/script>\n/, () => `  <script type="application/ld+json">\n  ${JSON.stringify(ld)}\n  </script>\n`)
    .replace(/<!--\n  BENAMAR · rebranding[\s\S]*?-->\n/, '<!-- Artículo: generado con tools/publicar.mjs. No editar a mano. -->\n')
    .replace(/<html lang="es"[^>]*>/, '<html lang="es">');
  h = headFor(h, lang, url, alts, title, desc);
  const head = h.slice(0, h.indexOf('<main id="main">'));
  const foot = h.slice(h.indexOf('  </main>')).replace(/<p class="ftr__credits">.*<\/p>\n?/, '');
  return { head, foot };
}
const card = (a, u) => `          <a class="art-card" href="${a.url.slice(1)}">
            <img src="${a.img}" alt="${esc(a.imgAlt)}" width="${a.w}" height="${a.h}" loading="lazy" decoding="async">
            <span class="art-card__t"><span class="art-card__cat">[${esc(a.cat)}]</span><span class="art-card__h">${esc(a.h1)}</span><span class="art-card__p">${esc(a.lead)}</span><span class="art-card__go">${u.leer} →</span></span>
          </a>`;
const ARTSITE = [];
for (const lang of ['es', 'en', 'fr']) {
  const u = AUI[lang];
  for (const a of ART[lang]) {
    const url = SITE + a.url;
    // Títulos orientados a cómo pregunta la gente en Google (Search Console, 17-11-2026)
    const TIT = { 'cuanto-tarda-el-seo-en-dar-resultados.html': 'Cuánto tarda en posicionarse una web en Google' };
    if (TIT[a.file]) a.title = TIT[a.file];
    const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: a.h1, description: a.desc, image: SITE + a.img, datePublished: a.date[0], inLanguage: lang, mainEntityOfPage: url, author: { '@type': 'Organization', name: 'BENAMAR', url: SITE + '/' }, publisher: { '@id': SITE + '/#organization' } };
    const { head, foot } = shell(lang, (a.title + ' · BENAMAR').length > 60 ? a.title : a.title + ' · BENAMAR', a.desc, url, a.alt, ld);
    const srvName = (D[lang] || {})[`ts_${{ 'diseno-web-barcelona.html': 'web', 'landing-pages-barcelona.html': 'landing', 'gestion-redes-sociales-barcelona.html': 'redes', 'posicionamiento-seo-barcelona.html': 'seo' }[a.srv]}`];
    const srvTitulo = (srvName || read(a.srv).match(/<title>([^<]*)/)[1]).replace(/ · BENAMAR$/, '').replace(/ en Barcelona$| in Barcelona$| à Barcelone$/, '');
    const otros = ART[lang].filter((o) => o !== a).map((o) => card(o, u)).join('\n');
    const main = `<main id="main">

    <article class="art">
      <div class="wrap">
        <a class="legal__back" href="${ART_DIR[lang].slice(1)}"><span aria-hidden="true">←</span> ${u.back}</a>
        <header class="art__head">
          <p class="legal__tag">[${esc(a.cat)}]</p>
          <h1>${esc(a.h1)}</h1>
          <p class="legal__lead">${esc(a.lead)}</p>
          <p class="art__meta"><time datetime="${a.date[0]}">${esc(a.date[1])}</time> · ${esc(a.mins)}</p>
        </header>
        <figure class="art__fig"><img src="${a.img}" alt="${esc(a.imgAlt)}" width="${a.w}" height="${a.h}" fetchpriority="high" decoding="async"></figure>
        <div class="art__body">
${a.body}
        </div>
        <aside class="art__srv srv--${COLOR[a.srv]}">
          <p class="srv-tag">${u.srvT}</p>
          <p class="art__srv-h">${esc(srvTitulo)}</p>
          <div class="art__srv-cta"><a class="btn btn--light" href="./#contacto">${u.cta}</a><a class="art__srv-link" href="${a.srv}">${u.srvV} →</a></div>
        </aside>
      </div>
    </article>

    <section class="art-mas">
      <div class="wrap">
        <h2>${u.mas}</h2>
        <div class="art-grid">
${otros}
        </div>
      </div>
    </section>

`;
    let h = rebase(head + main + foot, '/', ART_DIR[lang], lang);
    h = switcher(h, lang, (x) => (a.alt[x] ? a.alt[x].replace(SITE, '') : DIR[x]));
    write(a.url, h);
    ARTSITE.push(a.alt);
  }
  // Índice de artículos de cada idioma
  const old = fs.readFileSync(path.join(VIEJOS, ART_DIR[lang], 'index.html'), 'utf8');
  const alt = Object.fromEntries([...old.matchAll(/hreflang="([a-z-]+)" href="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const t = txt(old.match(/<title>([^<]*)/)[1]).replace(/ — BENAMAR$/, '');
  const d = old.match(/name="description" content="([^"]*)"/)[1];
  const h1 = txt(old.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
  const deck = txt(old.match(/<p class="section-deck"[^>]*>([\s\S]*?)<\/p>/)[1]);
  const url = SITE + ART_DIR[lang];
  const { head, foot } = shell(lang, t + ' · BENAMAR', d, url, alt, { '@context': 'https://schema.org', '@type': 'CollectionPage', name: t, url, inLanguage: lang });
  const main = `<main id="main">

    <section class="art art--idx">
      <div class="wrap">
        <header class="art__head">
          <p class="legal__tag">[${u.tag}]</p>
          <h1>${esc(h1)}</h1>
          <p class="legal__lead">${esc(deck)}</p>
        </header>
        <div class="art-grid art-grid--idx">
${ART[lang].map((a) => card(a, u)).join('\n')}
        </div>
      </div>
    </section>

`;
  let h = rebase(head + main + foot, '/', ART_DIR[lang], lang);
  h = switcher(h, lang, (x) => (alt[x] ? alt[x].replace(SITE, '') : DIR[x]));
  write(ART_DIR[lang], h);
  ARTSITE.push(alt);
}

// ── Sitemap con hreflang ──
const hoy = new Date().toISOString().slice(0, 10);
const urls = [], vistas = new Set();
for (const alts of [...SITEMAP, ...ARTSITE]) {
  for (const [l, u] of Object.entries(alts)) {
    if (l === 'x-default' || vistas.has(u)) continue;
    vistas.add(u);
    urls.push(`  <url>\n    <loc>${u}</loc>\n    <lastmod>${hoy}</lastmod>\n${Object.entries(alts).map(([x, v]) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${v}"/>`).join('\n')}\n  </url>`);
  }
}
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
console.log('dist listo:', urls.length, 'URL en el sitemap');
