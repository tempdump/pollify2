const { query } = require('../config/database');

class Response {
  // Generate unique response code
  static async generateResponseCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let exists = true;

    while (exists) {
      code = 'R-';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const existing = await query(
        'SELECT id FROM responses WHERE response_code = ?',
        [code]
      );
      exists = existing.length > 0;
    }

    return code;
  }

  // Create new response
  static async create(responseData) {
    const { poll_id, participant_name, participant_email } = responseData;
    const response_code = await this.generateResponseCode();

    const result = await query(
      `INSERT INTO responses (poll_id, participant_name, participant_email, response_code)
       VALUES (?, ?, ?, ?)`,
      [poll_id, participant_name, participant_email || null, response_code]
    );

    return {
      id: result.insertId,
      response_code,
      participant_name
    };
  }

  // Add availability data
  static async addAvailability(response_id, availabilityData) {
    if (!Array.isArray(availabilityData) || availabilityData.length === 0) {
      return 0;
    }

    const values = availabilityData.map(slot => [
      response_id,
      slot.time_slot_id,
      slot.status
    ]);

    const placeholders = values.map(() => '(?, ?, ?)').join(',');
    const flatValues = values.flat();

    const result = await query(
      `INSERT INTO availability (response_id, time_slot_id, status)
       VALUES ${placeholders}`,
      flatValues
    );

    return result.affectedRows;
  }

  // Get response by code
  static async getByCode(response_code) {
    const responses = await query(
      `SELECT r.id, r.poll_id, r.participant_name, r.participant_email,
              r.response_code, r.created_at, r.updated_at
       FROM responses r
       WHERE r.response_code = ?`,
      [response_code]
    );

    if (responses.length === 0) {
      return null;
    }

    const response = responses[0];

    // Get availability
    const availability = await query(
      `SELECT a.time_slot_id, a.status, ts.start_time, ts.end_time
       FROM availability a
       JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.response_id = ?
       ORDER BY ts.start_time`,
      [response.id]
    );

    return {
      ...response,
      availability
    };
  }

  // Update response
  static async update(response_code, updates) {
    const { participant_name, participant_email } = updates;

    const result = await query(
      `UPDATE responses
       SET participant_name = COALESCE(?, participant_name),
           participant_email = COALESCE(?, participant_email)
       WHERE response_code = ?`,
      [participant_name, participant_email, response_code]
    );

    return result.affectedRows > 0;
  }

  // Update availability
  static async updateAvailability(response_id, availabilityData) {
    // Delete existing availability
    await query('DELETE FROM availability WHERE response_id = ?', [response_id]);

    // Add new availability
    return await this.addAvailability(response_id, availabilityData);
  }

  // Delete response
  static async delete(response_code) {
    const result = await query(
      'DELETE FROM responses WHERE response_code = ?',
      [response_code]
    );
    return result.affectedRows > 0;
  }

  // Get all responses for a poll
  static async getAllByPollId(poll_id) {
    const responses = await query(
      `SELECT id, participant_name, participant_email, response_code, created_at
       FROM responses
       WHERE poll_id = ?
       ORDER BY created_at DESC`,
      [poll_id]
    );

    return responses;
  }
}

module.exports = Response;
