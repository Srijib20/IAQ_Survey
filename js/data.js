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

  ethicsApprovalNo: '___',
  incentiveText: '', // e.g. '₹150–200 voucher' — leave empty to hide

  pricingInScope: true, // shows the PV1 price-value statement in Section F
  askTopBenefit: true, // optional sixth item in Section C
  // Clusters asked about in Section C. System Trust & Meta (7) was dropped.
  benefitClusters: [1, 2, 3, 4, 5, 6],
  kanoTotal: 14, // pairs per respondent (cap 20); pilot may cut to 10
  cardSortCount: 15, // queries each respondent sorts in E1
  // Queries drawn from every cluster before the rest are filled at random.
  // 1 gives every one of the 110 queries ≥30 sorts at N = 300; the draft's
  // 2 leaves the 37 cluster-1 queries at ~19 (below Tullis & Wood's 20–30).
  cardSortPerCluster: 1,
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
    { key: 'C', label: 'Benefits', minutes: 1.3, icon: 'sparkle',
      intro: 'For each kind of help, tell us how useful it would be — and how well you manage today.' },
    { key: 'D', label: 'Features', minutes: 5.0, icon: 'sliders',
      intro: 'Quick reactions to possible features, then a few “most vs least useful” choices.' },
    { key: 'E', label: 'Categories', minutes: 3.0, icon: 'grid',
      intro: 'Help us check whether our categories make sense to you.' },
    { key: 'F', label: 'Would you use it?', minutes: 1.0, icon: 'check',
      intro: 'Your honest view on using an assistant like this.' },
    { key: 'G', label: 'Your thoughts', minutes: 1.0, icon: 'chat',
      intro: 'Almost done! Everything on this page is optional.' },
  ];

  /* 7-cluster taxonomy. `def` is the one-line definition shown in C, D2 and E1. */
  const CLUSTERS = [
    { id: 1, name: 'Personal Health & Physiological State', short: 'Personal health',
      color: '#d6589f', icon: 'heart',
      def: 'How the air may be affecting your own body: symptoms, sleep, comfort, focus, diet',
      examples: ['Could the dust from sweeping be why I keep sneezing?', 'Is the air in my room making my cough worse?'] },
    { id: 2, name: 'Household & Vulnerable-Member Care', short: 'Family care',
      color: '#ee9a35', icon: 'home',
      def: 'Keeping children, older adults and family members with health conditions safe',
      examples: ['Is the incense from today’s puja safe for my asthmatic son?', 'Can my toddler play on the floor right after it is mopped?'] },
    { id: 3, name: 'Environmental Situational Awareness', short: 'Air right now',
      color: '#1ea896', icon: 'eye',
      def: 'What the air is like now, what caused changes, and how it compares',
      examples: ['How dusty is the air in the drawing room at the moment?', 'Did the mosquito coil make the bedroom air worse?'] },
    { id: 4, name: 'Behavioral & Routine Analytics', short: 'Habits & routines',
      color: '#7b68ee', icon: 'chart',
      def: 'How your habits (cooking, cleaning, time in rooms) affect the air over time',
      examples: ['Does making rotis on the tawa add more smoke than boiling rice?', 'Does drying clothes indoors make the house more humid?'] },
    { id: 5, name: 'Intervention & Device Management', short: 'Devices & fixes',
      color: '#3b8ee6', icon: 'fan',
      def: 'Choosing, placing and running purifiers, sensors and fixes',
      examples: ['Is my purifier big enough for the living room?', 'Would a chimney over the stove help more than a purifier?'] },
    { id: 6, name: 'Predictive Alerts & Emergency Response', short: 'Alerts & hazards',
      color: '#e5484d', icon: 'bell',
      def: 'Warnings before air gets worse, and help in hazards',
      examples: ['Will tonight’s fireworks make the air inside unsafe?', 'Can you warn me before smoke from outside reaches my home?'] },
    { id: 7, name: 'System Trust & Meta', short: 'Trust & privacy',
      color: '#5b7083', icon: 'shield',
      def: 'Accuracy, confidence, sensors and privacy of the assistant itself',
      examples: ['How accurate is this sensor compared with a lab test?', 'Is my data shared with any company?'] },
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
    // Added after the draft, so it keeps the next free code; shown on the first A screen.
    A12: { q: 'What country are you from?', top: ['India'], other: 'Prefer not to say',
      opts: ('Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cambodia|Cameroon|Canada|Cape Verde|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Costa Rica|Côte d’Ivoire|Croatia|Cuba|Cyprus|Czechia|Democratic Republic of the Congo|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|São Tomé and Príncipe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe').split('|') },
  };

  /* ---------------- Section B ---------------- */
  const VIGNETTES = {
    1: { text: '…you felt a headache, drowsiness, stuffiness, or eye/throat irritation at home and wondered if the air was the cause.', src: '1.1, 1.3' },
    2: { text: '…you wondered whether the air in a room was safe for a child, older adult, pregnant, or asthmatic family member, e.g. while someone was cooking or cleaning.', src: '2.1, 2.2, 2.6' },
    3: { text: '…you wondered how clean the air at home was right then, or whether it was cleaner inside or outside.', src: '3.1, 3.4' },
    4: { text: '…you wondered how cooking, cleaning, or where you spent time affected the air, or when the best time to cook or ventilate would be.', src: '4.1, 4.2, 4.5' },
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
    { id: 'K6', c: 2, sub: '2.6', f: 'check whether an activity (frying, a strong cleaner) is safe for everyone at home before you start' },
    { id: 'K7', c: 3, sub: '3.1', f: 'show the current air quality in each room' },
    { id: 'K8', c: 3, sub: '3.2', f: 'explain what caused a recent pollution spike' },
    { id: 'K9', c: 3, sub: '3.5', f: 'tell you whether it is safe to go outside or open windows, using outdoor data' },
    { id: 'K10', c: 4, sub: '4.1', f: 'show how a cooking method or session affected kitchen air' },
    { id: 'K11', c: 4, sub: '4.5', f: 'suggest the best times today to cook, clean or ventilate' },
    { id: 'K12', c: 4, sub: '4.7', f: 'give you a weekly exposure summary and track your goals' },
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
     Source: Taxonomy.txt (7 domains, 37 sub-clusters, 110 queries). Two
     sub-clusters are numbered 4.7 in the file; Cooking Chronicles is 4.8 here.
     Wording is verbatim except these fixes (agreed 2026-10-29):
       1.3 “heat,humidity” → “heat, humidity”
       1.4 “Approximately how much macro nutrients am I taking?”
       2.1 “…limit today for because of…” → “…limit today because of…”
       4.8 “How much healthy is the food which is being cooked?”,
           “Can this food for all aged humans?”,
           “Which specific types of person will get benefited for making…”
     Each query gets a stable id from its sub-cluster and position, e.g.
     q1_1_05. `c`, `sub`, `subName` and `facet` are never shown to
     respondents; they feed the agreement analysis. */
  const TAXONOMY = [
    { c: 1, sub: '1.1', name: 'Symptom–Exposure Attribution', facets: {
      'Acute mapping': [
        'Why do I have a headache right now?',
        'Why am I feeling drowsy this afternoon?',
        'Is this throat irritation linked to something in the house?',
        'Why do my eyes feel irritated since I got home?',
      ],
      'Chronic/cumulative risk': [
        'How has my PM2.5 exposure trended this month?',
        'Am I at elevated respiratory risk given my exposure history?',
        'Has my long-term NO2 exposure increased since we moved rooms?',
      ],
      'Cognitive/productivity impact': [
        'Is high CO2 in my study affecting my focus?',
        'Why do I feel foggy during my afternoon work sessions?',
        'Does poor ventilation correlate with my lower productivity days?',
        'Do I perform better on days when my room has better ventilation?',
      ],
      'Exposure budget': [
        'How much of today’s safe pollution budget have I used?',
        'Can I afford to cook fried food again today?',
        'How many “high-exposure” hours have I had this week?',
        'Which activities have used most of my exposure budget this week?',
      ],
    } },
    { c: 1, sub: '1.2', name: 'Sleep & Recovery', queries: [
      'Did poor air quality affect my sleep last night?',
      'What in my bedroom is disrupting my sleep?',
      'Is CO2 buildup causing me to wake up tired?',
      'Would an air purifier in the bedroom improve my sleep score?',
    ] },
    { c: 1, sub: '1.3', name: 'Comfort & Ambient Well-being', facets: {
      'Thermal/humidity discomfort': [
        'Why does this room feel stuffy?',
        'Is humidity causing my discomfort?',
        'Why does the living room feel clammy in the evenings?',
      ],
      'Ambient adjustment': [
        'How can I make my bedroom feel more comfortable tonight?',
        'What settings would improve comfort in the study right now?',
      ],
      'Multi-factor comfort diagnosis': [
        'Is it the air quality or the temperature making me uneasy?',
        'Is my discomfort from humidity, VOCs, or heat?',
        'Are multiple factors like heat, humidity and air quality contributing to how I feel?',
      ],
    } },
    { c: 1, sub: '1.4', name: 'Nutrition & Diet', facets: {
      'Deficiency detection': [
        'Am I lacking any nutrients based on recent meals?',
        'Have I been eating enough protein this week?',
        'Roughly how much of each macronutrient am I getting?',
      ],
      'Diet–pollution interaction': [
        'What foods can offset today’s high exposure?',
        'Should I eat differently on high-pollution days?',
        'What to eat on high pollution days?',
      ],
      'Meal pattern': [
        'Is my eating schedule irregular, and does it matter?',
        'Am I skipping meals more often this month?',
      ],
      'Hydration': [
        'Am I drinking enough water given today’s heat/pollution?',
        'Has my water intake dropped compared to last week?',
      ],
    } },

    { c: 2, sub: '2.1', name: 'Precondition-Specific Guidance', queries: [
      'What can help my grandmother’s asthma today?',
      'Is today good for her to go outside?',
      'Should she avoid the kitchen while I’m cooking?',
      'Are there any activities she should limit today because of the air quality?',
    ] },
    { c: 2, sub: '2.2', name: 'Zone/Room Recommendation', queries: [
      'Where should preconditioned members spend most of their time?',
      'Which room has the safest air for her right now?',
      'Is the sunroom safer than the living room this afternoon?',
    ] },
    { c: 2, sub: '2.3', name: 'Trigger Correlation', queries: [
      'Did her inhaler use correlate with a pollutant spike?',
      'What was different in the air the last time she had an attack?',
    ] },
    { c: 2, sub: '2.4', name: 'Life-stage Specific', queries: [
      'Is the nursery air suitable for my newborn?',
      'Any precautions for a pregnant household member?',
      'Is the elderly room’s air quality within safe limits?',
    ] },
    { c: 2, sub: '2.5', name: 'Comparative Exposure (multi-occupant)', queries: [
      'Who had the highest exposure today?',
      'Whose room has consistently worse air this week?',
    ] },
    { c: 2, sub: '2.6', name: 'Shared-space Negotiation', queries: [
      'Is it safe for everyone if I fry fish tonight?',
      'Can I use the strong-smelling cleaner while grandma’s home?',
    ] },
    { c: 2, sub: '2.7', name: 'Household-wide Recommendation', queries: [
      'What single change most benefits everyone?',
      'What’s the best ventilation schedule for the whole house?',
    ] },

    { c: 3, sub: '3.1', name: 'Current State', queries: [
      'What’s my indoor air quality right now?',
      'Which pollutant is highest in the living room?',
      'Which room has the worst air quality currently?',
    ] },
    { c: 3, sub: '3.2', name: 'Source Attribution', queries: [
      'What caused the PM2.5 spike an hour ago?',
      'Is this VOC reading from cleaning or new furniture?',
      'Why did CO2 suddenly rise in the bedroom?',
    ] },
    { c: 3, sub: '3.3', name: 'Historical Trends', queries: [
      'How has kitchen air quality changed over the past week?',
      'Has overall home air quality improved since I got the purifier?',
    ] },
    { c: 3, sub: '3.4', name: 'Benchmarking', queries: [
      'How does my air compare to WHO/EPA limits?',
      'Is it cleaner inside or outside right now?',
      'How does today compare to last week?',
    ] },
    { c: 3, sub: '3.5', name: 'Outdoor/External Integration', queries: [
      'Is it safe to run outside right now?',
      'Should windows stay closed due to today’s pollen count?',
      'What’s my expected pollution exposure on my commute?',
    ] },

    { c: 4, sub: '4.1', name: 'Cooking Behavior', queries: [
      'How did last night’s frying affect kitchen air?',
      'Which cooking method pollutes most in my kitchen?',
      'Does using the exhaust fan actually reduce my exposure?',
    ] },
    { c: 4, sub: '4.2', name: 'Cleaning Behavior', queries: [
      'Did my floor cleaner raise VOC levels?',
      'What’s the safest time to clean given ventilation?',
    ] },
    { c: 4, sub: '4.3', name: 'Occupancy Patterns', queries: [
      'Which room do I spend the most polluted hours in?',
      'Am I spending too much time in the kitchen during cooking?',
    ] },
    { c: 4, sub: '4.4', name: 'Personal Pollution Signature', queries: [
      'What does my daily exposure pattern look like?',
      'What’s my “typical” pollution day compared to today?',
    ] },
    { c: 4, sub: '4.5', name: 'Routine Scheduling', queries: [
      'Best time to cook to minimize exposure?',
      'When should I ventilate today?',
    ] },
    { c: 4, sub: '4.6', name: 'Behavior-change Tracking', queries: [
      'Have I cut high-VOC product use this month?',
      'Am I cooking fried food less often than last month?',
    ] },
    { c: 4, sub: '4.7', name: 'Long-term Reporting & Goal-Setting', queries: [
      'Give me my weekly exposure and health summary.',
      'Has her asthma frequency tracked seasonal air quality?',
      'Am I on track with this month’s air-quality goals?',
    ] },
    { c: 4, sub: '4.8', name: 'Cooking Chronicles', queries: [
      'Is the dish cooked properly, or is it overcooked or undercooked?',
      'How healthy is the food being cooked?',
      'Is this food suitable for people of all ages?',
      'Which kinds of people would benefit from this food?',
    ] },

    { c: 5, sub: '5.1', name: 'Device Placement', queries: [
      'Where should I place my new air purifier?',
      'Where should I add another sensor for coverage?',
    ] },
    { c: 5, sub: '5.2', name: 'Operating Mode/Configuration', queries: [
      'What fan speed should the purifier run at now?',
      'Purifier or open window right now?',
    ] },
    { c: 5, sub: '5.3', name: 'Coverage Gaps', queries: [
      'Are there rooms my sensors don’t cover?',
    ] },
    { c: 5, sub: '5.4', name: 'Source Mitigation', queries: [
      'What are the top 3 pollution sources I should address?',
      'How do I reduce VOC from my cleaning routine?',
      'Should I switch cooking fuel?',
    ] },
    { c: 5, sub: '5.5', name: 'Financial/Resource Optimization', queries: [
      'What’s the energy cost of running the purifier continuously?',
      'When should I replace the purifier filter?',
      'Do I need a second purifier for the bedroom?',
    ] },

    { c: 6, sub: '6.1', name: 'Short-term Forecast', queries: [
      'Will air quality worsen after I start cooking?',
      'Will humidity spike if I run a hot shower with the door closed?',
    ] },
    { c: 6, sub: '6.2', name: 'Preemptive Suggestion', queries: [
      'Should I close windows before evening traffic?',
    ] },
    { c: 6, sub: '6.3', name: 'Threshold Alerting', queries: [
      'Warn me if VOC exceeds a safe level while I clean.',
    ] },
    { c: 6, sub: '6.4', name: 'Acute Hazard Detection', queries: [
      'Is there a gas leak or CO risk right now?',
      'Is today’s smoke event dangerous for my household?',
    ] },
    { c: 6, sub: '6.5', name: 'Escalation Guidance', queries: [
      'Should I seek medical attention for these symptoms?',
    ] },

    { c: 7, sub: '7.1', name: 'Confidence/Uncertainty', queries: [
      'How confident are you in this recommendation?',
    ] },
    { c: 7, sub: '7.2', name: 'Data & Privacy', queries: [
      'Who can see my exposure data?',
    ] },
    { c: 7, sub: '7.3', name: 'Device Health/Calibration', queries: [
      'Is the sensor working correctly? When was it last calibrated?',
    ] },
  ];

  const QUERIES = [];
  TAXONOMY.forEach((s) => {
    const groups = s.facets ? Object.entries(s.facets) : [[null, s.queries]];
    let n = 0;
    groups.forEach(([facet, list]) => list.forEach((text) => {
      n += 1;
      QUERIES.push({
        id: `q${s.sub.replace('.', '_')}_${String(n).padStart(2, '0')}`,
        c: s.c, sub: s.sub, subName: s.name, facet, text,
      });
    }));
  });

  /* ---------------- Section F ---------------- */
  // Removed 2026-10-29: PE1, SI2, FC1, FC2, BI1, BI2 and the ATT attention
  // check; the F2 demand question, F3 price block and F4 waitlist also went.
  const UTAUT = [
    { id: 'PE2', con: 'Performance expectancy', text: 'Using the assistant would help me keep my home’s air healthier.' },
    { id: 'PE3', con: 'Performance expectancy', text: 'Using the assistant would help me act on air problems more quickly.' },
    { id: 'EE1', con: 'Effort expectancy', text: 'Learning to use the assistant would be easy for me.' },
    { id: 'EE2', con: 'Effort expectancy', text: 'Asking the assistant questions by voice or text would be clear and understandable.' },
    { id: 'EE3', con: 'Effort expectancy', text: 'Wearing the device every day would be easy for me.' },
    { id: 'SI1', con: 'Social influence', text: 'People who are important to me would think I should use such an assistant.' },
    { id: 'CO1', con: 'Compatibility', text: 'Using the assistant would fit well with how my household lives.' },
    { id: 'PV1', con: 'Price value', text: 'At a reasonable price, the assistant would be good value for money.', pricing: true },
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
    KANO, KANO_OPTS, MAXDIFF, TAXONOMY, QUERIES, UTAUT, G,
  };
})();
