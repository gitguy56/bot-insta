// Shared helpers used by content-google.js and content-instagram.js.
// This file only ever fills form fields with the user's own saved info —
// it never submits a form and never touches CAPTCHA / phone-verification steps.

function esaSetNativeValue(el, value) {
  const proto = Object.getPrototypeOf(el);
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  if (descriptor && descriptor.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// Try a list of CSS selectors in order; fill the first matching, visible element.
function esaFillFirstMatch(selectors, value) {
  if (value === undefined || value === null || value === '') return false;
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.offsetParent !== null) {
      esaSetNativeValue(el, value);
      return true;
    }
  }
  return false;
}

function esaSelectFirstMatch(selectors, value) {
  if (!value) return false;
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.tagName === 'SELECT' && el.offsetParent !== null) {
      el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

async function esaSetFileInput(selectors, dataUrl) {
  if (!dataUrl) return false;
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.type === 'file') {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'profile.jpg', { type: blob.type });
      const dt = new DataTransfer();
      dt.items.add(file);
      el.files = dt.files;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

function esaSpeak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function esaEscapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Builds the always-available fallback panel: big-text values with copy buttons,
// so the person can fill the form by hand if auto-detection ever fails
// (site layouts change often — this path always works).
function esaBuildPanel({ siteName, profile, onAutofill }) {
  if (document.getElementById('esa-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'esa-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Easy Signup Assistant');

  const rows = [
    ['First name', profile.firstName],
    ['Last name', profile.lastName],
    ['Username', profile.usernameBase],
    ['Password', profile.password ? '•'.repeat(Math.min(profile.password.length, 12)) : ''],
    ['Birthday', [profile.birthMonth, profile.birthDay, profile.birthYear].filter(Boolean).join('/')],
  ];

  panel.innerHTML = `
    <div class="esa-header">
      <strong>Easy Signup Assistant</strong>
      <button type="button" class="esa-close" aria-label="Close panel">✕</button>
    </div>
    <p class="esa-note">We can try to fill in this page for you. Please still check every field,
      press the site's own Submit button yourself, and complete any phone code or "I'm not a
      robot" step yourself — that part has to be done by a real person.</p>
    <button type="button" class="esa-fill-btn">Fill this page for me</button>
    <button type="button" class="esa-speak-btn">🔊 Read my info aloud</button>
    <details class="esa-details">
      <summary>Show my info so I can type it in myself</summary>
      <table class="esa-table">
        ${rows.map(([label, value]) => `
          <tr>
            <th scope="row">${esaEscapeHtml(label)}</th>
            <td>${esaEscapeHtml(value || '—')}</td>
            <td>${value ? `<button type="button" class="esa-copy" data-value="${esaEscapeHtml(value)}">Copy</button>` : ''}</td>
          </tr>
        `).join('')}
      </table>
    </details>
    <p class="esa-status" role="status"></p>
  `;

  document.body.appendChild(panel);

  panel.querySelector('.esa-close').addEventListener('click', () => panel.remove());

  panel.querySelector('.esa-fill-btn').addEventListener('click', async () => {
    const status = panel.querySelector('.esa-status');
    status.textContent = 'Filling in what we can find…';
    try {
      const filledCount = await onAutofill();
      status.textContent = filledCount > 0
        ? `Filled ${filledCount} field${filledCount === 1 ? '' : 's'}. Please double-check everything before continuing.`
        : `We couldn't find fields to fill on this page automatically. Use "Show my info" below to fill it in by hand.`;
    } catch (err) {
      status.textContent = 'Something went wrong auto-filling. Use "Show my info" below instead.';
    }
  });

  panel.querySelector('.esa-speak-btn').addEventListener('click', () => {
    const spoken = `Your saved info for ${siteName}. First name ${profile.firstName || 'not set'}. ` +
      `Last name ${profile.lastName || 'not set'}. Username ${profile.usernameBase || 'not set'}. ` +
      `Your password is saved and shown as dots on screen for privacy. ` +
      `Birthday ${profile.birthMonth || '?'} slash ${profile.birthDay || '?'} slash ${profile.birthYear || '?'}.`;
    esaSpeak(spoken);
  });

  panel.querySelectorAll('.esa-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.value).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });
  });
}
