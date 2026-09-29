# KTSZE Punkosdi Vilag- es Utcazenei Fesztival 2027
**Koszeg -- 2027. majus 14-17. (Punkosd)**

Operativ fesztivalmenedzsment, fellepo-koordinacio, helyszinlogisztika es palyazati elszamolasi rendszer a Koszegi Turisztikai Szovetseg Egyesulet (KTSZE) szamara.

---

## Fobb Jellemzok & Modulok

1. **Menetrend & Szinpadok (Run of Show)**:
   - 4 napos interaktiv programtabla (Pentek-Hetfo).
   - Szinpadok: Nagyszinpad (Fo ter), Kisszinpad (Jurisics ter akusztik), Gyerekszinpad (Varjatszoter), Utcazene pontok (Belvarosi kapualjak).
   - Pentek ejszakai **VARDISCO** (TISZTAFAXXA, Kunyik, Magnus, TornyosiGabi), szombati **Ocho Macho** es sztarfellepok, vasarnapi nyilt oromzeneles.
   - Hangbeallasok (soundcheck), atszerelesi idok es atfedések figyelese.

2. **Fellepok & Riderek**:
   - Zenekarok, DJ-k, utcazeneszek adatbazisa.
   - Gazsik, fizetesi es szerzodesstatuszok.
   - **Technikai Rider** (csatornakiosztas, mikrofonozas, monitorutak, aram).
   - **Hospitality Rider** (etkezesi igenyek: vegan, glutenmentes, italok, torolkozok, oltozo).

3. **Mester Beszerzes & Anyagigeny (A szinpadtol a szemeteszsakig)**:
   - Teljes logisztikai es eszkozbeszerzesi lista.
   - Rogziti: **ki irta be**, **kinek a dolga beszerezni/egyeztetni**, becsult es tenyleges ar, forras, prioritas, szamlaigazolas.

4. **Arusok & Kozmuvek**:
   - **Borok Tere (Fo ter)** es **Etelek Utcaja (Jurisics ter)**.
   - Aramigenyek osszegzese (1x16A, 3x32A ipari betap), vizveteli es szennyvizpontok.
   - Kiosztott szemeteskukak es 120L zsakok nyilvantartasa, kauciok es standdijak.

5. **Szolgaltatok & Szerzodesek**:
   - Szinpadtechnika, aggregatorberles, mobil WC-k (ToiToi), orvosi/mento ugyelet, biztonsagi orzes, hulladekszallitas, nyomda.

6. **Helyszinrajz & Terkep**:
   - Belvarosi helyszinek, szinpadok, aramelosztok, elsosegelypontok, backstage zonak attekintese.

7. **To-Do & Ki csinalta (Operativ Audit)**:
   - Felelosokhoz rendelt teendok azonnali pipalassal.
   - Megbizhato audit nyomvonal: ki es pontosan mikor vegezte el a feladatot.

8. **Tracklist & Artisjus Generator**:
   - Elhangzo dalok, zeneszerzok, szovegirok es idotartamok nyilvantartasa a hivatalos jogdij-elszamolashoz.

9. **Palyazati Koltsegvetes & 1-kattintasos Excel (.xlsx) Export**:
   - Teteles koltsegvetes a palyazati formatumhoz igazitva (palyazati tamogatas vs. KTSZE onresz).
   - Azonnali tobb-munkalapos Excel munkafuzelet letoltes a palyazati elszamolashoz.

10. **Aktivitasi Naplo**:
    - Valos ideju audit trail: minden hozzaadas, szerkesztes, torles es allapotvaltozas naplozva felhasznaloval es idobelyeggel.

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
