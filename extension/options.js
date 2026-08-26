const steps = Array.from(document.querySelectorAll('fieldset[data-step]'));
let current = 0;
let photoDataUrl = null;

const progressEl = document.getElementById('progress');
const liveRegion = document.getElementById('liveRegion');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const saveBtn = document.getElementById('saveBtn');
const form = document.getElementById('wizardForm');

const stepText = {
  0: 'Welcome. This form asks for your name, a password, and a few details. We save it only on this device, and use it to help fill in Google and Instagram sign up pages for you. You still press submit yourself and complete any human verification step.',
  1: 'Your name. Enter your first name and last name.',
  2: 'Username. Enter the username you want. Letters and numbers only, no spaces. This will also be part of your Gmail address.',
  3: 'Password. Enter a password with at least 8 characters, then type it again to confirm.',
  4: 'Your birthday. Choose the month, then enter the day and year you were born.',
  5: 'Profile picture. This is optional. Choose a photo of yourself if you would like one.',
  6: 'Review and save. Check your answers, then press Save my info.',
};

function showStep(index) {
  steps.forEach((el, i) => { el.hidden = i !== index; });
  progressEl.textContent = `Step ${index + 1} of ${steps.length}`;
  backBtn.hidden = index === 0;
  nextBtn.hidden = index === steps.length - 1;
  saveBtn.hidden = index !== steps.length - 1;
  if (index === steps.length - 1) renderReview();
  const legend = steps[index].querySelector('legend');
  liveRegion.textContent = legend ? `Now on: ${legend.textContent}` : '';
  const firstField = steps[index].querySelector('input, select, button');
  if (firstField) firstField.focus();
}

function validateStep(index) {
  const fieldset = steps[index];
  const inputs = fieldset.querySelectorAll('input[required], select[required]');
  for (const input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }
  if (index === 3) {
    const pw = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const mismatch = document.getElementById('passwordMismatch');
    if (pw !== confirm) {
      mismatch.hidden = false;
      document.getElementById('confirmPassword').focus();
      return false;
    }
    mismatch.hidden = true;
  }
  return true;
}

nextBtn.addEventListener('click', () => {
  if (!validateStep(current)) return;
  current = Math.min(current + 1, steps.length - 1);
  showStep(current);
});

backBtn.addEventListener('click', () => {
  current = Math.max(current - 1, 0);
  showStep(current);
});

document.querySelectorAll('.readAloud').forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.target);
    speak(stepText[idx] || '');
  });
});

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

document.getElementById('showPassword').addEventListener('change', (e) => {
  const type = e.target.checked ? 'text' : 'password';
  document.getElementById('password').type = type;
  document.getElementById('confirmPassword').type = type;
});

document.getElementById('contrastToggle').addEventListener('click', (e) => {
  const on = document.body.classList.toggle('high-contrast');
  e.target.setAttribute('aria-pressed', String(on));
  e.target.textContent = `High contrast: ${on ? 'On' : 'Off'}`;
  chrome.storage.local.set({ highContrast: on });
});

document.getElementById('photo').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  resizeImageToDataUrl(file, 512).then((dataUrl) => {
    photoDataUrl = dataUrl;
    const preview = document.getElementById('photoPreview');
    preview.src = dataUrl;
    preview.hidden = false;
    document.getElementById('removePhoto').hidden = false;
  });
});

document.getElementById('removePhoto').addEventListener('click', () => {
  photoDataUrl = null;
  document.getElementById('photo').value = '';
  document.getElementById('photoPreview').hidden = true;
  document.getElementById('removePhoto').hidden = true;
});

function resizeImageToDataUrl(file, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderReview() {
  const data = collectData();
  const el = document.getElementById('reviewSummary');
  el.innerHTML = `
    <dl>
      <dt>Name</dt><dd>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</dd>
      <dt>Username</dt><dd>${escapeHtml(data.usernameBase)}</dd>
      <dt>Password</dt><dd>${'•'.repeat(Math.min(data.password.length, 12)) || '(not set)'}</dd>
      <dt>Birthday</dt><dd>${escapeHtml(data.birthMonth)}/${escapeHtml(data.birthDay)}/${escapeHtml(data.birthYear)}</dd>
      <dt>Picture</dt><dd>${photoDataUrl ? 'Added' : 'None chosen'}</dd>
    </dl>
  `;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function collectData() {
  return {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    usernameBase: document.getElementById('usernameBase').value.trim(),
    password: document.getElementById('password').value,
    birthMonth: document.getElementById('birthMonth').value,
    birthDay: document.getElementById('birthDay').value,
    birthYear: document.getElementById('birthYear').value,
  };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep(current)) return;
  const profile = { ...collectData(), photoDataUrl, updatedAt: Date.now() };
  chrome.storage.local.set({ profile }, () => {
    document.getElementById('savedMessage').hidden = false;
    liveRegion.textContent = 'Saved.';
  });
});

// Restore existing profile + preferences, if any.
chrome.storage.local.get(['profile', 'highContrast'], ({ profile, highContrast }) => {
  if (highContrast) {
    document.body.classList.add('high-contrast');
    document.getElementById('contrastToggle').setAttribute('aria-pressed', 'true');
    document.getElementById('contrastToggle').textContent = 'High contrast: On';
  }
  if (profile) {
    document.getElementById('firstName').value = profile.firstName || '';
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('usernameBase').value = profile.usernameBase || '';
    document.getElementById('password').value = profile.password || '';
    document.getElementById('confirmPassword').value = profile.password || '';
    document.getElementById('birthMonth').value = profile.birthMonth || '';
    document.getElementById('birthDay').value = profile.birthDay || '';
    document.getElementById('birthYear').value = profile.birthYear || '';
    if (profile.photoDataUrl) {
      photoDataUrl = profile.photoDataUrl;
      const preview = document.getElementById('photoPreview');
      preview.src = photoDataUrl;
      preview.hidden = false;
      document.getElementById('removePhoto').hidden = false;
    }
  }
  showStep(0);
});
