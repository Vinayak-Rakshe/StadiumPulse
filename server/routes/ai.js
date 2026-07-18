const express = require('express');
const router = express.Router();
const { chatWayfinding, getCrowdSummary, getSustainabilitySummary } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/nav-chat', chatWayfinding);
router.post('/crowd-summary', protect, authorize('Staff', 'Organizer'), getCrowdSummary);
router.post('/sustainability-summary', getSustainabilitySummary);

module.exports = router;
