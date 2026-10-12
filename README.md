# IAQ Wearable Assistant Survey — web frontend

Static site, no build step. Open `index.html` in a browser, or host the folder on any static server (GitHub Pages, Netlify, an institute web server).

```
index.html        page shell
css/styles.css    all styling
js/data.js        survey content + configuration (edit this)
js/app.js         survey engine (screens, randomization, validation, submit)
```

## Before launch

Edit `window.SURVEY_CONFIG` at the top of `js/data.js`:

| Setting | Purpose |
|---|---|
| `firebase` | Read from `js/firebase-config.js` (git-ignored; copy [js/firebase-config.example.js](js/firebase-config.example.js)). When present, each response is saved to Cloud Firestore as `responses/{respondentId}`. Publish [firestore.rules](firestore.rules) in the console first. |
| `submitUrl` | Alternative to Firebase: an endpoint that receives each completed response as a JSON `POST`. With neither set, responses are kept in the browser's `localStorage` (`iaq-survey-submissions`) and logged to the console. |
| `waitlistUrl` | Separate, unlinked pilot sign-up form (F4.1). |
| `ethicsApprovalNo` | Shown in the consent text. |
| `incentiveText` | e.g. `'₹150–200 voucher'`; shown on the landing page if set. |
| `pricingInScope` | Toggles PV1 and the Van Westendorp block (F3). |
| `kanoTotal` | Kano pairs per respondent (14 by default; cut to 10 if the pilot runs long). |

Also replace the placeholder `QUERIES` list in `js/data.js` with the ~120 queries from `taxonomy.txt` (keep the `c` and `sub` fields).

## Useful URL parameters

- `?ch=clinic-kgp` tags responses with a recruitment channel.
- `?debug=1` shows item codes (A1, B3.b, K12…), a screen-jump menu, and a JSON download on the thank-you page.
- `?debug=1&fresh=1&screen=40` opens a specific screen with a fresh randomization.

## What each response contains

Respondent ID, timestamps, active seconds per screen (for speeder checks), recruitment group (G1/G2/G3, plus a flag for respondents who qualify for both G1 and G2), attention-check result, the per-respondent randomization (cluster orders, Kano features drawn, MaxDiff set order and item positions, card-sort queries, UTAUT order) and all answers.

## Deploying to GitHub Pages

[.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) deploys on every push to `main`. It writes `js/firebase-config.js` from the repository secret `FIREBASE_CONFIG` (the `{...}` object from your local `js/firebase-config.js`), so the config never lives in the repository. One-time setup on GitHub: add that secret under *Settings → Secrets and variables → Actions*, and set *Settings → Pages → Source* to **GitHub Actions**.

The deployed site still sends the config to every visitor's browser. That is how Firebase web apps work: protection comes from `firestore.rules`, an API-key restriction to the Pages domain, and App Check.
