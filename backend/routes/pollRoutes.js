const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const { createPollValidation } = require('../middleware/validators');

// Create new poll
router.post('/', createPollValidation, pollController.createPoll);

// Get poll by code
router.get('/:code', pollController.getPoll);

// Get poll results
router.get('/:code/results', pollController.getPollResults);

// Update poll (requires authentication in future)
router.put('/:id', pollController.updatePoll);

// Delete poll (requires authentication in future)
router.delete('/:id', pollController.deletePoll);

module.exports = router;
