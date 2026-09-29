import * as XLSX from 'xlsx';

export function exportFestivalToExcel({ schedule, artists, contractors, vendors, tasks, shoppingList, inventory, tracklist, budget, logs }) {
  const wb = XLSX.utils.book_new();

  // 1. Pályázati Költségvetés
  const budgetRows = [
    ['KOSZEGI VILAG- ES UTCAZENEI FESZTIVAL 2026 — PALYAZATI KOLTSEGVETES'],
    ['Palyazo: KTSZE | Helyszin: Koszeg Belvaros | Idoszak: Punkosd (4 nap)'],
    [],
    ['Kod', 'Fokategoria', 'Tetel Pontos Megnevezese', 'Mennyiseg', 'Egyseg', 'Egysegar (Ft)', 'Osszkoltseg (Ft)', 'Tamogatas (Ft)', 'KTSZE Onresz (Ft)', 'Szallito / Partner', 'Bizonylatszam', 'Statusz']
  ];

  budget.forEach(item => {
    budgetRows.push([
      item.code,
      item.category,
      item.name,
      item.qty,
      item.unit,
      item.unitPrice,
      item.qty * item.unitPrice,
      item.grant,
      item.own,
      item.supplier,
      item.invoice,
      item.status
    ]);
  });

  const wsBudget = XLSX.utils.aoa_to_sheet(budgetRows);
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Palyazati Koltsegvetes');

  // 2. Menetrend & Lineup
  const scheduleRows = [
    ['FESZTIVAL MENETREND ES TIMEUP — MINDEN SZINPAD'],
    ['Nap', 'Szinpad', 'Idosav', 'Produkcio Cime', 'Fellepo', 'Mufaj', 'Beallas (Soundcheck)', 'Load-in', 'Stage Manager', 'Statusz', 'Megjegyzes']
  ];

  schedule.forEach(s => {
    scheduleRows.push([
      s.day,
      s.stageId === 'main_stage' ? 'Nagyszinpad (Fo ter)' :
      s.stageId === 'small_stage_1' ? 'Kisszinpad 1 (Jurisics ter)' :
      s.stageId === 'small_stage_2' ? 'Kisszinpad 2 (Varjatszoter)' : 'Belvarosi Kapualjak',
      s.time,
      s.title,
      s.artist,
      s.genre,
      s.soundcheck,
      s.loadIn,
      s.stageManager,
      s.status,
      s.notes
    ]);
  });

  const wsSchedule = XLSX.utils.aoa_to_sheet(scheduleRows);
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Menetrend (Lineup)');

  // 3. Fellépők & Riderek
  const artistRows = [
    ['FELLEPOK, SZERZODESEK, GAZSIK ES RIDEREK'],
    ['Zenekar / Fellepo', 'Kapcsolattarto', 'Telefon', 'E-mail', 'Gazsi (Ft)', 'Szamlazasi Mod', 'Szerzodes Statusz', 'Fizetesi Statusz', 'Tech Rider', 'Hospitality Rider', 'Etrend (Dieta)', 'Szallas Igeny', 'VIP Pass (db)']
  ];

  artists.forEach(a => {
    artistRows.push([
      a.name,
      a.contact,
      a.phone,
      a.email,
      a.fee,
      a.feeType,
      a.contractStatus,
      a.paymentStatus,
      a.techRider,
      a.hospitality,
      a.diet,
      a.accommodation,
      a.passes
    ]);
  });

  const wsArtists = XLSX.utils.aoa_to_sheet(artistRows);
  XLSX.utils.book_append_sheet(wb, wsArtists, 'Fellepok & Riderek');

  // 4. Szolgáltatók & Alvállalkozók
  if (contractors) {
    const contractorRows = [
      ['SZERZODOTT SZOLGALTATOK ES ALVALLALKOZOK'],
      ['Kod', 'Ceg / Partner Neve', 'Szakterulet / Kategoria', 'Megrendelt Szolgaltatas', 'Kapcsolattarto', 'Telefon', 'E-mail', 'Osszeg (Ft)', 'Szerzodes Statusz', 'Fizetes Statusz', 'Szamlaszam', 'Megjegyzes']
    ];

    contractors.forEach(c => {
      contractorRows.push([
        c.code,
        c.companyName,
        c.category,
        c.service,
        c.contactName,
        c.phone,
        c.email,
        c.feeHuf,
        c.contractStatus,
        c.paymentStatus,
        c.invoiceNumber,
        c.notes
      ]);
    });

    const wsContractors = XLSX.utils.aoa_to_sheet(contractorRows);
    XLSX.utils.book_append_sheet(wb, wsContractors, 'Szolgaltatok & Szerzodesek');
  }

  // 5. BevasarloLista
  if (shoppingList) {
    const shoppingRows = [
      ['BEVASARLOLISTA ES BESZERZESI NYILVANTARTAS'],
      ['Allapot', 'Tetel Megnevezese', 'Beszerzesi Forras (Bolt)', 'Mennyiseg', 'Egyseg', 'Becsult Ar (Ft)', 'Tenyleges Ar (Ft)', 'Felelos', 'Szamla megvan?', 'Kipipalta', 'Megvasarlas Ideje', 'Megjegyzes']
    ];

    shoppingList.forEach(sh => {
      shoppingRows.push([
        sh.isPurchased ? 'MEGVEVE' : 'MEGVASAROLANDO',
        sh.name,
        sh.store,
        sh.qty,
        sh.unit,
        sh.estimatedPrice,
        sh.actualPrice || 0,
        sh.responsible,
        sh.hasReceipt ? 'Igen' : 'Nem',
        sh.purchasedBy || '-',
        sh.purchasedAt || '-',
        sh.notes || ''
      ]);
    });

    const wsShopping = XLSX.utils.aoa_to_sheet(shoppingRows);
    XLSX.utils.book_append_sheet(wb, wsShopping, 'Bevasarlolista');
  }

  // 6. To-Do Feladatok & Ki Csinálta
  const taskRows = [
    ['FESZTIVAL TO-DO ES AUDIT — KI MIT PIPALT KI'],
    ['Allapot', 'Feladat Megnevezese', 'Kategoria', 'Prioritas', 'Felelos', 'Hatarido', 'Kipipalta', 'Kipipalas Ideje', 'Letrehozta', 'Megjegyzes']
  ];

  tasks.forEach(t => {
    taskRows.push([
      t.completed ? 'KESZ' : 'FOLYAMATBAN',
      t.title,
      t.category,
      t.priority,
      t.assignedTo,
      t.dueDate,
      t.completedBy || '-',
      t.completedAt || '-',
      t.createdBy,
      t.notes || ''
    ]);
  });

  const wsTasks = XLSX.utils.aoa_to_sheet(taskRows);
  XLSX.utils.book_append_sheet(wb, wsTasks, 'To-Do & Ki Csinalta');

  // 7. Árusok és Közművek
  const vendorRows = [
    ['VENDÉGLÁTÓK ÉS ÁRUSOK — BOROK HELYSZÍNE ÉS ÉTELEK UTCÁJA'],
    ['Stand Kod', 'Arus / Pinceszet Neve', 'Kategoria', 'Helyszin / Stand', 'Kapcsolattarto', 'Telefon', 'Aramigeny (Betap)', 'Viz igeny', 'Szemeteskuka (db)', '120L Zsak Kiadva (db)', 'Kaucio (Ft)', 'Helypenz (Ft)', 'Statusz']
  ];

  vendors.forEach(v => {
    vendorRows.push([
      v.code,
      v.name,
      v.category,
      v.location,
      v.contact,
      v.phone,
      v.power,
      v.water ? 'Igen (Viz + Szennyviz)' : 'Nem ker',
      v.trashBins,
      v.trashBagsIssued,
      v.deposit,
      v.fee,
      v.status
    ]);
  });

  const wsVendors = XLSX.utils.aoa_to_sheet(vendorRows);
  XLSX.utils.book_append_sheet(wb, wsVendors, 'Arusok & Kozmuvek');

  // 8. Készlet (Az utolsó szemeteszsák azonosítója)
  const invRows = [
    ['INFRASTRUKTURA ES KESZLET — AZ UTOLSO SZEMETESZSAK AZONOSITOJA'],
    ['Eszkoz Kod', 'Megnevezes', 'Kategoria', 'Mennyiseg', 'Mertekegyseg', 'Helyszini Zona', 'Felelos Szemely', 'Statusz']
  ];

  inventory.forEach(i => {
    invRows.push([
      i.code,
      i.name,
      i.category,
      i.qty,
      i.unit,
      i.location,
      i.responsible,
      i.status
    ]);
  });

  const wsInv = XLSX.utils.aoa_to_sheet(invRows);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Keszlet & Zsakok');

  // 9. Tracklist & Artisjus
  const trackRows = [
    ['ARTISJUS SZERZOI JOGDIJ ES MUSORADATSZOLGALTATAS'],
    ['Eloadó', 'Ssz.', 'Dal / Mu Cime', 'Zeneszerzo(k)', 'Szovegiro(k)', 'Idotartam', 'Mu Jellege', 'Artisjus Jelentve']
  ];

  tracklist.forEach(tr => {
    trackRows.push([
      tr.artist,
      tr.order,
      tr.title,
      tr.composers,
      tr.lyricists,
      tr.duration,
      tr.type,
      tr.reported ? 'Igen' : 'Folyamatban'
    ]);
  });

  const wsTrack = XLSX.utils.aoa_to_sheet(trackRows);
  XLSX.utils.book_append_sheet(wb, wsTrack, 'Tracklist & Artisjus');

  // 10. Változásnapló (Audit Trail)
  const logRows = [
    ['AKTIVITASI NAPLO — KI MIT VALTOZTATOTT'],
    ['Idopont', 'Felhasznalo', 'Muvelet', 'Modul', 'Leiras']
  ];

  logs.forEach(l => {
    logRows.push([
      l.time,
      l.user,
      l.action,
      l.module,
      l.description
    ]);
  });

  const wsLogs = XLSX.utils.aoa_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Aktivitasi Naplo');

  // Download trigger
  const fileName = `KTSZE_Vilagzenei_Fesztival_2026_Menedzser_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
