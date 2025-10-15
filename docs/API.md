# Pollify API Documentation

Base URL: `http://localhost:3000/api` (development)
Production: `https://retea.se/pollify/api`

## Table of Contents
- [Polls](#polls)
- [Responses](#responses)
- [Error Handling](#error-handling)

---

## Polls

### Create Poll

Create a new availability poll.

**Endpoint:** `POST /api/polls`

**Request Body:**
```json
{
  "title": "Team Meeting Week 42",
  "description": "Finding the best time for our weekly meeting",
  "timezone": "Europe/Stockholm",
  "show_responses": true,
  "allow_if_needed": true,
  "time_slots": [
    {
      "start_time": "2025-10-20T09:00:00",
      "end_time": "2025-10-20T10:00:00"
    },
    {
      "start_time": "2025-10-20T13:00:00",
      "end_time": "2025-10-20T14:00:00"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Poll created successfully",
  "data": {
    "id": 1,
    "creator_id": 1,
    "title": "Team Meeting Week 42",
    "description": "Finding the best time for our weekly meeting",
    "poll_code": "ABC123",
    "timezone": "Europe/Stockholm",
    "is_active": true,
    "show_responses": true,
    "allow_if_needed": true,
    "time_slots": [
      {
        "id": 1,
        "start_time": "2025-10-20T09:00:00.000Z",
        "end_time": "2025-10-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Poll

Get poll details by poll code.

**Endpoint:** `GET /api/polls/:code`

**Parameters:**
- `code` (string, required) - Poll code (e.g., "ABC123")

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Team Meeting Week 42",
    "description": "Finding the best time for our weekly meeting",
    "poll_code": "ABC123",
    "timezone": "Europe/Stockholm",
    "is_active": true,
    "show_responses": true,
    "allow_if_needed": true,
    "time_slots": [
      {
        "id": 1,
        "start_time": "2025-10-20T09:00:00.000Z",
        "end_time": "2025-10-20T10:00:00.000Z"
      },
      {
        "id": 2,
        "start_time": "2025-10-20T13:00:00.000Z",
        "end_time": "2025-10-20T14:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Poll Results

Get aggregated results showing availability counts per time slot.

**Endpoint:** `GET /api/polls/:code/results`

**Parameters:**
- `code` (string, required) - Poll code

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "poll": {
      "title": "Team Meeting Week 42",
      "description": "Finding the best time for our weekly meeting",
      "poll_code": "ABC123",
      "timezone": "Europe/Stockholm"
    },
    "total_responses": 3,
    "results": [
      {
        "time_slot_id": 1,
        "start_time": "2025-10-20T09:00:00.000Z",
        "end_time": "2025-10-20T10:00:00.000Z",
        "total_responses": 3,
        "available_count": 2,
        "if_needed_count": 1,
        "not_available_count": 0
      },
      {
        "time_slot_id": 2,
        "start_time": "2025-10-20T13:00:00.000Z",
        "end_time": "2025-10-20T14:00:00.000Z",
        "total_responses": 3,
        "available_count": 3,
        "if_needed_count": 0,
        "not_available_count": 0
      }
    ],
    "responses": [
      {
        "id": 1,
        "participant_name": "Anna Andersson",
        "created_at": "2025-10-15T10:00:00.000Z",
        "availability": [
          {
            "time_slot_id": 1,
            "status": "available"
          },
          {
            "time_slot_id": 2,
            "status": "available"
          }
        ]
      }
    ]
  }
}
```

---

### Update Poll

Update poll details (requires authentication in future).

**Endpoint:** `PUT /api/polls/:id`

**Parameters:**
- `id` (integer, required) - Poll ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "is_active": true,
  "show_responses": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Poll updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated description",
    "is_active": true,
    "show_responses": false
  }
}
```

---

### Delete Poll

Delete a poll (requires authentication in future).

**Endpoint:** `DELETE /api/polls/:id`

**Parameters:**
- `id` (integer, required) - Poll ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Poll deleted successfully"
}
```

---

## Responses

### Submit Response

Submit availability for a poll.

**Endpoint:** `POST /api/responses/polls/:poll_code`

**Parameters:**
- `poll_code` (string, required) - Poll code

**Request Body:**
```json
{
  "participant_name": "Erik Eriksson",
  "participant_email": "erik@example.com",
  "availability": [
    {
      "time_slot_id": 1,
      "status": "available"
    },
    {
      "time_slot_id": 2,
      "status": "if_needed"
    },
    {
      "time_slot_id": 3,
      "status": "not_available"
    }
  ]
}
```

**Availability Status Values:**
- `"available"` - Person is available
- `"if_needed"` - Person can attend if needed
- `"not_available"` - Person is not available

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Response submitted successfully",
  "data": {
    "id": 1,
    "poll_id": 1,
    "participant_name": "Erik Eriksson",
    "participant_email": "erik@example.com",
    "response_code": "R-ABC12345",
    "created_at": "2025-10-15T10:00:00.000Z",
    "availability": [
      {
        "time_slot_id": 1,
        "status": "available",
        "start_time": "2025-10-20T09:00:00.000Z",
        "end_time": "2025-10-20T10:00:00.000Z"
      }
    ]
  }
}
```

**Important:** Save the `response_code` to allow users to edit their response later!

---

### Get Response

Retrieve a response by response code (for editing).

**Endpoint:** `GET /api/responses/:code`

**Parameters:**
- `code` (string, required) - Response code (e.g., "R-ABC12345")

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "poll_id": 1,
    "participant_name": "Erik Eriksson",
    "participant_email": "erik@example.com",
    "response_code": "R-ABC12345",
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z",
    "availability": [
      {
        "time_slot_id": 1,
        "status": "available",
        "start_time": "2025-10-20T09:00:00.000Z",
        "end_time": "2025-10-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Update Response

Update an existing response.

**Endpoint:** `PUT /api/responses/:code`

**Parameters:**
- `code` (string, required) - Response code

**Request Body:**
```json
{
  "participant_name": "Erik E.",
  "participant_email": "newemail@example.com",
  "availability": [
    {
      "time_slot_id": 1,
      "status": "if_needed"
    },
    {
      "time_slot_id": 2,
      "status": "available"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Response updated successfully",
  "data": {
    "id": 1,
    "participant_name": "Erik E.",
    "participant_email": "newemail@example.com",
    "response_code": "R-ABC12345",
    "availability": [...]
  }
}
```

---

### Delete Response

Delete a response.

**Endpoint:** `DELETE /api/responses/:code`

**Parameters:**
- `code` (string, required) - Response code

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Response deleted successfully"
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Errors

**Validation Error (400):**
```json
{
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 3 and 255 characters",
      "value": "AB"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Poll not found"
}
```

**Rate Limit (429):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max requests:** 100 per IP address
- Applies to all `/api/*` endpoints

---

## CORS

Default allowed origin: `http://localhost:8080` (development)

Production: Configure via `.env` file

---

## Testing with cURL

### Create a poll:
```bash
curl -X POST http://localhost:3000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "time_slots": [
      {
        "start_time": "2025-10-20T09:00:00",
        "end_time": "2025-10-20T10:00:00"
      }
    ]
  }'
```

### Get a poll:
```bash
curl http://localhost:3000/api/polls/ABC123
```

### Submit response:
```bash
curl -X POST http://localhost:3000/api/responses/polls/ABC123 \
  -H "Content-Type: application/json" \
  -d '{
    "participant_name": "Test User",
    "availability": [
      {
        "time_slot_id": 1,
        "status": "available"
      }
    ]
  }'
```

---

## Next Steps

See [README.md](../README.md) for setup instructions and development workflow.
