# Database Setup Guide - MariaDB

## Steg 1: Skapa databas i cPanel

1. Logga in på din cPanel hos HostUp.se
2. Hitta "MySQL® Databases" eller "MySQL®-databaser"
3. Under "Create New Database" / "Skapa ny databas":
   - Namnge databasen: `pollify_db`
   - Klicka "Create Database"

## Steg 2: Skapa databasanvändare

1. Scrolla ner till "MySQL Users" / "MySQL-användare"
2. Under "Add New User" / "Lägg till ny användare":
   - Användarnamn: `pollify_user`
   - Lösenord: Generera ett starkt lösenord (spara det!)
   - Klicka "Create User"

## Steg 3: Ge användaren behörigheter

1. Scrolla ner till "Add User To Database"
2. Välj:
   - User: `pollify_user`
   - Database: `pollify_db`
3. Klicka "Add"
4. På nästa sida, välj **ALL PRIVILEGES** / **ALLA BEHÖRIGHETER**
5. Klicka "Make Changes"

## Steg 4: Notera databasuppgifter

Spara följande information (du behöver den senare):

```
DB_HOST: localhost
DB_NAME: [ditt_cpanel_prefix]_pollify_db
DB_USER: [ditt_cpanel_prefix]_pollify_user
DB_PASSWORD: [det lösenord du skapade]
DB_PORT: 3306
```

**OBS**: cPanel lägger ofta till ett prefix till databas- och användarnamn, t.ex. `retea_pollify_db`

## Steg 5: Skapa databastabeller via phpMyAdmin

1. I cPanel, klicka på "phpMyAdmin"
2. Välj din `pollify_db` databas i vänstermenyn
3. Klicka på "SQL"-fliken
4. Kör följande SQL (se fullständigt schema i [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)):

```sql
-- Användartabell
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Poll-tabell (events)
CREATE TABLE polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    poll_code VARCHAR(20) UNIQUE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Europe/Stockholm',
    is_active BOOLEAN DEFAULT TRUE,
    show_responses BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_poll_code (poll_code),
    INDEX idx_creator (creator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tidsluckor för varje poll
CREATE TABLE time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    INDEX idx_poll (poll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Svar/responser
CREATE TABLE responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    participant_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    INDEX idx_poll (poll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tillgänglighet per tidslucka
CREATE TABLE availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    status ENUM('available', 'if_needed', 'not_available') NOT NULL,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    INDEX idx_response (response_id),
    INDEX idx_timeslot (time_slot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Steg 6: Verifiera att tabellerna skapades

I phpMyAdmin, under din databas, bör du nu se 5 tabeller:
- `users`
- `polls`
- `time_slots`
- `responses`
- `availability`

## Steg 7: Testa anslutning från Node.js

Skapa en testfil `test-db.js`:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful!');

    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables:', rows);

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

Kör:
```bash
node test-db.js
```

## Steg 8: Konfigurera .env-fil

Lägg till i din `.env`:

```env
DB_HOST=localhost
DB_USER=ditt_prefix_pollify_user
DB_PASSWORD=ditt_lösenord
DB_NAME=ditt_prefix_pollify_db
DB_PORT=3306
```

## Backup och underhåll

### Skapa backup via cPanel:
1. Gå till "Backup" i cPanel
2. Under "Download a MySQL Database Backup"
3. Välj din pollify_db
4. Ladda ner

### Automatisk backup:
HostUp.se gör dagliga automatiska backuper på Start-paketet.

### Återställa från backup:
1. I phpMyAdmin
2. Välj databas
3. Klicka "Import"
4. Välj din backup-fil (.sql)
5. Klicka "Go"

## Felsökning

### Problem: "Access denied for user"
- Kontrollera att prefix är korrekt (t.ex. `retea_pollify_user`)
- Kontrollera att användaren har behörigheter till databasen
- Verifiera lösenordet

### Problem: "Unknown database"
- Kontrollera databas-namnet inkluderar prefix
- Se i cPanel > MySQL Databases för exakt namn

### Problem: "Too many connections"
- Detta är sällsynt på delat webbhotell
- Kontakta HostUp support om det händer
- Säkerställ att du stänger databasanslutningar i koden

## Säkerhet

✅ **Gör alltid:**
- Använd starka lösenord
- Använd `.env` för credentials
- Lägg aldrig `.env` i git
- Använd prepared statements i queries

❌ **Gör aldrig:**
- Hårdkoda lösenord i kod
- Committa credentials till git
- Använd root-användare
- Kör ouppdaterade queries från user input

## Nästa steg

När databasen är konfigurerad, gå vidare till backend-utveckling!
