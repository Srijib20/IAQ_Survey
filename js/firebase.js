/* =========================================================================
   Firebase (Cloud Firestore) backend for survey responses.
   Active only when SURVEY_CONFIG.firebase is filled in and the Firebase SDK
   loaded; otherwise app.js falls back to submitUrl / local storage.
   Each response is stored as responses/{respondentId}.
   ========================================================================= */
(function () {
  'use strict';

  const fbConfig = window.SURVEY_CONFIG && window.SURVEY_CONFIG.firebase;
  if (!fbConfig || !fbConfig.projectId) return;
  if (!window.firebase) {
    console.warn('[IAQ survey] Firebase SDK did not load; responses will be kept on this device.');
    return;
  }

  const COLLECTION = 'responses'; // must match firestore.rules
  const TIMEOUT_MS = 15000;

  const app = firebase.initializeApp(fbConfig);
  const db = firebase.firestore(app);
  db.settings({ ignoreUndefinedProperties: true });

  // Resolves to 'ok' (stored), 'rejected' (refused by security rules, e.g. the
  // response already exists) or 'failed' (network/timeout — retry later).
  function send(payload) {
    const data = JSON.parse(JSON.stringify(payload));
    data.receivedAt = firebase.firestore.FieldValue.serverTimestamp();

    const write = db.collection(COLLECTION).doc(payload.respondentId).set(data)
      .then(() => 'ok')
      .catch((err) => {
        console.warn('[IAQ survey] Firestore write failed:', err.code, err.message);
        return err.code === 'permission-denied' ? 'rejected' : 'failed';
      });
    // Firestore keeps offline writes pending instead of failing; don't make the respondent wait.
    const timeout = new Promise((resolve) => setTimeout(() => resolve('failed'), TIMEOUT_MS));
    return Promise.race([write, timeout]);
  }

  window.SurveyBackend = { name: 'firestore', send };
})();
