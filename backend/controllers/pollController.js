const Poll = require('../models/Poll');
const { validationResult } = require('express-validator');

// Create new poll
exports.createPoll = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, timezone, time_slots, show_responses, allow_if_needed } = req.body;

    // Create poll
    const poll = await Poll.create({
      title,
      description,
      timezone,
      show_responses,
      allow_if_needed
    });

    // Add time slots
    if (time_slots && time_slots.length > 0) {
      await Poll.addTimeSlots(poll.id, time_slots);
    }

    // Get complete poll with time slots
    const completePoll = await Poll.getByCode(poll.poll_code);

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: completePoll
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll',
      error: error.message
    });
  }
};

// Get poll by code
exports.getPoll = async (req, res) => {
  try {
    const { code } = req.params;

    const poll = await Poll.getByCode(code);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.json({
      success: true,
      data: poll
    });
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll',
      error: error.message
    });
  }
};

// Get poll results
exports.getPollResults = async (req, res) => {
  try {
    const { code } = req.params;

    const results = await Poll.getResults(code);

    if (!results) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get poll results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get poll results',
      error: error.message
    });
  }
};

// Update poll
exports.updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await Poll.update(id, updates);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const poll = await Poll.getById(id);

    res.json({
      success: true,
      message: 'Poll updated successfully',
      data: poll
    });
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update poll',
      error: error.message
    });
  }
};

// Delete poll
exports.deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Poll.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete poll',
      error: error.message
    });
  }
};
