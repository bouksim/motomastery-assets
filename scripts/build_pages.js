// Génère les pages publiques (GitHub Pages, dossier docs/) à partir de la
// politique de confidentialité de l'app.
//
//   node scripts/build_pages.js ../motomastery/assets/legal
//
// À relancer après chaque modification de privacy_fr.md / privacy_en.md.
// Les images du site (icône, captures réduites) sont dans docs/site/.

const fs = require("fs");
const path = require("path");

const legalDir = process.argv[2];
if (!legalDir) {
  console.error("Usage : node scripts/build_pages.js <dossier assets/legal de l'app>");
  process.exit(1);
}
const docs = path.join(__dirname, "..", "docs");
const contact = "support@motomastery.app";
const siteUrl = "https://motomastery.app";
const year = new Date().getFullYear();

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Markdown du texte légal : titres, listes, gras, italique, paragraphes
function inline(s) {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (m) => `<a href="mailto:${m}">${m}</a>`);
}

function markdown(md) {
  const out = [];
  let list = false;
  let para = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push("</ul>");
    list = false;
  };
  for (const raw of md.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    let m;
    if (!line) {
      flush();
      closeList();
    } else if ((m = line.match(/^(#{1,3}) (.*)$/))) {
      flush();
      closeList();
      const level = m[1].length;
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if ((m = line.match(/^- (.*)$/))) {
      flush();
      if (!list) out.push("<ul>");
      list = true;
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      para.push(line);
    }
  }
  flush();
  closeList();
  return out.join("\n");
}

// Icônes (traits, 24 × 24, couleur du texte courant)
const icon = (d) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const icons = {
  book: icon('<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>'),
  check: icon('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
  exam: icon('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  repeat: icon('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>'),
  flame: icon('<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>'),
  lock: icon('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  sound: icon('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  play: icon('<path d="m6 3 14 9-14 9z"/>'),
};

const css = `
:root {
  --bg:#f5f7fb; --surface:#ffffff; --text:#141a26; --soft:#5d6878; --line:#e3e8f0;
  --brand:#2979ff; --brand-ink:#1a5fe0; --brand-soft:#eaf1ff; --accent:#ff9100;
  --hero-1:#2979ff; --hero-2:#1450c8; --shadow:0 18px 40px -18px rgba(20,40,90,.28);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg:#0d1118; --surface:#151b26; --text:#e8edf5; --soft:#9aa6b8; --line:#253045;
    --brand:#5b9bff; --brand-ink:#8db8ff; --brand-soft:#18243a; --accent:#ffab40;
    --hero-1:#1f5fd6; --hero-2:#0e2f7a; --shadow:0 18px 40px -18px rgba(0,0,0,.6);
  }
}
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:var(--bg); color:var(--text);
  font:17px/1.65 "DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  overflow-wrap:anywhere; -webkit-font-smoothing:antialiased; }
img { max-width:100%; height:auto; display:block; }
a { color:var(--brand); }
.wrap { max-width:1080px; margin:0 auto; padding:0 20px; }

/* En-tête */
.nav { position:sticky; top:0; z-index:10; background:color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-bottom:1px solid var(--line); }
.nav .wrap { display:flex; align-items:center; justify-content:space-between; gap:16px; height:64px; }
.brand { display:flex; align-items:center; gap:10px; font-weight:700; font-size:19px; color:var(--text); text-decoration:none; }
.brand img { width:34px; height:34px; border-radius:9px; }
.links { display:flex; align-items:center; gap:18px; font-size:15px; }
.links a { color:var(--soft); text-decoration:none; font-weight:500; }
.links a:hover { color:var(--text); }
.links .lang { border:1px solid var(--line); border-radius:999px; padding:4px 12px; color:var(--text); }
.nav, .brand, .links a { overflow-wrap:normal; white-space:nowrap; }
@media (max-width:640px) { .links .hide-sm { display:none; } .links { gap:12px; } }

/* Accueil */
.hero { background:linear-gradient(135deg,var(--hero-1),var(--hero-2)); color:#fff; overflow:hidden; }
.hero .wrap { display:grid; grid-template-columns:1.15fr .85fr; gap:40px; align-items:center; padding-top:64px; padding-bottom:0; }
.hero h1 { font-size:clamp(36px,5.2vw,58px); line-height:1.08; letter-spacing:-.02em; margin:0 0 18px; }
.hero p.lead { font-size:19px; color:rgba(255,255,255,.88); margin:0 0 28px; max-width:30em; }
.hero .copy { padding-bottom:64px; }
.badge { display:inline-flex; align-items:center; gap:10px; background:#fff; color:#10306f;
  border-radius:14px; padding:12px 20px; font-weight:700; font-size:16px; }
.badge small { display:block; font-weight:500; font-size:12px; color:#5d6878; line-height:1.2; }
.badge svg { color:var(--accent); }
.hero .note { margin-top:14px; font-size:14px; color:rgba(255,255,255,.75); }
.phone { justify-self:center; width:min(300px,78vw); border-radius:34px 34px 0 0; padding:10px 10px 0;
  background:#0b1430; box-shadow:0 30px 60px -20px rgba(0,0,0,.55); }
.phone img { width:100%; border-radius:26px 26px 0 0; aspect-ratio:1/1.55; object-fit:cover; object-position:top; }
@media (max-width:820px) {
  .hero .wrap { grid-template-columns:1fr; padding-top:44px; gap:8px; }
  .hero .copy { padding-bottom:32px; }
}

.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:-0px auto 0; padding:28px 20px; }
.stat { text-align:center; }
.stat b { display:block; font-size:28px; color:var(--brand); line-height:1.2; }
.stat span { color:var(--soft); font-size:15px; }
@media (max-width:640px) { .stats { grid-template-columns:repeat(2,1fr); row-gap:20px; } }

section.block { padding:56px 0; }
section.block h2 { font-size:clamp(26px,3.4vw,36px); line-height:1.2; letter-spacing:-.01em; margin:0 0 10px; text-align:center; }
section.block p.sub { text-align:center; color:var(--soft); margin:0 auto 36px; max-width:36em; }
.grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
@media (max-width:900px) { .grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:600px) { .grid { grid-template-columns:1fr; } }
.feature { background:var(--surface); border:1px solid var(--line); border-radius:20px; padding:24px; }
.feature .ic { width:46px; height:46px; border-radius:13px; display:grid; place-items:center;
  background:var(--brand-soft); color:var(--brand); margin-bottom:14px; }
.feature h3 { margin:0 0 6px; font-size:19px; }
.feature p { margin:0; color:var(--soft); font-size:16px; }

.shots { display:flex; gap:20px; overflow-x:auto; scroll-snap-type:x mandatory; padding:8px 20px 20px;
  justify-content:center; }
.shots figure { margin:0; flex:0 0 220px; scroll-snap-align:center; text-align:center; }
.shots img { border-radius:22px; border:1px solid var(--line); box-shadow:var(--shadow); background:#fff; }
.shots figcaption { margin-top:12px; font-size:15px; color:var(--soft); font-weight:500; }
@media (max-width:1000px) { .shots { justify-content:flex-start; } }

.notice { background:var(--surface); border:1px solid var(--line); border-radius:20px; padding:22px 24px;
  color:var(--soft); font-size:15px; max-width:760px; margin:0 auto; }
.notice strong { color:var(--text); }

/* Pages légales */
.doc-head { background:linear-gradient(135deg,var(--hero-1),var(--hero-2)); color:#fff; }
.doc-head .wrap { max-width:800px; padding-top:44px; padding-bottom:84px; }
.doc-head .kicker { font-size:14px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.75); }
.doc-head h1 { font-size:clamp(28px,4vw,42px); line-height:1.15; margin:6px 0 0; letter-spacing:-.01em; }
.doc { max-width:800px; margin:-56px auto 0; padding:0 20px; }
.doc .paper { background:var(--surface); border:1px solid var(--line); border-radius:22px; padding:36px 40px; box-shadow:var(--shadow); }
@media (max-width:600px) { .doc .paper { padding:26px 20px; } }
.doc .paper > h1:first-child { display:none; }
.doc h2 { font-size:22px; margin:36px 0 10px; padding-top:20px; border-top:1px solid var(--line); }
.doc .paper > h2:first-of-type { margin-top:20px; }
.doc h3 { font-size:18px; margin:24px 0 6px; }
.doc p, .doc li { color:var(--text); }
.doc ul, .doc ol { padding-left:22px; }
.doc li { margin:6px 0; }
.doc li::marker { color:var(--brand); }
.doc em { color:var(--soft); }
.doc .paper > p:first-of-type em:only-child { display:inline-block; background:var(--brand-soft); color:var(--brand-ink);
  font-style:normal; font-size:14px; font-weight:600; border-radius:999px; padding:4px 12px; }
.steps { counter-reset:step; list-style:none; padding-left:0 !important; }
.steps li { counter-increment:step; position:relative; padding-left:46px; margin:14px 0; min-height:32px; }
.steps li::before { content:counter(step); position:absolute; left:0; top:-2px; width:32px; height:32px; border-radius:50%;
  background:var(--brand); color:#fff; font-weight:700; font-size:15px; display:grid; place-items:center; }
.callout { background:var(--brand-soft); border-radius:14px; padding:16px 18px; color:var(--text); }
.callout a { font-weight:600; }
.warn { background:color-mix(in srgb, var(--accent) 14%, var(--surface)); border-radius:14px; padding:16px 18px; }

/* Pied de page */
footer.site { margin-top:64px; border-top:1px solid var(--line); background:var(--surface); }
footer.site .wrap { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:28px; padding-top:40px; padding-bottom:28px; }
footer.site h4 { margin:0 0 10px; font-size:14px; text-transform:uppercase; letter-spacing:.06em; color:var(--soft); }
footer.site ul { list-style:none; padding:0; margin:0; }
footer.site li { margin:6px 0; font-size:15px; }
footer.site li a { color:var(--text); text-decoration:none; }
footer.site li a:hover { color:var(--brand); }
footer.site .about { color:var(--soft); font-size:15px; max-width:26em; }
footer.site .legal { grid-column:1/-1; border-top:1px solid var(--line); padding-top:18px; font-size:13px; color:var(--soft); }
@media (max-width:700px) { footer.site .wrap { grid-template-columns:1fr; } }
`;

const t = {
  fr: {
    privacy: "Confidentialité", del: "Supprimer mon compte", features: "Fonctionnalités",
    about: "Prépare l'examen théorique du permis moto au Québec : cours, quiz et examens blancs.",
    legalH: "Légal", contactH: "Contact", privacyFull: "Politique de confidentialité",
    disclaimer: "MotoMastery est une application indépendante, non affiliée à la Société de l'assurance automobile du Québec (SAAQ) ni à aucun organisme gouvernemental.",
  },
  en: {
    privacy: "Privacy", del: "Delete my account", features: "Features",
    about: "Get ready for Quebec's motorcycle knowledge test: lessons, quizzes and mock exams.",
    legalH: "Legal", contactH: "Contact", privacyFull: "Privacy policy",
    disclaimer: "MotoMastery is an independent app, not affiliated with the Société de l'assurance automobile du Québec (SAAQ) or any government agency.",
  },
};

// root : chemin relatif vers docs/ ; switchTo : lien vers l'autre langue
function page({ lang, title, description, body, root, switchTo, canonical }) {
  const L = t[lang];
  const p = lang === "fr" ? "" : "en/";
  const other = switchTo
    ? `<a class="lang" href="${switchTo}" hreflang="${lang === "fr" ? "en" : "fr"}">${lang === "fr" ? "EN" : "FR"}</a>`
    : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="theme-color" content="#2979ff">
<link rel="canonical" href="${siteUrl}/${canonical}">
<link rel="icon" type="image/png" sizes="32x32" href="${root}site/favicon-32.png">
<link rel="apple-touch-icon" href="${root}site/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="MotoMastery">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${siteUrl}/${canonical}">
<meta property="og:image" content="${siteUrl}/site/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<header class="nav">
  <div class="wrap">
    <a class="brand" href="${root}${p}"><img src="${root}site/icon-192.png" alt="" width="34" height="34">MotoMastery</a>
    <nav class="links">
      <a class="hide-sm" href="${root}${p}#fonctionnalites">${L.features}</a>
      <a href="${root}privacy/${p}">${L.privacy}</a>
      ${other}
    </nav>
  </div>
</header>
${body}
<footer class="site">
  <div class="wrap">
    <div>
      <a class="brand" href="${root}${p}"><img src="${root}site/icon-192.png" alt="" width="34" height="34">MotoMastery</a>
      <p class="about">${L.about}</p>
    </div>
    <div>
      <h4>${L.legalH}</h4>
      <ul>
        <li><a href="${root}privacy/${p}">${L.privacyFull}</a></li>
        <li><a href="${root}delete-account/${p}">${L.del}</a></li>
      </ul>
    </div>
    <div>
      <h4>${L.contactH}</h4>
      <ul><li><a href="mailto:${contact}">${contact}</a></li></ul>
    </div>
    <p class="legal">© ${year} Mastery Software · ${L.disclaimer}</p>
  </div>
</footer>
</body>
</html>
`;
}

// Page légale : bandeau titre + feuille blanche
const legal = (kicker, h1, html) => `
<div class="doc-head"><div class="wrap"><div class="kicker">${kicker}</div><h1>${h1}</h1></div></div>
<main class="doc"><article class="paper">
${html}
</article></main>`;

function write(rel, html) {
  const file = path.join(docs, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log("écrit", path.relative(path.join(__dirname, ".."), file));
}

const read = (name) => fs.readFileSync(path.join(legalDir, name), "utf8");

// Politique de confidentialité
write("privacy/index.html", page({
  lang: "fr",
  title: "Politique de confidentialité – MotoMastery",
  description: "Quels renseignements MotoMastery recueille, pourquoi, et comment exercer vos droits.",
  body: legal("MotoMastery", "Politique de confidentialité", markdown(read("privacy_fr.md"))),
  root: "../",
  switchTo: "en/",
  canonical: "privacy/",
}));
write("privacy/en/index.html", page({
  lang: "en",
  title: "Privacy policy – MotoMastery",
  description: "What information MotoMastery collects, why, and how to exercise your rights.",
  body: legal("MotoMastery", "Privacy policy", markdown(read("privacy_en.md"))),
  root: "../../",
  switchTo: "../",
  canonical: "privacy/en/",
}));

// Suppression du compte (exigée par Google Play et l'App Store)
const deleteFr = `
<p>Vous pouvez supprimer votre compte et toutes vos données à tout moment.</p>
<h2>Depuis l'application</h2>
<ol class="steps">
  <li>Ouvrez MotoMastery et connectez-vous.</li>
  <li>Allez dans l'onglet <strong>Paramètres</strong>.</li>
  <li>Touchez <strong>Supprimer mon compte</strong>.</li>
  <li>Confirmez votre identité (mot de passe, ou reconnexion Google ou Apple), puis touchez <strong>Supprimer définitivement</strong>.</li>
</ol>
<h2>Sans l'application</h2>
<p class="callout">Écrivez à <a href="mailto:${contact}?subject=Suppression%20de%20mon%20compte%20MotoMastery">${contact}</a> depuis l'adresse email de votre compte, avec pour objet « Suppression de mon compte ». Nous supprimons le compte dans un délai de 30 jours et vous le confirmons par email.</p>
<h2>Données supprimées</h2>
<ul>
  <li>Votre compte (adresse email, nom, mot de passe)</li>
  <li>Votre profil (pays, province)</li>
  <li>Toute votre progression : leçons, quiz, examens, séries, leçons « À revoir » et questions manquées</li>
  <li>L'historique des notifications et les données enregistrées sur votre appareil</li>
</ul>
<p class="warn">Aucune donnée n'est conservée après la suppression. <strong>La suppression est définitive.</strong></p>
<p>Voir aussi la <a href="../privacy/">politique de confidentialité</a>.</p>
`;
const deleteEn = `
<p>You can delete your account and all your data at any time.</p>
<h2>From the app</h2>
<ol class="steps">
  <li>Open MotoMastery and sign in.</li>
  <li>Go to the <strong>Settings</strong> tab.</li>
  <li>Tap <strong>Delete my account</strong>.</li>
  <li>Confirm your identity (password, or sign in again with Google or Apple), then tap <strong>Delete permanently</strong>.</li>
</ol>
<h2>Without the app</h2>
<p class="callout">Write to <a href="mailto:${contact}?subject=Delete%20my%20MotoMastery%20account">${contact}</a> from your account's email address, with the subject "Delete my account". We delete the account within 30 days and confirm by email.</p>
<h2>Data deleted</h2>
<ul>
  <li>Your account (email address, name, password)</li>
  <li>Your profile (country, province)</li>
  <li>All your progress: lessons, quizzes, exams, streaks, "To review" lessons and missed questions</li>
  <li>Notification history and data stored on your device</li>
</ul>
<p class="warn">No data is kept after deletion. <strong>Deletion is permanent.</strong></p>
<p>See also the <a href="../../privacy/en/">privacy policy</a>.</p>
`;
write("delete-account/index.html", page({
  lang: "fr",
  title: "Supprimer votre compte – MotoMastery",
  description: "Comment supprimer votre compte MotoMastery et toutes vos données.",
  body: legal("MotoMastery", "Supprimer votre compte", deleteFr),
  root: "../",
  switchTo: "en/",
  canonical: "delete-account/",
}));
write("delete-account/en/index.html", page({
  lang: "en",
  title: "Delete your account – MotoMastery",
  description: "How to delete your MotoMastery account and all your data.",
  body: legal("MotoMastery", "Delete your account", deleteEn),
  root: "../../",
  switchTo: "../",
  canonical: "delete-account/en/",
}));

// Accueil (le contenu des cours est en français, l'interface en français et en anglais)
const feature = (ic, h, p) =>
  `<div class="feature"><div class="ic">${icons[ic]}</div><h3>${h}</h3><p>${p}</p></div>`;
const shot = (root, file, caption) =>
  `<figure><img src="${root}site/${file}.webp" alt="${escape(caption)}" width="540" height="1080" loading="lazy"><figcaption>${caption}</figcaption></figure>`;

const home = {
  fr: {
    title: "MotoMastery – Prépare ton permis moto au Québec",
    description: "Cours, quiz et examens blancs pour réussir l'examen théorique du permis moto au Québec.",
    h1: "Ton permis moto, bien préparé.",
    lead: "Des cours clairs, des quiz et des examens blancs pour réussir l'examen théorique du permis moto au Québec, à ton rythme.",
    soon: "Bientôt sur",
    note: "Sans publicité · Interface en français et en anglais",
    heroAlt: "Écran d'accueil de MotoMastery",
    stats: [["10", "modules"], ["80+", "leçons illustrées"], ["30", "questions par examen blanc"], ["0", "publicité"]],
    featuresH: "Tout pour réussir l'examen théorique",
    featuresSub: "Apprends, vérifie ce que tu sais, puis entraîne-toi dans les conditions de l'examen.",
    features: [
      ["book", "Des cours complets", "Équipement, maniement, trajectoires, circulation, météo, mécanique, urgences et réglementation, en leçons courtes et illustrées."],
      ["check", "Des quiz pour valider", "Un quiz à la fin des leçons et des modules, avec l'explication de chaque réponse."],
      ["exam", "Des examens blancs", "Examens thématiques et examen blanc chronométré, avec des questions différentes à chaque essai."],
      ["repeat", "« À revoir »", "Tes erreurs sont gardées de côté : révise-les jusqu'à ce que tu les maîtrises."],
      ["flame", "Reste motivé", "Progression par module, série de jours d'étude et rappels que tu peux désactiver."],
      ["sound", "À lire ou à écouter", "Chaque leçon peut être lue à voix haute, pour réviser autrement."],
    ],
    shotsH: "Aperçu de l'application",
    shotsSub: "Une interface simple, en thème clair ou sombre.",
    shots: [["02-lecon", "Leçons illustrées"], ["03-quiz", "Quiz expliqués"], ["05-examen", "Examens blancs"], ["06-resultat", "Correction détaillée"]],
    dataH: "Tes données respectées.",
    data: "Ta progression est sauvegardée dans ton compte et te suit sur tous tes appareils. Tu peux supprimer ton compte et toutes tes données à tout moment, directement depuis l'application.",
    more: "En savoir plus",
  },
  en: {
    title: "MotoMastery – Get your Quebec motorcycle licence",
    description: "Lessons, quizzes and mock exams to pass Quebec's motorcycle knowledge test.",
    h1: "Your motorcycle licence, well prepared.",
    lead: "Clear lessons, quizzes and mock exams to pass Quebec's motorcycle knowledge test, at your own pace.",
    soon: "Coming soon on",
    note: "No ads · Interface in French and English · Course content in French",
    heroAlt: "MotoMastery home screen",
    stats: [["10", "modules"], ["80+", "illustrated lessons"], ["30", "questions per mock exam"], ["0", "ads"]],
    featuresH: "Everything to pass the knowledge test",
    featuresSub: "Learn, check what you know, then practise in real exam conditions.",
    features: [
      ["book", "Complete lessons", "Gear, handling, lines, traffic, weather, mechanics, emergencies and regulations, in short illustrated lessons."],
      ["check", "Quizzes to check yourself", "A quiz at the end of lessons and modules, with an explanation for every answer."],
      ["exam", "Mock exams", "Topic exams and a timed mock exam, with different questions each time."],
      ["repeat", "\"To review\"", "Your mistakes are set aside: review them until you master them."],
      ["flame", "Stay motivated", "Progress by module, study streaks and reminders you can turn off."],
      ["sound", "Read or listen", "Every lesson can be read aloud, for another way to review."],
    ],
    shotsH: "A look at the app",
    shotsSub: "A simple interface, in light or dark theme.",
    shots: [["02-lecon", "Illustrated lessons"], ["03-quiz", "Explained quizzes"], ["05-examen", "Mock exams"], ["06-resultat", "Detailed corrections"]],
    dataH: "Your data, respected.",
    data: "Your progress is saved in your account and follows you on all your devices. You can delete your account and all your data at any time, right from the app.",
    more: "Learn more",
  },
};

function homeBody(lang, root) {
  const H = home[lang];
  const p = lang === "fr" ? "" : "en/";
  return `
<section class="hero">
  <div class="wrap">
    <div class="copy">
      <h1>${H.h1}</h1>
      <p class="lead">${H.lead}</p>
      <span class="badge">${icons.play}<span><small>${H.soon}</small>Google Play</span></span>
      <p class="note">${H.note}</p>
    </div>
    <div class="phone"><img src="${root}site/01-accueil.webp" alt="${H.heroAlt}" width="540" height="1080"></div>
  </div>
</section>

<div class="wrap stats">
  ${H.stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("\n  ")}
</div>

<section class="block" id="fonctionnalites">
  <div class="wrap">
    <h2>${H.featuresH}</h2>
    <p class="sub">${H.featuresSub}</p>
    <div class="grid">
      ${H.features.map(([ic, h, d]) => feature(ic, h, d)).join("\n      ")}
    </div>
  </div>
</section>

<section class="block" style="padding-top:8px">
  <div class="wrap">
    <h2>${H.shotsH}</h2>
    <p class="sub">${H.shotsSub}</p>
  </div>
  <div class="shots">
    ${H.shots.map(([f, c]) => shot(root, f, c)).join("\n    ")}
  </div>
</section>

<section class="block" style="padding-top:8px">
  <div class="wrap">
    <div class="notice">${icons.lock.replace('width="24" height="24"', 'width="20" height="20" style="vertical-align:-4px;margin-right:6px"')}<strong>${H.dataH}</strong> ${H.data} <a href="${root}privacy/${p}">${H.more}</a></div>
  </div>
</section>
`;
}

write("index.html", page({
  lang: "fr",
  title: home.fr.title,
  description: home.fr.description,
  root: "./",
  switchTo: "en/",
  canonical: "",
  body: homeBody("fr", "./"),
}));
write("en/index.html", page({
  lang: "en",
  title: home.en.title,
  description: home.en.description,
  root: "../",
  switchTo: "../",
  canonical: "en/",
  body: homeBody("en", "../"),
}));

// Pas de traitement Jekyll : les fichiers sont servis tels quels
fs.writeFileSync(path.join(docs, ".nojekyll"), "");
