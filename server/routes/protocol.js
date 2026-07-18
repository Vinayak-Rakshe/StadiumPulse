const express = require('express');
const router = express.Router();
const { getProtocols, postCopilotQuery } = require('../controllers/protocolController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProtocols);
router.post('/copilot-chat', protect, postCopilotQuery);

module.exports = router;
