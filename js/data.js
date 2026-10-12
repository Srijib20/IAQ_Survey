/* =========================================================================
   IAQ Wearable Assistant Survey — content & configuration
   Everything a researcher may want to edit lives in this file.
   ========================================================================= */

window.SURVEY_CONFIG = {
  // Firebase web-app config. It lives in js/firebase-config.js, which is kept
  // out of git; the GitHub Pages workflow writes that file from the
  // FIREBASE_CONFIG repository secret. Missing file → Firebase disabled.
  firebase: window.SURVEY_FIREBASE_CONFIG || null,

  // Alternative to Firebase: an endpoint that receives each completed response
  // as a JSON POST. With neither set, responses stay in the browser
  // (localStorage key "iaq-survey-submissions") and the console.
  submitUrl: null,

  // Separate, unlinked waitlist form (F4.1). Shown on the thank-you screen
  // only to respondents who answered "Yes".
  waitlistUrl: null,

  ethicsApprovalNo: '___',
  incentiveText: '', // e.g. '₹150–200 voucher' — leave empty to hide

  pricingInScope: true, // shows PV1 and the Van Westendorp block (F3)
  askTopBenefit: true, // optional sixth item in Section C
  kanoTotal: 14, // pairs per respondent (cap 20); pilot may cut to 10
  cardSortCount: 15, // 2 per cluster + 1 wild card
};

