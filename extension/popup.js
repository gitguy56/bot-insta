const statusEl = document.getElementById('status');

function refreshStatus() {
  chrome.storage.local.get('profile', ({ profile }) => {
    if (profile && profile.firstName) {
      statusEl.textContent = `Saved info for ${profile.firstName}. Visit Google or Instagram's sign-up page and we'll offer to help fill it in.`;
    } else {
      statusEl.textContent = 'No info saved yet. Click "Fill in / edit my info" to get started.';
    }
  });
}

document.getElementById('openForm').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('clearData').addEventListener('click', () => {
  if (confirm('Clear all saved info from this device?')) {
    chrome.storage.local.remove('profile', refreshStatus);
  }
});

refreshStatus();
