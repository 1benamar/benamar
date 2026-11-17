// Genera las cuatro páginas de servicio (diseño web, landing pages, redes sociales y SEO) con la cabecera,
// el menú y el pie de index.html. Recuperan las URL de la web antigua de benamar.es y su texto real
// (tools/servicios-texto.json, ajustado en servicios-patch.mjs; catalán y rumano en servicios-texto-ca-ro.json).
// Cada página lleva el texto en los cinco idiomas y se ve el del idioma activo.
// Uso: node tools/servicios.mjs   (volver a ejecutarlo si cambia la cabecera, el pie o los servicios de index.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { textos } from './servicios-patch.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = 'https://benamar.es/';
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const head = src.slice(0, src.indexOf('<main id="main">'));
const foot = src.slice(src.indexOf('  </main>'));
const toHome = (s) => s.replace(/href="#top"/g, 'href="./"').replace(/href="#(mundos|servicios|metodo|equipo|contacto|opiniones|cifras)"/g, 'href="./#$1"');
const ICONOS = [...src.matchAll(/<article class="svc"[^>]*>\n\s*(<svg class="svc__ico ill"[\s\S]*?<\/svg>)/g)].map((m) => m[1]);
if (ICONOS.length !== 4) throw new Error('No encuentro los cuatro dibujos de servicios en index.html');

