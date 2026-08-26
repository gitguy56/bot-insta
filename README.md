# Easy Signup Assistant (prototype)

An accessibility prototype to help elderly and disabled users sign up for
their own Google and Instagram accounts, using their **own real name and
photo**. It does not create accounts automatically and does not solve
CAPTCHAs or phone verification — a real person still completes those steps.

## What it does

1. **`extension/options.html`** — a step-by-step, screen-reader-friendly
   form (one question per screen, large text, high-contrast mode, read-aloud
   buttons) that collects a name, desired username, password, birthday, and
   an optional profile photo. Saved only to the browser's local extension
   storage on that device — nothing is sent to a server.
2. On `accounts.google.com` and `www.instagram.com` sign-up pages, a content
   script offers a small on-page panel that can:
   - try to auto-fill the matching fields on the real sign-up form, or
   - show the saved info in large text with "Copy" buttons, so it can be
     typed in by hand if a site's page layout has changed and auto-detection
     doesn't find the fields.

The person (or someone assisting them) still reviews every field, clicks the
site's own Submit/Sign up button, and completes any phone-verification code
or "prove you're human" step themselves — that part must be done by a real
human and is intentionally not automated here.

## Loading the prototype

1. Open `chrome://extensions`.
2. Enable "Developer mode" (top right).
3. Click "Load unpacked" and select the `extension/` folder.
4. Click the extension icon → "Fill in / edit my info" to open the form.
5. Visit `https://accounts.google.com/signup` or
   `https://www.instagram.com/accounts/emailsignup/` to see the assistant
   panel.

## Known limitations

- The CSS selectors used to find Google/Instagram's form fields are
  best-effort guesses at their current page structure. Both sites change
  their sign-up flow fairly often, so auto-fill may stop finding fields —
  the "show my info to copy" fallback is there for exactly that case.
- Data is stored unencrypted in the browser's local extension storage. This
  is fine for a local prototype but should not be considered secure storage
  for real passwords long-term.
- This is a prototype, not a production accessibility tool — it hasn't been
  tested with real assistive technology users yet.
