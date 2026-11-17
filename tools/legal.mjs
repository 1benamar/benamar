// Genera aviso-legal.html y privacidad.html con la cabecera, el menú y el pie de index.html.
// El texto legal va en los cinco idiomas; se ve el bloque del idioma activo (atributo lang de <html>).
// Uso: node tools/legal.mjs   (volver a ejecutarlo si cambia la cabecera o el pie de index.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = 'https://benamar.es/';
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const head = src.slice(0, src.indexOf('<main id="main">'));
const foot = src.slice(src.indexOf('  </main>'));
const toHome = (s) => s.replace(/href="#top"/g, 'href="./"').replace(/href="#(mundos|servicios|metodo|equipo|contacto|opiniones|cifras)"/g, 'href="./#$1"');

const MAIL = '<a href="mailto:contact@benamar.es">contact@benamar.es</a>';
const TEL = '<a href="tel:+34633712475">+34 633 71 24 75</a>';
const AEPD = '<a href="https://www.aepd.es/" target="_blank" rel="noopener">aepd.es</a>';

// Cada documento: etiqueta, título, entrada, ficha de datos y apartados [título, párrafo] por idioma
const DOCS = {
  aviso: {
    file: 'aviso-legal.html', key: 'aviso',
    es: { tag: 'Legal', h: 'Aviso legal', title: 'Aviso legal · BENAMAR', desc: 'Aviso legal de BENAMAR, agencia de marketing digital con base en Barcelona.',
      lead: 'En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).',
      ficha: 'Datos identificativos', datos: [['Titular', 'BENAMAR'], ['NIF/CIF', '*********'], ['Domicilio', 'Barcelona, España'], ['Email', MAIL], ['Teléfono', TEL]],
      sec: [
        ['Objeto', 'Este sitio web (en adelante, «la Web») tiene como finalidad informar sobre los servicios de marketing digital que ofrece BENAMAR y facilitar el contacto con clientes potenciales.'],
        ['Condiciones de uso', 'El acceso y uso de la Web atribuye la condición de usuario e implica la aceptación de estas condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que BENAMAR ofrece a través de la Web.'],
        ['Propiedad intelectual e industrial', 'Todos los contenidos de la Web (textos, imágenes, diseño, logotipo y código fuente) son titularidad de BENAMAR o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial. Las fotografías de terceros se usan con su licencia y se cita a sus autores al pie de cada página. Queda prohibida su reproducción total o parcial sin autorización expresa.'],
        ['Responsabilidad', 'BENAMAR no se hace responsable de los daños que pudieran derivarse de interferencias, interrupciones, virus informáticos o desconexiones en el funcionamiento de la Web, ni de los derivados del mal uso que terceros hagan de ella. Tampoco responde del contenido de las webs externas a las que se enlace.'],
        ['Legislación aplicable', 'Estas condiciones se rigen por la legislación española. Para cualquier controversia derivada del acceso o uso de la Web, las partes se someten a los juzgados y tribunales que correspondan según la normativa aplicable.'],
      ], upd: 'Última actualización: noviembre de 2026', other: ['Política de privacidad', 'privacidad.html'], idx: 'En esta página' },
    ca: { tag: 'Legal', h: 'Avís legal', title: 'Avís legal · BENAMAR', desc: 'Avís legal de BENAMAR, agència de màrqueting digital amb base a Barcelona.',
      lead: 'En compliment de la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE).',
      ficha: 'Dades identificatives', datos: [['Titular', 'BENAMAR'], ['NIF/CIF', '*********'], ['Domicili', 'Barcelona, Espanya'], ['Correu', MAIL], ['Telèfon', TEL]],
      sec: [
        ['Objecte', 'Aquest lloc web (d’ara endavant, «el Web») té com a finalitat informar sobre els serveis de màrqueting digital que ofereix BENAMAR i facilitar el contacte amb clients potencials.'],
        ['Condicions d’ús', 'L’accés i l’ús del Web atribueixen la condició d’usuari i impliquen l’acceptació d’aquestes condicions. L’usuari es compromet a fer un ús adequat dels continguts i serveis que BENAMAR ofereix a través del Web.'],
        ['Propietat intel·lectual i industrial', 'Tots els continguts del Web (textos, imatges, disseny, logotip i codi font) són titularitat de BENAMAR o de tercers que n’han autoritzat l’ús, i estan protegits per la normativa de propietat intel·lectual i industrial. Les fotografies de tercers s’utilitzen amb la seva llicència i se’n citen els autors al peu de cada pàgina. Se’n prohibeix la reproducció total o parcial sense autorització expressa.'],
        ['Responsabilitat', 'BENAMAR no es fa responsable dels danys que es puguin derivar d’interferències, interrupcions, virus informàtics o desconnexions en el funcionament del Web, ni dels derivats del mal ús que en facin tercers. Tampoc no respon del contingut dels webs externs als quals s’enllaci.'],
        ['Legislació aplicable', 'Aquestes condicions es regeixen per la legislació espanyola. Per a qualsevol controvèrsia derivada de l’accés o l’ús del Web, les parts se sotmeten als jutjats i tribunals que corresponguin segons la normativa aplicable.'],
      ], upd: 'Última actualització: novembre de 2026', other: ['Política de privacitat', 'privacidad.html'], idx: 'En aquesta pàgina' },
    en: { tag: 'Legal', h: 'Legal notice', title: 'Legal notice · BENAMAR', desc: 'Legal notice of BENAMAR, a digital marketing agency based in Barcelona.',
      lead: 'In compliance with Spanish Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE).',
      ficha: 'Company details', datos: [['Owner', 'BENAMAR'], ['Tax ID', '*********'], ['Address', 'Barcelona, Spain'], ['Email', MAIL], ['Phone', TEL]],
      sec: [
        ['Purpose', 'This website (“the Website”) provides information about the digital marketing services offered by BENAMAR and makes it easy for potential clients to get in touch.'],
        ['Terms of use', 'Accessing and using the Website makes you a user and implies acceptance of these terms. Users agree to make appropriate use of the content and services BENAMAR offers through the Website.'],
        ['Intellectual and industrial property', 'All content on the Website (texts, images, design, logo and source code) belongs to BENAMAR or to third parties who have authorised its use, and is protected by intellectual and industrial property law. Third-party photographs are used under their licence, and their authors are credited at the foot of each page. Total or partial reproduction without express permission is prohibited.'],
        ['Liability', 'BENAMAR is not liable for any damage arising from interference, interruptions, computer viruses or disconnections affecting the Website, or from misuse of it by third parties. Nor is it responsible for the content of external websites it links to.'],
        ['Governing law', 'These terms are governed by Spanish law. Any dispute arising from access to or use of the Website shall be submitted to the competent courts under the applicable regulations.'],
      ], upd: 'Last updated: November 2026', other: ['Privacy policy', 'privacidad.html'], idx: 'On this page' },
    fr: { tag: 'Mentions', h: 'Mentions légales', title: 'Mentions légales · BENAMAR', desc: 'Mentions légales de BENAMAR, agence de marketing digital basée à Barcelone.',
      lead: 'Conformément à la loi espagnole 34/2002 sur les services de la société de l’information et le commerce électronique (LSSI-CE).',
      ficha: 'Informations légales', datos: [['Titulaire', 'BENAMAR'], ['N° fiscal', '*********'], ['Adresse', 'Barcelone, Espagne'], ['E-mail', MAIL], ['Téléphone', TEL]],
      sec: [
        ['Objet', 'Ce site web (ci-après « le Site ») a pour objet de présenter les services de marketing digital proposés par BENAMAR et de faciliter la prise de contact avec de futurs clients.'],
        ['Conditions d’utilisation', 'L’accès au Site et son utilisation confèrent la qualité d’utilisateur et impliquent l’acceptation des présentes conditions. L’utilisateur s’engage à faire un usage approprié des contenus et services proposés par BENAMAR sur le Site.'],
        ['Propriété intellectuelle et industrielle', 'L’ensemble des contenus du Site (textes, images, design, logo et code source) appartient à BENAMAR ou à des tiers qui en ont autorisé l’utilisation, et est protégé par le droit de la propriété intellectuelle et industrielle. Les photographies de tiers sont utilisées selon leur licence et leurs auteurs sont cités en bas de chaque page. Toute reproduction totale ou partielle sans autorisation expresse est interdite.'],
        ['Responsabilité', 'BENAMAR décline toute responsabilité pour les dommages pouvant résulter d’interférences, d’interruptions, de virus informatiques ou de déconnexions affectant le Site, ainsi que de toute utilisation abusive par des tiers. BENAMAR ne répond pas non plus du contenu des sites externes vers lesquels il renvoie.'],
        ['Droit applicable', 'Les présentes conditions sont régies par le droit espagnol. Tout litige lié à l’accès au Site ou à son utilisation sera soumis aux juridictions compétentes selon la réglementation applicable.'],
      ], upd: 'Dernière mise à jour : novembre 2026', other: ['Politique de confidentialité', 'privacidad.html'], idx: 'Sur cette page' },
    ro: { tag: 'Legal', h: 'Mențiuni legale', title: 'Mențiuni legale · BENAMAR', desc: 'Mențiunile legale ale BENAMAR, agenție de marketing digital cu sediul în Barcelona.',
      lead: 'În conformitate cu Legea spaniolă 34/2002 privind serviciile societății informaționale și comerțul electronic (LSSI-CE).',
      ficha: 'Date de identificare', datos: [['Titular', 'BENAMAR'], ['Cod fiscal', '*********'], ['Sediu', 'Barcelona, Spania'], ['E-mail', MAIL], ['Telefon', TEL]],
      sec: [
        ['Obiect', 'Acest site (denumit în continuare „Site-ul”) are rolul de a prezenta serviciile de marketing digital oferite de BENAMAR și de a facilita contactul cu potențiali clienți.'],
        ['Condiții de utilizare', 'Accesarea și utilizarea Site-ului vă conferă calitatea de utilizator și implică acceptarea acestor condiții. Utilizatorul se angajează să folosească în mod adecvat conținutul și serviciile oferite de BENAMAR prin Site.'],
        ['Proprietate intelectuală și industrială', 'Întregul conținut al Site-ului (texte, imagini, design, logo și cod sursă) aparține BENAMAR sau unor terți care au autorizat utilizarea lui și este protejat de legislația privind proprietatea intelectuală și industrială. Fotografiile terților sunt folosite conform licenței lor, iar autorii sunt menționați în subsolul fiecărei pagini. Reproducerea totală sau parțială fără acord expres este interzisă.'],
        ['Răspundere', 'BENAMAR nu răspunde pentru daunele care ar putea rezulta din interferențe, întreruperi, viruși informatici sau deconectări în funcționarea Site-ului și nici pentru utilizarea lui necorespunzătoare de către terți. De asemenea, nu răspunde pentru conținutul site-urilor externe către care trimite.'],
        ['Legislație aplicabilă', 'Aceste condiții sunt guvernate de legislația spaniolă. Orice litigiu legat de accesarea sau utilizarea Site-ului va fi soluționat de instanțele competente conform normelor aplicabile.'],
      ], upd: 'Ultima actualizare: noiembrie 2026', other: ['Politica de confidențialitate', 'privacidad.html'], idx: 'Pe această pagină' },
  },
  priv: {
    file: 'privacidad.html', key: 'priv',
    es: { tag: 'Privacidad', h: 'Política de privacidad', title: 'Política de privacidad · BENAMAR', desc: 'Cómo trata BENAMAR los datos que nos facilita a través de su web.',
      lead: 'Cómo tratamos los datos que nos facilita a través de esta web, conforme al Reglamento General de Protección de Datos (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).',
      ficha: 'Responsable del tratamiento', datos: [['Responsable', 'BENAMAR'], ['Domicilio', 'Barcelona, España'], ['Email', MAIL], ['Teléfono', TEL]],
      sec: [
        ['¿Qué datos recogemos?', 'A través del formulario de contacto recogemos su nombre, su email, su empresa (opcional), el país del proyecto, el servicio que le interesa y el mensaje que nos escriba. Si nos escribe por WhatsApp o por email, tratamos los datos que nos envíe por esa vía.'],
        ['¿Con qué finalidad?', 'Usamos sus datos únicamente para responder a su solicitud de información o presupuesto y para gestionar la relación comercial que pueda derivarse de ella. No los usamos para enviarle publicidad.'],
        ['¿Cuál es la legitimación?', 'El consentimiento que nos da al marcar la casilla del formulario y enviarlo, o al escribirnos por iniciativa propia. Puede retirarlo cuando quiera.'],
        ['¿Se comunican a terceros?', 'No. Sus datos no se ceden ni se venden a terceros bajo ningún concepto, salvo obligación legal.'],
        ['¿Cuánto tiempo los conservamos?', 'Mientras exista un interés mutuo en mantener el contacto y, en todo caso, durante los plazos que establezca la ley.'],
        ['¿Cuáles son sus derechos?', `Puede acceder a sus datos, rectificarlos o suprimirlos, así como solicitar la limitación de su tratamiento, oponerse a él o pedir su portabilidad, escribiendo a ${MAIL}. Si considera que no se han respetado sus derechos, puede reclamar ante la Agencia Española de Protección de Datos (${AEPD}).`],
        ['Cookies', 'Esta web no usa cookies de analítica ni de publicidad. Solo guarda en su navegador el idioma que elija, para mostrarle la web en ese idioma la próxima vez; no sirve para identificarle.'],
      ], upd: 'Última actualización: noviembre de 2026', other: ['Aviso legal', 'aviso-legal.html'], idx: 'En esta página' },
    ca: { tag: 'Privacitat', h: 'Política de privacitat', title: 'Política de privacitat · BENAMAR', desc: 'Com tracta BENAMAR les dades que ens facilita a través del seu web.',
      lead: 'Com tractem les dades que ens facilita a través d’aquest web, d’acord amb el Reglament general de protecció de dades (RGPD) i la Llei orgànica 3/2018 (LOPDGDD).',
      ficha: 'Responsable del tractament', datos: [['Responsable', 'BENAMAR'], ['Domicili', 'Barcelona, Espanya'], ['Correu', MAIL], ['Telèfon', TEL]],
      sec: [
        ['Quines dades recollim?', 'A través del formulari de contacte recollim el seu nom, el seu correu, la seva empresa (opcional), el país del projecte, el servei que l’interessa i el missatge que ens escrigui. Si ens escriu per WhatsApp o per correu, tractem les dades que ens enviï per aquesta via.'],
        ['Amb quina finalitat?', 'Fem servir les seves dades únicament per respondre a la seva sol·licitud d’informació o de pressupost i per gestionar la relació comercial que se’n pugui derivar. No les fem servir per enviar-li publicitat.'],
        ['Quina és la legitimació?', 'El consentiment que ens dona en marcar la casella del formulari i enviar-lo, o en escriure’ns per iniciativa pròpia. El pot retirar quan vulgui.'],
        ['Es comuniquen a tercers?', 'No. Les seves dades no se cedeixen ni es venen a tercers sota cap concepte, llevat d’obligació legal.'],
        ['Quant de temps les conservem?', 'Mentre hi hagi un interès mutu a mantenir el contacte i, en tot cas, durant els terminis que estableixi la llei.'],
        ['Quins són els seus drets?', `Pot accedir a les seves dades, rectificar-les o suprimir-les, així com sol·licitar-ne la limitació del tractament, oposar-s’hi o demanar-ne la portabilitat, escrivint a ${MAIL}. Si considera que no s’han respectat els seus drets, pot reclamar davant l’Agència Espanyola de Protecció de Dades (${AEPD}).`],
        ['Galetes', 'Aquest web no fa servir galetes d’analítica ni de publicitat. Només desa al seu navegador l’idioma que triï, per mostrar-li el web en aquest idioma la propera vegada; no serveix per identificar-lo.'],
      ], upd: 'Última actualització: novembre de 2026', other: ['Avís legal', 'aviso-legal.html'], idx: 'En aquesta pàgina' },
    en: { tag: 'Privacy', h: 'Privacy policy', title: 'Privacy policy · BENAMAR', desc: 'How BENAMAR handles the data you share through its website.',
      lead: 'How we handle the data you share through this website, in line with the General Data Protection Regulation (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD).',
      ficha: 'Data controller', datos: [['Controller', 'BENAMAR'], ['Address', 'Barcelona, Spain'], ['Email', MAIL], ['Phone', TEL]],
      sec: [
        ['What data do we collect?', 'Through the contact form we collect your name, email, company (optional), the country of the project, the service you are interested in and your message. If you write to us on WhatsApp or by email, we handle the data you send that way.'],
        ['What do we use it for?', 'We use your data only to answer your request for information or a quote and to manage any business relationship that may follow. We do not use it to send you advertising.'],
        ['Legal basis', 'The consent you give by ticking the box on the form and sending it, or by contacting us on your own initiative. You can withdraw it at any time.'],
        ['Is it shared with third parties?', 'No. Your data is never passed on or sold to third parties, except where required by law.'],
        ['How long do we keep it?', 'For as long as there is mutual interest in staying in touch and, in any case, for the periods required by law.'],
        ['What are your rights?', `You can access, correct or delete your data, and ask us to restrict or stop processing it or to transfer it, by writing to ${MAIL}. If you believe your rights have not been respected, you can file a complaint with the Spanish Data Protection Agency (${AEPD}).`],
        ['Cookies', 'This website uses no analytics or advertising cookies. It only stores the language you choose in your browser, to show you the site in that language next time; it cannot be used to identify you.'],
      ], upd: 'Last updated: November 2026', other: ['Legal notice', 'aviso-legal.html'], idx: 'On this page' },
    fr: { tag: 'Confidentialité', h: 'Politique de confidentialité', title: 'Politique de confidentialité · BENAMAR', desc: 'Comment BENAMAR traite les données que vous nous transmettez via son site.',
      lead: 'Comment nous traitons les données que vous nous transmettez via ce site, conformément au Règlement général sur la protection des données (RGPD) et à la loi organique espagnole 3/2018 (LOPDGDD).',
      ficha: 'Responsable du traitement', datos: [['Responsable', 'BENAMAR'], ['Adresse', 'Barcelone, Espagne'], ['E-mail', MAIL], ['Téléphone', TEL]],
      sec: [
        ['Quelles données collectons-nous ?', 'Via le formulaire de contact, nous collectons votre nom, votre e-mail, votre entreprise (facultatif), le pays du projet, le service qui vous intéresse et votre message. Si vous nous écrivez sur WhatsApp ou par e-mail, nous traitons les données que vous nous envoyez par ce biais.'],
        ['Dans quel but ?', 'Nous utilisons vos données uniquement pour répondre à votre demande d’information ou de devis et pour gérer la relation commerciale qui pourrait en découler. Nous ne les utilisons pas pour vous envoyer de la publicité.'],
        ['Sur quelle base légale ?', 'Le consentement que vous donnez en cochant la case du formulaire et en l’envoyant, ou en nous écrivant de votre propre initiative. Vous pouvez le retirer à tout moment.'],
        ['Les données sont-elles communiquées à des tiers ?', 'Non. Vos données ne sont jamais cédées ni vendues à des tiers, sauf obligation légale.'],
        ['Combien de temps les conservons-nous ?', 'Tant qu’il existe un intérêt mutuel à rester en contact et, en tout état de cause, pendant les délais prévus par la loi.'],
        ['Quels sont vos droits ?', `Vous pouvez accéder à vos données, les rectifier ou les supprimer, ainsi que demander la limitation de leur traitement, vous y opposer ou demander leur portabilité, en écrivant à ${MAIL}. Si vous estimez que vos droits n’ont pas été respectés, vous pouvez déposer une réclamation auprès de l’Agence espagnole de protection des données (${AEPD}).`],
        ['Cookies', 'Ce site n’utilise aucun cookie d’analyse ni de publicité. Il enregistre seulement dans votre navigateur la langue que vous choisissez, pour vous afficher le site dans cette langue la prochaine fois ; cela ne permet pas de vous identifier.'],
      ], upd: 'Dernière mise à jour : novembre 2026', other: ['Mentions légales', 'aviso-legal.html'], idx: 'Sur cette page' },
    ro: { tag: 'Confidențialitate', h: 'Politica de confidențialitate', title: 'Politica de confidențialitate · BENAMAR', desc: 'Cum tratează BENAMAR datele pe care ni le transmiteți prin site.',
      lead: 'Cum tratăm datele pe care ni le transmiteți prin acest site, conform Regulamentului general privind protecția datelor (GDPR) și Legii organice spaniole 3/2018 (LOPDGDD).',
      ficha: 'Operatorul de date', datos: [['Operator', 'BENAMAR'], ['Sediu', 'Barcelona, Spania'], ['E-mail', MAIL], ['Telefon', TEL]],
      sec: [
        ['Ce date colectăm?', 'Prin formularul de contact colectăm numele, adresa de e-mail, firma (opțional), țara proiectului, serviciul care vă interesează și mesajul dumneavoastră. Dacă ne scrieți pe WhatsApp sau prin e-mail, tratăm datele pe care ni le trimiteți pe această cale.'],
        ['În ce scop?', 'Folosim datele dumneavoastră doar pentru a răspunde cererii de informații sau de ofertă și pentru a gestiona relația comercială care ar putea rezulta. Nu le folosim pentru a vă trimite publicitate.'],
        ['Care este temeiul legal?', 'Consimțământul pe care ni-l dați bifând căsuța din formular și trimițându-l sau scriindu-ne din proprie inițiativă. Îl puteți retrage oricând.'],
        ['Sunt comunicate terților?', 'Nu. Datele dumneavoastră nu sunt cedate sau vândute terților în niciun caz, cu excepția obligațiilor legale.'],
        ['Cât timp le păstrăm?', 'Cât timp există un interes reciproc de a păstra legătura și, în orice caz, pe durata prevăzută de lege.'],
        ['Care sunt drepturile dumneavoastră?', `Puteți accesa, rectifica sau șterge datele, precum și solicita restricționarea prelucrării, vă puteți opune acesteia sau puteți cere portabilitatea lor, scriind la ${MAIL}. Dacă considerați că drepturile v-au fost încălcate, puteți depune o plângere la Agenția Spaniolă pentru Protecția Datelor (${AEPD}).`],
        ['Cookie-uri', 'Acest site nu folosește cookie-uri de analiză sau de publicitate. Salvează în browser doar limba pe care o alegeți, pentru a vă arăta site-ul în acea limbă data viitoare; nu poate fi folosită pentru a vă identifica.'],
      ], upd: 'Ultima actualizare: noiembrie 2026', other: ['Mențiuni legale', 'aviso-legal.html'], idx: 'Pe această pagină' },
  },
};

