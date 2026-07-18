const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Zone = require('./models/Zone');
const Protocol = require('./models/Protocol');
const Sustainability = require('./models/Sustainability');
const Match = require('./models/Match');

// Load environment variables
dotenv.config();

const users = [
  {
    name: 'Tournament Director',
    email: 'organizer@stadiumpulse.com',
    password: 'password123',
    role: 'Organizer'
  },
  {
    name: 'Sector B Coordinator',
    email: 'staff@stadiumpulse.com',
    password: 'password123',
    role: 'Staff'
  },
  {
    name: 'Volunteer Guide',
    email: 'volunteer@stadiumpulse.com',
    password: 'password123',
    role: 'Volunteer'
  }
];

const zones = [
  { name: 'Gate 1', type: 'Gate', capacity: 3000, currentOccupancy: 1200, accessibleFeatures: ['step-free', 'ramp'], isAccessible: true },
  { name: 'Gate 2', type: 'Gate', capacity: 2500, currentOccupancy: 800, accessibleFeatures: ['step-free', 'ramp', 'braille-signage'], isAccessible: true },
  { name: 'Gate 3', type: 'Gate', capacity: 2500, currentOccupancy: 2300, accessibleFeatures: [], isAccessible: true }, // high occupancy
  { name: 'Gate 4', type: 'Gate', capacity: 3000, currentOccupancy: 700, accessibleFeatures: ['step-free', 'ramp'], isAccessible: true },
  
  { name: 'Zone A', type: 'Zone', capacity: 5000, currentOccupancy: 1800, accessibleFeatures: ['step-free'], isAccessible: true },
  { name: 'Zone B', type: 'Zone', capacity: 4000, currentOccupancy: 3800, accessibleFeatures: ['step-free', 'elevator'], isAccessible: true }, // critical occupancy
  { name: 'Zone C', type: 'Zone', capacity: 4000, currentOccupancy: 1200, accessibleFeatures: [], isAccessible: false }, // stairs only
  { name: 'Zone D', type: 'Zone', capacity: 5000, currentOccupancy: 1400, accessibleFeatures: ['step-free'], isAccessible: true },

  { name: 'Block 101', type: 'SeatBlock', capacity: 800, currentOccupancy: 350, accessibleFeatures: ['step-free', 'wheelchair-seating'], isAccessible: true },
  { name: 'Block 102', type: 'SeatBlock', capacity: 800, currentOccupancy: 780, accessibleFeatures: ['step-free', 'elevator', 'hearing-loop'], isAccessible: true }, // critical
  { name: 'Block 103', type: 'SeatBlock', capacity: 800, currentOccupancy: 200, accessibleFeatures: [], isAccessible: false },
  { name: 'Block 104', type: 'SeatBlock', capacity: 800, currentOccupancy: 410, accessibleFeatures: ['step-free', 'ramp'], isAccessible: true },

  { name: 'Restroom West', type: 'Restroom', capacity: 50, currentOccupancy: 12, accessibleFeatures: ['step-free', 'braille-signage', 'emergency-button'], isAccessible: true },
  { name: 'Restroom East', type: 'Restroom', capacity: 50, currentOccupancy: 34, accessibleFeatures: [], isAccessible: false },

  { name: 'Food Court West', type: 'Concession', capacity: 200, currentOccupancy: 145, accessibleFeatures: ['step-free', 'low-counters'], isAccessible: true },
  { name: 'Food Court East', type: 'Concession', capacity: 200, currentOccupancy: 95, accessibleFeatures: [], isAccessible: false },

  { name: 'First Aid Station', type: 'FirstAid', capacity: 20, currentOccupancy: 4, accessibleFeatures: ['step-free', 'wide-doors'], isAccessible: true },
  { name: 'VIP Lounge', type: 'Zone', capacity: 300, currentOccupancy: 180, accessibleFeatures: ['step-free', 'elevator'], isAccessible: true }
];

