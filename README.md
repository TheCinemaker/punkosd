# KTSZE Punkosdi Vilag- es Utcazenei Fesztival 2026
**Koszeg -- 2026. majus 22-25. (Punkosd)**

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

A felulet operativ, gyors terepi munkara van optimalizalva:
- Belepesi PIN kod: **`1532`** (Koszeg dicsoseges ostromanak eve).
- Belepeskor valaszthato a munkatars (Szilveszter, Gabor, Zoltan, Muszaki Stab, Onkentes), igy a rendszer minden modositast azonnal a megfelelo szemelyhez rendel.

---

## Technologiai Stack

- **Frontend**: React 19, Vite 6, Lucide Icons (100% SVG), SheetJS (`xlsx`).
- **Adatbazis / Backend**: Supabase PostgreSQL (`supabase/schema.sql` sema, `fest_` elotagu tablak a KTSZE tobbi tablatol valo teljes szeparalasert).
- **Helyi / Offline mod**: Teljes erteku LocalStorage perzisztencia offline terepmunkahoz es azonnali teszteleshez.
- **Deploy**: Netlify / Cloudflare Pages kompatibilis.
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
