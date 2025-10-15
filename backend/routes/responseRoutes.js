const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { createResponseValidation, updateResponseValidation } = require('../middleware/validators');

// Create response to poll
router.post('/polls/:poll_code', createResponseValidation, responseController.createResponse);

// Get response by code
router.get('/:code', responseController.getResponse);

// Update response
router.put('/:code', updateResponseValidation, responseController.updateResponse);

// Delete response
router.delete('/:code', responseController.deleteResponse);

module.exports = router;
