const request = require('supertest');
const { app } = require('../server');
const Zone = require('../models/Zone');
const Sustainability = require('../models/Sustainability');
const Match = require('../models/Match');

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

  describe('GET /api/crowd/matches', () => {
    it('should retrieve scheduled matches ordered by date', async () => {
      const mockMatches = [
        { teams: 'USA vs England', date: '2026-07-16', time: '20:00', status: 'Live' }
      ];

      Match.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMatches)
      });

      const res = await request(app).get('/api/crowd/matches');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].teams).toEqual('USA vs England');
    });
  });
});
