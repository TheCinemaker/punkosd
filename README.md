# KTSZE Punkosdi Vilag- es Utcazenei Fesztival 2027
**Koszeg -- 2027. majus 14-17. (Punkosd)**

Operativ fesztivalmenedzsment, fellepo-koordinacio, helyszinlogisztika es palyazati elszamolasi rendszer a Koszegi Turisztikai Szovetseg Egyesulet (KTSZE) szamara.

---

## Modulok

- **Elo:** Most (kezdolap: szinpadok elo allapota, SOS, sajat feladatok/muszak, figyelmeztetesek), Feladatok, Kozlemenyek, Telefonkonyv & veszhelyzet
- **Program:** Menetrend & helyszinek (idovonal, utkozesfigyeles, csuszas-gombok, A4 nyomtatas), Fellepok & riderek, Szallas / transzfer / catering
- **Helyszin & produkcio:** Epites-bontas idovonal, Helyszinrajz (Leaflet), Arusok, Szolgaltatok, Engedelyek, Beszerzes, Keszlet
- **Penzugy:** Penzugyi attekintes (kiadas, bevetel, egyenleg, Excel elszamolas), Palyazati koltsegvetes (terv vs. teny), Szponzorok
- **Csapat:** Stab (PIN), Muszakbeosztas, Akkreditacio & vendeglista
- **Rendszer:** Beszamolo & tanulsagok, Aktivitasi naplo, Lomtar (30 nap) & teljes mentes (Excel / JSON)

---

## Belepes

- Mindenki a sajat profiljat valasztja, es a **sajat PIN kodjaval** lep be (a Stab menuben allithato, csak o es az Elnokseg latja).
- Az alapertelmezett `1532` PIN-t minden profilnal le kell cserelni — a kezdolap figyelmeztet, amig ez nem tortenik meg.
- Opcionalis vesz-mesterkod: `VITE_MASTER_PIN` kornyezeti valtozo (Netlify).
- 5 hibas probalkozas utan 30 mp varakozas.

---

## Technologiai Stack

- **Frontend**: React 19, Vite 6, Lucide Icons, SheetJS (`xlsx`). Telepitheto PWA (offline is betolt).
- **Adatbazis**: Supabase. Az app a `fest_records` tablat hasznalja (soronkenti mentes, Realtime elo szinkron, offline kimeno sor). A fajlok (riderek, szerzodesek, szamlak) a `fest-docs` Storage bucketbe kerulnek. Lasd `supabase/schema.sql` (az egesz fajl lefuttathato).
- **Supabase nelkul**: helyi mod (csak az adott eszkozon, bongeszofulek kozott szinkronizal).
- **Kornyezeti valtozok**: lasd `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MASTER_PIN`).
- **Fesztival datumai**: `src/lib/config.js` — uj evnel csak ezt kell atirni.
- **Deploy**: Netlify.
- **Git Repository**: `https://github.com/TheCinemaker/punkosd`

---

## Futtatas Helyben

```bash
# Fuggosegek telepitese
npm install

# Fejlesztoi szerver inditasa
npm run dev

# Eles build keszitese
npm run build
```
