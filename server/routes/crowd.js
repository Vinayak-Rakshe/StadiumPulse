const express = require('express');
const router = express.Router();
const { getZones, updateZoneOccupancy, getSustainabilityMetrics, getMatches } = require('../controllers/crowdController');
const { protect, authorize } = require('../middleware/auth');

router.get('/zones', getZones);
router.put('/zones/:id', protect, authorize('Staff', 'Organizer'), updateZoneOccupancy);
router.get('/sustainability', getSustainabilityMetrics);
router.get('/matches', getMatches);

module.exports = router;
