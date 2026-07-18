const request = require('supertest');
const { app } = require('../server');
const Zone = require('../models/Zone');
const Sustainability = require('../models/Sustainability');
const Match = require('../models/Match');
const { _computeMatchStatus } = require('../controllers/crowdController');

// Mock Models
jest.mock('../models/Zone');
jest.mock('../models/Sustainability');
jest.mock('../models/Match');

describe('Crowd and Operations API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/crowd/zones', () => {
    it('should retrieve all zones and calculate density percentage', async () => {
      const mockZones = [
        {
          _id: '507f1f77bcf86cd799439021',
          name: 'Gate 1',
          type: 'Gate',
          capacity: 1000,
          currentOccupancy: 300,
          isAccessible: true,
          accessibleFeatures: ['step-free']
        },
        {
          _id: '507f1f77bcf86cd799439022',
          name: 'Zone B',
          type: 'Zone',
          capacity: 2000,
          currentOccupancy: 1800,
          isAccessible: true,
          accessibleFeatures: ['elevator']
        }
      ];

      Zone.find.mockResolvedValue(mockZones);

      const res = await request(app).get('/api/crowd/zones');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      
      // Gate 1 Density should be (300/1000) * 100 = 30%
      expect(res.body.data[0].density).toEqual(30);
      // Zone B Density should be (1800/2000) * 100 = 90%
      expect(res.body.data[1].density).toEqual(90);
    });
  });

  describe('GET /api/crowd/sustainability', () => {
    it('should retrieve the latest sustainability statistics log', async () => {
      const mockStats = {
        waterUsageLitres: 12000,
        energyUsageKwh: 1500,
        wasteGeneratedKg: 400,
        recyclingRatePercent: 70
      };

      Sustainability.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockStats)
      });

      const res = await request(app).get('/api/crowd/sustainability');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recyclingRatePercent).toEqual(70);
    });
  });

  describe('GET /api/crowd/matches integration test with frozen system clock', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should override an intentionally wrong stored status field with the correct computed status', async () => {
      // Freeze system clock at 2026-07-20 19:00:00 UTC
      jest.setSystemTime(new Date('2026-07-20T19:00:00.000Z'));

      // Mock a match: kickoff is 2026-07-20 18:00:00 UTC
      // Stored status is "Upcoming" (which is wrong, it should be "Live" since 19:00 is within 3 hours from 18:00)
      const mockMatches = [
        {
          _id: '607f1f77bcf86cd799439023',
          teams: 'France vs Germany',
          date: new Date('2026-07-20'),
          time: '18:00',
          status: 'Upcoming', // Wrong stored status
          toObject: function() {
            return {
              _id: this._id,
              teams: this.teams,
              date: this.date,
              time: this.time,
              status: this.status
            };
          }
        }
      ];

      Match.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMatches)
      });

      const res = await request(app).get('/api/crowd/matches');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].status).toEqual('Live'); // Overridden from "Upcoming" to "Live"
    });
  });

  describe('computeMatchStatus unit tests with explicit now parameter', () => {
    const matchDate = new Date('2026-07-20'); // UTC midnight 2026-07-20
    const matchTime = '18:00'; // 18:00 UTC kickoff

    it('returns "Upcoming" when the kickoff date/time is in the future', () => {
      // Reference time: 1 hour before kickoff
      const now = new Date('2026-07-20T17:00:00.000Z');
      const status = _computeMatchStatus(matchDate, matchTime, now);
      expect(status).toBe('Upcoming');
    });

    it('returns "Live" exactly at kickoff instant', () => {
      // Reference time: exactly at kickoff
      const now = new Date('2026-07-20T18:00:00.000Z');
      const status = _computeMatchStatus(matchDate, matchTime, now);
      expect(status).toBe('Live');
    });

    it('returns "Live" within the 3-hour live window', () => {
      // Reference time: 2 hours and 59 minutes after kickoff
      const now = new Date('2026-07-20T20:59:00.000Z');
      const status = _computeMatchStatus(matchDate, matchTime, now);
      expect(status).toBe('Live');
    });

    it('returns "Completed" just past the 3-hour window', () => {
      // Reference time: exactly 3 hours after kickoff
      const now = new Date('2026-07-20T21:00:00.000Z');
      const status = _computeMatchStatus(matchDate, matchTime, now);
      expect(status).toBe('Completed');
    });
  });
});
