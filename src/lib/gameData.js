// Airlines and callsigns
export const AIRLINES = [
  { code: 'DAL', name: 'Delta', callsign: 'Delta' },
  { code: 'AAL', name: 'American', callsign: 'American' },
  { code: 'UAL', name: 'United', callsign: 'United' },
  { code: 'SWA', name: 'Southwest', callsign: 'Southwest' },
  { code: 'JBU', name: 'JetBlue', callsign: 'JetBlue' },
  { code: 'BAW', name: 'British Airways', callsign: 'Speedbird' },
  { code: 'DLH', name: 'Lufthansa', callsign: 'Lufthansa' },
  { code: 'AFR', name: 'Air France', callsign: 'Air France' },
  { code: 'UAE', name: 'Emirates', callsign: 'Emirates' },
  { code: 'QFA', name: 'Qantas', callsign: 'Qantas' },
  { code: 'ACA', name: 'Air Canada', callsign: 'Air Canada' },
  { code: 'SKW', name: 'SkyWest', callsign: 'SkyWest' },
  { code: 'RPA', name: 'Republic', callsign: 'Brickyard' },
  { code: 'FDX', name: 'FedEx', callsign: 'FedEx' },
  { code: 'UPS', name: 'UPS', callsign: 'UPS' },
  { code: 'N', name: 'General Aviation', callsign: 'November' },
];

export const AIRCRAFT_TYPES = [
  { type: 'B738', name: 'Boeing 737-800', category: 'LARGE', speed: 250, climbRate: 2500 },
  { type: 'A320', name: 'Airbus A320', category: 'LARGE', speed: 250, climbRate: 2500 },
  { type: 'B772', name: 'Boeing 777-200', category: 'HEAVY', speed: 280, climbRate: 2000 },
  { type: 'A388', name: 'Airbus A380', category: 'SUPER', speed: 280, climbRate: 1800 },
  { type: 'B744', name: 'Boeing 747-400', category: 'HEAVY', speed: 280, climbRate: 2000 },
  { type: 'E175', name: 'Embraer 175', category: 'LARGE', speed: 230, climbRate: 2800 },
  { type: 'CRJ7', name: 'CRJ-700', category: 'LARGE', speed: 220, climbRate: 2500 },
  { type: 'C172', name: 'Cessna 172', category: 'SMALL', speed: 110, climbRate: 700 },
  { type: 'C208', name: 'Cessna Caravan', category: 'SMALL', speed: 160, climbRate: 1000 },
  { type: 'B763', name: 'Boeing 767-300', category: 'HEAVY', speed: 270, climbRate: 2200 },
  { type: 'A333', name: 'Airbus A330-300', category: 'HEAVY', speed: 275, climbRate: 2100 },
  { type: 'MD11', name: 'MD-11', category: 'HEAVY', speed: 270, climbRate: 2000 },
];

