// Genera espana.html, marruecos.html y rumania.html a partir de index.html:
// misma cabecera, menú, pie y scripts; en medio, el apartado del país (centrado, con su bandera),
// la foto de su ciudad, sus datos, los servicios con sus dibujos y los otros dos países.
// Uso: node tools/paises.mjs   (volver a ejecutarlo si cambia la cabecera, el pie o los servicios de index.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = 'https://mariovalentinopavel.github.io/benamar/';
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').replace(/\r\n/g, '\n');

const head = src.slice(0, src.indexOf('<main id="main">'));
const foot = src.slice(src.indexOf('  </main>'));

// Los servicios de la portada: dibujo, título y frase, tal cual
const SERVICIOS = [...src.matchAll(/<article class="svc"[^>]*>\n\s*(<svg class="svc__ico ill"[\s\S]*?<\/svg>)\n\s*<h3 data-i18n="(svc\d_h)">([^<]*)<\/h3>\n\s*<p class="svc__p" data-i18n="(svc\d_p)">([^<]*)<\/p>/g)]
  .map((m) => ({ ico: m[1], hk: m[2], h: m[3], pk: m[4], p: m[5] }));
if (SERVICIOS.length !== 4) throw new Error('No encuentro los cuatro servicios en index.html');

// Enlaces internos de la portada: desde la subpágina apuntan a index.html
const toHome = (s) => s
  .replace(/href="#top"/g, 'href="./"')
  .replace(/href="#(mundos|servicios|metodo|equipo|contacto)"/g, 'href="./#$1"');

const svc = { dt: 'Servicios', k: 'cf_services', dd: 'Diseño web, landing pages, redes sociales y posicionamiento en Google', dk: 'cf_services_v' };
const contact = { dt: 'Contacto', k: 'cf_contact', dd: 'WhatsApp y email, todos los días de 8:00 a 21:00 (hora de España)', dk: 'cf_contact_v' };

// Fotos libres de Unsplash (licencia gratuita comprobada en su ficha el 15-11-2026)
const PAISES = [
  { file: 'espana.html', code: 'es', name: 'España', local: '',
    title: 'BENAMAR en España · Marketing digital desde Barcelona',
    desc: 'BENAMAR en España: base en Barcelona y reuniones en persona. Diseño web, landing pages, redes sociales y posicionamiento en Google.',
    lead: 'Aquí está nuestra base. Nos reunimos en persona en Barcelona y alrededores.',
    facts: [{ dt: 'Reuniones', k: 'cf_meet', dd: 'En persona, en Barcelona y alrededores', dk: 'ces_meet' }, svc, contact],
    city: 'Barcelona', img: 'ciudad-barcelona', pos: '50% 55%',
    alt: 'Vista aérea del Eixample de Barcelona con la Sagrada Familia en el centro',
    autor: 'Logan Armstrong', perfil: 'https://unsplash.com/@loganstrongarms', foto: 'https://unsplash.com/es/fotos/vista-aerea-de-los-edificios-de-la-ciudad-durante-el-dia-hVhfqhDYciU' },
  { file: 'marruecos.html', code: 'ma', name: 'Marruecos',
    local: '<span lang="fr" data-same="fr">Maroc</span><span aria-hidden="true" data-same="fr"> · </span><span class="ar" lang="ar" dir="rtl">المغرب</span>',
    title: 'BENAMAR en Marruecos · Webs en francés, árabe, español e inglés',
    desc: 'BENAMAR en Marruecos: webs para negocios en francés, árabe, español e inglés, landing pages, redes sociales y posicionamiento en Google.',
    lead: 'Webs para negocios de Marruecos en francés, árabe, español e inglés.',
    facts: [{ dt: 'Idiomas de la web', k: 'cf_langs', dd: 'Francés, árabe, español e inglés', dk: 'cma_langs' }, svc, contact],
    city: 'Marrakech', img: 'ciudad-marrakech', pos: '50% 60%',
    alt: 'El minarete de la Koutoubia en Marrakech, con el Atlas nevado detrás',
    autor: 'Paul Macallan', perfil: 'https://unsplash.com/@pemacallan', foto: 'https://unsplash.com/es/fotos/minarete-de-la-mezquita-koutoubia-en-marrakech-CFKksjYRSQ8' },
  { file: 'rumania.html', code: 'ro', name: 'Rumanía', local: '<span lang="ro">România</span>', localSame: 'ro',
    title: 'BENAMAR en Rumanía · Marketing digital para negocios rumanos',
    desc: 'BENAMAR en Rumanía: diseño web, landing pages, redes sociales y posicionamiento en Google para negocios de Rumanía.',
    lead: 'También trabajamos con negocios en Rumanía. Cuéntenos su proyecto y le proponemos cómo empezar.',
    facts: [svc, contact],
    city: 'Bucarest', img: 'ciudad-bucarest', pos: '50% 45%',
    alt: 'La Biblioteca Central Universitaria de Bucarest con la estatua del rey Carol I',
    autor: 'Hari Nandakumar', perfil: 'https://unsplash.com/@hariprasad000', foto: 'https://unsplash.com/es/fotos/edificio-de-hormigon-blanco-y-negro-bajo-un-cielo-azul-claro-Ef9V-RCrj8k' },
];

