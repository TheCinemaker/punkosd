import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_festival_workbook():
    wb = openpyxl.Workbook()
    
    # ----------------------------------------------------
    # Styles & Colors (Modern Festival Corporate Palette)
    # ----------------------------------------------------
    font_family = "Segoe UI"
    
    title_font = Font(name=font_family, size=16, bold=True, color="FFFFFF")
    subtitle_font = Font(name=font_family, size=10, italic=True, color="E2E8F0")
    header_font = Font(name=font_family, size=11, bold=True, color="FFFFFF")
    section_font = Font(name=font_family, size=12, bold=True, color="1E293B")
    bold_font = Font(name=font_family, size=10, bold=True, color="0F172A")
    regular_font = Font(name=font_family, size=10, color="334155")
    italic_font = Font(name=font_family, size=9, italic=True, color="64748B")
    kpi_num_font = Font(name=font_family, size=15, bold=True, color="1E3A8A")
    kpi_label_font = Font(name=font_family, size=9, bold=True, color="475569")
    
    # Fills
    primary_header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Dark Slate
    sub_header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")     # Medium Slate
    accent_header_fill = PatternFill(start_color="1D4ED8", end_color="1D4ED8", fill_type="solid")  # Blue Accent
    section_fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")        # Soft Slate Grey
    zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")          # Ultra light grey
    kpi_fill = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid")            # Soft Blue
    total_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")          # Warm Gold light
    
    # Status Fills & Fonts
    ok_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
    ok_font = Font(name=font_family, size=10, bold=True, color="166534")
    
    warn_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    warn_font = Font(name=font_family, size=10, bold=True, color="92400E")
    
    plan_fill = PatternFill(start_color="DBEAFE", end_color="DBEAFE", fill_type="solid")
    plan_font = Font(name=font_family, size=10, bold=True, color="1E40AF")

    # Borders
    thin_border_side = Side(style='thin', color='CBD5E1')
    medium_border_side = Side(style='medium', color='64748B')
    double_border_side = Side(style='double', color='0F172A')
    
    border_all = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    border_total = Border(top=thin_border_side, bottom=double_border_side, left=thin_border_side, right=thin_border_side)
    border_kpi = Border(left=medium_border_side, right=medium_border_side, top=medium_border_side, bottom=medium_border_side)

    # Number Formats
    CURRENCY_FORMAT = '#,##0\\ "Ft"'
    PERCENT_FORMAT = '0.0%'
    NUMBER_FORMAT = '#,##0'

    # =========================================================================
    # 1. MUNKALAP: Vezetői Összesítő & Pályázat (Dashboard)
    # =========================================================================
    ws_dash = wb.active
    ws_dash.title = "Pályázati Összesítő"
    ws_dash.views.sheetView[0].showGridLines = True
    
    # Title Block
    ws_dash.merge_cells("A1:G2")
    ws_dash["A1"] = "KŐSZEGI VILÁG- ÉS UTCAZENEI FESZTIVÁL — PÁLYÁZATI KÖLTSÉGVETÉS ÉS PROJEKTTERV"
    ws_dash["A1"].font = title_font
    ws_dash["A1"].fill = primary_header_fill
    ws_dash["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_dash.merge_cells("A3:G3")
    ws_dash["A3"] = "Pályázó szervezet: KTSZE | Helyszín: Kőszeg Történelmi Belváros (Fő tér, Jurisics tér, Várárok) | Időtartam: 3 nap"
    ws_dash["A3"].font = subtitle_font
    ws_dash["A3"].fill = sub_header_fill
    ws_dash["A3"].alignment = Alignment(horizontal="center", vertical="center")
    
    # KPI Kártyák (sor 5-7)
    kpis = [
        ("B5:C5", "B6:C7", "TELJES PROJEKT KÖLTSÉGVETÉS", "=D22", CURRENCY_FORMAT),
        ("D5:E5", "D6:E7", "IGÉNYELT TÁMOGATÁS (PÁLYÁZAT)", "=E22", CURRENCY_FORMAT),
        ("F5:G5", "F6:G7", "KTSZE SAJÁT FORRÁS / ÖNRÉSZ", "=F22", CURRENCY_FORMAT)
    ]
    for top_range, val_range, label, formula, num_fmt in kpis:
        ws_dash.merge_cells(top_range)
        ws_dash.merge_cells(val_range)
        top_cell = ws_dash[top_range.split(":")[0]]
        val_cell = ws_dash[val_range.split(":")[0]]
        
        top_cell.value = label
        top_cell.font = kpi_label_font
        top_cell.alignment = Alignment(horizontal="center", vertical="center")
        top_cell.fill = kpi_fill
        
        val_cell.value = formula
        val_cell.font = kpi_num_font
        val_cell.alignment = Alignment(horizontal="center", vertical="center")
        val_cell.fill = kpi_fill
        val_cell.number_format = num_fmt
        
        # Apply borders
        for row in ws_dash[top_range]:
            for c in row: c.border = Border(top=medium_border_side, left=medium_border_side, right=medium_border_side)
        for row in ws_dash[val_range]:
            for c in row: c.border = Border(bottom=medium_border_side, left=medium_border_side, right=medium_border_side)

    # Összesítő Költségvetési Táblázat Főcsoportok szerint (Sor 10-23)
    ws_dash.cell(row=10, column=1, value="PÁLYÁZATI KÖLTSÉGVETÉSI FŐCSOPORTOK ÖSSZESÍTŐJE").font = section_font
    
    dash_headers = ["Kód", "Költségvetési Főcsoport Megnevezése", "Hivatkozott Munkalap", "Összköltség (Bruttó)", "Pályázati Támogatás", "Saját Erő / Önrész", "Részarány"]
    for col_idx, text in enumerate(dash_headers, 1):
        cell = ws_dash.cell(row=11, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = primary_header_fill
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 3, 7] else "left", vertical="center", wrap_text=True)
        cell.border = border_all
    
    categories = [
        ("I.", "Fellépői tiszteletdíjak és gázsik (Nagyszínpad + Utcazene)", "'Nagyszínpad Lineup'", "='Nagyszínpad Lineup'!I14", "=D12*0.85", "=D12-E12"),
        ("II.", "Hang-, fény- és színpadtechnika, vizuál", "'Teljes Operatív Költségvetés'", "=SUMIF('Teljes Operatív Költségvetés'!B9:B80, \"Színpad- és Hangtechnika\", 'Teljes Operatív Költségvetés'!F9:F80)", "=D13*0.80", "=D13-E13"),
        ("III.", "Helyszíni infrastruktúra, logisztika és áramellátás", "'Teljes Operatív Költségvetés'", "=SUMIF('Teljes Operatív Költségvetés'!B9:B80, \"Infrastruktúra és Áramellátás\", 'Teljes Operatív Költségvetés'!F9:F80)", "=D14*0.80", "=D14-E14"),
        ("IV.", "Higiénia, hulladékgazdálkodás, tisztaság (utolsó zsákig)", "'Teljes Operatív Költségvetés'", "=SUMIF('Teljes Operatív Költségvetés'!B9:B80, \"Higiénia és Hulladékkezelés\", 'Teljes Operatív Költségvetés'!F9:F80)", "=D15*0.85", "=D15-E15"),
        ("V.", "Biztonság, egészségügy, engedélyek és jogdíjak (Artisjus)", "'Teljes Operatív Költségvetés'", "=SUMIF('Teljes Operatív Költségvetés'!B9:B80, \"Biztonság és Engedélyek\", 'Teljes Operatív Költségvetés'!F9:F80)", "=D16*0.75", "=D16-E16"),
        ("VI.", "Marketing, kommunikáció, arculat és nyomda", "'Teljes Operatív Költségvetés'", "=SUMIF('Teljes Operatív Költségvetés'!B9:B80, \"Marketing és Kommunikáció\", 'Teljes Operatív Költségvetés'!F9:F80)", "=D17*0.90", "=D17-E17"),
        ("VII.", "Backstage, catering, stáb- és fellépőellátás", "'Fellépők & Koordináció'", "=SUM('Fellépők & Koordináció'!J8:J15) + 350000", "=D18*0.70", "=D18-E18"),
        ("VIII.", "Projektmenedzsment, szervezés és koordináció", "'Teljes Operatív Költségvetés'", "=SUMIF('Teljes Operatív Költségvetés'!B9:B80, \"Személyzet és Koordináció\", 'Teljes Operatív Költségvetés'!F9:F80)", "=D19*0.80", "=D19-E19"),
        ("IX.", "Előre nem látható tartalékkeret (kb. 5%)", "Belső kalkuláció", "=ROUND(SUM(D12:D19)*0.05, -3)", "=D20*0.50", "=D20-E20")
    ]
    
    current_row = 12
    for item in categories:
        ws_dash.cell(row=current_row, column=1, value=item[0]).alignment = Alignment(horizontal="center")
        ws_dash.cell(row=current_row, column=2, value=item[1])
        ws_dash.cell(row=current_row, column=3, value=item[2]).font = italic_font
        
        c_tot = ws_dash.cell(row=current_row, column=4, value=item[3])
        c_tot.number_format = CURRENCY_FORMAT
        c_tot.alignment = Alignment(horizontal="right")
        
        c_tam = ws_dash.cell(row=current_row, column=5, value=item[4])
        c_tam.number_format = CURRENCY_FORMAT
        c_tam.alignment = Alignment(horizontal="right")
        
        c_onr = ws_dash.cell(row=current_row, column=6, value=item[5])
        c_onr.number_format = CURRENCY_FORMAT
        c_onr.alignment = Alignment(horizontal="right")
        
        c_pct = ws_dash.cell(row=current_row, column=7, value=f"=D{current_row}/$D$22")
        c_pct.number_format = PERCENT_FORMAT
        c_pct.alignment = Alignment(horizontal="right")
        
        for c in range(1, 8):
            cell = ws_dash.cell(row=current_row, column=c)
            cell.font = regular_font if c not in [1, 2] else bold_font
            cell.border = border_all
            if current_row % 2 == 1:
                cell.fill = zebra_fill
        current_row += 1
        
    # Összesen sor
    ws_dash.cell(row=22, column=1, value="")
    ws_dash.cell(row=22, column=2, value="MINDÖSSZESEN (PROJEKT ÖSSZKÖLTSÉG)").font = bold_font
    ws_dash.cell(row=22, column=3, value="")
    
    c_tot_sum = ws_dash.cell(row=22, column=4, value="=SUM(D12:D20)")
    c_tot_sum.number_format = CURRENCY_FORMAT
    c_tot_sum.font = bold_font
    c_tot_sum.alignment = Alignment(horizontal="right")
    
    c_tam_sum = ws_dash.cell(row=22, column=5, value="=SUM(E12:E20)")
    c_tam_sum.number_format = CURRENCY_FORMAT
    c_tam_sum.font = bold_font
    c_tam_sum.alignment = Alignment(horizontal="right")
    
    c_onr_sum = ws_dash.cell(row=22, column=6, value="=SUM(F12:F20)")
    c_onr_sum.number_format = CURRENCY_FORMAT
    c_onr_sum.font = bold_font
    c_onr_sum.alignment = Alignment(horizontal="right")
    
    c_pct_sum = ws_dash.cell(row=22, column=7, value="=SUM(G12:G20)")
    c_pct_sum.number_format = PERCENT_FORMAT
    c_pct_sum.font = bold_font
    c_pct_sum.alignment = Alignment(horizontal="right")
    
    for c in range(1, 8):
        cell = ws_dash.cell(row=22, column=c)
        cell.border = border_total
        cell.fill = total_fill

    # Megjegyzés doboz a pályázathoz
    ws_dash.cell(row=25, column=1, value="Pályázati útmutató és KTSZE feljegyzések:").font = bold_font
    notes = [
        "• A táblázat automatikusan frissül az operatív fül és a nagyszínpad fül adatainak változásakor.",
        "• A pályázati elszámoláshoz a 'Teljes Operatív Költségvetés' és a 'Fellépők & Koordináció' fülek szolgáltatják a tételes számla-összerendelést.",
        "• Az Artisjus jogdíj bejelentéshez a 'Tracklist & Artisjus' fül közvetlenül kinyomtatható / exportálható.",
        "• A támogatási intenzitás átlagosan ~80-85%-ra van beállítva a pályázati felhívás sztenderdjei szerint."
    ]
    for idx, note in enumerate(notes, 26):
        ws_dash.cell(row=idx, column=1, value=note).font = regular_font

    # =========================================================================
    # 2. MUNKALAP: Nagyszínpad Lineup & Időrend (Timeup & Program)
    # =========================================================================
    ws_lineup = wb.create_sheet(title="Nagyszínpad Lineup")
    ws_lineup.views.sheetView[0].showGridLines = True
    
    ws_lineup.merge_cells("A1:K2")
    ws_lineup["A1"] = "NAGYSZÍNPAD — LINEUP & TIMEUP (MŰSORTERV ÉS IDŐREND)"
    ws_lineup["A1"].font = title_font
    ws_lineup["A1"].fill = primary_header_fill
    ws_lineup["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_lineup.merge_cells("A3:K3")
    ws_lineup["A3"] = "Helyszín: Kőszeg Fő tér Nagyszínpad | Színpadméret: 10x8m fedett | Hang: Line Array rendszer | Fény: DMX robotlámpák"
    ws_lineup["A3"].font = subtitle_font
    ws_lineup["A3"].fill = accent_header_fill
    ws_lineup["A3"].alignment = Alignment(horizontal="center", vertical="center")
    
    lineup_headers = [
        "Nap", "Idősáv (Koncert)", "Fellépő / Zenekar Neve", "Zenei Stílus", 
        "Származás", "Létszám (fő)", "Érkezés / Load-in", "Beállás (Soundcheck)", 
        "Gázsi (Bruttó Ft)", "Stage Manager", "Státusz"
    ]
    for col_idx, text in enumerate(lineup_headers, 1):
        cell = ws_lineup.cell(row=5, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = primary_header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_all
        
    lineup_data = [
        ("1. Nap (Péntek)", "17:30 - 18:45", "Kőszegi Vonósok & Világzenei Fúzió", "Ethno-Klasszikus fúzió", "Kőszeg (Helyi)", 12, "14:30", "15:00 - 16:15", 350000, "Szilveszter", "Visszaigazolva"),
        ("1. Nap (Péntek)", "19:15 - 20:45", "Besh o droM Produkció", "Balkan / Gypsy Punk / Brass", "Budapest", 8, "16:00", "16:30 - 17:15", 1450000, "Szilveszter", "Szerződés alatt"),
        ("1. Nap (Péntek)", "21:30 - 23:30", "Bohemian Betyars", "Speed-folk Freak-punk", "Miskolc / Bp.", 7, "17:00", "Átszerelés / Line-check", 1850000, "Szilveszter", "Visszaigazolva"),
        ("2. Nap (Szombat)", "16:00 - 17:15", "Flamenco Nuevo Trio", "Flamenco & Akusztikus Világzene", "Bécs / Sopron", 3, "14:00", "14:30 - 15:30", 420000, "Szilveszter", "Visszaigazolva"),
        ("2. Nap (Szombat)", "17:45 - 19:15", "Söndörgő Együttes", "Délszláv Tambura Világzene", "Szentendre", 5, "15:30", "16:15 - 17:15", 1200000, "Szilveszter", "Tervezett"),
        ("2. Nap (Szombat)", "20:00 - 21:30", "Cimbaliband & Danics Dóra", "Balkan / Világzene / Pop", "Budapest", 6, "17:00", "Átszerelés / Line-check", 1350000, "Szilveszter", "Visszaigazolva"),
        ("2. Nap (Szombat)", "22:15 - 23:45", "Parno Graszt Nagykoncert", "Autentikus Cigány Világzene", "Pasab", 10, "18:00", "Átszerelés / Line-check", 1950000, "Szilveszter", "Egyeztetés alatt"),
        ("3. Nap (Vasárnap)", "16:30 - 17:45", "Kelta Vándor Skót Duda & Folk", "Kelta / Ír Tradicionális", "Szombathely", 5, "14:30", "15:00 - 16:00", 380000, "Szilveszter", "Visszaigazolva"),
        ("3. Nap (Vasárnap)", "18:15 - 19:45", "Romengo & Lakatos Mónika", "Oláhcigány Világzene", "Budapest", 6, "16:00", "16:45 - 17:30", 1100000, "Szilveszter", "Visszaigazolva"),
        ("3. Nap (Vasárnap)", "20:30 - 22:00", "Utcazenész All-Stars & Fesztivál Finálé", "Nemzetközi Össznépi Jam", "Nemzetközi", 18, "17:30", "Átszerelés (30p)", 600000, "Szilveszter", "Tervezett")
    ]
    
    current_row = 6
    for row in lineup_data:
        for col_idx, val in enumerate(row, 1):
            cell = ws_lineup.cell(row=current_row, column=col_idx, value=val)
            cell.border = border_all
            cell.font = regular_font
            
            if col_idx in [1, 2, 7, 8, 10]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [4, 5]:
                cell.alignment = Alignment(horizontal="left", vertical="center")
            elif col_idx == 6:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.number_format = NUMBER_FORMAT
            elif col_idx == 9:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.number_format = CURRENCY_FORMAT
                cell.font = bold_font
            elif col_idx == 11:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if val == "Visszaigazolva":
                    cell.fill = ok_fill
                    cell.font = ok_font
                elif val in ["Egyeztetés alatt", "Szerződés alatt"]:
                    cell.fill = warn_fill
                    cell.font = warn_font
                else:
                    cell.fill = plan_fill
                    cell.font = plan_font
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
                
        if current_row % 2 == 1 and row[10] == "":
            for c in range(1, 12):
                ws_lineup.cell(row=current_row, column=c).fill = zebra_fill
                
        current_row += 1
        
    # Összesen tiszteletdíj
    ws_lineup.cell(row=current_row, column=2, value="NAGYSZÍNPADI GÁZSIK ÖSSZESEN:").font = bold_font
    c_gazsi_sum = ws_lineup.cell(row=current_row, column=9, value=f"=SUM(I6:I{current_row-1})")
    c_gazsi_sum.number_format = CURRENCY_FORMAT
    c_gazsi_sum.font = bold_font
    c_gazsi_sum.alignment = Alignment(horizontal="right")
    
    for c in range(1, 12):
        cell = ws_lineup.cell(row=current_row, column=c)
        cell.border = border_total
        cell.fill = total_fill
    
    # Utcazenészek külön sáv
    current_row += 3
    ws_lineup.cell(row=current_row, column=1, value="AKUSZTIKUS UTCAZENE PONTOK FELLÉPŐI (Jurisics tér, Várkerület, Hősök kapuja)").font = section_font
    current_row += 1
    
    street_headers = ["Helyszín Pont", "Idősáv", "Előadó / Csapat Neve", "Műfaj", "Napi fellépés", "Napidíj / Honorárium", "Státusz"]
    for col_idx, text in enumerate(street_headers, 1):
        cell = ws_lineup.cell(row=current_row, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = sub_header_fill
        cell.alignment = Alignment(horizontal="center" if col_idx in [2, 5, 7] else "left", vertical="center")
        cell.border = border_all
    current_row += 1
    
    street_data = [
        ("A) Jurisics tér - Szökőkút", "15:00 - 20:00 (váltásban)", "Duo Corda (Akusztikus gitár/hegedű)", "World Acoustic", "Péntek-Szombat-Vasárnap", 150000, "Visszaigazolva"),
        ("B) Hősök Kapuja alatti árkád", "15:30 - 21:00 (váltásban)", "Balkan Brass Kvartett", "Balkán rézfúvós", "Szombat-Vasárnap", 180000, "Visszaigazolva"),
        ("C) Várárok sétány", "16:00 - 20:30 (váltásban)", "Handpan & Didgeridoo Meditatív Trió", "Meditatív ethno", "Péntek-Szombat", 120000, "Egyeztetés alatt"),
        ("D) Tábornokház udvar", "16:00 - 21:00 (váltásban)", "Kőszegi Zeneiskola Ifjúsági Népzenei Műhely", "Tradicionális népzene", "Péntek", 80000, "Visszaigazolva"),
        ("Utcazenei verseny fellépői keret", "Folyamatos", "8 kiválasztott utcazenész díjazása & támogatása", "Vegyes utcazene", "3 nap", 320000, "Pályázatban")
    ]
    for row in street_data:
        for col_idx, val in enumerate(row, 1):
            cell = ws_lineup.cell(row=current_row, column=col_idx, value=val)
            cell.border = border_all
            cell.font = regular_font
            if col_idx in [2, 5]:
                cell.alignment = Alignment(horizontal="center")
            elif col_idx == 6:
                cell.alignment = Alignment(horizontal="right")
                cell.number_format = CURRENCY_FORMAT
                cell.font = bold_font
            elif col_idx == 7:
                cell.alignment = Alignment(horizontal="center")
                cell.fill = ok_fill if val == "Visszaigazolva" else warn_fill
                cell.font = ok_font if val == "Visszaigazolva" else warn_font
            else:
                cell.alignment = Alignment(horizontal="left")
        current_row += 1
        
    # =========================================================================
    # 3. MUNKALAP: Fellépők Koordinációja, Rider & Hospitality
    # =========================================================================
    ws_coord = wb.create_sheet(title="Fellépők & Koordináció")
    ws_coord.views.sheetView[0].showGridLines = True
    
    ws_coord.merge_cells("A1:M2")
    ws_coord["A1"] = "FELLÉPŐK KOORDINÁCIÓJA, SZERZŐDÉSEK, SZÁLLÁS ÉS HOSPITALITY RIDER"
    ws_coord["A1"].font = title_font
    ws_coord["A1"].fill = primary_header_fill
    ws_coord["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_coord.merge_cells("A3:M3")
    ws_coord["A3"] = "Felelős: Szilveszter (Nagyszínpad koordinátor) | Kapcsolatfelvétel, szerződéskötés, étkezés, szállásfoglalás Kőszegen"
    ws_coord["A3"].font = subtitle_font
    ws_coord["A3"].fill = accent_header_fill
    ws_coord["A3"].alignment = Alignment(horizontal="center", vertical="center")
    
    coord_headers = [
        "Zenekar / Fellépő", "Kapcsolattartó / Menedzser", "Telefonszám", "E-mail cím",
        "Szerződés Státusz", "Számlázási Mód", "Tech Rider OK?", "Stage Plot OK?",
        "Szállás Igény (Fő / Éj)", "Catering / Étkezés Költség (Ft)", "Speciális Étrendi Igény", 
        "Backstage Ital / Víz Igény", "Behajtási / Parkoló Pass (db)"
    ]
    for col_idx, text in enumerate(coord_headers, 1):
        cell = ws_coord.cell(row=5, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = primary_header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_all
        
    coord_data = [
        ("Kőszegi Vonósok & Világzene", "Németh András", "+36 30 111 2233", "nemeth.andras@koszegzene.hu", "Aláírva", "Átutalás / Egyesület", "Igen", "Igen", "Helyi (Nem kér)", 48000, "Nincs", "1 tálca mentes ásványvíz, kávé", 2),
        ("Besh o droM Produkció", "Kovács Zoltán (Tour Mgr)", "+36 20 222 3344", "booking@beshodrom.hu", "Kiküldve", "Átutalás / Kft", "Igen", "Igen", "8 fő / 1 éj (Panzió)", 96000, "2 vegetáriánus", "2 karton mentes víz, 1 karton sör, gyümölcstál", 2),
        ("Bohemian Betyars", "Fehér Gábor", "+36 30 333 4455", "koncert@bohemianbetyars.hu", "Aláírva", "Átutalás / Kft", "Igen", "Igen", "9 fő / 1 éj (Hotel)", 115000, "1 vegán, 1 gluténmentes", "3 karton víz, tea, kávé, hidegtál", 2),
        ("Flamenco Nuevo Trio", "Carlos Mendez / Bp.", "+36 70 444 5566", "flamenco.nuevo@gmail.com", "Aláírva", "KATA számla", "Igen", "Igen", "3 fő / 1 éj (Panzió)", 36000, "Nincs", "1 karton víz, citrom, gyümölcs", 1),
        ("Söndörgő Együttes", "Eredics Áron", "+36 30 555 6677", "info@sondorgo.hu", "Folyamatban", "Átutalás / Kft", "Igen", "Egyeztetés alatt", "5 fő / 1 éj (Hotel)", 65000, "Nincs", "2 karton mentes víz, kávé", 1),
        ("Cimbaliband & Danics Dóra", "Unger Balázs", "+36 20 666 7788", "management@cimbaliband.hu", "Aláírva", "Átutalás / Egyéni váll.", "Igen", "Igen", "7 fő / 1 éj (Hotel)", 85000, "1 laktózmentes", "2 karton víz, gyümölcstál", 2),
        ("Parno Graszt Nagykoncert", "Oláh József", "+36 30 777 8899", "parnograszt@gmail.com", "Tárgyalás alatt", "Átutalás / Kft", "Egyeztetés alatt", "Bekérve", "11 fő / 1 éj (Panzió)", 140000, "Hagyományos melegétel", "3 karton mentes víz, üdítők", 3),
        ("Romengo & Lakatos Mónika", "Rostás Mihály Mazsi", "+36 30 888 9900", "romengoband@gmail.com", "Aláírva", "Átutalás / Egyesület", "Igen", "Igen", "6 fő / 1 éj (Hotel)", 75000, "Nincs", "2 karton mentes víz, méz, gyömbér tea", 1)
    ]
    
    current_row = 6
    for row in coord_data:
        for col_idx, val in enumerate(row, 1):
            cell = ws_coord.cell(row=current_row, column=col_idx, value=val)
            cell.border = border_all
            cell.font = regular_font
            
            if col_idx in [3, 4, 7, 8, 9, 13]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx == 5:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if val == "Aláírva":
                    cell.fill = ok_fill
                    cell.font = ok_font
                elif val in ["Kiküldve", "Folyamatban"]:
                    cell.fill = warn_fill
                    cell.font = warn_font
                else:
                    cell.fill = plan_fill
                    cell.font = plan_font
            elif col_idx == 10:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.number_format = CURRENCY_FORMAT
                cell.font = bold_font
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
                
        if current_row % 2 == 1:
            for c in range(1, 14):
                if c != 5: # keep status color
                    ws_coord.cell(row=current_row, column=c).fill = zebra_fill
        current_row += 1
        
    # Catering összesen
    ws_coord.cell(row=current_row, column=2, value="FELLÉPŐI CATERING ÉS BACKSTAGE ÖSSZESEN:").font = bold_font
    c_cat_sum = ws_coord.cell(row=current_row, column=10, value=f"=SUM(J6:J{current_row-1})")
    c_cat_sum.number_format = CURRENCY_FORMAT
    c_cat_sum.font = bold_font
    c_cat_sum.alignment = Alignment(horizontal="right")
    
    for c in range(1, 14):
        cell = ws_coord.cell(row=current_row, column=c)
        cell.border = border_total
        cell.fill = total_fill

    # =========================================================================
    # 4. MUNKALAP: Tracklist & Artisjus Adatszolgáltatás (Setlist & Copyright)
    # =========================================================================
    ws_artisjus = wb.create_sheet(title="Tracklist & Artisjus")
    ws_artisjus.views.sheetView[0].showGridLines = True
    
    ws_artisjus.merge_cells("A1:I2")
    ws_artisjus["A1"] = "ARTISJUS SZERZŐI JOGDÍJ ÉS MŰSORADATSZOLGÁLTATÁS (TRACKLIST)"
    ws_artisjus["A1"].font = title_font
    ws_artisjus["A1"].fill = primary_header_fill
    ws_artisjus["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_artisjus.merge_cells("A3:I3")
    ws_artisjus["A3"] = "Kötelező pályázati és jogszabályi adatszolgáltatás a fesztiválon elhangzott zeneművekről az Artisjus felé"
    ws_artisjus["A3"].font = subtitle_font
    ws_artisjus["A3"].fill = sub_header_fill
    ws_artisjus["A3"].alignment = Alignment(horizontal="center", vertical="center")
    
    art_headers = [
        "Ssz.", "Előadó / Zenekar", "Zenemű / Dal címe", "Zeneszerző(k) teljes neve", 
        "Szövegíró(k) teljes neve", "Időtartam (perc:mp)", "Műfaj / Besorolás", 
        "Mű jellege (Saját / Trad / Feldolgozás)", "Bejelentőlap kitöltve?"
    ]
    for col_idx, text in enumerate(art_headers, 1):
        cell = ws_artisjus.cell(row=5, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = primary_header_fill
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 6, 9] else "left", vertical="center", wrap_text=True)
        cell.border = border_all
        
    artisjus_sample = [
        (1, "Besh o droM", "Kecskemét", "Pettik Ádám, Barcza Gergely", "Tradicionális gyűjtés", "04:15", "Világzene", "Feldolgozás", "Igen"),
        (2, "Besh o droM", "Meggyújtom a pipám", "Pettik Ádám", "Barcza Gergely", "03:50", "Világzene", "Saját szerzemény", "Igen"),
        (3, "Bohemian Betyars", "Megjöttek a fiúk", "Szűcs Levente, Palágyi Máté", "Szűcs Levente", "03:40", "Speed-folk", "Saját szerzemény", "Igen"),
        (4, "Bohemian Betyars", "Összefúj a szél", "Szűcs Levente", "Szűcs Levente", "04:05", "Speed-folk", "Saját szerzemény", "Igen"),
        (5, "Söndörgő Együttes", "Jozo", "Eredics Áron, Eredics Benjamin", "Tradicionális balkán", "05:10", "Tambura világzene", "Feldolgozás", "Igen"),
        (6, "Cimbaliband", "Balkán Expressz", "Unger Balázs", "Unger Balázs", "04:30", "Ethno-jazz / World", "Saját szerzemény", "Igen"),
        (7, "Parno Graszt", "Készpénz", "Oláh József", "Oláh József", "03:55", "Autentikus cigány", "Saját szerzemény", "Folyamatban"),
        (8, "Romengo", "Kétháné", "Rostás Mihály, Lakatos Mónika", "Lakatos Mónika", "04:45", "Oláhcigány világzene", "Saját szerzemény", "Igen"),
        (9, "Kelta Vándor", "Braveheart Jig", "Hagyományos skót tánc", "Instrumentális", "03:20", "Kelta folk", "Tradicionális", "Igen"),
        (10, "Flamenco Nuevo", "Soleá de Kőszeg", "Carlos Mendez", "Instrumentális", "06:10", "Flamenco fúzió", "Saját szerzemény", "Igen")
    ]
    
    current_row = 6
    for row in artisjus_sample:
        for col_idx, val in enumerate(row, 1):
            cell = ws_artisjus.cell(row=current_row, column=col_idx, value=val)
            cell.border = border_all
            cell.font = regular_font
            if col_idx in [1, 6]:
                cell.alignment = Alignment(horizontal="center")
            elif col_idx == 9:
                cell.alignment = Alignment(horizontal="center")
                cell.fill = ok_fill if val == "Igen" else warn_fill
                cell.font = ok_font if val == "Igen" else warn_font
            else:
                cell.alignment = Alignment(horizontal="left")
                
        if current_row % 2 == 1:
            for c in range(1, 9):
                ws_artisjus.cell(row=current_row, column=c).fill = zebra_fill
        current_row += 1

    # =========================================================================
    # 5. MUNKALAP: Teljes Operatív Költségvetés ("Az utolsó szemeteszsákig")
    # =========================================================================
    ws_budget = wb.create_sheet(title="Teljes Operatív Költségvetés")
    ws_budget.views.sheetView[0].showGridLines = True
    
    ws_budget.merge_cells("A1:K2")
    ws_budget["A1"] = "RÉSZLETES FESZTIVÁL INFRASTRUKTÚRA ÉS KÖLTSÉGVETÉS — AZ UTOLSÓ SZEMETESZSÁKIG"
    ws_budget["A1"].font = title_font
    ws_budget["A1"].fill = primary_header_fill
    ws_budget["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_budget.merge_cells("A3:K3")
    ws_budget["A3"] = "Minden szükséges engedély, technika, higiénia, hulladék, biztonság, nyomda és backstage tétel pontos kalkulációja"
    ws_budget["A3"].font = subtitle_font
    ws_budget["A3"].fill = accent_header_fill
    ws_budget["A3"].alignment = Alignment(horizontal="center", vertical="center")
    
    b_headers = [
        "Tétel Kód", "Költség Főkategória", "Tétel Pontos Megnevezése", "Mennyiség", 
        "Egység", "Egységár (Bruttó Ft)", "Összesen (Bruttó Ft)", "Pályázatból (Ft)", 
        "KTSZE Önrész (Ft)", "Felelős / Szállító", "Státusz"
    ]
    for col_idx, text in enumerate(b_headers, 1):
        cell = ws_budget.cell(row=5, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = primary_header_fill
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 4, 5, 11] else "left", vertical="center", wrap_text=True)
        cell.border = border_all

    # Tételes adatbázis ("az utolsó szemeteszsákig")
    items_database = [
        # --- Higiénia és Hulladékkezelés ---
        ("HUG-01", "Higiénia és Hulladékkezelés", "Mobil WC bérlés (Standard ToiToi kézfertőtlenítővel) - 3 nap", 10, "db / hétvége", 38000, 380000, "Kőszegi Kommunális / Partner", "Megrendelve"),
        ("HUG-02", "Higiénia és Hulladékkezelés", "Akadálymentesített mobil WC bérlés (kerekesszékes)", 2, "db / hétvége", 55000, 110000, "Kőszegi Kommunális / Partner", "Megrendelve"),
        ("HUG-03", "Higiénia és Hulladékkezelés", "Mobil kézmosó állomások bérlése (lábpumpás, 2 férőhelyes)", 4, "állomás", 45000, 180000, "Partner cég", "Tervezett"),
        ("HUG-04", "Higiénia és Hulladékkezelés", "120 literes extra erős szemeteszsákok (szelektív & kommunális - 10 tekercs)", 40, "tekercs (25db/tek)", 3200, 128000, "Beszerzés (Metro / Bauhaus)", "Tervezett"),
        ("HUG-05", "Higiénia és Hulladékkezelés", "Fesztivál hulladékgyűjtő kukaállványok és fedelek (szelektív felirattal)", 20, "db", 6500, 130000, "Bérlés / KTSZE raktár", "Raktáron"),
        ("HUG-06", "Higiénia és Hulladékkezelés", "Mobil WC napi kétszeri szippantás, fertőtlenítés és papír-utántöltés", 3, "nap", 60000, 180000, "Szolgáltató", "Ajánlat bekérve"),
        ("HUG-07", "Higiénia és Hulladékkezelés", "Folyamatos fesztivál takarító személyzet (Fő tér, utcák, zónák) 4 fő x 3 nap", 12, "műszak (nap)", 25000, 300000, "KTSZE Diákmunka / Önkéntes stáb", "Szervezés alatt"),
        ("HUG-08", "Higiénia és Hulladékkezelés", "Konténeres hulladékszállítás és lerakási díj a fesztivál után", 2, "konténer", 95000, 190000, "Kőszegi Városüzemeltetés", "Egyeztetve"),
        ("HUG-09", "Higiénia és Hulladékkezelés", "Ipari takarítóeszközök, seprűk, lapátok, gumikesztyűk, fertőtlenítők", 1, "csomag", 65000, 65000, "Beszerzés", "Tervezett"),
        
        # --- Színpad- és Hangtechnika ---
        ("TEC-01", "Színpad- és Hangtechnika", "Fedett Nagyszínpad bérlés (10x8m, lépcsőkkel, fekete szoknyával)", 1, "színpad / 3 nap", 1450000, 1450000, "Stage Pro Hungary Kft.", "Szerződés alatt"),
        ("TEC-02", "Színpad- és Hangtechnika", "Nagyszínpadi professzionális Line Array hangrendszer + monitorozás", 1, "rendszer / 3 nap", 1600000, 1600000, "Sound & Light Bt.", "Visszaigazolva"),
        ("TEC-03", "Színpad- és Hangtechnika", "Koncert fénytechnika (DMX robotlámpák, LED bar-ok, vezérlőpult)", 1, "rendszer / 3 nap", 850000, 850000, "Sound & Light Bt.", "Visszaigazolva"),
        ("TEC-04", "Színpad- és Hangtechnika", "Hang- és fénymérnökök, színpadi technikusok stábja (3 nap)", 4, "fő / hétvége", 220000, 880000, "Műszaki stáb", "Visszaigazolva"),
        ("TEC-05", "Színpad- és Hangtechnika", "Utcazenei pontok mobil akusztikus PA szettjei (3 helyszínre)", 3, "szett", 120000, 360000, "Hangtechnika partner", "Tervezett"),
        ("TEC-06", "Színpad- és Hangtechnika", "Mikrofonpark, állványok, DI-boxok, kábelkorbácsok", 1, "teljes szett", 250000, 250000, "Stage Pro Kft.", "Visszaigazolva"),
        
        # --- Infrastruktúra és Áramellátás ---
        ("INF-01", "Infrastruktúra és Áramellátás", "Ideiglenes áramvételezési pontok kiépítése és E.ON hálózati csatlakozás", 1, "projekt", 280000, 280000, "Regisztrált villanyszerelő / E.ON", "Egyeztetés alatt"),
        ("INF-02", "Infrastruktúra és Áramellátás", "63A / 32A ipari elosztószekrények és fővezetékek telepítése", 4, "szett", 45000, 180000, "Villamossági partner", "Tervezett"),
        ("INF-03", "Infrastruktúra és Áramellátás", "Tartalék csendesített aggregátor (Diesel 60 kVA) biztonsági tartaléknak", 1, "gép / hétvége", 320000, 320000, "Aggregátor bérlő cég", "Ajánlat beérkezett"),
        ("INF-04", "Infrastruktúra és Áramellátás", "Sárga gumis kábelátvezetők (taposók) gyalogos és forgalmi utakhoz", 25, "db (1m/db)", 4500, 112500, "Bérlés", "Tervezett"),
        ("INF-05", "Infrastruktúra és Áramellátás", "Kordonok: Színpad előtti biztonsági kordonok (Mojo/taposó kordon)", 30, "méter", 6000, 180000, "Kordon bérlés", "Tervezett"),
        ("INF-06", "Infrastruktúra és Áramellátás", "Kordonok: Terelő kordonok és backstage elzárás", 80, "méter", 2200, 176000, "Kordon bérlés", "Tervezett"),
        ("INF-07", "Infrastruktúra és Áramellátás", "Backstage öltözősátor (6x4m masszív rendezvénysátor)", 2, "sátor", 95000, 190000, "Sátorbérlés", "Tervezett"),
        ("INF-08", "Infrastruktúra és Áramellátás", "Sörpad garnitúrák (asztal + 2 pad) backstage-be és infópontra", 15, "garnitúra", 4000, 60000, "KTSZE saját / Bérlés", "Raktáron"),
        
        # --- Biztonság és Engedélyek ---
        ("SEC-01", "Biztonság és Engedélyek", "Biztonsági szolgálat (Vagyonőri felügyelet 24h a színpadnál és kapuknál)", 6, "fő x 3 nap", 90000, 540000, "Securitas / Helyi őrző-védő", "Egyeztetés alatt"),
        ("SEC-02", "Biztonság és Engedélyek", "Orvosi és mentőügyelet (Kitelepült mentőautó ápolóval és orvossal)", 3, "nap (12 óra/nap)", 150000, 450000, "Országos Mentőszolgálat / Rescue", "Ajánlatkérés elküldve"),
        ("SEC-03", "Biztonság és Engedélyek", "Artisjus zenei szerzői jogdíj megváltása (pályázati elszámolható)", 1, "átalánydíj", 580000, 580000, "Artisjus Magyar Szerzői Jogvédő", "Kalkulálva"),
        ("SEC-04", "Biztonság és Engedélyek", "Rendezvénybiztonsági terv és katasztrófavédelmi engedélyezési díj", 1, "ügyintézés", 120000, 120000, "Munkavédelmi mérnök", "Folyamatban"),
        ("SEC-05", "Biztonság és Engedélyek", "Rendezvény felelősségbiztosítás (3 napos fesztivál biztosítás)", 1, "kötvény", 140000, 140000, "Generali / Allianz", "Ajánlatkérés elküldve"),
        ("SEC-06", "Biztonság és Engedélyek", "Hitelesített poroltó készülékek (6 kg ABC poroltó színpadhoz, büfékhez)", 8, "db", 7500, 60000, "Tűzoltóság / Partner", "Tervezett"),
        ("SEC-07", "Biztonság és Engedélyek", "Közterület-használati illeték és engedély Kőszeg Város Önkormányzatától", 1, "engedély", 85000, 85000, "Kőszeg Város Önkormányzata", "Kérelem benyújtva"),
        
        # --- Marketing és Kommunikáció ---
        ("MKT-01", "Marketing és Kommunikáció", "Fesztivál arculattervezés, grafikai anyagok, web & social grafika", 1, "csomag", 220000, 220000, "Helyi grafikus", "Megrendelve"),
        ("MKT-02", "Marketing és Kommunikáció", "B1 / B2 méretű plakátok nyomtatása és terjesztése (250 db)", 250, "db", 480, 120000, "Kőszegi Nyomda", "Tervezett"),
        ("MKT-03", "Marketing és Kommunikáció", "Részletes programfüzet és térkép (színes, hajtott, 3000 db)", 3000, "db", 95, 285000, "Nyomda", "Tervezett"),
        ("MKT-04", "Marketing és Kommunikáció", "Szövet fesztivál karszalagok (műanyag záróval, stáb, VIP, fellépő)", 1500, "db", 140, 210000, "Karszalag Webshop", "Tervezett"),
        ("MKT-05", "Marketing és Kommunikáció", "Molinók, kordonhálók, színpad háttérmolinó (backdrop 8x4m)", 6, "db", 38000, 228000, "Reklámstúdió", "Tervezett"),
        ("MKT-06", "Marketing és Kommunikáció", "Közösségi média célzott hirdetések (Meta: Kőszeg, Szombathely, Burgenland)", 1, "kampány", 180000, 180000, "Facebook / Instagram Ads", "Tervezett"),
        ("MKT-07", "Marketing és Kommunikáció", "Hivatalos fesztivál fotós és aftermovie videós stáb (3 nap + vágás)", 1, "csapat", 350000, 350000, "Kreatív média partner", "Egyeztetés alatt"),
        
        # --- Személyzet és Koordináció ---
        ("STF-01", "Személyzet és Koordináció", "Nagyszínpad koordinátor és műszaki rendező (Szilveszter - felügyelet)", 3, "nap", 50000, 150000, "KTSZE Megbízás", "Jóváhagyva"),
        ("STF-02", "Személyzet és Koordináció", "Fesztivál főszervező és pályázati elszámolási felelős", 1, "projekt díj", 250000, 250000, "KTSZE Menedzsment", "Jóváhagyva"),
        ("STF-03", "Személyzet és Koordináció", "Önkéntesek koordinációja, stáb pólók (50 db) és napi étkezése", 50, "fő", 6500, 325000, "KTSZE / Beszerzés", "Tervezett"),
        ("STF-04", "Személyzet és Koordináció", "Kétnyelvű konferanszié / műsorvezető (magyar és német nyelv)", 3, "nap", 60000, 180000, "Műsorvezető", "Visszaigazolva")
    ]
    
    current_row = 6
    for row in items_database:
        ws_budget.cell(row=current_row, column=1, value=row[0]).alignment = Alignment(horizontal="center")
        ws_budget.cell(row=current_row, column=2, value=row[1]).alignment = Alignment(horizontal="left")
        ws_budget.cell(row=current_row, column=3, value=row[2]).alignment = Alignment(horizontal="left")
        
        c_qty = ws_budget.cell(row=current_row, column=4, value=row[3])
        c_qty.alignment = Alignment(horizontal="center")
        c_qty.number_format = NUMBER_FORMAT
        
        ws_budget.cell(row=current_row, column=5, value=row[4]).alignment = Alignment(horizontal="center")
        
        c_upr = ws_budget.cell(row=current_row, column=6, value=row[5])
        c_upr.alignment = Alignment(horizontal="right")
        c_upr.number_format = CURRENCY_FORMAT
        
        # Formula: Quantity * Unit Price
        c_tot = ws_budget.cell(row=current_row, column=7, value=f"=D{current_row}*F{current_row}")
        c_tot.alignment = Alignment(horizontal="right")
        c_tot.number_format = CURRENCY_FORMAT
        c_tot.font = bold_font
        
        # Támogatás: ~80-85% alapesetben
        c_grant = ws_budget.cell(row=current_row, column=8, value=f"=ROUND(G{current_row}*0.82, 0)")
        c_grant.alignment = Alignment(horizontal="right")
        c_grant.number_format = CURRENCY_FORMAT
        
        # Önrész: Összesen - Támogatás
        c_own = ws_budget.cell(row=current_row, column=9, value=f"=G{current_row}-H{current_row}")
        c_own.alignment = Alignment(horizontal="right")
        c_own.number_format = CURRENCY_FORMAT
        
        ws_budget.cell(row=current_row, column=10, value=row[7]).alignment = Alignment(horizontal="left")
        
        c_st = ws_budget.cell(row=current_row, column=11, value=row[8])
        c_st.alignment = Alignment(horizontal="center")
        if row[8] in ["Visszaigazolva", "Megrendelve", "Jóváhagyva", "Raktáron", "Kérelem benyújtva"]:
            c_st.fill = ok_fill
            c_st.font = ok_font
        elif row[8] in ["Szerződés alatt", "Egyeztetés alatt", "Ajánlatkérés elküldve", "Szervezés alatt", "Folyamatban"]:
            c_st.fill = warn_fill
            c_st.font = warn_font
        else:
            c_st.fill = plan_fill
            c_st.font = plan_font
            
        for c in range(1, 12):
            cell = ws_budget.cell(row=current_row, column=c)
            cell.border = border_all
            if cell.font == regular_font:
                cell.font = regular_font
            if current_row % 2 == 1 and c != 11:
                cell.fill = zebra_fill
                
        current_row += 1

    # Operatív összesen sor
    ws_budget.cell(row=current_row, column=2, value="OPERATÍV INFRASTRUKTÚRA ÉS SZERVEZÉS ÖSSZESEN:").font = bold_font
    
    c_op_tot = ws_budget.cell(row=current_row, column=7, value=f"=SUM(G6:G{current_row-1})")
    c_op_tot.number_format = CURRENCY_FORMAT
    c_op_tot.font = bold_font
    c_op_tot.alignment = Alignment(horizontal="right")
    
    c_op_grant = ws_budget.cell(row=current_row, column=8, value=f"=SUM(H6:H{current_row-1})")
    c_op_grant.number_format = CURRENCY_FORMAT
    c_op_grant.font = bold_font
    c_op_grant.alignment = Alignment(horizontal="right")
    
    c_op_own = ws_budget.cell(row=current_row, column=9, value=f"=SUM(I6:I{current_row-1})")
    c_op_own.number_format = CURRENCY_FORMAT
    c_op_own.font = bold_font
    c_op_own.alignment = Alignment(horizontal="right")
    
    for c in range(1, 12):
        cell = ws_budget.cell(row=current_row, column=c)
        cell.border = border_total
        cell.fill = total_fill

    # =========================================================================
    # 6. MUNKALAP: ⏱️ Nagyszínpad Run of Show (Percről-percre Időrend)
    # =========================================================================
    ws_ros = wb.create_sheet(title="⏱️ Mester Időrend (Run of Show)")
    ws_ros.views.sheetView[0].showGridLines = True
    
    ws_ros.merge_cells("A1:H2")
    ws_ros["A1"] = "NAGYSZÍNPAD — OPERATÍV MESTER MENETREND (RUN OF SHOW)"
    ws_ros["A1"].font = title_font
    ws_ros["A1"].fill = primary_header_fill
    ws_ros["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_ros.merge_cells("A3:H3")
    ws_ros["A3"] = "Percről percre lebontott technikai beállások, átszerelések, bemondások és koncertek"
    ws_ros["A3"].font = subtitle_font
    ws_ros["A3"].fill = sub_header_fill
    ws_ros["A3"].alignment = Alignment(horizontal="center", vertical="center")
    
    ros_headers = ["Nap", "Kezdés", "Végzés", "Időtartam", "Tevékenység / Esemény", "Főszereplő / Zenekar", "Felelős Személy", "Megjegyzés / Műszaki teendő"]
    for col_idx, text in enumerate(ros_headers, 1):
        cell = ws_ros.cell(row=5, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = primary_header_fill
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 2, 3, 4] else "left", vertical="center")
        cell.border = border_all
        
    ros_sample = [
        ("Péntek", "10:00", "14:00", "240 perc", "Színpad és Fény/Hangrendszer átadás-átvétel", "Műszaki Stáb", "Szilveszter & Főtechnikus", "Zajszintmérés, áramkörök tesztelése"),
        ("Péntek", "14:30", "15:00", "30 perc", "Load-in & Színpadi kipakolás", "Kőszegi Vonósok", "Stage Hand stáb", "Székek, kottatartók, mikrofonozás"),
        ("Péntek", "15:00", "16:15", "75 perc", "Beállás (Soundcheck)", "Kőszegi Vonósok & Fúzió", "Hangmérnök", "Akusztikus hangszerek finomhangolása"),
        ("Péntek", "16:30", "17:15", "45 perc", "Beállás (Soundcheck)", "Besh o droM", "Hangmérnök", "Dobok, fúvós szekció, monitor arányok"),
        ("Péntek", "17:15", "17:30", "15 perc", "Kapunyitás, Háttérzene, Fesztivál Megnyitó", "KTSZE Elnök & Polgármester", "Műsorvezető", "Ünnepélyes köszöntő, sajtófotók"),
        ("Péntek", "17:30", "18:45", "75 perc", "ÉLŐ KONCERT", "Kőszegi Vonósok & Világzenei Fúzió", "Szilveszter", "Időkorlát szigorú betartása"),
        ("Péntek", "18:45", "19:15", "30 perc", "Átszerelés (Changeover) & Utcazene áthidalás", "Besh o droM felkészülés", "Stage Hand stáb", "Közben a Jurisics téren játszik a Duo Corda"),
        ("Péntek", "19:15", "20:45", "90 perc", "ÉLŐ KONCERT", "Besh o droM Produkció", "Szilveszter", "Fénytechnika látványprogram indítása"),
        ("Péntek", "20:45", "21:30", "45 perc", "Nagy átszerelés & Bohemian Betyars Line-check", "Bohemian Betyars stáb", "Műszaki stáb", "Közben a Hősök kapujánál rézfúvós show"),
        ("Péntek", "21:30", "23:15", "105 perc", "HEADLINER KONCERT", "Bohemian Betyars", "Szilveszter", "Kiemelt biztonsági felügyelet a kordonoknál"),
        ("Péntek", "23:15", "23:30", "15 perc", "Napi zárás, közönségterelés, csendrendelet", "Biztonsági Szolgálat", "Szilveszter", "Hangrendszer leállítása 23:30-kor pontosan!")
    ]
    
    current_row = 6
    for row in ros_sample:
        for col_idx, val in enumerate(row, 1):
            cell = ws_ros.cell(row=current_row, column=col_idx, value=val)
            cell.border = border_all
            cell.font = regular_font
            if col_idx in [1, 2, 3, 4]:
                cell.alignment = Alignment(horizontal="center")
            elif col_idx in [5, 6]:
                cell.alignment = Alignment(horizontal="left")
                if "KONCERT" in str(val):
                    cell.font = bold_font
            else:
                cell.alignment = Alignment(horizontal="left")
                
        if current_row % 2 == 1:
            for c in range(1, 9):
                ws_ros.cell(row=current_row, column=c).fill = zebra_fill
        current_row += 1

    # =========================================================================
    # Auto-adjust column widths across all sheets
    # =========================================================================
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            # Find max length excluding merged title cells
            for cell in col:
                # ignore row 1-3 merged cells for width calc
                if cell.row in [1, 2, 3]:
                    continue
                val_str = str(cell.value or '')
                if val_str.startswith('='):
                    val_str = "12,345,678 Ft" # estimate formula display length
                max_len = max(max_len, len(val_str))
            sheet.column_dimensions[col_letter].width = max(max_len + 4, 12)
            
    # Set custom widths for important columns
    ws_dash.column_dimensions['A'].width = 8
    ws_dash.column_dimensions['B'].width = 46
    ws_dash.column_dimensions['C'].width = 28
    ws_dash.column_dimensions['D'].width = 22
    ws_dash.column_dimensions['E'].width = 22
    ws_dash.column_dimensions['F'].width = 22
    ws_dash.column_dimensions['G'].width = 14
    
    ws_budget.column_dimensions['A'].width = 12
    ws_budget.column_dimensions['B'].width = 28
    ws_budget.column_dimensions['C'].width = 48
    ws_budget.column_dimensions['D'].width = 12
    ws_budget.column_dimensions['E'].width = 16
    ws_budget.column_dimensions['F'].width = 20
    ws_budget.column_dimensions['G'].width = 22
    ws_budget.column_dimensions['H'].width = 20
    ws_budget.column_dimensions['I'].width = 20
    ws_budget.column_dimensions['J'].width = 30
    ws_budget.column_dimensions['K'].width = 18

    # Output path
    output_dir = r"C:\Users\Szilveszter\.gemini\antigravity-ide\scratch\ktsze-vilagzene-fesztival"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "KTSZE_Vilagzenei_Fesztival_Koltségvetes_es_Nagyszinpad_Tervezo.xlsx")
    wb.save(output_file)
    print(f"Workbook successfully created at: {output_file}")
    return output_file

if __name__ == "__main__":
    build_festival_workbook()
