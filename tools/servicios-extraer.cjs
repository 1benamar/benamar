// Extrae una vez el texto de las páginas de servicio de la web antigua (es/en/fr) a tools/servicios-texto.json.
const fs = require('fs'), path = require('path');
const VIEJA = 'C:/Users/Usuario/.claude/benamar-marketing-agency/';
const F = {
  web: ['diseno-web-barcelona.html', 'en/web-design-barcelona.html', 'fr/creation-site-web-barcelone.html'],
  landing: ['landing-pages-barcelona.html', 'en/landing-pages-barcelona.html', 'fr/landing-pages-barcelone.html'],
  redes: ['gestion-redes-sociales-barcelona.html', 'en/social-media-management-barcelona.html', 'fr/gestion-reseaux-sociaux-barcelone.html'],
  seo: ['posicionamiento-seo-barcelona.html', 'en/seo-barcelona.html', 'fr/referencement-seo-barcelone.html'],
};
const txt = (s) => s.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').replace(/&rsaquo;/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const all = (s, re) => [...s.matchAll(re)];
const out = {};
for (const [k, files] of Object.entries(F)) {
  out[k] = {};
  files.forEach((f, i) => {
    const l = ['es', 'en', 'fr'][i];
    const s = fs.readFileSync(VIEJA + f, 'utf8');
    const main = s.match(/<main[\s\S]*<\/main>/)[0];
    const secs = all(main, /<section class="service-section[^"]*"[^>]*>([\s\S]*?)<\/section>/g).map((m) => m[1]);
    const head = (sec) => ({ h: txt((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || ''), deck: txt((sec.match(/<p class="section-deck"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '') });
    const secBy = (cls) => secs.find((x) => x.includes(cls)) || '';
    out[k][l] = {
      title: txt(s.match(/<title>([^<]*)/)[1]),
      desc: s.match(/name="description" content="([^"]*)/)[1],
      h1: txt(main.match(/<h1 class="service-title"[^>]*>([\s\S]*?)<\/h1>/)[1]),
      teaser: txt(main.match(/<p class="service-teaser"[^>]*>([\s\S]*?)<\/p>/)[1]),
      lead: txt(main.match(/<p class="service-lead"[^>]*>([\s\S]*?)<\/p>/)[1]),
      about: all(main, /<p class="about-body"[^>]*>([\s\S]*?)<\/p>/g).map((m) => txt(m[1])),
      stats: all(main, /<span class="stat-value"[^>]*>([\s\S]*?)<\/span>[\s\S]*?<span class="stat-label"[^>]*>([\s\S]*?)<\/span>/g).map((m) => [txt(m[1]), txt(m[2])]),
      incluye: { h: txt((main.match(/<h2 class="manifesto-statement"[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || ''), deck: txt((main.match(/manifesto-statement[\s\S]*?<p class="section-deck"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || ''), items: all(main, /<div class="benefit"[^>]*>[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g).map((m) => [txt(m[1]), txt(m[2])]) },
      quien: { ...head(secBy('audience')), items: all(main, /<div class="audience-item"[^>]*>\s*<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g).map((m) => [txt(m[1]), txt(m[2])]) },
      faq: { ...head(secBy('faq')), items: all(main, /<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="faq-answer"[^>]*>([\s\S]*?)<\/div>/g).map((m) => [txt(m[1]), txt(m[2])]) },
      posts: { ...head(secBy('post-list')), items: all(main, /<a class="post-card" href="([^"]*)"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?post-card-excerpt">([\s\S]*?)<\/span>/g).map((m) => [m[1], txt(m[2]), txt(m[3])]) },
    };
  });
}
fs.writeFileSync(path.join(__dirname, 'servicios-texto.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) for (const [l, d] of Object.entries(v)) console.log(k, l, 'about', d.about.length, 'stats', d.stats.length, 'incl', d.incluye.items.length, 'quien', d.quien.items.length, 'faq', d.faq.items.length, 'posts', d.posts.items.length, '|', d.incluye.h, '|', d.quien.h, '|', d.faq.h);
