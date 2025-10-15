# Pollify

**En modern schemaläggningsplattform för att hitta bästa tiden för gruppmöten**

Inspirerad av [Timeful](https://timeful.app), byggd för att köra på HostUp.se webbhotell.

## Vad är Pollify?

Pollify hjälper dig att:
- Skapa tillgänglighetsomröstningar (availability polls)
- Hitta när flest personer kan delta
- Se visuellt när alla är tillgängliga
- Dela enkelt via kod (ex: `TEAM42`)

Perfekt för:
- Teammöten
- Studiegrupper
- Event-planering
- Familjesamlingar

## Teknisk Stack

- **Frontend**: Vue 2 + Vuetify + TailwindCSS
- **Backend**: Node.js + Express.js
- **Databas**: MariaDB (MySQL)
- **Hosting**: HostUp.se Start-paket (19 kr/mån)

## Funktioner

### Fas 1 (MVP - Minimal Viable Product):
- ✅ Skapa polls med titel och tidsluckor
- ✅ Dela poll via unik kod
- ✅ Deltagare anger tillgänglighet (tillgänglig/om det behövs/ej tillgänglig)
- ✅ Visuell grid-vy för att se överlapp
- ✅ Sammanställning: flest tillgängliga per tidslucka

### Fas 2 (Planerad):
- 📋 Användarregistrering och inloggning
- 📋 Redigera/ta bort egna polls
- 📋 Email-notiser till deltagare
- 📋 Export av resultat (CSV)
- 📋 Kopiera/duplicera polls

### Fas 3 (Framtida):
- 📋 Kalenderintegration (Google Calendar, Outlook)
- 📋 Tidszon-stöd
- 📋 Mobilapp (PWA)
- 📋 Recurring meetings

## Kom igång

### Steg 1: Setup på HostUp.se

Följ dessa guider i ordning:

1. **[SSH Setup](docs/SSH-SETUP.md)** - Aktivera och anslut via SSH
2. **[Node.js Setup](docs/NODEJS-SETUP.md)** - Installera och konfigurera Node.js
3. **[Database Setup](docs/DATABASE-SETUP.md)** - Skapa databas och tabeller

### Steg 2: Installation lokalt

```bash
# Klona projektet
git clone <repo-url> pollify
cd pollify

# Installera backend dependencies
cd backend
npm install
cp .env.example .env
# Redigera .env med dina databasuppgifter

# Installera frontend dependencies
cd ../frontend
npm install

# Starta utvecklingsservrar
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run serve
```

### Steg 3: Öppna i webbläsaren

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

## Projektstruktur

```
pollify/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── server.js    # Huvudserver
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Databasmodeller
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── utils/       # Hjälpfunktioner
│   ├── config/          # Konfiguration
│   └── package.json
├── frontend/            # Vue 2 applikation
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── components/  # Vue-komponenter
│   │   ├── views/       # Sidor
│   │   ├── router/      # Vue Router
│   │   └── store/       # Vuex (state management)
│   └── package.json
├── database/            # Databasfiler
│   ├── schema.sql      # Fullständigt schema
│   └── migrations/     # Framtida migrations
└── docs/               # Dokumentation
    ├── SSH-SETUP.md
    ├── NODEJS-SETUP.md
    ├── DATABASE-SETUP.md
    └── DATABASE-SCHEMA.md
```

## API Endpoints (Planerad)

### Polls
```
GET    /api/polls/:code          # Hämta poll
POST   /api/polls                # Skapa poll
PUT    /api/polls/:id            # Uppdatera poll
DELETE /api/polls/:id            # Ta bort poll
```

### Responses
```
POST   /api/polls/:code/respond  # Skicka svar
PUT    /api/responses/:code      # Uppdatera svar
GET    /api/polls/:code/results  # Hämta resultat
```

### Users (Fas 2)
```
POST   /api/auth/register        # Registrera
POST   /api/auth/login           # Logga in
GET    /api/users/me             # Hämta profil
GET    /api/users/me/polls       # Mina polls
```

## Utveckling

### Backend utveckling
```bash
cd backend
npm run dev        # Startar med nodemon (auto-reload)
npm test           # Kör tester
npm run lint       # Kör linting
```

### Frontend utveckling
```bash
cd frontend
npm run serve      # Dev server med hot-reload
npm run build      # Bygg för produktion
npm run lint       # Kör linting
```

## Deploy till HostUp.se

### Via SSH:
```bash
# På din lokala dator
cd backend
npm run build  # Om du har build-steg

# Kopiera till server via SCP/FTP
scp -r backend/* användarnamn@retea.se:~/pollify-app/

# På servern via SSH
ssh användarnamn@retea.se
cd ~/pollify-app
npm install --production
pm2 restart pollify
```

### Via Git (rekommenderat):
```bash
# På servern
ssh användarnamn@retea.se
cd ~/pollify-app
git pull origin main
npm install --production
pm2 restart pollify
```

## Databas

Se fullständig dokumentation:
- [Database Schema](docs/DATABASE-SCHEMA.md)
- [Setup Guide](docs/DATABASE-SETUP.md)
- [SQL Schema](database/schema.sql)

## Säkerhet

- ✅ Lösenord hashas med bcrypt
- ✅ JWT för autentisering (Fas 2)
- ✅ Prepared statements (SQL injection-skydd)
- ✅ Input validation
- ✅ CORS konfiguration
- ✅ Rate limiting (planerad)
- ✅ `.env` för känslig data

## Bidra

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/MinFunktion`)
3. Committa dina ändringar (`git commit -m 'Lägg till MinFunktion'`)
4. Pusha till branchen (`git push origin feature/MinFunktion`)
5. Öppna en Pull Request

## Licens

MIT License - se [LICENSE](LICENSE) för detaljer

## Support

- Dokumentation: `/docs`
- Issues: GitHub Issues
- Email: support@pollify.local (ej aktiv än)

## Tack till

- [Timeful](https://timeful.app) - Inspiration
- [HostUp.se](https://hostup.se) - Hosting
- Vue.js, Node.js, och alla open-source contributors

## Roadmap

### Q4 2025
- [x] Projektstruktur och dokumentation
- [ ] Backend API (grundläggande)
- [ ] Frontend (MVP)
- [ ] Deploy till produktion

### Q1 2026
- [ ] Användarautentisering
- [ ] Email-notiser
- [ ] Mobile-responsiv design

### Q2 2026
- [ ] Kalenderintegration
- [ ] PWA-support
- [ ] Recurring meetings

---

**Byggd med ❤️ för HostUp.se Start-paket (19 kr/mån)**