// Galería de cada país: fotos libres de Unsplash (licencia comprobada en su ficha el 15-11-2026)
const GAL = { "es": [ { "img": "gal-es-1", "autor": "Jorge Fernández Salas", "foto": "https://unsplash.com/es/fotos/castillo-de-hormigon-marron-rodeado-de-arboles-verdes-durante-el-dia-zXxkdiBgHvA", "key": "g_es1", "cap": "Alhambra, Granada" }, { "img": "gal-es-2", "autor": "Dan San", "foto": "https://unsplash.com/es/fotos/un-edificio-con-columnas-5-YmOvST93E", "key": "g_es2", "cap": "Arcos de la Alhambra" }, { "img": "gal-es-4", "autor": "Anastasiia Tarasova", "foto": "https://unsplash.com/es/fotos/bicicleta-negra-al-lado-de-la-puerta-de-madera-NYvx-uP85mA", "key": "g_es4", "cap": "Barri Gòtic, Barcelona" }, { "img": "gal-es-3", "autor": "Cristian iordan", "foto": "https://unsplash.com/es/fotos/un-grupo-de-personas-en-un-bote-en-un-rio-frente-a-un-gran-edificio-i1SjoO4C_PY", "key": "g_es3", "cap": "Plaza de España, Sevilla" }, { "img": "gal-es-5", "autor": "Douglas Lopez", "foto": "https://unsplash.com/es/fotos/sarten-negra-en-la-estufa-4B0cLMtJxWw", "key": "g_es5", "cap": "Paella de marisco" }, { "img": "gal-es-6", "autor": "Vincenzo Montagna", "foto": "https://unsplash.com/es/fotos/un-grupo-de-botes-flotando-sobre-un-cuerpo-de-agua-lJy98lq4F7c", "key": "g_es6", "cap": "Costa Brava, Blanes" } ], "ma": [ { "img": "gal-ma-1", "autor": "Elizabeth Gottwald", "foto": "https://unsplash.com/es/fotos/camion-de-hormigon-azul-dnIWYrliZfU", "key": "g_ma1", "cap": "Chefchaouen" }, { "img": "gal-ma-2", "autor": "Haydn", "foto": "https://unsplash.com/es/fotos/patron-geometrico-de-mosaico-colorido-con-motivos-florales-ynII5iyN0j4", "key": "g_ma2", "cap": "Zellige" }, { "img": "gal-ma-3", "autor": "Martin Zangerl", "foto": "https://unsplash.com/es/fotos/tetera-gris-colocada-en-bandeja-colocada-sobre-mesa-marron-al-aire-libre-pbMf0vDIdO8", "key": "g_ma3", "cap": "Té a la menta, Fez" }, { "img": "gal-ma-4", "autor": "Urtak Hoti", "foto": "https://unsplash.com/es/fotos/un-grupo-de-personas-montadas-en-camello-a-traves-de-un-desierto-pgPHUKsAoBg", "key": "g_ma4", "cap": "Sáhara, Merzouga" }, { "img": "gal-ma-5", "autor": "Ben Ostrower", "foto": "https://unsplash.com/es/fotos/casas-de-hormigon-durante-el-dia-bjNv5Bg6h4U", "key": "g_ma5", "cap": "Curtidurías tradicionales" }, { "img": "gal-ma-6", "autor": "Florian Bernhardt", "foto": "https://unsplash.com/es/fotos/macro-shot-de-copas-de-vino-bnXUaEq9xYQ", "key": "g_ma6", "cap": "Faroles, Marrakech" } ], "ro": [ { "img": "gal-ro-1", "autor": "virgil maierean", "foto": "https://unsplash.com/es/fotos/castillo-de-hormigon-blanco-y-marron-8A496IhZ47A", "key": "g_ro1", "cap": "Castillo de Bran" }, { "img": "gal-ro-6", "autor": "Marian Strinoiu", "foto": "https://unsplash.com/es/fotos/dos-mujeres-con-trajes-folcloricos-tradicionales-rumanos-wqIATdlriBY", "key": "g_ro6", "cap": "Trajes tradicionales" }, { "img": "gal-ro-5", "autor": "Rareș Constantin", "foto": "https://unsplash.com/es/fotos/gente-caminando-por-un-parque-de-madera-8C4cj7uIpjE", "key": "g_ro5", "cap": "Monasterio de madera" }, { "img": "gal-ro-2", "autor": "Reanimated Man X", "foto": "https://unsplash.com/es/fotos/un-gran-castillo-con-torres-en-la-cima-de-una-colina-DE7I5KDnJic", "key": "g_ro2", "cap": "Castillo de Peleș, Sinaia" }, { "img": "gal-ro-3", "autor": "Alisa Anton", "foto": "https://unsplash.com/es/fotos/edificio-de-hormigon-beige-y-gris-pkUsKFmAQIM", "key": "g_ro3", "cap": "Sibiu" }, { "img": "gal-ro-4", "autor": "Paladuta Stefan", "foto": "https://unsplash.com/es/fotos/una-vieja-casa-con-techo-de-paja-wY698U02Aa8", "key": "g_ro4", "cap": "Casas tradicionales, Sibiu" } ] };
const galHtml = (p) => GAL[p.code].map((f, i) => `        <figure class="gal__item gal__item--${i + 1}" data-reveal style="--d: ${i % 3}">
          <img src="assets/img/${f.img}-800.webp" srcset="assets/img/${f.img}-800.webp 800w, assets/img/${f.img}-1400.webp 1400w" sizes="${i === 0 ? '(min-width: 900px) 50vw, 94vw' : '(min-width: 900px) 25vw, 47vw'}" width="1400" height="933" alt="${f.cap}" data-i18n-attr="alt:${f.key}" loading="lazy" decoding="async">
          <figcaption><span class="gal__cap" data-i18n="${f.key}">${f.cap}</span></figcaption>
        </figure>\n`).join('');
