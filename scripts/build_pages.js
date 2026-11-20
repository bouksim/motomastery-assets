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
  bike: icon('<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h5l4.5 7.5M14 9l-1.5-3H10"/>'),
  refresh: icon('<path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/>'),
  user: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  search: icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  cards: icon('<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>'),
  help: icon('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3 2.5c-.5.2-.5.6-.5 1.5M12 17h.01"/>'),
};
// Le chronomètre de la question d'essai n'a pas de stroke-linejoin
const timer = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>`;

const t = {
  fr: {
    privacy: "Confidentialité", del: "Supprimer mon compte", route: "Le parcours", tryIt: "Une question",
    signs: "Panneaux", premium: "Premium", faq: "Questions", cta: "Obtenir l'app",
    about: "Prépare l'examen théorique du permis moto au Québec : cours, panneaux et examens blancs.",
    legalH: "Légal", contactH: "Contact", privacyFull: "Politique de confidentialité", terms: "Conditions de vente",
    disclaimer: "MotoMastery est une application indépendante, non affiliée à la Société de l'assurance automobile du Québec (SAAQ) ni à aucun organisme gouvernemental.",
  },
  en: {
    privacy: "Privacy", del: "Delete my account", route: "The route", tryIt: "Try a question",
    signs: "Road signs", premium: "Premium", faq: "Questions", cta: "Get the app",
    about: "Get ready for Quebec's motorcycle knowledge test: lessons, road signs and mock exams.",
    legalH: "Legal", contactH: "Contact", privacyFull: "Privacy policy", terms: "Terms of sale",
    disclaimer: "MotoMastery is an independent app, not affiliated with the Société de l'assurance automobile du Québec (SAAQ) or any government agency.",
  },
};

// Tout le style est dans docs/site/style.css, partagé par les pages.
// root : chemin relatif vers docs/ ; switchTo : lien vers l'autre langue ;
// script : fichier de docs/site/ à charger en fin de page ; isHome : barre
// transparente sur le bandeau de l'accueil (le grand logo est dans la page)
function page({ lang, title, description, body, root, switchTo, canonical, script, isHome }) {
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
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}site/style.css">
</head>
<body>
<header class="nav${isHome ? " home" : ""}">
  <div class="wrap">
    <a class="brand-logo" href="${root}${p}"><img src="${root}site/logo-white.png" alt="MotoMastery" width="334" height="154"></a>
    <nav class="links">
      <a class="hide-sm" href="${root}${p}#parcours">${L.route}</a>
      <a class="hide-sm" href="${root}${p}#panneaux">${L.signs}</a>
      <a class="hide-sm" href="${root}${p}#premium">${L.premium}</a>
      <a class="hide-sm" href="${root}${p}#faq">${L.faq}</a>
      <a class="cta" href="${root}${p}#telecharger">${L.cta}</a>
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
        <li><a href="${root}terms/${p}">${L.terms}</a></li>
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

// Conditions de vente du Premium (#14)
write("terms/index.html", page({
  lang: "fr",
  title: "Conditions de vente – MotoMastery",
  description: "Conditions de l'achat de MotoMastery Premium : achat unique, accès à vie, remboursement.",
  body: legal("MotoMastery", "Conditions de vente", markdown(read("terms_fr.md"))),
  root: "../",
  switchTo: "en/",
  canonical: "terms/",
}));
write("terms/en/index.html", page({
  lang: "en",
  title: "Terms of sale – MotoMastery",
  description: "Terms for buying MotoMastery Premium: one-time purchase, lifetime access, refunds.",
  body: legal("MotoMastery", "Terms of sale", markdown(read("terms_en.md"))),
  root: "../../",
  switchTo: "../",
  canonical: "terms/en/",
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
  <li>Vos signalements de questions</li>
  <li>Votre dossier d'achats du Premium chez notre fournisseur de paiements intégrés (RevenueCat)</li>
  <li>L'historique des notifications et les données enregistrées sur votre appareil</li>
</ul>
<p>Seuls restent, sans lien avec votre compte ni votre nom, les rapports de plantage et les statistiques d'utilisation (si vous les aviez acceptées), effacés automatiquement après 90 jours et 2 mois. Les reçus d'achat restent chez Google Play ou l'App Store, selon leurs règles.</p>
<p class="warn"><strong>La suppression est définitive.</strong></p>
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
  <li>Your question reports</li>
  <li>Your Premium purchase record at our in-app purchase provider (RevenueCat)</li>
  <li>Notification history and data stored on your device</li>
</ul>
<p>Only crash reports and usage statistics (if you had accepted them) remain, with no link to your account or name; they are erased automatically after 90 days and 2 months. Purchase receipts stay with Google Play or the App Store, under their own rules.</p>
<p class="warn"><strong>Deletion is permanent.</strong></p>
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

// Accueil (cours et examens en français ; interface en français et en anglais).
// Textes repris de la fiche Play Store (motomastery/store/play-listing.md).
const home = {
  fr: {
    title: "MotoMastery – Prépare ton permis moto au Québec",
    description: "Cours complets, 204 panneaux et examens blancs pour le test théorique du permis moto au Québec. Sans pub, sans abonnement.",
    hello: "Permis moto · Québec",
    h1: "Ton permis moto, bien préparé.",
    lead: "Cours complets, panneaux et examens blancs pour le test théorique moto du Québec.",
    promises: [["Sans pub", "noads", true], ["Sans abonnement", "card"], ["Essai sans compte", "user"]],
    // Badges officiels : à rendre cliquables (lien vers la fiche) une fois l'app publiée
    badges: [
      ["google-play-fr.png", "Disponible sur Google Play", 646, 192],
      ["app-store-fr.svg", "Télécharger dans l'App Store", 127, 40],
    ],
    soon: "Bientôt sur Google Play et l'App Store",
    heroAlt: "Écran d'accueil de MotoMastery",
    stats: [["12", "modules"], ["109", "leçons illustrées"], ["204", "panneaux"], ["0", "publicité"]],
    motoLabel: "Pensée pour la moto",
    motoH: "Tout parle de moto",
    motoSub: "Équipement, maniement, trajectoires, freinage et adhérence, expliqués du point de vue du motocycliste.",
    moto: [
      ["bike", "", "Les règles du Québec", "Le Code de la route et la signalisation, pour le motocycliste."],
      ["refresh", "amber", "Révise ce qui compte", "Chaque jour, 10 questions choisies parmi tes erreurs."],
      ["user", "green", "Essaie sans compte", "Commence tout de suite ; crée ton compte plus tard pour garder ta progression."],
    ],
    routeLabel: "Le parcours",
    routeH: "Trois étapes jusqu'à l'examen",
    routeSub: "Apprends, vérifie ce que tu sais, puis entraîne-toi dans les conditions de l'examen.",
    stage: "Étape",
    steps: [
      {
        h: "Apprendre", p: "12 modules et 109 leçons courtes et illustrées, de la première sortie à la conduite avancée.",
        rows: [
          ["book", "", "Des cours complets", "Équipement, mécanique, techniques de base, circulation, météo et urgences, autoroute, pilotage et réglementation."],
          ["sound", "amber", "À lire ou à écouter", "Chaque leçon peut être lue à voix haute, pour réviser autrement."],
        ],
        shot: "02-lecon", alt: "Une leçon illustrée dans l'application",
      },
      {
        h: "Vérifier", p: "Un quiz à la fin des leçons et des modules, et chaque jour une révision de tes erreurs.",
        rows: [
          ["check", "green", "Des quiz expliqués", "Tu sais tout de suite pourquoi une réponse est la bonne."],
          ["bookmark", "purple", "À revoir", "Une erreur disparaît quand tu la réussis deux fois de suite."],
        ],
        shot: "07-a-revoir", alt: "La révision du jour dans l'application",
      },
      {
        h: "S'entraîner", p: "9 examens par thème, illimités, et des examens blancs chronométrés, différents à chaque essai.",
        rows: [
          ["exam", "", "Tes points faibles", "Ton score par famille de questions, pour savoir quoi revoir."],
          ["flame", "amber", "Reste motivé", "Progression par module, série de jours d'étude et rappels que tu peux désactiver."],
        ],
        shot: "06-examens", alt: "Les examens dans l'application",
      },
    ],
    signsLabel: "Signalisation",
    signsH: "204 panneaux à connaître",
    signsSub: "Ce que chaque panneau du Québec signifie, et ce qu'il faut retenir à moto.",
    signsCardH: "Apprends-les par cœur",
    signsCardP: "Les panneaux ratés reviennent jusqu'à ce que tu les saches.",
    signsRows: [
      ["search", "", "Le répertoire", "204 panneaux, par famille, avec une recherche."],
      ["cards", "purple", "Des cartes-éclair", "Retourne la carte, dis si tu savais."],
      ["help", "green", "408 questions de panneaux", "Pour vérifier que tu les reconnais, et un panneau du jour sur l'accueil."],
    ],
    signsShots: [["03-panneaux", "Le répertoire des panneaux"], ["04-carte-eclair", "Une carte-éclair de panneau"]],
    plansLabel: "Gratuit ou Premium",
    plansH: "Premium, en un seul achat",
    plansSub: "Sans abonnement. Les cours, les examens par thème et le répertoire des panneaux restent gratuits.",
    free: {
      tag: "Gratuit", h: "Pour bien apprendre", sub: "Sans publicité, sans carte de crédit.",
      items: [
        "12 modules et 109 leçons, avec leurs quiz",
        "9 examens par thème, illimités",
        "Le répertoire des 204 panneaux et les cartes-éclair des incontournables",
        "Des examens blancs : 3 pour commencer, puis 1 par jour",
        "La révision de tes erreurs",
      ],
    },
    premium: {
      tag: "Premium", h: "Pour viser la réussite", sub: "Un seul achat, sans abonnement.",
      items: [
        "Une banque de questions exclusives",
        "Des examens blancs illimités",
        "Trois examens de signalisation",
        "La révision ciblée de tes points faibles",
        "Les cartes-éclair de toutes les familles de panneaux",
      ],
    },
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
    dataH: "Sans publicité, tes données respectées",
    data: "Ta progression te suit sur tous tes appareils. Tu peux supprimer ton compte et toutes tes données à tout moment, depuis l'application.",
    more: "En savoir plus",
    faqLabel: "Questions",
    faqH: "Questions fréquentes",
    faq: [
      ["MotoMastery est-elle une application officielle ?", "Non. MotoMastery est une application indépendante, non affiliée à la SAAQ. Elle t'aide à te préparer à l'examen théorique du permis moto au Québec ; pour les règles officielles, consulte le guide de la SAAQ."],
      ["Qu'est-ce qui est gratuit ?", "Les 12 modules et leurs leçons, les 9 examens par thème, le répertoire des 204 panneaux et des examens blancs. Premium ajoute des questions exclusives, des examens blancs illimités et la révision ciblée, en un seul achat, sans abonnement."],
      ["Faut-il créer un compte ?", "Non pour commencer : tu peux essayer l'application sans compte. Un compte gratuit garde ta progression et la retrouve sur tous tes appareils."],
      ["Sur quels appareils ?", "Android bientôt sur Google Play, puis iPhone sur l'App Store. L'interface est en français ou en anglais ; les cours et les examens sont en français."],
      ["Que deviennent mes données ?", "Aucune publicité. Tu peux supprimer ton compte et toutes tes données à tout moment, directement depuis l'application."],
    ],
    finalH: "Prêt pour ton examen ?",
    finalP: "Commence par une leçon, gratuitement, sans créer de compte.",
    finalSoon: "Bientôt disponible",
  },
  en: {
    title: "MotoMastery – Get your Quebec motorcycle licence",
    description: "Complete lessons, 204 road signs and mock exams for Quebec's motorcycle knowledge test. No ads, no subscription. Lessons and exams in French.",
    hello: "Motorcycle licence · Quebec",
    h1: "Your motorcycle licence, well prepared.",
    lead: "Complete lessons, road signs and mock exams for Quebec's motorcycle knowledge test. Lessons and exams are in French.",
    promises: [["No ads", "noads", true], ["No subscription", "card"], ["Try without an account", "user"]],
    badges: [
      ["google-play-en.png", "Get it on Google Play", 564, 168],
      ["app-store-en.svg", "Download on the App Store", 120, 40],
    ],
    soon: "Coming soon to Google Play and the App Store",
    heroAlt: "MotoMastery home screen",
    stats: [["12", "modules"], ["109", "illustrated lessons"], ["204", "road signs"], ["0", "ads"]],
    motoLabel: "Made for motorcycles",
    motoH: "Everything is about riding",
    motoSub: "Gear, handling, lines, braking and grip, explained from the rider's point of view.",
    moto: [
      ["bike", "", "Quebec's rules", "The Highway Safety Code and road signs, for motorcyclists."],
      ["refresh", "amber", "Review what matters", "Every day, 10 questions picked from your mistakes."],
      ["user", "green", "Try without an account", "Start right away; create your account later to keep your progress."],
    ],
    routeLabel: "The route",
    routeH: "Three stages to the test",
    routeSub: "Learn, check what you know, then practise in real exam conditions.",
    stage: "Stage",
    steps: [
      {
        h: "Learn", p: "12 modules and 109 short illustrated lessons, from your first ride to advanced riding.",
        rows: [
          ["book", "", "Complete lessons", "Gear, mechanics, basic techniques, traffic, weather and emergencies, highways, riding skills and regulations."],
          ["sound", "amber", "Read or listen", "Every lesson can be read aloud, for another way to review."],
        ],
        shot: "02-lecon", alt: "An illustrated lesson in the app",
      },
      {
        h: "Check", p: "A quiz at the end of lessons and modules, and a daily review of your mistakes.",
        rows: [
          ["check", "green", "Explained quizzes", "You know right away why an answer is the right one."],
          ["bookmark", "purple", "To review", "A mistake goes away once you get it right twice in a row."],
        ],
        shot: "07-a-revoir", alt: "The daily review in the app",
      },
      {
        h: "Practise", p: "9 unlimited topic exams and timed mock exams, with different questions each time.",
        rows: [
          ["exam", "", "Your weak spots", "Your score by question family, so you know what to review."],
          ["flame", "amber", "Stay motivated", "Progress by module, study streaks and reminders you can turn off."],
        ],
        shot: "06-examens", alt: "The exams in the app",
      },
    ],
    signsLabel: "Road signs",
    signsH: "204 road signs to know",
    signsSub: "What every Quebec road sign means, and what to remember on a motorcycle.",
    signsCardH: "Learn them by heart",
    signsCardP: "Signs you miss come back until you know them.",
    signsRows: [
      ["search", "", "The directory", "204 signs, by family, with search."],
      ["cards", "purple", "Flashcards", "Flip the card, say whether you knew it."],
      ["help", "green", "408 sign questions", "To check that you recognise them, plus a sign of the day on the home screen."],
    ],
    signsShots: [["03-panneaux", "The road sign directory"], ["04-carte-eclair", "A road sign flashcard"]],
    plansLabel: "Free or Premium",
    plansH: "Premium, one purchase",
    plansSub: "No subscription. Lessons, topic exams and the road sign directory stay free.",
    free: {
      tag: "Free", h: "To learn well", sub: "No ads, no credit card.",
      items: [
        "12 modules and 109 lessons, with their quizzes",
        "9 unlimited topic exams",
        "The 204-sign directory and the must-know flashcards",
        "Mock exams: 3 to start, then 1 a day",
        "A review of your mistakes",
      ],
    },
    premium: {
      tag: "Premium", h: "To aim for success", sub: "One purchase, no subscription.",
      items: [
        "A bank of exclusive questions",
        "Unlimited mock exams",
        "Three road sign exams",
        "A targeted review of your weak spots",
        "Flashcards for every road sign family",
      ],
    },
    tryLabel: "Try it",
    tryH: "One question, right now",
    trySub: "Taken from our mock exams (in French in the app). Pick your answer.",
    quiz: {
      exam: "Mock exam", count: "Question 8 of 30", tag: "Single answer",
      q: "At 60 km/h, to start a left turn, you push on…",
      opts: ["The right handgrip", "The left handgrip", "Both handgrips at once"], answer: 1,
      ok: "Correct.", ko: "Wrong answer.",
      why: "Above about 25 km/h, you countersteer: pushing the left handgrip leans the motorcycle to the left.",
    },
    dataH: "No ads, your data respected",
    data: "Your progress follows you on all your devices. You can delete your account and all your data at any time, right from the app.",
    more: "Learn more",
    faqLabel: "Questions",
    faqH: "Frequently asked questions",
    faq: [
      ["Is MotoMastery an official app?", "No. MotoMastery is an independent app, not affiliated with the SAAQ. It helps you prepare for Quebec's motorcycle knowledge test; for the official rules, see the SAAQ guide."],
      ["Is the app in English?", "The interface is in English or French, but the lessons and exams are in French, like the test content you study."],
      ["What is free?", "The 12 modules and their lessons, the 9 topic exams, the 204-sign directory and mock exams. Premium adds exclusive questions, unlimited mock exams and targeted review, as one purchase with no subscription."],
      ["Do I need an account?", "Not to start: you can try the app without an account. A free account keeps your progress and brings it to all your devices."],
      ["What happens to my data?", "No ads. You can delete your account and all your data at any time, right from the app."],
    ],
    finalH: "Ready for your test?",
    finalP: "Start with a lesson, for free, without creating an account.",
    finalSoon: "Coming soon",
  },
};

// Petites icônes des promesses (couleur du texte)
const smallIcon = (d) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const promiseIcons = {
  noads: smallIcon('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'),
  card: smallIcon('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10.5h18M7 15h4"/>'),
  user: smallIcon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
};

// Barre de progression en segments : les `on` premiers sont remplis
const segments = (on, total) =>
  `<div class="segments" aria-hidden="true">${Array.from({ length: total }, (_, i) => (i < on ? '<i class="on"></i>' : "<i></i>")).join("")}</div>`;

const row = ([ic, color, h, d]) =>
  `<div class="row"><span class="tile${color ? " " + color : ""}">${icons[ic]}</span><div><strong>${h}</strong><span>${d}</span></div></div>`;

const badges = (H, root) =>
  `<div class="badges">${H.badges.map(([f, alt, w, h]) => `<img src="${root}site/${f}" alt="${alt}" width="${w}" height="${h}">`).join("")}</div>`;

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
      <figure><img src="${root}site/${s.shot}.webp" alt="${s.alt}" width="540" height="1054" loading="lazy"></figure>
    </article>
`;
}

