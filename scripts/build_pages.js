// Génère les pages publiques (GitHub Pages, dossier docs/) à partir de la
// politique de confidentialité de l'app.
//
//   node scripts/build_pages.js ../motomastery/assets/legal
//
// À relancer après chaque modification de privacy_fr.md / privacy_en.md.

const fs = require("fs");
const path = require("path");

const legalDir = process.argv[2];
if (!legalDir) {
  console.error("Usage : node scripts/build_pages.js <dossier assets/legal de l'app>");
  process.exit(1);
}
const docs = path.join(__dirname, "..", "docs");
const contact = "support@motomastery.app";

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

const css = `
:root { --bg:#f6f8fb; --card:#ffffff; --text:#1c2430; --soft:#5b6676; --line:#e2e7ee; --accent:#2f5bd3; }
@media (prefers-color-scheme: dark) {
  :root { --bg:#10141b; --card:#171d26; --text:#e6ebf2; --soft:#9aa6b6; --line:#2a3340; --accent:#86a5ff; }
}
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--text);
  font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; overflow-wrap:anywhere; }
main { max-width:760px; margin:0 auto; padding:32px 16px 64px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:18px; padding:28px 24px; }
header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px; }
.brand { font-weight:700; font-size:20px; color:var(--accent); text-decoration:none; }
.lang { font-size:14px; color:var(--soft); }
.lang a { color:var(--accent); }
h1 { font-size:28px; line-height:1.25; margin:0 0 8px; }
h2 { font-size:20px; margin:32px 0 8px; }
p, li { color:var(--text); }
em { color:var(--soft); }
ul { padding-left:22px; }
li { margin:4px 0; }
a { color:var(--accent); }
.steps li { margin:8px 0; }
.note { background:var(--bg); border-radius:12px; padding:14px 16px; color:var(--soft); }
footer { margin-top:24px; font-size:14px; color:var(--soft); text-align:center; }
`;

// root : chemin relatif vers docs/ (liens et accueil)
function page({ lang, title, body, root, other }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>${css}</style>
</head>
<body>
<main>
<header>
  <a class="brand" href="${root}">MotoMastery</a>
  <span class="lang">${other}</span>
</header>
<div class="card">
${body}
</div>
<footer>MotoMastery · <a href="mailto:${contact}">${contact}</a></footer>
</main>
</body>
</html>
`;
}

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
  body: markdown(read("privacy_fr.md")),
  root: "../",
  other: `<a href="en/" hreflang="en">English</a>`,
}));
write("privacy/en/index.html", page({
  lang: "en",
  title: "Privacy policy – MotoMastery",
  body: markdown(read("privacy_en.md")),
  root: "../../",
  other: `<a href="../" hreflang="fr">Français</a>`,
}));

// Suppression du compte (exigée par Google Play et l'App Store)
const deleteFr = `
<h1>Supprimer votre compte MotoMastery</h1>
<p>Vous pouvez supprimer votre compte et toutes vos données à tout moment.</p>
<h2>Depuis l'application</h2>
<ol class="steps">
  <li>Ouvrez MotoMastery et connectez-vous.</li>
  <li>Allez dans l'onglet <strong>Paramètres</strong>.</li>
  <li>Touchez <strong>Supprimer mon compte</strong>.</li>
  <li>Confirmez votre identité (mot de passe, ou reconnexion Google ou Apple), puis touchez <strong>Supprimer définitivement</strong>.</li>
</ol>
<h2>Sans l'application</h2>
<p>Écrivez à <a href="mailto:${contact}?subject=Suppression%20de%20mon%20compte%20MotoMastery">${contact}</a> depuis l'adresse email de votre compte, avec pour objet « Suppression de mon compte ». Nous supprimons le compte dans un délai de 30 jours et vous le confirmons par email.</p>
<h2>Données supprimées</h2>
<ul>
  <li>votre compte (adresse email, nom, mot de passe) ;</li>
  <li>votre profil (pays, province) ;</li>
  <li>toute votre progression : leçons, quiz, examens, séries, leçons « À revoir » et questions manquées ;</li>
  <li>l'historique des notifications et les données enregistrées sur votre appareil.</li>
</ul>
<p class="note">Aucune donnée n'est conservée après la suppression, sauf les copies techniques de nos fournisseurs (Google Firebase), qui disparaissent selon leurs propres délais. La suppression est définitive.</p>
<p>Voir aussi la <a href="../privacy/">politique de confidentialité</a>.</p>
`;
const deleteEn = `
<h1>Delete your MotoMastery account</h1>
<p>You can delete your account and all your data at any time.</p>
<h2>From the app</h2>
<ol class="steps">
  <li>Open MotoMastery and sign in.</li>
  <li>Go to the <strong>Settings</strong> tab.</li>
  <li>Tap <strong>Delete my account</strong>.</li>
  <li>Confirm your identity (password, or sign in again with Google or Apple), then tap <strong>Delete permanently</strong>.</li>
</ol>
<h2>Without the app</h2>
<p>Write to <a href="mailto:${contact}?subject=Delete%20my%20MotoMastery%20account">${contact}</a> from your account's email address, with the subject "Delete my account". We delete the account within 30 days and confirm by email.</p>
<h2>Data deleted</h2>
<ul>
  <li>your account (email address, name, password);</li>
  <li>your profile (country, province);</li>
  <li>all your progress: lessons, quizzes, exams, streaks, "To review" lessons and missed questions;</li>
  <li>notification history and data stored on your device.</li>
</ul>
<p class="note">No data is kept after deletion, except our providers' technical copies (Google Firebase), which are removed according to their own schedules. Deletion is permanent.</p>
<p>See also the <a href="../../privacy/en/">privacy policy</a>.</p>
`;
write("delete-account/index.html", page({
  lang: "fr",
  title: "Supprimer votre compte – MotoMastery",
  body: deleteFr,
  root: "../",
  other: `<a href="en/" hreflang="en">English</a>`,
}));
write("delete-account/en/index.html", page({
  lang: "en",
  title: "Delete your account – MotoMastery",
  body: deleteEn,
  root: "../../",
  other: `<a href="../" hreflang="fr">Français</a>`,
}));

// Accueil
write("index.html", page({
  lang: "fr",
  title: "MotoMastery",
  body: `
<h1>MotoMastery</h1>
<p>Prépare l'examen théorique moto de la SAAQ : cours, quiz et examens blancs.</p>
<ul>
  <li><a href="privacy/">Politique de confidentialité</a> · <a href="privacy/en/">Privacy policy</a></li>
  <li><a href="delete-account/">Supprimer votre compte</a> · <a href="delete-account/en/">Delete your account</a></li>
</ul>
<p>Contact : <a href="mailto:${contact}">${contact}</a></p>
`,
  root: "./",
  other: "",
}));

// Pas de traitement Jekyll : les fichiers sont servis tels quels
fs.writeFileSync(path.join(docs, ".nojekyll"), "");