export const AIRPORTS = [
  {
    id: 'KORD',
    name: "O'Hare International",
    city: 'Chicago',
    difficulty: 'EXPERT',
    runways: [
      { id: '10L/28R', heading: 100, length: 13000 },
      { id: '10R/28L', heading: 100, length: 7500 },
      { id: '09L/27R', heading: 90, length: 7967 },
      { id: '09R/27L', heading: 90, length: 8075 },
      { id: '04L/22R', heading: 40, length: 8075 },
    ],
    trafficDensity: 10,
    description: "One of the world's busiest. Pure chaos.",
  },
  {
    id: 'EGLL',
    name: 'Heathrow',
    city: 'London',
    difficulty: 'EXPERT',
    runways: [
      { id: '09L/27R', heading: 90, length: 12802 },
      { id: '09R/27L', heading: 90, length: 12008 },
    ],
    trafficDensity: 9,
    description: 'Two runways handling 80M passengers. Good luck.',
  },
  {
    id: 'KJFK',
    name: 'John F. Kennedy International',
    city: 'New York',
    difficulty: 'HARD',
    runways: [
      { id: '04L/22R', heading: 40, length: 11351 },
      { id: '04R/22L', heading: 40, length: 8400 },
      { id: '13L/31R', heading: 130, length: 14511 },
      { id: '13R/31L', heading: 130, length: 10000 },
    ],
    trafficDensity: 8,
    description: 'Heavy internationals, intersecting runways, constant wind.',
  },
  {
    id: 'KATL',
    name: 'Hartsfield-Jackson Atlanta',
    city: 'Atlanta',
    difficulty: 'HARD',
    runways: [
      { id: '08L/26R', heading: 80, length: 9000 },
      { id: '08R/26L', heading: 80, length: 9000 },
      { id: '09L/27R', heading: 90, length: 11890 },
      { id: '09R/27L', heading: 90, length: 9000 },
      { id: '10/28', heading: 100, length: 9000 },
    ],
    trafficDensity: 10,
    description: 'The busiest airport on Earth by movements.',
  },
  {
    id: 'KSFO',
    name: 'San Francisco International',
    city: 'San Francisco',
    difficulty: 'MEDIUM',
    runways: [
      { id: '01L/19R', heading: 10, length: 7650 },
      { id: '01R/19L', heading: 10, length: 8650 },
      { id: '10L/28R', heading: 100, length: 11870 },
      { id: '10R/28L', heading: 100, length: 10602 },
    ],
    trafficDensity: 7,
    description: 'Famous parallel approaches in fog. Terrifying.',
  },
  {
    id: 'KBOS',
    name: 'Logan International',
    city: 'Boston',
    difficulty: 'MEDIUM',
    runways: [
      { id: '04R/22L', heading: 40, length: 10083 },
      { id: '04L/22R', heading: 40, length: 7864 },
      { id: '09/27', heading: 90, length: 7001 },
      { id: '15R/33L', heading: 150, length: 10006 },
    ],
    trafficDensity: 6,
    description: 'Tight airspace, complex runway config, ocean approaches.',
  },
  {
    id: 'KASE',
    name: 'Aspen-Pitkin County',
    city: 'Aspen',
    difficulty: 'MEDIUM',
    runways: [
      { id: '15/33', heading: 150, length: 8006 },
    ],
    trafficDensity: 3,
    description: 'Mountain airport. One runway. Terrain everywhere.',
  },
  {
    id: 'KVNY',
    name: 'Van Nuys',
    city: 'Los Angeles',
    difficulty: 'EASY',
    runways: [
      { id: '16L/34R', heading: 160, length: 8001 },
      { id: '16R/34L', heading: 160, length: 4003 },
    ],
    trafficDensity: 4,
    description: 'Busiest GA airport in the world. Cessna central.',
  },
  {
    id: 'KOSH',
    name: 'Wittman Regional',
    city: 'Oshkosh',
    difficulty: 'BEGINNER',
    runways: [
      { id: '09/27', heading: 90, length: 6179 },
      { id: '18/36', heading: 180, length: 6178 },
    ],
    trafficDensity: 2,
    description: 'Training ground. Nice and easy... for now.',
  },
];

export const EMERGENCY_TYPES = [
  { id: 'engine_failure', name: 'Engine Failure', severity: 'HIGH', squawk: '7700', description: 'Single engine failure, needs priority handling' },
  { id: 'bird_strike', name: 'Bird Strike', severity: 'MEDIUM', squawk: '7700', description: 'Bird strike on takeoff or approach' },
  { id: 'medical', name: 'Medical Emergency', severity: 'MEDIUM', squawk: '7700', description: 'Passenger medical emergency, need expedited approach' },
  { id: 'fuel', name: 'Minimum Fuel', severity: 'HIGH', squawk: '7700', description: 'Running low on fuel, cannot hold' },
  { id: 'hydraulic', name: 'Hydraulic Failure', severity: 'HIGH', squawk: '7700', description: 'Hydraulic system failure, limited control' },
  { id: 'fire', name: 'Engine Fire', severity: 'CRITICAL', squawk: '7700', description: 'Engine fire, need immediate vectors' },
  { id: 'bomb_threat', name: 'Security Threat', severity: 'CRITICAL', squawk: '7500', description: 'Security concern, need isolated area' },
  { id: 'dual_engine', name: 'Dual Engine Failure', severity: 'CRITICAL', squawk: '7700', description: 'Both engines out. This is it.' },
  { id: 'gear', name: 'Landing Gear Malfunction', severity: 'MEDIUM', squawk: '7700', description: 'Gear won\'t extend, need flyby inspection' },
  { id: 'depressurization', name: 'Rapid Depressurization', severity: 'HIGH', squawk: '7700', description: 'Emergency descent required' },
];

