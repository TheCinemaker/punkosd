# KTSZE Pünkösdi Világ- és Utcazenei Fesztivál 🎸🎷🥁
**Kőszeg — 2026. május 22–25. (Pünkösd)**

Operatív fesztiválmenedzsment, fellépő-koordináció, helyszínlogisztika és pályázati elszámolási rendszer a Kőszegi Turisztikai Szövetség Egyesület (KTSZE) számára.

---

## 📌 Főbb Jellemzők & Modulok

1. **Menetrend & Színpadok (Run of Show)**:
   - 4 napos interaktív programtábla (Péntek–Hétfő).
   - Színpadok: Nagyszínpad (Fő tér), Kisszínpad (Jurisics tér akusztik), Gyerekszínpad (Várjátszótér), Utcazene pontok (Belvárosi kapualjak).
   - Péntek éjszakai **VÁRDISCO** (TISZTAFAXXA, Kunyik, Magnus, TornyosiGabi), szombati **Ocho Macho** és sztárfellépők, vasárnapi nyílt örömzenélés.
   - Hangbeállások (soundcheck), átszerelési idők és átfedések figyelése.

2. **Fellépők & Riderek**:
   - Zenekarok, DJ-k, utcazenészek adatbázisa.
   - Gázsik, fizetési és szerződésstátuszok.
   - **Technikai Rider** (csatornakiosztás, mikrofonozás, monitorutak, áram).
   - **Hospitality Rider** (étkezési igények: vegán, gluténmentes, italok, törölközők, öltöző).

3. **Beszerzés & Anyagigény („A színpadtól az utolsó szemeteszsákig”)**:
   - Teljes logisztikai és eszközbeszerzési lista.
   - Rögzíti: **ki írta be**, **kinek a dolga beszerezni/egyeztetni**, becsült és tényleges ár, forrás, prioritás, számlaigazolás.

4. **Árusok & Közművek**:
   - **Borok Tere (Fő tér)** és **Ételek Utcája (Jurisics tér)**.
   - Áramigények összegzése (1x16A, 3x32A ipari betáp), vízvételi és szennyvízpontok.
   - Kiosztott szemeteskukák és 120L zsákok nyilvántartása, kauciók és standdíjak.

5. **Szolgáltatók & Szerződések**:
   - Színpadtechnika, aggregátorbérlés, mobil WC-k (ToiToi), orvosi/mentő ügyelet, biztonsági őrzés, hulladékszállítás, nyomda.

6. **Helyszínrajz & Térkép**:
   - Belvárosi helyszínek, színpadok, áramelosztók, elsősegélypontok, backstage zónák áttekintése.

7. **To-Do & Ki csinálta (Operatív Audit)**:
   - Felelősökhöz rendelt teendők azonnali pipálással.
   - Megbízható audit nyomvonal: ki és pontosan mikor végezte el a feladatot.

8. **Tracklist & Artisjus Generátor**:
   - Elhangzó dalok, zeneszerzők, szövegírók és időtartamok nyilvántartása a hivatalos jogdíj-elszámoláshoz.

9. **Pályázati Költségvetés & 1-kattintásos Excel (.xlsx) Export**:
   - Tételes költségvetés a pályázati formátumhoz igazítva (pályázati támogatás vs. KTSZE önrész).
   - Azonnali Excel fájl letöltés a pályázatíróknak.

10. **Aktivitási Napló**:
    - Valós idejű audit trail: minden hozzáadás, szerkesztés, törlés és állapotváltozás naplózva felhasználóval és időbélyeggel.

---

## 🔐 Belépés

A felület operatív, gyors terepi munkára van optimalizálva:
- Belépési PIN kód: **`1532`** (Kőszeg dicsőséges ostromának éve).
- Belépéskor választható a munkatárs (Szilveszter, Gábor, Zoltán, Műszaki Stáb, Önkéntes), így a rendszer minden módosítást azonnal a megfelelő személyhez rendel.

---

## 🛠️ Technológiai Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS, Lucide Icons, SheetJS (`xlsx`).
- **Adatbázis / Backend**: Supabase PostgreSQL (`supabase/schema.sql` séma, `fest_` előtagú táblákkal a szeparáció érdekében).
- **Helyi / Offline mód**: Teljes értékű LocalStorage perzisztencia offline munkához és azonnali teszteléshez.
- **Deploy**: Netlify / Cloudflare Pages kompatibilis.

---

## 🚀 Futtatás Helyben

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása
npm run dev

# Éles build készítése
npm run build
```
