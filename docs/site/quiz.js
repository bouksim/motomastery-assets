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