const plan = (P, cls) => `<div class="card plan${cls}">
        <span class="tag">${P.tag}</span>
        <h3>${P.h}</h3>
        <p class="sub">${P.sub}</p>
        <ul>
          ${P.items.map((it) => `<li>${it}</li>`).join("\n          ")}
        </ul>
      </div>`;

function homeBody(lang, root) {
  const H = home[lang];
  const Q = H.quiz;
  const p = lang === "fr" ? "" : "en/";
  return `
<section class="hero">
  <div class="wrap">
    <div class="copy">
      <img class="logo" src="${root}site/logo-white.png" alt="MotoMastery" width="334" height="154">
      <p class="hello">${H.hello}</p>
      <h1>${H.h1}</h1>
      <p class="lead">${H.lead}</p>
      <ul class="promises">
        ${H.promises.map(([s, ic, gold]) => `<li${gold ? ' class="gold"' : ""}>${promiseIcons[ic]}${s}</li>`).join("")}
      </ul>
      <div class="stores">${badges(H, root)}
        <p class="soon-line">${H.soon}</p></div>
    </div>
    <div class="visual">
      <div class="signs" aria-hidden="true">
        <div class="sign s1"><img src="${root}site/signs/P-70-2.png" alt=""></div>
        <div class="sign s2"><img src="${root}site/signs/D-310-2.png" alt=""></div>
        <div class="sign s3"><img src="${root}site/signs/P-10.png" alt=""></div>
      </div>
      <div class="phone"><img src="${root}site/01-accueil.webp" alt="${H.heroAlt}" width="540" height="1054"></div>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="card stats">
    ${H.stats.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join("\n    ")}
  </div>
</div>

<section>
  <div class="wrap">
    <div class="head first">
      <span class="label">${H.motoLabel}</span>
      <h2>${H.motoH}</h2>
      <p>${H.motoSub}</p>
    </div>
    <div class="moto">
      ${H.moto.map(([ic, color, h, d]) => `<div class="card"><span class="tile${color ? " " + color : ""}">${icons[ic]}</span><div><strong>${h}</strong><span class="t">${d}</span></div></div>`).join("\n      ")}
    </div>
  </div>
</section>

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

<section id="panneaux">
  <div class="wrap">
    <div class="head">
      <span class="label">${H.signsLabel}</span>
      <h2>${H.signsH}</h2>
      <p>${H.signsSub}</p>
    </div>
    <div class="signs-grid">
      <div class="card">
        <h3>${H.signsCardH}</h3>
        <p>${H.signsCardP}</p>
        ${H.signsRows.map(row).join("\n        ")}
      </div>
      ${H.signsShots.map(([f, alt], i) => `<figure${i ? ' class="low"' : ""}><img src="${root}site/${f}.webp" alt="${alt}" width="540" height="1054" loading="lazy"></figure>`).join("\n      ")}
    </div>
  </div>
</section>

<section id="premium">
  <div class="wrap">
    <div class="head">
      <span class="label">${H.plansLabel}</span>
      <h2>${H.plansH}</h2>
      <p>${H.plansSub}</p>
    </div>
    <div class="plans">
      ${plan(H.free, "")}
      ${plan(H.premium, " premium")}
    </div>
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

<section id="faq">
  <div class="wrap">
    <div class="head">
      <span class="label">${H.faqLabel}</span>
      <h2>${H.faqH}</h2>
    </div>
    <div class="faq">
      ${H.faq.map(([q, a], i) => `<details${i ? "" : " open"}><summary>${q}</summary><p>${a}</p></details>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="final" id="telecharger">
  <div class="wrap">
    <img class="final-logo" src="${root}site/logo-white.png" alt="" width="334" height="154">
    <h2>${H.finalH}</h2>
    <p>${H.finalP}</p>
    ${badges(H, root)}
    <p class="soon-line">${H.finalSoon}</p>
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
  script: "quiz.js",
  isHome: true,
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
  isHome: true,
}));

// Pas de traitement Jekyll : les fichiers sont servis tels quels
fs.writeFileSync(path.join(docs, ".nojekyll"), "");
