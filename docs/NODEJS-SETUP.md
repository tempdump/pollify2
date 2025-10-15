# Node.js Setup Guide för HostUp.se

## Förutsättningar
- SSH-åtkomst konfigurerad (se [SSH-SETUP.md](SSH-SETUP.md))
- Inloggad via SSH på din server

## Steg 1: Installera nvm (Node Version Manager)

```bash
# Logga in via SSH
ssh ditt-användarnamn@retea.se

# Installera nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Ladda om bash-konfiguration
source ~/.bashrc

# Verifiera installation
nvm --version
```

## Steg 2: Installera Node.js

```bash
# Installera senaste LTS-version
nvm install --lts

# Använd den installerade versionen
nvm use --lts

# Verifiera installation
node --version
npm --version
```

## Steg 3: Konfigurera Node.js App i cPanel

### Via cPanel (Enklaste sättet):

1. Logga in på cPanel
2. Hitta "Setup Node.js App" eller "Konfigurera Node.js-applikation"
3. Klicka "Create Application" / "Skapa applikation"

**Fyll i följande:**
- **Node.js version**: Välj den version du installerade (t.ex. 18.x eller 20.x)
- **Application mode**: `Production`
- **Application root**: `/home/ditt-användarnamn/pollify-app` (eller önskad sökväg)
- **Application URL**: `retea.se/pollify` eller önskad URL
- **Application startup file**: `server.js` (eller `src/server.js`)
- **Port**: En av de 10 dedikerade portarna (t.ex. 3000)

4. Klicka "Create" / "Skapa"

## Steg 4: Skapa .htaccess för att maskera porten

I mappen där du vill att Pollify ska vara tillgänglig (t.ex. `public_html/pollify`), skapa `.htaccess`:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

**Byt `3000` mot den port du valde i cPanel.**

## Steg 5: Konfigurera projektmappen

```bash
# Skapa projektmapp
mkdir -p ~/pollify-app
cd ~/pollify-app

# Initiera Node.js-projekt
npm init -y

# Installera grundläggande dependencies
npm install express mysql2 dotenv cors body-parser
npm install --save-dev nodemon
```

## Steg 6: Testa med en enkel server

Skapa `server.js`:

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Pollify API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Starta servern:
```bash
node server.js
```

## Steg 7: Testa i webbläsaren

Gå till: `http://retea.se/pollify`

Du bör se: `{"message":"Pollify API is running!"}`

## Steg 8: Konfigurera för att köra i bakgrunden

### Alternativ 1: Använd pm2 (Rekommenderat)

```bash
# Installera pm2 globalt
npm install -g pm2

# Starta din app med pm2
pm2 start server.js --name pollify

# Spara pm2-konfiguration
pm2 save

# Konfigurera pm2 att starta vid reboot
pm2 startup
```

### Alternativ 2: Använd cPanel's Node.js App Manager

I cPanel under "Setup Node.js App":
- Klicka på din app
- Klicka "Restart" för att starta/starta om
- appen körs automatiskt i bakgrunden

## Steg 9: Hantera din Node.js-app

### Via pm2:
```bash
# Visa status
pm2 status

# Starta om
pm2 restart pollify

# Stoppa
pm2 stop pollify

# Visa loggar
pm2 logs pollify
```

### Via cPanel:
- Gå till "Setup Node.js App"
- Klicka på din applikation
- Använd knapparna "Start", "Stop", "Restart"

## Miljövariabler (.env)

Skapa `.env`-fil i projektmappen:

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=ditt_db_användarnamn
DB_PASSWORD=ditt_db_lösenord
DB_NAME=pollify_db
JWT_SECRET=din_hemliga_nyckel_här
```

**VIKTIGT**: Lägg till `.env` i `.gitignore`!

## Nästa steg

När Node.js är konfigurerat, gå vidare till [Database Setup Guide](DATABASE-SETUP.md)

## Felsökning

### Problem: "Cannot find module"
```bash
npm install
```

### Problem: "Port already in use"
- Välj en annan port i cPanel-konfigurationen
- Eller stoppa den process som använder porten:
```bash
pm2 stop all
```

### Problem: App startar inte i cPanel
- Kontrollera att `Application startup file` pekar på rätt fil
- Kontrollera loggar i cPanel Node.js App Manager
- Testa starta manuellt via SSH först

### Visa vilka portar som är tillgängliga:
```bash
netstat -tuln | grep LISTEN
```

## Support

HostUp dokumentation: [Kom igång med NodeJS](https://hostup.se/support/kom-igang-med-nodejs/)
