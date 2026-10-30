// Génère les pages publiques (GitHub Pages, dossier docs/) à partir de la
// politique de confidentialité de l'app.
//
//   node scripts/build_pages.js ../motomastery/assets/legal
//
// À relancer après chaque modification de privacy_fr.md / privacy_en.md.
// Le style (site/style.css), la question d'essai (site/quiz.js) et les images
// (icône, captures réduites, badges des stores) sont dans docs/site/.

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

// Icônes (traits, couleur du texte courant)
const icon = (d) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const icons = {
  book: icon('<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>'),
  check: icon('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
  exam: icon('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  bookmark: icon('<path d="M6 3h12v18l-6-4-6 4z"/>'),
  flame: icon('<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/>'),
  lock: icon('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  sound: icon('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
};
// Le chronomètre de la question d'essai n'a pas de stroke-linejoin
const timer = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>`;

const t = {
  fr: {
    privacy: "Confidentialité", del: "Supprimer mon compte", route: "Le parcours", tryIt: "Une question",
    about: "Prépare l'examen théorique du permis moto au Québec : cours, quiz et examens blancs.",
    legalH: "Légal", contactH: "Contact", privacyFull: "Politique de confidentialité",
    disclaimer: "MotoMastery est une application indépendante, non affiliée à la Société de l'assurance automobile du Québec (SAAQ) ni à aucun organisme gouvernemental.",
  },
  en: {
    privacy: "Privacy", del: "Delete my account", route: "The route", tryIt: "Try a question",
    about: "Get ready for Quebec's motorcycle knowledge test: lessons, quizzes and mock exams.",
    legalH: "Legal", contactH: "Contact", privacyFull: "Privacy policy",
    disclaimer: "MotoMastery is an independent app, not affiliated with the Société de l'assurance automobile du Québec (SAAQ) or any government agency.",
  },
};

// Tout le style est dans docs/site/style.css, partagé par les pages.
// root : chemin relatif vers docs/ ; switchTo : lien vers l'autre langue ;
// script : fichier de docs/site/ à charger en fin de page
function page({ lang, title, description, body, root, switchTo, canonical, script }) {
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
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}site/style.css">
</head>
<body>
<header class="nav">
  <div class="wrap">
    <a class="brand" href="${root}${p}"><img src="${root}site/icon-192.png" alt="" width="34" height="34">MotoMastery</a>
    <nav class="links">
      <a class="hide-sm" href="${root}${p}#parcours">${L.route}</a>
      <a class="hide-sm" href="${root}${p}#essai">${L.tryIt}</a>
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
${script ? `<script src="${root}site/${script}" defer></script>
` : ""}</body>
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
const home = {
  fr: {
    title: "MotoMastery – Prépare ton permis moto au Québec",
    description: "Cours, quiz et examens blancs pour réussir l'examen théorique du permis moto au Québec.",
    hello: "Permis moto au Québec",
    h1: "Ton permis moto, bien préparé.",
    lead: "Des cours clairs, des quiz et des examens blancs pour réussir l'examen théorique du permis moto au Québec, à ton rythme.",
    soon: "Bientôt disponible",
    // Badges officiels : à rendre cliquables (lien vers la fiche) une fois l'app publiée
    badges: [
      ["google-play-fr.png", "Disponible sur Google Play", 646, 192],
      ["app-store-fr.svg", "Télécharger dans l'App Store", 127, 40],
    ],
    note: "Sans publicité · Interface en français et en anglais",
    heroAlt: "Écran d'accueil de MotoMastery",
    stats: [["10", "modules"], ["80+", "leçons illustrées"], ["30", "questions par examen"], ["0", "publicité"]],
    routeLabel: "Le parcours",
    routeH: "Trois étapes jusqu'à l'examen",
    routeSub: "Apprends, vérifie ce que tu sais, puis entraîne-toi dans les conditions de l'examen.",
    stage: "Étape",
    steps: [
      {
        h: "Apprendre", p: "Tout le contenu de l'examen, découpé en leçons courtes et illustrées.",
        rows: [
          ["book", "", "Des cours complets", "Équipement, maniement, trajectoires, circulation, météo, mécanique, urgences et réglementation."],
          ["sound", "amber", "À lire ou à écouter", "Chaque leçon peut être lue à voix haute, pour réviser autrement."],
        ],
        shot: "02-lecon", alt: "Une leçon illustrée dans l'application",
      },
      {
        h: "Vérifier", p: "Un quiz à la fin des leçons et des modules, avec l'explication de chaque réponse.",
        rows: [
          ["check", "green", "Des quiz expliqués", "Tu sais tout de suite pourquoi une réponse est la bonne."],
          ["bookmark", "purple", "À revoir", "Tes erreurs sont gardées de côté : révise-les jusqu'à ce que tu les maîtrises."],
        ],
        shot: "03-quiz", alt: "Un quiz dans l'application",
      },
      {
        h: "S'entraîner", p: "Examens thématiques et examen blanc chronométré, avec des questions différentes à chaque essai.",
        rows: [
          ["exam", "", "Une correction détaillée", "Chaque question revue à la fin de l'examen."],
          ["flame", "amber", "Reste motivé", "Progression par module, série de jours d'étude et rappels que tu peux désactiver."],
        ],
        shot: "05-examen", alt: "Un examen blanc dans l'application",
      },
    ],
    tryLabel: "Essaie",
    tryH: "Une question, tout de suite",
    trySub: "Tirée de nos examens blancs. Choisis ta réponse.",
    quiz: {
      exam: "Examen blanc", count: "Question 8 sur 30", tag: "Réponse unique",
      q: "À 60 km/h, pour amorcer un virage à gauche, vous poussez sur…",
      opts: ["La poignée droite", "La poignée gauche", "Les deux poignées en même temps"], answer: 1,
      ok: "Bonne réponse.", ko: "Mauvaise réponse.",
      why: "Au-delà d'environ 25 km/h, on contre-braque : pousser la poignée gauche incline la moto vers la gauche.",
    },
    dataH: "Tes données respectées",
    data: "Ta progression te suit sur tous tes appareils. Tu peux supprimer ton compte et toutes tes données à tout moment, depuis l'application.",
    more: "En savoir plus",
  },
  en: {
    title: "MotoMastery – Get your Quebec motorcycle licence",
    description: "Lessons, quizzes and mock exams to pass Quebec's motorcycle knowledge test.",
    hello: "Quebec motorcycle licence",
    h1: "Your motorcycle licence, well prepared.",
    lead: "Clear lessons, quizzes and mock exams to pass Quebec's motorcycle knowledge test, at your own pace.",
    soon: "Coming soon",
    badges: [
      ["google-play-en.png", "Get it on Google Play", 564, 168],
      ["app-store-en.svg", "Download on the App Store", 120, 40],
    ],
    note: "No ads · Interface in French and English · Course content in French",
    heroAlt: "MotoMastery home screen",
    stats: [["10", "modules"], ["80+", "illustrated lessons"], ["30", "questions per exam"], ["0", "ads"]],
    routeLabel: "The route",
    routeH: "Three stages to the test",
    routeSub: "Learn, check what you know, then practise in real exam conditions.",
    stage: "Stage",
    steps: [
      {
        h: "Learn", p: "Everything the test covers, split into short illustrated lessons.",
        rows: [
          ["book", "", "Complete lessons", "Gear, handling, lines, traffic, weather, mechanics, emergencies and regulations."],
          ["sound", "amber", "Read or listen", "Every lesson can be read aloud, for another way to review."],
        ],
        shot: "02-lecon", alt: "An illustrated lesson in the app",
      },
      {
        h: "Check", p: "A quiz at the end of lessons and modules, with an explanation for every answer.",
        rows: [
          ["check", "green", "Explained quizzes", "You know right away why an answer is the right one."],
          ["bookmark", "purple", "To review", "Your mistakes are set aside: review them until you master them."],
        ],
        shot: "03-quiz", alt: "A quiz in the app",
      },
      {
        h: "Practise", p: "Topic exams and a timed mock exam, with different questions each time.",
        rows: [
          ["exam", "", "Detailed corrections", "Every question reviewed at the end of the exam."],
          ["flame", "amber", "Stay motivated", "Progress by module, study streaks and reminders you can turn off."],
        ],
        shot: "05-examen", alt: "A mock exam in the app",
      },
    ],
    tryLabel: "Try it",
    tryH: "One question, right now",
    trySub: "Taken from our mock exams. Pick your answer.",
    quiz: {
      exam: "Mock exam", count: "Question 8 of 30", tag: "Single answer",
      q: "At 60 km/h, to start a left turn, you push on…",
      opts: ["The right handgrip", "The left handgrip", "Both handgrips at once"], answer: 1,
      ok: "Correct.", ko: "Wrong answer.",
      why: "Above about 25 km/h, you countersteer: pushing the left handgrip leans the motorcycle to the left.",
    },
    dataH: "Your data, respected",
    data: "Your progress follows you on all your devices. You can delete your account and all your data at any time, right from the app.",
    more: "Learn more",
  },
};

// Barre de progression en segments : les `on` premiers sont remplis
const segments = (on, total) =>
  `<div class="segments" aria-hidden="true">${Array.from({ length: total }, (_, i) => (i < on ? '<i class="on"></i>' : "<i></i>")).join("")}</div>`;

const row = ([ic, color, h, d]) =>
  `<div class="row"><span class="tile${color ? " " + color : ""}">${icons[ic]}</span><div><strong>${h}</strong><span>${d}</span></div></div>`;

function step(H, s, i, root) {
  const n = H.steps.length;
  return `<article class="step">
      <div class="card">
        <div class="top"><span class="label">${H.stage} ${i + 1}</span><span>${i + 1} / ${n}</span></div>
        <h3>${s.h}</h3>
        <p>${s.p}</p>
        ${segments(i + 1, n)}
        ${s.rows.map(row).join("\n        ")}
      </div>
      <figure><img src="${root}site/${s.shot}.webp" alt="${s.alt}" width="540" height="1080" loading="lazy"></figure>
    </article>
`;
}

function homeBody(lang, root) {
  const H = home[lang];
  const Q = H.quiz;
  const p = lang === "fr" ? "" : "en/";
  return `
<section class="hero">
  <div class="wrap">
    <div class="copy">
      <p class="hello">${H.hello}</p>
      <h1>${H.h1}</h1>
      <p class="lead">${H.lead}</p>
      <div class="stores"><span class="soon">${H.soon}</span><div class="badges">${H.badges.map(([f, alt, w, h]) => `<img src="${root}site/${f}" alt="${alt}" width="${w}" height="${h}">`).join("")}</div></div>
      <p class="note">${H.note}</p>
    </div>
    <div class="visual">
      <div class="phone"><img src="${root}site/01-accueil.webp" alt="${H.heroAlt}" width="540" height="1080"></div>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="card stats">
    ${H.stats.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("\n    ")}
  </div>
</div>

<section id="parcours">
  <div class="wrap">
    <div class="head">
      <span class="label">${H.routeLabel}</span>
      <h2>${H.routeH}</h2>
      <p>${H.routeSub}</p>
    </div>

    ${H.steps.map((s, i) => step(H, s, i, root)).join("\n    ")}
  </div>
</section>

<section class="try" id="essai">
  <div class="wrap">
    <div class="head">
      <span class="label">${H.tryLabel}</span>
      <h2>${H.tryH}</h2>
      <p>${H.trySub}</p>
    </div>
    <div class="card quiz sheet" data-answer="${Q.answer}">
      <div class="bar-top"><span>${Q.exam}</span><span class="timer">${timer}20:48</span></div>
      ${segments(8, 15)}
      <p class="count">${Q.count}</p>
      <span class="tag">${Q.tag}</span>
      <p class="q">${Q.q}</p>
      <div class="opts">
        ${Q.opts.map((o) => `<button type="button">${o}</button>`).join("\n        ")}
      </div>
      <p class="why" hidden aria-live="polite"><strong data-ok="${Q.ok}" data-ko="${Q.ko}"></strong>${Q.why}</p>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="card data">
    <span class="tile">${icons.lock}</span>
    <div><strong>${H.dataH}</strong><p>${H.data}</p></div>
    <a class="pill pill-outline" href="${root}privacy/${p}">${H.more}</a>
  </div>
</div>
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
  script: "quiz.js",
}));
write("en/index.html", page({
  lang: "en",
  title: home.en.title,
  description: home.en.description,
  root: "../",
  switchTo: "../",
  canonical: "en/",
  body: homeBody("en", "../"),
  script: "quiz.js",
}));

// Pas de traitement Jekyll : les fichiers sont servis tels quels
fs.writeFileSync(path.join(docs, ".nojekyll"), "");
