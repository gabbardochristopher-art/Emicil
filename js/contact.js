// =========================================================
//  CONTACT PAGE
// =========================================================

document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
  document.getElementById('contact-success').classList.remove('hidden');
  e.target.reset();
  showToast('Message envoyé !');
});
