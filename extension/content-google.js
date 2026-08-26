// Best-effort autofill for accounts.google.com sign-up pages.
// Selectors are best-effort guesses at Google's current field names/ids and
// may stop matching if Google changes their page — that's expected, which is
// why the panel always offers the "show my info to copy" fallback too.
(function () {
  if (!/\/signup/.test(location.pathname) && !/CreateAccount/.test(location.href)) return;

  chrome.storage.local.get('profile', ({ profile }) => {
    if (!profile || !profile.firstName) return;

    esaBuildPanel({
      siteName: 'Google',
      profile,
      onAutofill: async () => {
        let count = 0;
        if (esaFillFirstMatch(['#firstName', 'input[name="firstName"]'], profile.firstName)) count++;
        if (esaFillFirstMatch(['#lastName', 'input[name="lastName"]'], profile.lastName)) count++;
        if (esaFillFirstMatch(['#username', 'input[name="Username"]'], profile.usernameBase)) count++;
        if (esaFillFirstMatch(['#password', 'input[name="Passwd"]'], profile.password)) count++;
        if (esaFillFirstMatch(['#confirm-password', 'input[name="ConfirmPasswd"]'], profile.password)) count++;
        if (esaSelectFirstMatch(['#month', 'select[name="Month"]'], profile.birthMonth)) count++;
        if (esaFillFirstMatch(['#day', 'input[name="Day"]'], profile.birthDay)) count++;
        if (esaFillFirstMatch(['#year', 'input[name="Year"]'], profile.birthYear)) count++;
        return count;
      },
    });
  });
})();
