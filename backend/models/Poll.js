const { query } = require('../config/database');

class Poll {
  // Generate unique poll code
  static async generatePollCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check if code already exists
      const existing = await query(
        'SELECT id FROM polls WHERE poll_code = ?',
        [code]
      );
      exists = existing.length > 0;
    }

    return code;
  }

  // Create new poll
  static async create(pollData) {
    const { creator_id, title, description, timezone, show_responses, allow_if_needed } = pollData;
    const poll_code = await this.generatePollCode();

    const result = await query(
      `INSERT INTO polls (creator_id, title, description, poll_code, timezone, show_responses, allow_if_needed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [creator_id || 1, title, description || null, poll_code, timezone || 'Europe/Stockholm', show_responses !== false, allow_if_needed !== false]
    );

    return {
      id: result.insertId,
      poll_code,
      title,
      description,
      timezone,
      show_responses: show_responses !== false,
      allow_if_needed: allow_if_needed !== false
    };
  }

  // Get poll by code
  static async getByCode(poll_code) {
    const polls = await query(
      `SELECT id, creator_id, title, description, poll_code, timezone,
              is_active, show_responses, allow_if_needed, created_at, updated_at
       FROM polls
       WHERE poll_code = ? AND is_active = TRUE`,
      [poll_code]
    );

    if (polls.length === 0) {
      return null;
    }

    const poll = polls[0];

    // Get time slots
    const timeSlots = await query(
      `SELECT id, start_time, end_time
       FROM time_slots
       WHERE poll_id = ?
       ORDER BY start_time`,
      [poll.id]
    );

    return {
      ...poll,
      time_slots: timeSlots
    };
  }

  // Get poll by ID
  static async getById(id) {
    const polls = await query(
      `SELECT id, creator_id, title, description, poll_code, timezone,
              is_active, show_responses, allow_if_needed, created_at, updated_at
       FROM polls
       WHERE id = ?`,
      [id]
    );

    return polls.length > 0 ? polls[0] : null;
  }

  // Add time slots to poll
  static async addTimeSlots(poll_id, timeSlots) {
    const values = timeSlots.map(slot => [poll_id, slot.start_time, slot.end_time]);

    const placeholders = values.map(() => '(?, ?, ?)').join(',');
    const flatValues = values.flat();

    const result = await query(
      `INSERT INTO time_slots (poll_id, start_time, end_time) VALUES ${placeholders}`,
      flatValues
    );

    return result.affectedRows;
  }

  // Get poll results (availability summary)
  static async getResults(poll_code) {
    const poll = await this.getByCode(poll_code);

    if (!poll) {
      return null;
    }

    // Get availability counts per time slot
    const results = await query(
      `SELECT
        ts.id as time_slot_id,
        ts.start_time,
        ts.end_time,
        COUNT(DISTINCT r.id) as total_responses,
        SUM(CASE WHEN a.status = 'available' THEN 1 ELSE 0 END) as available_count,
        SUM(CASE WHEN a.status = 'if_needed' THEN 1 ELSE 0 END) as if_needed_count,
        SUM(CASE WHEN a.status = 'not_available' THEN 1 ELSE 0 END) as not_available_count
       FROM time_slots ts
       LEFT JOIN availability a ON ts.id = a.time_slot_id
       LEFT JOIN responses r ON a.response_id = r.id
       WHERE ts.poll_id = ?
       GROUP BY ts.id, ts.start_time, ts.end_time
       ORDER BY available_count DESC, ts.start_time`,
      [poll.id]
    );

    // Get all responses if show_responses is true
    let responses = [];
    if (poll.show_responses) {
      responses = await query(
        `SELECT
          r.id,
          r.participant_name,
          r.created_at
         FROM responses r
         WHERE r.poll_id = ?
         ORDER BY r.created_at`,
        [poll.id]
      );

      // Get availability for each response
      for (let response of responses) {
        response.availability = await query(
          `SELECT time_slot_id, status
           FROM availability
           WHERE response_id = ?`,
          [response.id]
        );
      }
    }

    return {
      poll: {
        title: poll.title,
        description: poll.description,
        poll_code: poll.poll_code,
        timezone: poll.timezone
      },
      results,
      responses: poll.show_responses ? responses : null,
      total_responses: results[0]?.total_responses || 0
    };
  }

  // Update poll
  static async update(id, updates) {
    const { title, description, is_active, show_responses } = updates;

    const result = await query(
      `UPDATE polls
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           is_active = COALESCE(?, is_active),
           show_responses = COALESCE(?, show_responses)
       WHERE id = ?`,
      [title, description, is_active, show_responses, id]
    );

    return result.affectedRows > 0;
  }

  // Delete poll
  static async delete(id) {
    const result = await query('DELETE FROM polls WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Poll;
