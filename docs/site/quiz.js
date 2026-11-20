// Question d'essai de la page d'accueil
document.querySelectorAll('.sheet').forEach(function (sheet) {
  var answer = Number(sheet.dataset.answer);
  var buttons = sheet.querySelectorAll('.opts button');
  var why = sheet.querySelector('.why');
  var verdict = why.querySelector('strong');
  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.disabled = true; });
      buttons[answer].classList.add('good');
      if (i !== answer) btn.classList.add('wrong');
      verdict.textContent = verdict.dataset[i === answer ? 'ok' : 'ko'];
      why.classList.toggle('ko', i !== answer);
      why.hidden = false;
    });
  });
});

// Accueil : la barre devient bleue avec le petit logo une fois le grand logo passé
(function () {
  var nav = document.querySelector('.nav.home');
  var big = document.querySelector('.hero .logo');
  if (!nav || !big) return;
  if (!('IntersectionObserver' in window)) { nav.classList.add('scrolled'); return; }
  new IntersectionObserver(function (e) { nav.classList.toggle('scrolled', !e[0].isIntersecting); }).observe(big);
})();