const LANGS = ['es', 'ca', 'en', 'fr', 'ro'];
const esc = (s) => s.replace(/"/g, '&quot;');

for (const doc of Object.values(DOCS)) {
  const es = doc.es;
  const url = BASE_URL + doc.file;
  const h = toHome(head)
    .replace('<html lang="es">', `<html lang="es" data-title-key="tl_${doc.key}" data-desc-key="dl_${doc.key}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${es.title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(es.desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${es.title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(es.desc)}">`)
    .replace(/  <link rel="preload" as="image"[^\n]*\n/g, '')
    .replace(/  <script type="application\/ld\+json">[\s\S]*?<\/script>\n/, '')
    .replace(/<!--\n  BENAMAR · rebranding[\s\S]*?-->\n/, `<!-- ${es.h}: generada con tools/legal.mjs a partir de index.html. No editar a mano. -->\n`);

  const bloques = LANGS.map((l) => {
    const d = doc[l];
    const idx = d.sec.map((s, i) => `              <li><a href="#${doc.key}-${l}-${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span> ${s[0]}</a></li>`).join('\n');
    const secs = d.sec.map((s, i) => `            <section class="legal__sec" id="${doc.key}-${l}-${i + 1}">
              <h2><span class="legal__n" aria-hidden="true">[${String(i + 1).padStart(3, '0')}]</span> ${s[0]}</h2>
              <p>${s[1]}</p>
            </section>`).join('\n');
    const datos = d.datos.map(([k, v]) => `              <div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n');
    return `      <div class="legal__doc" data-legal="${l}" lang="${l}">
        <header class="legal__head">
          <p class="legal__tag">[${d.tag}]</p>
          <h1>${d.h}</h1>
          <p class="legal__lead">${d.lead}</p>
        </header>
        <div class="legal__grid">
          <aside class="legal__aside">
            <dl class="legal__ficha" aria-label="${esc(d.ficha)}">
              <p class="legal__ficha-t">${d.ficha}</p>
${datos}
            </dl>
            <nav class="legal__idx" aria-label="${esc(d.idx)}">
              <p class="legal__idx-t">${d.idx}</p>
              <ol>
${idx}
              </ol>
            </nav>
          </aside>
          <div class="legal__body">
${secs}
            <p class="legal__upd">${d.upd}</p>
            <a class="legal__other" href="${d.other[1]}">${d.other[0]} <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>`;
  }).join('\n');

  const main = `<main id="main">

    <section class="legal" aria-label="${esc(es.h)}">
      <div class="wrap">
        <a class="legal__back" href="./"><span aria-hidden="true">←</span> <span data-i18n="back_home">Volver al inicio</span></a>
${bloques}
      </div>
    </section>

`;
  const pie = toHome(foot).replace(/<p class="ftr__credits">.*<\/p>\n?/, '');
  fs.writeFileSync(path.join(RAIZ, doc.file), (h + main + pie).replace(/\n/g, '\r\n'));
  console.log('Escrita', doc.file);
}

// Títulos y descripciones traducidos para lang.js (los imprime para comprobar)
export const TITULOS = Object.fromEntries(LANGS.map((l) => [l, Object.fromEntries(Object.values(DOCS).flatMap((d) => [[`tl_${d.key}`, d[l].title], [`dl_${d.key}`, d[l].desc]]))]));