window.SURVEY = (function () {
  const AGREE7 = [
    'Strongly disagree', 'Disagree', 'Somewhat disagree',
    'Neither agree nor disagree', 'Somewhat agree', 'Agree', 'Strongly agree',
  ];

  const SECTIONS = [
    { key: 'A', label: 'About you', minutes: 2.0, icon: 'user',
      intro: 'A few quick questions about you and your home.' },
    { key: 'B', label: 'Your experiences', minutes: 2.0, icon: 'clock',
      intro: 'Think back over the past 4 weeks. We want to hear about real moments, not hypotheticals.' },
    { key: 'C', label: 'Benefits', minutes: 1.5, icon: 'sparkle',
      intro: 'For each kind of help, tell us how useful it would be — and how well you manage today.' },
    { key: 'D', label: 'Features', minutes: 5.0, icon: 'sliders',
      intro: 'Quick reactions to possible features, then a few “most vs least useful” choices.' },
    { key: 'E', label: 'Categories', minutes: 3.0, icon: 'grid',
      intro: 'Help us check whether our categories make sense to you.' },
    { key: 'F', label: 'Would you use it?', minutes: 2.5, icon: 'check',
      intro: 'Your honest view on using an assistant like this.' },
    { key: 'G', label: 'Your thoughts', minutes: 1.0, icon: 'chat',
      intro: 'Almost done! Everything on this page is optional.' },
  ];

  /* 7-cluster taxonomy. `def` is the one-line definition shown in C, D2 and E1. */
  const CLUSTERS = [
    { id: 1, name: 'Personal Health & Physiological State', short: 'Personal health',
      color: '#d6589f', icon: 'heart',
      def: 'How the air may be affecting your own body: symptoms, sleep, comfort, focus, diet',
      examples: ['Could the air be causing my headache right now?', 'Did my bedroom air affect last night’s sleep?'] },
    { id: 2, name: 'Household & Vulnerable-Member Care', short: 'Family care',
      color: '#ee9a35', icon: 'home',
      def: 'Keeping children, older adults and family members with health conditions safe',
      examples: ['Is the air in the bedroom safe for my baby right now?', 'Is it okay to use this cleaner while Grandma is at home?'] },
    { id: 3, name: 'Environmental Situational Awareness', short: 'Air right now',
      color: '#1ea896', icon: 'eye',
      def: 'What the air is like now, what caused changes, and how it compares',
      examples: ['How clean is the air in the living room right now?', 'Is the air cleaner inside or outside at the moment?'] },
    { id: 4, name: 'Behavioral & Routine Analytics', short: 'Habits & routines',
      color: '#7b68ee', icon: 'chart',
      def: 'How your habits (cooking, cleaning, time in rooms) affect the air over time',
      examples: ['How much smoke did tonight’s cooking add?', 'When is the best time today to ventilate?'] },
    { id: 5, name: 'Intervention & Device Management', short: 'Devices & fixes',
      color: '#3b8ee6', icon: 'fan',
      def: 'Choosing, placing and running purifiers, sensors and fixes',
      examples: ['Should I run the purifier or open a window now?', 'When should I change the purifier filter?'] },
    { id: 6, name: 'Predictive Alerts & Emergency Response', short: 'Alerts & hazards',
      color: '#e5484d', icon: 'bell',
      def: 'Warnings before air gets worse, and help in hazards',
      examples: ['Will air quality worsen after I start cooking?', 'Is there a gas leak or CO risk right now?'] },
    { id: 7, name: 'System Trust & Meta', short: 'Trust & privacy',
      color: '#5b7083', icon: 'shield',
      def: 'Accuracy, confidence, sensors and privacy of the assistant itself',
      examples: ['How confident are you in this advice?', 'Who can see my data?'] },
  ];

  /* ---------------- Section A ---------------- */
  const A = {
    A1: { q: 'What is your age?',
      opts: ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'] },
    A2: { q: 'Which best describes where you live?',
      opts: ['Metro city', 'Other city/town', 'Peri-urban', 'Village'] },
    A3: { q: 'What type of home do you live in?',
      opts: ['Apartment', 'Independent house', 'Hostel/shared', 'Other'] },
    A4: { q: 'Including you, how many people live in your home?',
      opts: ['1', '2', '3–4', '5–6', '7+'] },
    A5: { q: 'Does anyone in your home (including you) belong to these groups?', multi: true,
      opts: ['Child under 5', 'Child 5–17', 'Adult 65+', 'Asthma, COPD or other breathing condition',
        'Heart condition', 'Currently pregnant', 'None of these', 'Prefer not to say'],
      exclusive: ['None of these', 'Prefer not to say'] },
    A6: { q: 'What is the main fuel used for cooking at home?',
      opts: ['LPG', 'Piped gas', 'Induction/electric', 'Wood, dung or crop residue', 'Kerosene', 'Other'] },
    A7: { q: 'Who mostly decides about home appliances and cleaning products?',
      opts: ['Mainly me', 'Shared', 'Mainly someone else'] },
    A8: { q: 'Which of these do you currently own or use?', multi: true,
      opts: ['Air purifier', 'Indoor air-quality monitor', 'Smartwatch/fitness band',
        'Smart-home hub or voice assistant', 'Air-quality (AQI) app', 'None'],
      exclusive: ['None'] },
    A9: { q: 'How often do you check air-quality information (indoor or outdoor)?',
      opts: ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily'] },
    A10: { q: 'How comfortable are you using new apps or gadgets?',
      scale: 5, anchors: ['Not at all', 'Very comfortable'] },
    A11: { q: 'What is your gender?', optional: true,
      opts: ['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to say'] },
  };

  /* ---------------- Section B ---------------- */
  const VIGNETTES = {
    1: { text: '…you felt a headache, drowsiness, stuffiness, or eye/throat irritation at home and wondered if the air was the cause.', src: '1.1, 1.3' },
    2: { text: '…you wondered whether the air in a room was safe for a child, older adult, pregnant, or asthmatic family member, e.g. while someone was cooking or cleaning.', src: '2.1, 2.2, 2.5' },
    3: { text: '…you wondered how clean the air at home was right then, or whether it was cleaner inside or outside.', src: '3.1, 3.4' },
    4: { text: '…you wondered how cooking, cleaning, or where you spent time affected the air, or when the best time to cook or ventilate would be.', src: '4.1, 4.3, 4.6' },
    5: { text: '…you had to decide whether to run a purifier or open a window, where to put a device, or when to change a filter.', src: '5.1, 5.2, 5.5' },
    6: { text: '…you wished you had been warned before the air got bad: outdoor smoke, strong cleaner fumes, or a possible gas smell.', src: '6.1, 6.3, 6.4' },
    7: { text: '…you doubted whether an air-quality reading or an app’s advice was accurate, or wondered who could see your data.', src: '7.1–7.3' },
  };
  const FREQ = ['Never', 'Once', '2–3 times', 'About once a week', 'Several times a week', 'Daily'];
  const FREQ_NA = 'Not applicable to my home';
  const JUSTER = [
    'No chance (0 in 100)', 'Very slight (1 in 10)', 'Slight (2 in 10)', 'Some possibility (3 in 10)',
    'Fair (4 in 10)', 'Fairly good (5 in 10)', 'Good (6 in 10)', 'Probable (7 in 10)',
    'Very probable (8 in 10)', 'Almost sure (9 in 10)', 'Certain (99 in 100)',
  ];

  /* ---------------- Section C ---------------- */
  const BENEFITS = [
    { n: 1, text: 'Help with this would protect my health or my family’s health.', type: 'Health protection' },
    { n: 2, text: 'Help with this would save me time working out what to do.', type: 'Time saved' },
    { n: 3, text: 'Help with this would make me worry less about the air at home.', type: 'Peace of mind' },
    { n: 4, text: 'Help with this would help me make better decisions about my home and routine.', type: 'Better decisions' },
  ];

  /* ---------------- Section D1 — Kano feature pool ---------------- */
  const KANO = [
    { id: 'K1', c: 1, sub: '1.1', f: 'tell you which indoor pollutant is the likely cause of a symptom you feel now, such as a headache' },
    { id: 'K2', c: 1, sub: '1.2', f: 'show whether the air in your bedroom affected last night’s sleep' },
    { id: 'K3', c: 1, sub: '1.4', f: 'suggest what to eat or drink on high-pollution days' },
    { id: 'K4', c: 2, sub: '2.2', f: 'recommend the safest room for a vulnerable family member right now' },
    { id: 'K5', c: 2, sub: '2.3', f: 'link a family member’s inhaler use or attacks to pollution spikes' },
    { id: 'K6', c: 2, sub: '2.5', f: 'check whether an activity (frying, a strong cleaner) is safe for everyone at home before you start' },
    { id: 'K7', c: 3, sub: '3.1', f: 'show the current air quality in each room' },
    { id: 'K8', c: 3, sub: '3.2', f: 'explain what caused a recent pollution spike' },
    { id: 'K9', c: 3, sub: '3.5', f: 'tell you whether it is safe to go outside or open windows, using outdoor data' },
    { id: 'K10', c: 4, sub: '4.1', f: 'show how a cooking method or session affected kitchen air' },
    { id: 'K11', c: 4, sub: '4.6', f: 'suggest the best times today to cook, clean or ventilate' },
    { id: 'K12', c: 4, sub: '4.8', f: 'give you a weekly exposure summary and track your goals' },
    { id: 'K13', c: 5, sub: '5.2', f: 'tell you whether to run the purifier or open a window right now' },
    { id: 'K14', c: 5, sub: '5.4', f: 'rank the top pollution sources in your home to fix first' },
    { id: 'K15', c: 5, sub: '5.5', f: 'tell you when to replace a filter and what running a device costs' },
    { id: 'K16', c: 6, sub: '6.1', f: 'predict how the air will change if you start an activity' },
    { id: 'K17', c: 6, sub: '6.3', f: 'alert you when a pollutant crosses a safe level' },
    { id: 'K18', c: 6, sub: '6.4', f: 'detect a gas leak, CO or smoke hazard and tell you what to do' },
    { id: 'K19', c: 7, sub: '7.1', f: 'say how confident it is in each recommendation' },
    { id: 'K20', c: 7, sub: '7.2', f: 'let you control who can see your exposure data' },
    { id: 'K21', c: 7, sub: '7.3', f: 'tell you if a sensor is faulty or needs calibration' },
  ];
  const KANO_OPTS = [
    { v: 'Like', label: 'I like it that way', emoji: '😍' },
    { v: 'Expect', label: 'I expect it to be that way', emoji: '👌' },
    { v: 'Neutral', label: 'I am neutral', emoji: '😐' },
    { v: 'Live with', label: 'I can live with it that way', emoji: '🤷' },
    { v: 'Dislike', label: 'I dislike it that way', emoji: '😣' },
  ];

  /* ---------------- Section D2 — MaxDiff BIBD (7 sets of 4) ---------------- */
  const MAXDIFF = [
    { set: 1, items: [3, 5, 6, 7] },
    { set: 2, items: [1, 4, 6, 7] },
    { set: 3, items: [1, 2, 5, 7] },
    { set: 4, items: [1, 2, 3, 6] },
    { set: 5, items: [2, 3, 4, 7] },
    { set: 6, items: [1, 3, 4, 5] },
    { set: 7, items: [2, 4, 5, 6] },
  ];

  /* ---------------- Section E1 — card-sort query pool ----------------
     PLACEHOLDER: replace with the ~120 queries from taxonomy.txt, verbatim.
     Keep `c` (intended cluster) and `sub` (sub-cluster) — they are not shown
     to respondents but are needed for the agreement / confusion analysis. */
  const QUERIES = [
    { id: 'q1', c: 1, sub: '1.1', text: 'Why do I get a headache every evening at home?' },
    { id: 'q2', c: 1, sub: '1.1', text: 'Could the air in my room be making my eyes itchy?' },
    { id: 'q3', c: 1, sub: '1.2', text: 'Did the bedroom air affect my sleep last night?' },
    { id: 'q4', c: 1, sub: '1.3', text: 'Why do I feel so drowsy while working in my study?' },
    { id: 'q5', c: 1, sub: '1.3', text: 'Is the air making it harder for me to focus right now?' },
    { id: 'q6', c: 1, sub: '1.4', text: 'What should I eat on days when pollution is high?' },
    { id: 'q7', c: 2, sub: '2.1', text: 'Is the air in the nursery safe for my baby right now?' },
    { id: 'q8', c: 2, sub: '2.2', text: 'Which room is safest for my grandmother this evening?' },
    { id: 'q9', c: 2, sub: '2.3', text: 'Are my son’s asthma attacks linked to indoor pollution?' },
    { id: 'q10', c: 2, sub: '2.4', text: 'Is it safe for me to stay in the kitchen while I am pregnant?' },
    { id: 'q11', c: 2, sub: '2.5', text: 'Is it okay to use this floor cleaner with my toddler at home?' },
    { id: 'q12', c: 3, sub: '3.1', text: 'How clean is the air in the living room right now?' },
    { id: 'q13', c: 3, sub: '3.2', text: 'What caused the pollution spike at 8 pm yesterday?' },
    { id: 'q14', c: 3, sub: '3.3', text: 'How does today’s air compare with last week?' },
    { id: 'q15', c: 3, sub: '3.4', text: 'Is the air cleaner inside or outside right now?' },
    { id: 'q16', c: 3, sub: '3.5', text: 'Is it safe to open the windows now?' },
    { id: 'q17', c: 4, sub: '4.1', text: 'How much smoke did my tadka add to the kitchen air?' },
    { id: 'q18', c: 4, sub: '4.2', text: 'Which of my recipes this week created the most pollution?' },
    { id: 'q19', c: 4, sub: '4.3', text: 'Does sweeping raise the dust level in the house?' },
    { id: 'q20', c: 4, sub: '4.4', text: 'Which room do I spend the most time in, and how is its air?' },
    { id: 'q21', c: 4, sub: '4.6', text: 'When is the best time today to cook?' },
    { id: 'q22', c: 4, sub: '4.8', text: 'How much pollution was I exposed to this week?' },
    { id: 'q23', c: 5, sub: '5.1', text: 'Which air purifier size suits my bedroom?' },
    { id: 'q24', c: 5, sub: '5.2', text: 'Should I run the purifier or open a window right now?' },
    { id: 'q25', c: 5, sub: '5.3', text: 'Where should I place the sensor in my living room?' },
    { id: 'q26', c: 5, sub: '5.4', text: 'What is the biggest pollution source in my home to fix first?' },
    { id: 'q27', c: 5, sub: '5.5', text: 'When should I change my purifier filter?' },
    { id: 'q28', c: 6, sub: '6.1', text: 'Will the air get worse if I start frying now?' },
    { id: 'q29', c: 6, sub: '6.2', text: 'Will outdoor smoke reach my home tonight?' },
    { id: 'q30', c: 6, sub: '6.3', text: 'Alert me if PM2.5 crosses a safe level.' },
    { id: 'q31', c: 6, sub: '6.4', text: 'Is there a gas leak or CO risk right now?' },
    { id: 'q32', c: 6, sub: '6.4', text: 'I smell gas — what should I do?' },
    { id: 'q33', c: 7, sub: '7.1', text: 'How confident are you in this recommendation?' },
    { id: 'q34', c: 7, sub: '7.1', text: 'Why should I trust this reading over my AQI app?' },
    { id: 'q35', c: 7, sub: '7.2', text: 'Who can see my exposure data?' },
    { id: 'q36', c: 7, sub: '7.2', text: 'Can I delete my data?' },
    { id: 'q37', c: 7, sub: '7.3', text: 'Is my sensor reading correct, or does it need calibration?' },
  ];

  /* ---------------- Section F ---------------- */
  const UTAUT = [
    { id: 'PE1', con: 'Performance expectancy', text: 'I would find the air-quality assistant useful in my daily life.' },
    { id: 'PE2', con: 'Performance expectancy', text: 'Using the assistant would help me keep my home’s air healthier.' },
    { id: 'PE3', con: 'Performance expectancy', text: 'Using the assistant would help me act on air problems more quickly.' },
    { id: 'EE1', con: 'Effort expectancy', text: 'Learning to use the assistant would be easy for me.' },
    { id: 'EE2', con: 'Effort expectancy', text: 'Asking the assistant questions by voice or text would be clear and understandable.' },
    { id: 'EE3', con: 'Effort expectancy', text: 'Wearing the device every day would be easy for me.' },
    { id: 'SI1', con: 'Social influence', text: 'People who are important to me would think I should use such an assistant.' },
    { id: 'SI2', con: 'Social influence', text: 'My doctor or my family members’ doctors would encourage using it.' },
    { id: 'FC1', con: 'Facilitating conditions', text: 'I have the phone, internet and charging access needed to use the assistant.' },
    { id: 'FC2', con: 'Facilitating conditions', text: 'Help would be available to me if I had trouble using it.' },
    { id: 'CO1', con: 'Compatibility', text: 'Using the assistant would fit well with how my household lives.' },
    { id: 'PV1', con: 'Price value', text: 'At a reasonable price, the assistant would be good value for money.', pricing: true },
    { id: 'BI1', con: 'Behavioral intention', text: 'If available, I intend to use the assistant in the next 6 months.' },
    { id: 'BI2', con: 'Behavioral intention', text: 'I would recommend it to a family member or friend.' },
    { id: 'ATT', con: 'Attention check', text: 'To show you are reading, please select “Somewhat disagree”.' },
  ];
  const VAN_WESTENDORP = [
    { id: 'F3_1', q: 'At what price would it be so expensive that you would not consider buying it?', tag: 'Too expensive' },
    { id: 'F3_2', q: 'At what price would it be getting expensive, but you would still consider it?', tag: 'Getting expensive' },
    { id: 'F3_3', q: 'At what price would it be a bargain, a great buy for the money?', tag: 'A bargain' },
    { id: 'F3_4', q: 'At what price would it be so cheap that you would doubt its quality?', tag: 'Too cheap' },
  ];

  /* ---------------- Section G ---------------- */
  const G = {
    G1: 'Is there anything else you would want this assistant to do that we have not mentioned?',
    G2: 'What, if anything, would worry you about using it? (e.g. privacy, accuracy, too many alerts, cost)',
    G3: 'Think of a false or unnecessary alert. How many per week would make you stop trusting the assistant?',
    G3opts: ['0', '1', '2–3', '4–6', '7+'],
    G4: 'Any other comments about this survey?',
  };

  return {
    AGREE7, SECTIONS, CLUSTERS, A, VIGNETTES, FREQ, FREQ_NA, JUSTER, BENEFITS,
    KANO, KANO_OPTS, MAXDIFF, QUERIES, UTAUT, VAN_WESTENDORP, G,
  };
})();
