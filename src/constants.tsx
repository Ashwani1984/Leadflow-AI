export const VOICE_PROFILES = [
  { id: 'Atlas', name: 'Atlas', gender: 'Male', tone: 'Professional', sample: { en: 'Strategic implementation of growth protocols.', hi: 'विकास प्रोटोकॉल का रणनीतिक कार्यान्वयन।' } },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', tone: 'Energetic', sample: { en: 'Ready to scale your outreach trajectory today!', hi: 'आज आपके आउटरीच प्रक्षेपवक्र को बढ़ाने के लिए तैयार है!' } },
  { id: 'Kore', name: 'Kore', gender: 'Female', tone: 'Calm', sample: { en: 'Maintaining optimal lead flow stabilization.', hi: 'इष्टतम लीड प्रवाह स्थिरीकरण बनाए रखना।' } },
  { id: 'Puck', name: 'Puck', gender: 'Male', tone: 'Friendly', sample: { en: 'Connecting you with global intelligence units.', hi: 'आपको वैश्विक खुफिया इकाइयों से जोड़ रहा है।' } },
  { id: 'Nova', name: 'Nova', gender: 'Female', tone: 'Technical', sample: { en: 'Analyzing deep-stack infrastructure metrics.', hi: 'डीप-स्टैक इन्फ्रास्ट्रक्चर मेट्रिक्स का विश्लेषण।' } },
];

export const LANGUAGES = [
  { id: 'en-US', name: 'English (US)' },
  { id: 'en-GB', name: 'English (UK)' },
  { id: 'es-ES', name: 'Spanish' },
  { id: 'fr-FR', name: 'French' },
  { id: 'de-DE', name: 'German' },
  { id: 'hi-IN', name: 'Hindi' },
];

export const initialAgents = [
  { id: 1, name: 'SDR Agent Alpha', status: 'Active', tasks: 124, conversion: '12.4%', voice: 'Kore', language: 'en-US' },
  { id: 2, name: 'Retention Bot v2', status: 'Paused', tasks: 0, conversion: '8.2%', voice: 'Puck', language: 'en-US' },
  { id: 3, name: 'QualifyPro 3000', status: 'Active', tasks: 42, conversion: '15.7%', voice: 'Zephyr', language: 'en-US' },
];
