# SSH Setup Guide för HostUp.se

## Steg 1: Aktivera SSH-åtkomst i cPanel

1. Logga in på din cPanel hos HostUp.se
2. Leta efter "SSH Access" eller "SSH-åtkomst" (oftast under "Security" eller "Säkerhet")
3. Klicka på "Manage SSH Keys" eller "Hantera SSH-nycklar"

## Steg 2: Generera SSH-nyckel (om du inte redan har en)

### Windows:
Öppna PowerShell eller Command Prompt och kör:

```bash
ssh-keygen -t rsa -b 4096 -C "din-email@example.com"
```

Tryck Enter för att acceptera standardplatsen: `C:\Users\[ditt-användarnamn]\.ssh\id_rsa`

### Hitta din publika nyckel:
```bash
type %USERPROFILE%\.ssh\id_rsa.pub
```

Kopiera hela innehållet (börjar med `ssh-rsa`).

## Steg 3: Lägg till SSH-nyckeln i cPanel

1. I cPanel under "SSH Access" > "Manage SSH Keys"
2. Klicka "Import Key" eller "Importera nyckel"
3. Klistra in din publika nyckel
4. Ge den ett namn (t.ex. "pollify-dev")
5. Klicka "Import"
6. Klicka sedan "Authorize" eller "Auktorisera" på nyckeln

## Steg 4: Hitta dina SSH-inloggningsuppgifter

I cPanel, under "SSH Access", bör du se:
- **Värd/Host**: Oftast `retea.se` eller `ssh.retea.se`
- **Port**: Vanligtvis `22` (eller specificerad port)
- **Användarnamn**: Ditt cPanel-användarnamn

## Steg 5: Testa SSH-anslutningen

```bash
ssh ditt-användarnamn@retea.se
```

Om allt fungerar kommer du att loggas in på servern!

## Steg 6: Första gången på servern

När du är inloggad, kör dessa kommandon:

```bash
# Kontrollera vilken katalog du är i
pwd

# Lista filer
ls -la

# Hitta din public_html-mapp
cd public_html
ls -la
```

## Alternativ: Använd lösenord istället för SSH-nyckel

Om SSH-nyckel är krångligt kan du använda lösenord:

```bash
ssh ditt-användarnamn@retea.se
# Ange ditt cPanel-lösenord när du blir ombedd
```

**OBS**: Vissa webbhotell kräver att du aktiverar lösenordsinloggning separat i cPanel.

## Nästa steg

När SSH fungerar, gå vidare till [Node.js Setup Guide](NODEJS-SETUP.md)

## Felsökning

### Problem: "Permission denied (publickey)"
- Kontrollera att du har auktoriserat nyckeln i cPanel
- Prova med lösenordsinloggning istället

### Problem: "Connection refused"
- Kontrollera att du använder rätt port (vanligtvis 22)
- Vissa webbhotell använder en annan port, kolla i cPanel

### Problem: "Host key verification failed"
```bash
ssh-keygen -R retea.se
```
Prova sedan igen.

## Behöver du hjälp?

Kontakta HostUp support:
- Email: support@hostup.se
- Support-portal i cPanel
- Be specifikt om: "Hur aktiverar jag SSH-åtkomst på mitt Start-paket?"
