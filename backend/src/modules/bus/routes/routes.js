const express = require('express');
const router = express.Router();

// Placeholder routes for Buses
router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "Get buses endpoint placeholder" });
});

router.post('/', (req, res) => {
  res.status(200).json({ success: true, message: "Create bus endpoint placeholder" });
});

module.exports = router;
