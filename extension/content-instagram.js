// Best-effort autofill for instagram.com sign-up pages.
// Selectors are best-effort guesses at Instagram's current field names and
// may stop matching if Instagram changes their page — that's expected, which
// is why the panel always offers the "show my info to copy" fallback too.
(function () {
  if (!/emailsignup|accounts\/signup|accounts\/onetap/.test(location.pathname)) return;

  chrome.storage.local.get('profile', ({ profile }) => {
    if (!profile || !profile.firstName) return;

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();

    esaBuildPanel({
      siteName: 'Instagram',
      profile,
      onAutofill: async () => {
        let count = 0;
        if (esaFillFirstMatch(['input[name="fullName"]'], fullName)) count++;
        if (esaFillFirstMatch(['input[name="username"]'], profile.usernameBase)) count++;
        if (esaFillFirstMatch(['input[name="password"]'], profile.password)) count++;
        if (esaFillFirstMatch(['input[name="emailOrPhone"]', 'input[name="email"]'],
              profile.usernameBase ? `${profile.usernameBase}@gmail.com` : '')) count++;
        if (esaSelectFirstMatch(['select[title="Month:"]', 'select[name="birthday_month"]'], profile.birthMonth)) count++;
        if (esaSelectFirstMatch(['select[title="Day:"]', 'select[name="birthday_day"]'], profile.birthDay)) count++;
        if (esaSelectFirstMatch(['select[title="Year:"]', 'select[name="birthday_year"]'], profile.birthYear)) count++;
        if (await esaSetFileInput(['input[type="file"]'], profile.photoDataUrl)) count++;
        return count;
      },
    });
  });
})();