const GAL_H = { es: 'Así es España', ma: 'Así es Marruecos', ro: 'Así es Rumanía' };
const factHtml = (f, i) => `          <div data-reveal style="--d: ${i}"><dt data-i18n="${f.k}">${f.dt}</dt><dd${f.dk ? ` data-i18n="${f.dk}"` : ''}>${f.dd}</dd></div>\n`;

for (const p of PAISES) {
  const url = BASE_URL + p.file;
  const h = toHome(head)
    .replace('<html lang="es">', `<html lang="es" data-title-key="t_${p.code}" data-desc-key="d_${p.code}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${p.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${p.desc}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${p.title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${p.desc}">`)
    .replace(/  <link rel="preload" as="image"[^\n]*\n/g, '')
    .replace(/  <script type="application\/ld\+json">[\s\S]*?<\/script>\n/, '')
    .replace(/<!--\n  BENAMAR · rebranding[\s\S]*?-->\n/, `<!-- Subpágina de ${p.name}: generada con tools/paises.mjs a partir de index.html. No editar a mano. -->\n`)
    // En la barra, «Países» queda marcado
    .replace(/(<nav class="hdr__nav"[\s\S]*?<a href="\.\/#mundos")/, '$1 aria-current="location"');

  const others = PAISES.filter((o) => o !== p).map((o, i) => `        <a class="other other--${o.code}" href="${o.file}" data-reveal style="--d: ${i}">
          <svg class="other__flag" viewBox="0 0 30 20" aria-hidden="true"><use href="#flag-${o.code}"/></svg>
          <span class="other__name" data-i18n="name_${o.code}">${o.name}</span>
          <span class="other__go" aria-hidden="true">→</span>
        </a>\n`).join('');

  const cards = SERVICIOS.map((s, i) => `        <a class="svc-card" href="./#servicios" data-reveal style="--d: ${i}">
          ${s.ico}
          <h3 data-i18n="${s.hk}">${s.h}</h3>
          <p data-i18n="${s.pk}">${s.p}</p>
        </a>\n`).join('');

  const main = `<main id="main">

    <section class="country country--${p.code} country--page" aria-labelledby="pais-title">
      <div class="wrap country__top">
        <a class="country__back" href="./#mundos"><span aria-hidden="true">←</span> <span data-i18n="back_countries">Todos los países</span></a>
      </div>
      <div class="wrap country__grid">
        <header class="country__head" data-reveal>
          <svg class="country__flag" viewBox="0 0 30 20" aria-hidden="true"><use href="#flag-${p.code}-w"/></svg>
          <h1 id="pais-title" class="t-hand t-hand--h1"><span data-i18n="name_${p.code}">${p.name}</span> <span class="hand" aria-hidden="true" data-i18n="city_${p.code}">${p.city}</span></h1>
${p.local ? `          <p class="country__local"${p.localSame ? ` data-same="${p.localSame}"` : ''}>${p.local}</p>\n` : ''}        </header>
        <p class="country__lead" data-i18n="${p.code}_text" data-reveal style="--d: 1">${p.lead}</p>
      </div>
    </section>

    <div class="city city--${p.code}">
      <figure class="wrap city__fig" data-reveal>
        <div class="city__frame">
          <img src="assets/img/${p.img}-1100.webp" srcset="assets/img/${p.img}-1100.webp 1100w, assets/img/${p.img}-1800.webp 1800w" sizes="(min-width: 1360px) 1320px, 94vw" width="1800" height="1200" alt="${p.alt}" data-i18n-attr="alt:alt_${p.code}" style="object-position: ${p.pos}" fetchpriority="high" decoding="async">
        </div>
        <figcaption class="city__cap"><span class="city__name" data-i18n="city_${p.code}">${p.city}</span></figcaption>
      </figure>
    </div>

    <section class="country-info country-info--${p.code}" aria-label="${p.name}">
      <div class="wrap">
        <dl class="country__facts" style="--n: ${p.facts.length}">
${p.facts.map(factHtml).join('')}        </dl>
        <div class="country-info__cta" data-reveal>
          <a class="btn" href="./?pais=${p.code}#contacto" data-i18n="${p.code}_cta">Hablar de un proyecto<span class="vh"> en ${p.name}</span></a>
        </div>
      </div>
    </section>

    <section class="gal gal--${p.code}" aria-labelledby="gal-title">
      <div class="wrap sec-head" data-reveal>
        <h2 id="gal-title" class="t-hand"><span data-i18n="gal_h_${p.code}">${GAL_H[p.code]}</span> <span class="hand" aria-hidden="true" data-i18n="hand_gal">Galería</span></h2>
        <p data-i18n="gal_p">Arquitectura, tradición, cocina y paisaje del país.</p>
      </div>
      <div class="wrap gal__grid">
${galHtml(p)}      </div>
    </section>

    <section class="svc-strip" aria-labelledby="svc-strip-title">
      <div class="wrap sec-head" data-reveal>
        <h2 id="svc-strip-title" class="t-hand">${src.match(/<h2 id="services-title" class="t-hand">([\s\S]*?)<\/h2>/)[1]}</h2>
        <p data-i18n="services_p">${src.match(/<p data-i18n="services_p">([^<]*)<\/p>/)[1]}</p>
      </div>
      <div class="wrap svc-strip__grid">
${cards}      </div>
    </section>

    <nav class="others" aria-labelledby="others-title">
      <div class="wrap">
        <div class="sec-head" data-reveal>
          <h2 class="others__h t-hand" id="others-title"><span data-i18n="others_h">Otros países</span> <span class="hand" aria-hidden="true" data-i18n="ftr_worlds">Tres mundos</span></h2>
        </div>
        <div class="others__grid">
${others}        </div>
      </div>
    </nav>

`;
  // Créditos de las fotos de esta página, abajo del todo
  const fotos = [{ autor: p.autor, foto: p.foto }, ...GAL[p.code]];
  const creditos = fotos.map((f) => `<a href="${f.foto}" target="_blank" rel="noopener">${f.autor}</a>`).join(', ');
  const pie = toHome(foot).replace(/<p class="ftr__credits">.*<\/p>/, () => `<p class="ftr__credits"><span data-i18n="photo_credits">Fotos</span>: ${creditos} / <a href="https://unsplash.com/" target="_blank" rel="noopener">Unsplash</a></p>`);
  const out = h + main + pie;
  fs.writeFileSync(path.join(RAIZ, p.file), out.replace(/\n/g, '\r\n'));
  console.log('Escrita', p.file);
}
