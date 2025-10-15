const Response = require('../models/Response');
const Poll = require('../models/Poll');
const { validationResult } = require('express-validator');

// Create response to poll
exports.createResponse = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { poll_code } = req.params;
    const { participant_name, participant_email, availability } = req.body;

    // Check if poll exists
    const poll = await Poll.getByCode(poll_code);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Create response
    const response = await Response.create({
      poll_id: poll.id,
      participant_name,
      participant_email
    });

    // Add availability data
    if (availability && availability.length > 0) {
      await Response.addAvailability(response.id, availability);
    }

    // Get complete response
    const completeResponse = await Response.getByCode(response.response_code);

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: completeResponse
    });
  } catch (error) {
    console.error('Create response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit response',
      error: error.message
    });
  }
};

// Get response by code
exports.getResponse = async (req, res) => {
  try {
    const { code } = req.params;

    const response = await Response.getByCode(code);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response',
      error: error.message
    });
  }
};

// Update response
exports.updateResponse = async (req, res) => {
  try {
    const { code } = req.params;
    const { participant_name, participant_email, availability } = req.body;

    // Check if response exists
    const existingResponse = await Response.getByCode(code);
    if (!existingResponse) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Update response
    await Response.update(code, {
      participant_name,
      participant_email
    });

    // Update availability if provided
    if (availability && availability.length > 0) {
      await Response.updateAvailability(existingResponse.id, availability);
    }

    // Get updated response
    const updatedResponse = await Response.getByCode(code);

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: updatedResponse
    });
  } catch (error) {
    console.error('Update response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update response',
      error: error.message
    });
  }
};

// Delete response
exports.deleteResponse = async (req, res) => {
  try {
    const { code } = req.params;

    const success = await Response.delete(code);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete response',
      error: error.message
    });
  }
};