export const WEATHER_PRESETS = [
  { id: 'clear', name: 'CAVOK', visibility: 'unlimited', ceiling: 'none', wind: { speed: 5, direction: 270, gusts: 0 }, severity: 0 },
  { id: 'light_rain', name: 'Light Rain', visibility: 6, ceiling: 3000, wind: { speed: 12, direction: 180, gusts: 18 }, severity: 1 },
  { id: 'imc', name: 'IMC / Low IFR', visibility: 1, ceiling: 200, wind: { speed: 8, direction: 90, gusts: 0 }, severity: 2 },
  { id: 'gusty', name: 'Gusty Crosswind', visibility: 10, ceiling: 5000, wind: { speed: 25, direction: 320, gusts: 38 }, severity: 2 },
  { id: 'thunderstorm', name: 'Embedded Thunderstorms', visibility: 2, ceiling: 800, wind: { speed: 30, direction: 210, gusts: 55 }, severity: 3 },
  { id: 'microburst', name: 'Microburst Alert', visibility: 4, ceiling: 2500, wind: { speed: 35, direction: 190, gusts: 60 }, severity: 4 },
  { id: 'windshear', name: 'Severe Wind Shear', visibility: 3, ceiling: 1500, wind: { speed: 28, direction: 240, gusts: 50 }, severity: 4 },
  { id: 'apocalypse', name: 'Apocalypse Mode', visibility: 0.5, ceiling: 100, wind: { speed: 45, direction: 270, gusts: 70 }, severity: 5 },
];

export const DIFFICULTY_LEVELS = [
  { id: 'tutorial', name: 'Tutorial', label: 'Baby Steps', trafficMult: 0.3, emergencyChance: 0, weatherMax: 0, description: "We'll hold your hand. Don't worry." },
  { id: 'beginner', name: 'Beginner', label: 'Trainee', trafficMult: 0.5, emergencyChance: 0.02, weatherMax: 1, description: 'Light traffic, rare problems.' },
  { id: 'medium', name: 'Intermediate', label: 'Certified', trafficMult: 0.7, emergencyChance: 0.05, weatherMax: 2, description: 'Real traffic. Real pressure.' },
  { id: 'hard', name: 'Advanced', label: 'Veteran', trafficMult: 1.0, emergencyChance: 0.1, weatherMax: 3, description: "Things go wrong. Deal with it." },
  { id: 'expert', name: 'Expert', label: 'Tower Chief', trafficMult: 1.3, emergencyChance: 0.15, weatherMax: 4, description: 'Maximum traffic. Constant emergencies.' },
  { id: 'insane', name: 'Insane', label: 'Fuck Your Life', trafficMult: 1.8, emergencyChance: 0.25, weatherMax: 5, description: 'Multiple simultaneous emergencies. Thunderstorms. God help you.' },
];

