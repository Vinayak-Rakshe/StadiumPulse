const request = require('supertest');
const { app } = require('../server');
const aiService = require('../services/aiService');
const Protocol = require('../models/Protocol');
const Zone = require('../models/Zone');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock AI Service & Database Models
jest.mock('../services/aiService');
jest.mock('../models/Protocol');
jest.mock('../models/Zone');
jest.mock('../models/User');

describe('AI API Endpoints', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock token for Organizer role
    const mockUser = {
      _id: '507f1f77bcf86cd799439031',
      name: 'Director',
      email: 'organizer@stadiumpulse.com',
      role: 'Organizer'
    };
    User.findById.mockResolvedValue(mockUser);
    token = jwt.sign({ id: mockUser._id }, 'stadiumpulse_secret_key_placeholder');
  });

  describe('POST /api/ai/nav-chat', () => {
    it('should generate wayfinding instructions given query and path coordinates', async () => {
      aiService.generateWayfindingDirections.mockResolvedValue('Mock directions in English: Walk from Gate 1 to Zone A.');

      const res = await request(app)
        .post('/api/ai/nav-chat')
        .send({
          query: 'Show me the way from Gate 1 to Restroom West',
          startLocation: 'Gate 1',
          endLocation: 'Restroom West',
          accessibleMode: true
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.responseText).toContain('Walk from Gate 1 to Zone A');
      expect(res.body.data.pathData.totalDistance).toBeGreaterThan(0);
    });
  });

  describe('POST /api/ai/crowd-summary', () => {
    it('should block requests from non-organizers', async () => {
      const res = await request(app)
        .post('/api/ai/crowd-summary')
        .send();

      expect(res.statusCode).toEqual(401);
    });

    it('should synthesize crowd warning alerts for authorized organizers', async () => {
      const mockZones = [
        { name: 'Zone B', type: 'Zone', capacity: 1000, currentOccupancy: 900 }
      ];
      Zone.find.mockResolvedValue(mockZones);
      aiService.generateCrowdSummary.mockResolvedValue('AI Alert: Zone B is highly crowded.');

      const res = await request(app)
        .post('/api/ai/crowd-summary')
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toContain('Zone B is highly crowded');
    });
  });

  describe('POST /api/protocols/copilot-chat', () => {
    it('should execute RAG matches and return volunteer procedure recommendations', async () => {
      const mockProtocol = {
        topic: 'Lost Child',
        role: 'Volunteer',
        description: 'Stay in location, radio control supervisor immediately.',
        keywords: ['lost', 'child']
      };
      
      Protocol.findOne.mockResolvedValue(mockProtocol);
      aiService.generateVolunteerProtocol.mockResolvedValue('AI Checkpoint: 1. Stay in location. 2. Radio supervisor.');

      const res = await request(app)
        .post('/api/protocols/copilot-chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'I found a lost child, what do I do?' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchedTopic).toEqual('Lost Child');
      expect(res.body.data.answer).toContain('Radio supervisor');
    });
  });
});
