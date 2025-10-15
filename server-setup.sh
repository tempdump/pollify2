#!/bin/bash
# Pollify Server Setup Script
# Kör detta på omega.hostup.se för att installera Node.js och sätta upp miljön

set -e  # Exit on error

echo "======================================"
echo "Pollify Server Setup"
echo "======================================"
echo ""

# Steg 1: Visa nuvarande miljö
echo "📍 Steg 1: Kontrollerar nuvarande miljö..."
echo "Nuvarande katalog: $(pwd)"
echo "Hemkatalog: $HOME"
echo ""

# Steg 2: Kolla om Node.js redan finns
echo "📍 Steg 2: Kollar om Node.js redan är installerat..."
if command -v node &> /dev/null; then
    echo "✅ Node.js är redan installerat: $(node --version)"
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ Node.js är inte installerat"
fi
echo ""

# Steg 3: Kolla om nvm finns
echo "📍 Steg 3: Kollar om nvm finns..."
if command -v nvm &> /dev/null; then
    echo "✅ nvm är redan installerat: $(nvm --version)"
else
    echo "❌ nvm är inte installerat"
    echo "📥 Installerar nvm..."

    # Installera nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Ladda nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    echo "✅ nvm installerat!"
fi
echo ""

# Ladda nvm om det inte är laddat
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Steg 4: Installera Node.js LTS
echo "📍 Steg 4: Installerar Node.js LTS..."
nvm install --lts
nvm use --lts

echo "✅ Node.js installerat: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Steg 5: Skapa projektmapp
echo "📍 Steg 5: Skapar projektmapp..."
mkdir -p ~/pollify-app
cd ~/pollify-app

echo "✅ Projektmapp skapad: $(pwd)"
echo ""

# Steg 6: Initiera npm projekt
echo "📍 Steg 6: Initierar npm-projekt..."
if [ ! -f "package.json" ]; then
    npm init -y
    echo "✅ package.json skapad"
else
    echo "ℹ️  package.json finns redan"
fi
echo ""

# Steg 7: Installera pm2 globalt (för att köra Node.js i bakgrunden)
echo "📍 Steg 7: Installerar pm2 globalt..."
npm install -g pm2
echo "✅ pm2 installerat: $(pm2 --version)"
echo ""

# Steg 8: Visa sammanfattning
echo "======================================"
echo "✅ Setup komplett!"
echo "======================================"
echo ""
echo "📊 Sammanfattning:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  nvm: $(nvm --version)"
echo "  pm2: $(pm2 --version)"
echo "  Projektmapp: ~/pollify-app"
echo ""
echo "🔍 Kataloginnehåll:"
ls -la ~/pollify-app
echo ""
echo "📝 Nästa steg:"
echo "  1. Ladda upp backend-kod till ~/pollify-app"
echo "  2. Kör: cd ~/pollify-app && npm install"
echo "  3. Konfigurera .env-fil"
echo "  4. Skapa databas i cPanel"
echo "  5. Starta server med: pm2 start src/server.js --name pollify"
echo ""