export const CAREER_MISSIONS = [
  {
    id: 'training',
    title: 'Tower Training',
    airport: 'KOSH',
    difficulty: 'tutorial',
    scoreTarget: 200,
    xpReward: 250,
    requiredRank: 1,
    description: 'Complete the guided tutorial and land your first aircraft safely.',
  },
  {
    id: 'first_solo',
    title: 'First Solo Shift',
    airport: 'KBOS',
    difficulty: 'beginner',
    scoreTarget: 500,
    xpReward: 400,
    requiredRank: 2,
    description: 'Handle light traffic at Boston Logan without separation losses.',
  },
  {
    id: 'regional_ops',
    title: 'Regional Operations',
    airport: 'KDEN',
    difficulty: 'medium',
    scoreTarget: 1000,
    xpReward: 750,
    requiredRank: 3,
    description: 'Manage moderate traffic and weather at Denver International.',
  },
  {
    id: 'hub_control',
    title: 'Hub Control',
    airport: 'KATL',
    difficulty: 'hard',
    scoreTarget: 1500,
    xpReward: 1200,
    requiredRank: 4,
    description: 'Keep the world\'s busiest airport moving through peak traffic.',
  },
  {
    id: 'international',
    title: 'International Gateway',
    airport: 'KJFK',
    difficulty: 'hard',
    scoreTarget: 2000,
    xpReward: 1500,
    requiredRank: 5,
    description: 'Handle heavy international traffic and intersecting runways at JFK.',
  },
  {
    id: 'heathrow_night',
    title: 'Heathrow Night Shift',
    airport: 'EGLL',
    difficulty: 'expert',
    scoreTarget: 2500,
    xpReward: 2000,
    requiredRank: 6,
    description: 'Two runways, eighty million passengers. Survive the night.',
  },
  {
    id: 'ohare_chaos',
    title: "O'Hare Chaos",
    airport: 'KORD',
    difficulty: 'expert',
    scoreTarget: 3000,
    xpReward: 2500,
    requiredRank: 7,
    description: 'One of the world\'s busiest airports. Pure chaos.',
  },
  {
    id: 'apex_certification',
    title: 'Apex Certification',
    airport: 'KJFK',
    difficulty: 'insane',
    scoreTarget: 4000,
    xpReward: 5000,
    requiredRank: 8,
    description: 'Multiple emergencies, severe weather, maximum traffic. Prove you are Apex.',
  },
];

export const CAREER_RANKS = [
  { level: 1, title: 'Ground Observer', xpRequired: 0, description: 'You literally just showed up' },
  { level: 2, title: 'Trainee Controller', xpRequired: 500, description: 'They let you touch the radio' },
  { level: 3, title: 'Junior Controller', xpRequired: 1500, description: 'You haven\'t killed anyone yet' },
  { level: 4, title: 'Tower Controller', xpRequired: 3500, description: 'Solo tower operations' },
  { level: 5, title: 'Approach Controller', xpRequired: 7000, description: 'Now you handle the real traffic' },
  { level: 6, title: 'TRACON Specialist', xpRequired: 12000, description: 'Multi-airport terminal area' },
  { level: 7, title: 'Center Controller', xpRequired: 20000, description: 'En-route high altitude' },
  { level: 8, title: 'Senior Controller', xpRequired: 35000, description: 'Veteran status, training others' },
  { level: 9, title: 'Facility Chief', xpRequired: 55000, description: 'Running the whole damn show' },
  { level: 10, title: 'Apex Controller', xpRequired: 80000, description: 'The best there ever was' },
];

export const INSTRUCTOR_LINES = {
  good: [
    "Clean vector. Keep it up.",
    "Textbook separation. Nice.",
    "Smooth sequence. That's how it's done.",
    "Perfect readback acknowledgment.",
    "Good call on the spacing.",
  ],
  bad: [
    "What the hell was that?! You call that a vector?",
    "You almost killed 300 people. THINK.",
    "Are you even looking at the scope?!",
    "That's a separation violation, genius.",
    "A first-day trainee could do better than that.",
  ],
  emergency: [
    "EMERGENCY. Focus. Lives depend on you.",
    "Priority traffic. Clear the path NOW.",
    "This isn't a drill. Get them on the ground.",
  ],
  near_miss: [
    "CONFLICT ALERT! What the FUCK are you doing?!",
    "You almost caused a mid-air! WAKE UP!",
    "SEPARATION LOSS! Are you trying to make the news?!",
  ],
  weather: [
    "Microburst on final. This is about to get ugly.",
    "Wind shear alert. Brace yourself.",
    "Thunderstorm cell moving in. Reroute EVERYTHING.",
  ],
};

// Generate a random flight number
export function generateCallsign() {
  const airline = AIRLINES[Math.floor(Math.random() * (AIRLINES.length - 1))];
  const number = Math.floor(Math.random() * 9000) + 100;
  return {
    airline,
    flightNumber: `${airline.code}${number}`,
    spoken: `${airline.callsign} ${String(number).split('').join(' ')}`,
  };
}

// Generate a random aircraft
export function generateAircraft(airportDifficulty) {
  let filtered = AIRCRAFT_TYPES;
  if (airportDifficulty === 'EASY' || airportDifficulty === 'BEGINNER') {
    filtered = AIRCRAFT_TYPES.filter(a => a.category !== 'SUPER');
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}