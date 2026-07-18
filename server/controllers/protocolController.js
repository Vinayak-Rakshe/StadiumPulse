const Protocol = require('../models/Protocol');
const aiService = require('../services/aiService');

/**
 * @desc    Get all protocol topics
 * @route   GET /api/protocols
 * @access  Private (Volunteer/Staff/Organizer)
 */
exports.getProtocols = async (req, res, next) => {
  try {
    const protocols = await Protocol.find().select('topic role keywords');
    
    res.status(200).json({
      success: true,
      count: protocols.length,
      data: protocols
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit query to AI Volunteer Copilot (RAG pattern)
 * @route   POST /api/protocols/copilot-chat
 * @access  Private (Volunteer/Staff/Organizer)
 */
exports.postCopilotQuery = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a copilot question' });
    }

    // Convert query into words to find keyword matches
    const searchTerms = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Find protocol that matches search terms in topic or keywords array
    let matchedProtocol = null;

    if (searchTerms.length > 0) {
      matchedProtocol = await Protocol.findOne({
        $or: [
          { topic: { $regex: searchTerms.join('|'), $options: 'i' } },
          { keywords: { $in: searchTerms } }
        ]
      });
    }

    // Generate AI synthesized instruction based on retrieved database protocol
    const answer = await aiService.generateVolunteerProtocol(query, matchedProtocol);

    res.status(200).json({
      success: true,
      data: {
        query,
        matchedTopic: matchedProtocol ? matchedProtocol.topic : 'None',
        answer
      }
    });
  } catch (error) {
    next(error);
  }
};