const protocols = [
  {
    topic: 'Medical Emergency',
    role: 'All',
    description: `1. Stay calm and assess the situation. Do not move the patient unless there is immediate danger.
2. Dial 911 or radio the First Aid dispatch immediately on Channel 3, stating the patient's exact location (e.g. Block 102, Row E).
3. Request nearby volunteers to guide responders from the nearest gate and clear a corridor in the crowd.
4. Keep spectators at a safe distance and protect the patient's privacy.
5. Remain with the patient until the Medical Response team arrives and takes control.`,
    keywords: ['medical', 'heart', 'injury', 'hurt', 'collapse', 'bleed', 'ambulance', 'doctor', 'pain', 'sick']
  },
  {
    topic: 'Lost Child',
    role: 'Volunteer',
    description: `1. Keep the child in their original sector. Do not transport the child across the stadium.
2. Call the Control Room supervisor on radio Channel 1. Provide the child's name, approximate age, clothing description, and sector location.
3. Keep the child safe and calm. Offer water and reassure them that their guardians are being contacted.
4. If a parent/guardian reports a lost child, bring them to the nearest Guest Services booth (located in Zone A or Zone C).
5. Only hand the child over to a matching guardian once security verifies identification/matching credentials.`,
    keywords: ['lost', 'child', 'kid', 'parent', 'missing', 'son', 'daughter', 'boy', 'girl']
  },
  {
    topic: 'Ticketing Issue',
    role: 'Staff',
    description: `1. Check the ticket printed details or QR barcode details: verify match date, kickoff time, and gate assignment.
2. If the ticket scan fails, check for brightness/reflection on the phone screen or guide them to the manual validation scanner.
3. For duplicate seats, politely request both ticket holders to present their verification, check their IDs, and route the dispute to the Ticket Resolution Window at Gate 1.
4. Do not offer seat override upgrades or scan overrides without written supervisor signoff.`,
    keywords: ['ticket', 'scan', 'duplicate', 'seat', 'gate', 'error', 'barcode', 'qr', 'invalid']
  },
  {
    topic: 'Severe Weather Warning',
    role: 'All',
    description: `1. Wait for official broadcast alerts from the control center.
2. When instruction is broadcast, guide spectators from the outer uncovered seating bowl down into the covered concourse areas (Zone A, B, C, D).
3. Maintain doors open and ensure steps are kept dry or marked with warning pylons.
4. Remind fans that umbrellas are prohibited and they should utilize reusable rain ponchos.`,
    keywords: ['weather', 'rain', 'lightning', 'storm', 'wind', 'evacuate', 'shelter', 'wet']
  }
];

const sustainability = {
  waterUsageLitres: 124500,
  energyUsageKwh: 18200,
  wasteGeneratedKg: 4200,
  recyclingRatePercent: 62,
  notes: 'High crowd numbers for matchday. Recycling rate steady; minor food waste reduction campaigns needed in Zone B Concessions.'
};

// Build match dates relative to today so the schedule looks realistic whenever
// the app is demoed. The stored `status` field below is kept as a valid DB
// default, but the API (crowdController.js → computeMatchStatus) always
// overrides it with a value derived from the current server time.
const today = new Date();
const daysFromToday = (n) => {
  const d = new Date(today);
  d.setUTCHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};

const matches = [
  {
    teams: 'Argentina vs England',
    date: daysFromToday(-2),  // 2 days ago → will compute as Completed
    time: '20:00',
    stadiumName: 'StadiumPulse Arena (New York/New Jersey)',
    status: 'Completed'       // NOTE: API overrides this dynamically
  },
  {
    teams: 'France vs England',
    date: daysFromToday(1),   // tomorrow → will compute as Upcoming
    time: '18:00',
    stadiumName: 'StadiumPulse Arena (New York/New Jersey)',
    status: 'Upcoming'        // NOTE: API overrides this dynamically
  },
  {
    teams: 'Argentina vs Spain',
    date: daysFromToday(3),   // 3 days from now → will compute as Upcoming
    time: '15:00',
    stadiumName: 'StadiumPulse Arena (New York/New Jersey)',
    status: 'Upcoming'        // NOTE: API overrides this dynamically
  }
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/stadiumpulse';
    await mongoose.connect(connStr);
    console.log('MongoDB Connected for Seeding...');

    // Delete existing
    await User.deleteMany();
    await Zone.deleteMany();
    await Protocol.deleteMany();
    await Sustainability.deleteMany();
    await Match.deleteMany();
    console.log('Cleared existing data.');

    // Seed users
    for (const u of users) {
      await User.create(u);
    }
    console.log('Seeded Users.');

    // Seed zones
    await Zone.insertMany(zones);
    console.log('Seeded Stadium Zones.');

    // Seed protocols
    await Protocol.insertMany(protocols);
    console.log('Seeded Protocols.');

    // Seed sustainability
    await Sustainability.create(sustainability);
    console.log('Seeded Sustainability metrics.');

    // Seed matches
    await Match.insertMany(matches);
    console.log('Seeded Matches.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
