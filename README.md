# Easy Signup Helper

An accessibility prototype site to help elderly and disabled users prepare
everything they need to sign up for their own Google and Instagram
accounts, using their **own real name and photo**. It does not create
accounts automatically and does not solve CAPTCHAs or phone verification —
a real person still does that, on the real sign-up page.

## What it does

A single-page site (`site/index.html`) with a step-by-step,
screen-reader-friendly form — one question per screen, large text,
high-contrast mode, and a "read this step aloud" button on every step. It
asks for a name, desired username, password, birthday, and an optional
profile photo.

Everything is saved only in the browser's local storage on that device —
nothing is sent to a server, there is no backend.

After saving, the page shows every answer in large text with a **Copy**
button next to each one, plus direct links to open Google's and
Instagram's real sign-up pages in a new tab. The person (or someone
helping them) copies each answer over, reviews it, and clicks the site's
own Submit/Sign up button themselves — including any phone-verification
code or "prove you're human" step, which must be done by a real human and
is intentionally not automated here.

## Running it

No build step or server needed — it's plain HTML/CSS/JS.

- **Quickest:** open `site/index.html` directly in a browser (double-click it,
  or drag it into a browser window).
- **Or serve it locally**, if you'd rather test it over `http://`:
  ```
  cd site
  python3 -m http.server 8000
  ```
  then visit `http://localhost:8000`.

## Known limitations

- This is a prototype, not a production accessibility tool — it hasn't
  been tested with real assistive technology users yet.
- Data (including the password) is stored unencrypted in the browser's
  local storage on that device. Fine for a local prototype; not meant as
  secure long-term password storage.
- There's no way for a website to reach into a different site's page (like
  Google's or Instagram's sign-up form) and fill it in automatically —
  browsers block that across sites for security. That's why this prototype
  shows a copy-and-paste panel instead of auto-filling those pages.
