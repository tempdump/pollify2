# Database Schema Documentation

## Översikt

Pollify använder en relationsdatabas (MariaDB/MySQL) med 5 huvudtabeller:

```
users (användare)
  └─→ polls (omröstningar/events)
        ├─→ time_slots (tidsluckor)
        └─→ responses (deltagarsvar)
              └─→ availability (tillgänglighet per tidslucka)
```

## Tabeller

### 1. `users` - Användare

Lagrar registrerade användare som kan skapa polls.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unikt användar-ID |
| `username` | VARCHAR(50) UNIQUE | Användarnamn |
| `email` | VARCHAR(100) UNIQUE | E-postadress |
| `password_hash` | VARCHAR(255) | Hashad lösenord (bcrypt) |
| `display_name` | VARCHAR(100) | Visningsnamn |
| `created_at` | TIMESTAMP | När kontot skapades |
| `updated_at` | TIMESTAMP | Senast uppdaterad |

**Index:**
- PRIMARY KEY (`id`)
- UNIQUE (`username`, `email`)
- INDEX (`email`)

---

### 2. `polls` - Omröstningar/Events

Lagrar polls som användare skapar.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unikt poll-ID |
| `creator_id` | INT (FK → users.id) | Vem som skapade pollen |
| `title` | VARCHAR(255) | Pollens titel |
| `description` | TEXT | Beskrivning (frivillig) |
| `poll_code` | VARCHAR(20) UNIQUE | Delbar kod (ex: "TEAM42") |
| `timezone` | VARCHAR(50) | Tidszon (default: Europe/Stockholm) |
| `is_active` | BOOLEAN | Om pollen är aktiv |
| `show_responses` | BOOLEAN | Visa andras svar för deltagare |
| `allow_if_needed` | BOOLEAN | Tillåt "If needed"-alternativ |
| `created_at` | TIMESTAMP | När pollen skapades |
| `updated_at` | TIMESTAMP | Senast uppdaterad |

**Index:**
- PRIMARY KEY (`id`)
- UNIQUE (`poll_code`)
- FOREIGN KEY (`creator_id`) → `users(id)`
- INDEX (`poll_code`, `creator_id`, `created_at`)

---

### 3. `time_slots` - Tidsluckor

Lagrar tillgängliga tidsluckor för varje poll.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unikt tidslucka-ID |
| `poll_id` | INT (FK → polls.id) | Vilken poll detta tillhör |
| `start_time` | DATETIME | Starttid |
| `end_time` | DATETIME | Sluttid |
| `date` | DATE (GENERATED) | Datum (automatiskt från start_time) |

**Index:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`poll_id`) → `polls(id)`
- INDEX (`poll_id`, `start_time`, `date`)

**Exempel:**
```
Poll: "Teammöte"
Tidsluckor:
- 2025-10-20 09:00:00 → 10:00:00
- 2025-10-20 10:00:00 → 11:00:00
- 2025-10-21 09:00:00 → 10:00:00
```

---

### 4. `responses` - Deltagarsvar

Lagrar svar från deltagare (behöver inte ha användarkonto).

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unikt svar-ID |
| `poll_id` | INT (FK → polls.id) | Vilken poll de svarar på |
| `participant_name` | VARCHAR(100) | Deltagarens namn |
| `participant_email` | VARCHAR(100) | E-post (frivillig) |
| `response_code` | VARCHAR(20) UNIQUE | Unik kod för att redigera svar |
| `created_at` | TIMESTAMP | När svaret skapades |
| `updated_at` | TIMESTAMP | Senast uppdaterad |

**Index:**
- PRIMARY KEY (`id`)
- UNIQUE (`response_code`)
- FOREIGN KEY (`poll_id`) → `polls(id)`
- INDEX (`poll_id`, `response_code`)

---

### 5. `availability` - Tillgänglighet

Lagrar deltagarnas tillgänglighet för varje tidslucka.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| `id` | INT (PK, AUTO_INCREMENT) | Unikt tillgänglighets-ID |
| `response_id` | INT (FK → responses.id) | Vilket svar detta tillhör |
| `time_slot_id` | INT (FK → time_slots.id) | Vilken tidslucka |
| `status` | ENUM | Tillgänglighetsstatus |

**Status-värden:**
- `available` - Tillgänglig
- `if_needed` - Kan om det behövs
- `not_available` - Inte tillgänglig (default)

**Index:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`response_id`) → `responses(id)`
- FOREIGN KEY (`time_slot_id`) → `time_slots(id)`
- UNIQUE KEY (`response_id`, `time_slot_id`) - En person kan bara svara en gång per tidslucka
- INDEX (`status`)

---

## Dataflöde (exempel)

### Skapa en poll:

```sql
-- 1. Användare skapar poll
INSERT INTO polls (creator_id, title, poll_code, timezone)
VALUES (1, 'Teammöte', 'TEAM42', 'Europe/Stockholm');

-- 2. Lägg till tidsluckor
INSERT INTO time_slots (poll_id, start_time, end_time) VALUES
(1, '2025-10-20 09:00:00', '2025-10-20 10:00:00'),
(1, '2025-10-20 10:00:00', '2025-10-20 11:00:00');
```

### Deltagare svarar:

```sql
-- 1. Skapa svar
INSERT INTO responses (poll_id, participant_name, response_code)
VALUES (1, 'Anna Andersson', 'RESP001');

-- 2. Lägg till tillgänglighet
INSERT INTO availability (response_id, time_slot_id, status) VALUES
(1, 1, 'available'),
(1, 2, 'if_needed');
```

### Hämta översikt:

```sql
-- Visa alla svar för en poll
SELECT
    r.participant_name,
    ts.start_time,
    ts.end_time,
    a.status
FROM responses r
JOIN availability a ON r.id = a.response_id
JOIN time_slots ts ON a.time_slot_id = ts.id
WHERE r.poll_id = 1
ORDER BY ts.start_time, r.participant_name;
```

### Räkna tillgänglighet:

```sql
-- Hur många är tillgängliga per tidslucka?
SELECT
    ts.start_time,
    ts.end_time,
    COUNT(CASE WHEN a.status = 'available' THEN 1 END) as available,
    COUNT(CASE WHEN a.status = 'if_needed' THEN 1 END) as if_needed
FROM time_slots ts
LEFT JOIN availability a ON ts.id = a.time_slot_id
WHERE ts.poll_id = 1
GROUP BY ts.id
ORDER BY available DESC;
```

---

## Relationer och Kaskadradering

### CASCADE ON DELETE:

- Om en **user** raderas → alla deras **polls** raderas
- Om en **poll** raderas → alla **time_slots** och **responses** raderas
- Om en **response** raderas → all **availability** raderas
- Om en **time_slot** raderas → all **availability** för den tidsluckan raderas

Detta säkerställer att vi inte får "föräldralösa" data i databasen.

---

## Säkerhetsöverväganden

### Känslig data:
- `password_hash` - Aldrig returnera denna i API
- `participant_email` - Visa bara för poll-skapare

### Indexering:
Alla FK:s och ofta sökta kolumner är indexerade för prestanda.

### Character Set:
`utf8mb4_unicode_ci` stödjer alla Unicode-tecken (emojis, etc.)

---

## Migration och versionshantering

För framtida schemaändringar, skapa migrationsfiler:

```
database/migrations/
  001_initial_schema.sql
  002_add_if_needed_option.sql
  003_add_response_code.sql
```

---

## Nästa steg

Se fullständiga SQL-kommandon i [schema.sql](../database/schema.sql)
