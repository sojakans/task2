const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');

router.post('/', refundController.createRefund);
router.get('/', refundController.getRefunds);

module.exports = router;
