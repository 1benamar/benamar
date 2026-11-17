// Ajustes al texto de las páginas de servicio de la web antigua, para que diga lo mismo que la web nueva:
// plazos (17-11-2026), idiomas del equipo y la landing sin ofrecer la gestión de publicidad como servicio.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const P = {
  es: [['entre dos y cuatro semanas', 'entre una y dos semanas'], ['en una o dos semanas', 'en un plazo de un día a una semana'], ['entre tres y seis meses', 'entre uno y tres meses'],
    ['en español, inglés y francés.', 'en español, catalán, inglés, francés, árabe y rumano.'],
    ['Podemos hacer solo la página, o encargarnos también de la publicidad. Se lo detallamos por separado en el presupuesto.', 'Este servicio cubre la página, preparada para recibir el tráfico de la campaña y medir los contactos.']],
  en: [['between two and four weeks', 'between one and two weeks'], ['within one or two weeks', 'within one day to one week'], ['between three and six months', 'between one and three months'],
    ['in Spanish, English and French.', 'in Spanish, Catalan, English, French, Arabic and Romanian.']],
  fr: [['entre deux et quatre semaines', 'entre une et deux semaines'], ['en une à deux semaines', 'en un jour à une semaine'], ['de trois à six mois', 'd’un à trois mois'],
    ['en espagnol, en anglais et en français.', 'en espagnol, en catalan, en anglais, en français, en arabe et en roumain.']],
};
const STATS = { web: { '2–4': '1–2' }, seo: { '3–6': '1–3' } };
const LANDING_DIAS = { es: ['1–7', 'Días hasta publicar'], en: ['1–7', 'Days to launch'], fr: ['1–7', 'Jours avant la mise en ligne'] };

export function textos() {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, 'servicios-texto.json'), 'utf8'));
  for (const k of Object.keys(j)) {
    for (const l of ['es', 'en', 'fr']) {
      let s = JSON.stringify(j[k][l]);
      for (const [a, b] of P[l]) s = s.split(a).join(b);
      const d = JSON.parse(s);
      d.stats = d.stats.map(([v, t]) => [(STATS[k] || {})[v] || v, t]);
      if (k === 'landing') d.stats[1] = LANDING_DIAS[l];
      j[k][l] = d;
    }
  }
  // La landing en inglés y francés: misma idea que en español para la pregunta de la campaña
  const fixCamp = { en: 'This service covers the page, prepared to receive the campaign traffic and measure the enquiries.', fr: 'Ce service couvre la page, préparée pour recevoir le trafic de la campagne et mesurer les contacts.' };
  for (const l of ['en', 'fr']) j.landing[l].faq.items[4][1] = j.landing[l].faq.items[4][1].replace(/\.\s[^.]*(advertising|publicité)[\s\S]*$/, '. ' + fixCamp[l]);
  const extra = path.join(DIR, 'servicios-texto-ca-ro.json');
  if (fs.existsSync(extra)) { const e = JSON.parse(fs.readFileSync(extra, 'utf8')); for (const k of Object.keys(e)) Object.assign(j[k], e[k]); }
  return j;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const j = textos();
  if (process.argv[2] === 'es') { const o = {}; for (const k of Object.keys(j)) o[k] = j[k].es; console.log(JSON.stringify(o)); }
  else for (const k of Object.keys(j)) console.log(k, j.landing.en.faq.items[4][1], '|', j[k].fr.stats.map((s) => s.join(' ')).join(' / '));
}