const T = textos();
const LANGS = ['es', 'ca', 'en', 'fr', 'ro'];
const SERV = [
  { k: 'web', file: 'diseno-web-barcelona.html', c: 'es' },
  { k: 'landing', file: 'landing-pages-barcelona.html', c: 'ma' },
  { k: 'redes', file: 'gestion-redes-sociales-barcelona.html', c: 'ro' },
  { k: 'seo', file: 'posicionamiento-seo-barcelona.html', c: 'umber' },
];
const UI = {
  es: { back: 'Todos los servicios', cta: 'Pedir una propuesta', cifras: 'En cifras', otros: 'Otros servicios', fin: 'Hablemos de su proyecto.', finp: 'Cuéntenos qué necesita su negocio. Le respondemos en menos de 24 horas con una propuesta concreta.', leer: 'Leer el artículo' },
  ca: { back: 'Tots els serveis', cta: 'Demanar una proposta', cifras: 'En xifres', otros: 'Altres serveis', fin: 'Parlem del seu projecte.', finp: 'Expliqui’ns què necessita el seu negoci. Li responem en menys de 24 hores amb una proposta concreta.', leer: 'Llegir l’article' },
  en: { back: 'All services', cta: 'Request a proposal', cifras: 'In figures', otros: 'Other services', fin: 'Let’s talk about your project.', finp: 'Tell us what your business needs. We reply within 24 hours with a specific proposal.', leer: 'Read the article' },
  fr: { back: 'Tous les services', cta: 'Demander une proposition', cifras: 'En chiffres', otros: 'Autres services', fin: 'Parlons de votre projet.', finp: 'Dites-nous ce dont votre entreprise a besoin. Nous répondons en moins de 24 heures avec une proposition concrète.', leer: 'Lire l’article' },
  ro: { back: 'Toate serviciile', cta: 'Cereți o ofertă', cifras: 'În cifre', otros: 'Alte servicii', fin: 'Să vorbim despre proiectul dumneavoastră.', finp: 'Spuneți-ne de ce are nevoie afacerea dumneavoastră. Vă răspundem în mai puțin de 24 de ore cu o propunere concretă.', leer: 'Citiți articolul' },
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const n3 = (i) => '[' + String(i + 1).padStart(3, '0') + ']';
// Artículos: el catalán enlaza los de castellano y el rumano los de inglés
const postsDe = (k, l) => ({ ...T[k][l].posts, items: (T[k][l].posts.items || T[k][{ ca: 'es', ro: 'en' }[l]].posts.items) });

const titulos = {};
SERV.forEach((s, si) => {
  const url = BASE_URL + s.file;
  const es = T[s.k].es;
  titulos[s.k] = Object.fromEntries(LANGS.map((l) => [l, { t: T[s.k][l].title.replace(' — ', ' · '), d: T[s.k][l].desc }]));
  const h = toHome(head)
    .replace('<html lang="es">', `<html lang="es" data-title-key="ts_${s.k}" data-desc-key="ds_${s.k}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulos[s.k].es.t)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(es.desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(titulos[s.k].es.t)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(es.desc)}">`)
    .replace(/  <link rel="preload" as="image"[^\n]*\n/g, '')
    .replace(/  <script type="application\/ld\+json">[\s\S]*?<\/script>\n/, () => `  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: es.h1, description: es.desc, url, areaServed: ['España', 'Marruecos', 'Rumanía'], provider: { '@id': 'https://benamar.es/#organization' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'BENAMAR', item: BASE_URL }, { '@type': 'ListItem', position: 2, name: es.h1, item: url }] },
      { '@type': 'FAQPage', mainEntity: es.faq.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ],
  })}
  </script>\n`)
    .replace(/<!--\n  BENAMAR · rebranding[\s\S]*?-->\n/, `<!-- ${es.h1}: generada con tools/servicios.mjs a partir de index.html. No editar a mano. -->\n`)
    .replace(/(<nav class="hdr__nav"[\s\S]*?<a href="\.\/#servicios")/, '$1 aria-current="location"');

  const bloques = LANGS.map((l) => {
    const d = T[s.k][l], u = UI[l], posts = postsDe(s.k, l);
    const otros = SERV.filter((o) => o !== s).map((o) => `            <a class="srv-otro srv-otro--${o.c}" href="${o.file}"><span>${esc(T[o.k][l].h1)}</span><span aria-hidden="true">→</span></a>`).join('\n');
    return `      <div class="solo-idioma" data-l="${l}" lang="${l}">
        <header class="srv-hero srv--${s.c}">
          <div class="wrap srv-hero__in">
            <a class="srv-back" href="./#servicios"><span aria-hidden="true">←</span> ${u.back}</a>
            <div class="srv-hero__grid">
              <div>
                <p class="srv-tag">${n3(si)} BENAMAR · Barcelona</p>
                <h1>${esc(d.h1)}</h1>
                <p class="srv-teaser">${esc(d.teaser)}</p>
                <a class="btn btn--light srv-cta" href="./#contacto">${u.cta}</a>
              </div>
              <div class="srv-ico" aria-hidden="true">${ICONOS[si]}</div>
            </div>
          </div>
        </header>
        <section class="srv-sec srv-about">
          <div class="wrap srv-about__grid">
            <p class="srv-lead">${esc(d.lead)}</p>
            <div class="srv-about__txt">
${d.about.map((p) => `              <p>${esc(p)}</p>`).join('\n')}
            </div>
          </div>
        </section>
        <section class="srv-sec srv-cifras" aria-label="${esc(u.cifras)}">
          <ul class="wrap srv-cifras__grid">
${d.stats.map(([v, t], i) => `            <li><span class="srv-n">${n3(i)}</span><strong>${esc(v)}</strong><span>${esc(t)}</span></li>`).join('\n')}
          </ul>
        </section>
        <section class="srv-sec">
          <div class="wrap">
            <div class="srv-head"><h2>${esc(d.incluye.h)}</h2><p>${esc(d.incluye.deck)}</p></div>
            <ul class="srv-incl">
${d.incluye.items.map(([t, p], i) => `              <li><span class="srv-n">${n3(i)}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('\n')}
            </ul>
          </div>
        </section>
        <section class="srv-sec srv-quien">
          <div class="wrap">
            <div class="srv-head"><h2>${esc(d.quien.h)}</h2><p>${esc(d.quien.deck)}</p></div>
            <dl class="srv-quien__grid">
${d.quien.items.map(([t, p]) => `              <div><dt>${esc(t)}</dt><dd>${esc(p)}</dd></div>`).join('\n')}
            </dl>
          </div>
        </section>
        <section class="srv-sec">
          <div class="wrap srv-faq__grid">
            <div class="srv-head srv-head--izq"><h2>${esc(d.faq.h)}</h2><p>${esc(d.faq.deck)}</p></div>
            <div class="srv-faq">
${d.faq.items.map(([q, a]) => `              <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
            </div>
          </div>
        </section>
        <section class="srv-sec srv-posts">
          <div class="wrap">
            <div class="srv-head"><h2>${esc(posts.h)}</h2><p>${esc(posts.deck)}</p></div>
            <div class="srv-posts__list">
${posts.items.map(([href, t, p]) => `              <a class="srv-post" href="${href}"><h3>${esc(t)}</h3><p>${esc(p)}</p><span>${u.leer} →</span></a>`).join('\n')}
            </div>
          </div>
        </section>
        <section class="srv-sec srv-fin srv--${s.c}">
          <div class="wrap srv-fin__in">
            <h2>${u.fin}</h2>
            <p>${u.finp}</p>
            <a class="btn btn--light srv-cta" href="./#contacto">${u.cta}</a>
            <p class="srv-otros__t">${u.otros}</p>
            <nav class="srv-otros" aria-label="${esc(u.otros)}">
${otros}
            </nav>
          </div>
        </section>
      </div>`;
  }).join('\n');

  const main = `<main id="main" class="srv-page">\n${bloques}\n\n`;
  const pie = toHome(foot).replace(/<p class="ftr__credits">.*<\/p>\n?/, '');
  fs.writeFileSync(path.join(RAIZ, s.file), (h + main + pie).replace(/\n/g, '\r\n'));
  console.log('Escrita', s.file);
});

export const TITULOS_SERV = titulos;
