export const therapists = {
  komal: {
    id: 'komal',
    name: 'Komal',
    gender: 'female',
    voiceLabel: 'Female',
    tagline: 'Someone to talk to, whenever you need.',
    gradient: {
      from: '#1e1412',
      via: '#9e5230',
      to: '#c36a43',
    },
    accentColor: '#c36a43',
    chatLogGlass: 'rgba(40, 26, 22, 0.72)',
    bgImage: '/image/acc1.jpg',
    voice: 'ivy', // AssemblyAI female voice
  },
  alex: {
    id: 'alex',
    name: 'Alex',
    gender: 'male',
    voiceLabel: 'Male',
    tagline: 'Someone to talk to, whenever you need.',
    gradient: {
      from: '#1e1412',
      via: '#9e5230',
      to: '#c36a43',
    },
    accentColor: '#c36a43',
    chatLogGlass: 'rgba(40, 26, 22, 0.72)',
    bgImage: '/image/acc1.jpg',
    voice: 'james', // AssemblyAI male voice
  },
};

export const getTherapist = (id) => therapists[id] || therapists.komal;
