"""
M&H Frame Data Parser
─────────────────────
Reads the hard-coded ECMS / SharePoint Excel data, parses measurements
from each Item Description string, cross-references with available image
files, and produces:

  frame_data.json          — full structured record per SKU
  descriptions_batch.csv   — AI prompt template pre-filled per SKU

Run:  python parse_frames.py
"""

import os, re, json, csv

# ─── Paths ────────────────────────────────────────────
BASE_DIR      = r"C:\Users\DELL\soteriaeyeclinic"
IMAGES_DIR    = os.path.join(BASE_DIR, "frame_images")
OUT_JSON      = os.path.join(BASE_DIR, "frame_data.json")
OUT_CSV       = os.path.join(BASE_DIR, "descriptions_batch.csv")

# ─── Brand Tier Lookup ────────────────────────────────
LUXURY_BRANDS = {
    "Cartier","Gucci","Tom Ford","Tiffany & Co","Miu Miu","Prada",
    "Jimmy Choo","Marc Jacobs","David Beckham","Moschino","Dsquared2",
    "Dunhill","Clary Gray","Mont Blanc","Saint Laurent",
}
PREMIUM_BRANDS = {
    "Burberry","Versace","Dolce & Gabbana","Giorgio Armani",
    "Hugo","Ray-Ban","Oakley","Levi's","Arnette",
    "Hackett Bespoke","S.T. Dupont","Dario Martini",
    "Linda Farrow","Gentle Monster",
}
ACCESSIBLE_BRANDS = {
    "Vogue","Tommy Hilfiger","Polo Ralph Lauren","Ralph Lauren",
    "Carrera","Carrera Ducati","Pierre Cardin","La Martina",
    "Ted Baker","Daniel Hechter","Sandro","Cole Haan","Swarovski",
    "Menrad","Carolina Herrera","Eyezen","GF Ferré","Joseph Marc",
    "Polaroid","Columbia","Seventh Street","Pepper Jean",
    "Hackett Bespoke",
}
VALUE_BRANDS = {
    "Macruona","Guess","Puma","M&H","Generic","Zogami","Disney",
    "Randy Jackson","JLo","Funky Buddha","Geek","Hawk","Christies",
    "Xray","Enox","Le Specs","Johnocero","Mazzani","Graphity",
    "Diff Eyewear","Pisidia","Bon Vivant","ODBO","Pilgrim",
}
TIER_TONE = {
    "Luxury":    "Refined and understated",
    "Premium":   "Bold and iconic",
    "Accessible":"Fresh and approachable",
    "Value":     "Functional and confident",
}

# ─── Frame Shape Hints (model-level overrides) ────────
SHAPE_HINTS = {
    # Cartier
    "CT03490":"Rectangular","C34C38MJ":"Oval","CT0344O":"Oval",
    "CT0563S":"Square","30104":"Rectangular","CT00630":"Rectangular",
    "CT0284O":"Oval",
    # Gucci
    "GG12190":"Rectangular","GG1497O":"Rectangular","GG1438O":"Square",
    "GG1504O":"Rectangular","GG12210":"Rectangular","GG1303O":"Rectangular",
    # Tiffany
    "TF4197":"Cat-Eye","TF6138":"Aviator",
    # Tom Ford
    "TF5040":"Rectangular",
    # Prada
    "VPR 09Z":"Rectangular","VPR 22Z":"Rectangular",
    "VPR 58Z":"Square","VPR A52":"Rectangular",
    # Miu Miu
    "VMU 06V":"Rectangular",
    # Marc Jacobs
    "MJ1091":"Wayfarer","MARC848":"Rectangular",
    # David Beckham
    "DB 7020":"Rectangular",
    # Moschino
    "MOS637":"Cat-Eye",
    # Dsquared2
    "D2 0102":"Rectangular",
    # Burberry
    "B 4406":"Rectangular","B 2387":"Rectangular",
    "B 2403":"Rectangular","B2347":"Rectangular","B 1376":"Rectangular",
    # Versace
    "MOD 4445":"Rectangular","MOD 3327":"Rectangular",
    "MOD 3338":"Rectangular","MOD 3346":"Rectangular",
    "MOD 3339":"Rectangular","MOD.4458":"Rectangular",
    # Hugo
    "HG1257":"Rectangular","HG1359":"Rectangular",
    # Ray-Ban
    "RB3025":"Aviator","RB3625":"Aviator","RB3579":"Wayfarer",
    # Oakley
    "OO9242":"Rectangular","OX8156":"Rectangular",
    # Tommy Hilfiger
    "TH2072":"Rectangular","TH1892":"Rectangular","TH2049":"Rectangular",
    "TH1962":"Rectangular","TH1990":"Rectangular","TH1891":"Rectangular",
    "TH2046":"Rectangular","TH1948":"Rectangular",
    # Carrera
    "VICTORY C":"Wayfarer","CARDUC":"Rectangular","344":"Rectangular",
    "291":"Rectangular",
    # Vogue
    "VO5404S":"Rectangular","VO 5409S":"Cat-Eye",
    "VO 4298":"Cat-Eye","VO 5421":"Cat-Eye",
    # Dario Martini
    "DM 796":"Cat-Eye","DM716":"Rectangular","DM 822":"Rectangular",
    # La Martina
    "MAV749":"Rectangular","MAV720":"Rectangular",
    # Linda Farrow
    "LFL/351":"Cat-Eye",
    # Sandro
    "SD3017":"Rectangular","SD6018":"Cat-Eye",
    # Gentle Monster
    "LOVE PUNCH":"Cat-Eye","OLLIE":"Rectangular",
    # Swarovski
    "SW 1028":"Wayfarer",
    # Polaroid (most are rectangular)
    "PLD D":"Rectangular",
    # Daniel Hechter
    "DHM":"Rectangular","DHP":"Rectangular",
    # S.T. Dupont
    "DP-3985":"Rectangular","Titanium2104":"Rectangular",
    # Hackett Bespoke
    "HEB306":"Rectangular",
    # Ted Baker
    "TB4343":"Rectangular","4328":"Rectangular","4344":"Rectangular",
    "8219":"Rectangular","2323":"Rectangular",
    # Macruona — mostly rectangular
    "D3333":"Rectangular","MB1402":"Rectangular","SH9103":"Rectangular",
    "XL110":"Rectangular","TA9067":"Rectangular","MG3850":"Rectangular",
    "TA9066":"Rectangular","8604":"Rectangular","8592":"Rectangular",
    "D3337":"Rectangular","9869":"Rectangular","MG6557A":"Rectangular",
    "HC-16068":"Rectangular","PY-526":"Rectangular","MB1403":"Rectangular",
    "TA9068":"Rectangular","8563":"Rectangular","MR01":"Rectangular",
    "FE06":"Square","MG6557":"Rectangular",
    # Guess
    "GU2879":"Rectangular","GU2878":"Rectangular",
    # Columbia
    "C8036":"Rectangular","C3016":"Rectangular","C3015":"Rectangular",
    # Seventh Street
    "7A 081":"Rectangular","7A 108":"Rectangular","7A 588":"Rectangular",
    # Others
    "LV1042":"Rectangular","LV1042":"Rectangular",
    "AN 4332":"Rectangular","PH 2212":"Rectangular",
    "PH2257U":"Rectangular","HER 0150":"Rectangular",
    "P.C.8875":"Rectangular","DU00380A":"Rectangular",
    "DAKARIAN":"Rectangular","MB0266O":"Rectangular",
    "MB01990A":"Rectangular","SL 699":"Rectangular",
    "SL 379":"Rectangular","JC 3004B":"Rectangular",
    "TF4197":"Cat-Eye","GFF 0164":"Rectangular",
    "PLD D373":"Rectangular","PLD D379":"Rectangular",
    "MOD.14111":"Rectangular","ENGLER":"Wayfarer",
    "BS1003":"Rectangular","FD8819":"Rectangular",
    "PLD 0036":"Rectangular","PLD 0035":"Rectangular",
    "DM716":"Rectangular","GU2879":"Rectangular",
    "SD6018":"Cat-Eye","PJ1301":"Rectangular",
    "CH4045":"Rectangular","DU00380A":"Rectangular",
    "PH 2257U":"Rectangular","PLD D436":"Rectangular",
    "PLD D512":"Rectangular","PU03470":"Rectangular",
    "PLD D389":"Rectangular",
}

# ─── Full Excel Frame Data ────────────────────────────
# Format: product_id → (item_description, price_ngn)
# Source: M&H FRAMES_190526.xlsx via SharePoint
EXCEL_FRAMES = {
    # ── Luxury ──────────────────────────────────────────
    1793: ("Cartier FRAME CT0344O 003 Rimless 56-19-145",   2376000),
    471:  ("Cartier FRAME C34C38MJ 60-14-140",              1900000),
    474:  ("Cartier FRAME CT03490 001 55-18-145 L TITANIUM",1550000),
    183:  ("Tiffany & Co FRAME TF4197 8001/S4 62-17-140 3N SUN", 840000),
    460:  ("Gucci FRAME GG12210 002 56-16-140 L",           800000),
    1699: ("Gucci FRAME GG1504O 006 56-18-145 L",           785000),
    1703: ("Gucci FRAME GG1438O 003 53-20-145 XL",          780000),
    320:  ("Burberry FRAME B 4406-U 3001/87 55-20-140 3N SUN BLACK", 760000),
    457:  ("Gucci FRAME GG12190 001 50-19-145 M",           750000),
    1693: ("Gucci FRAME GG1497O 006 52-20-145",             750000),
    1704: ("Gucci FRAME GG1303O 006 57-18-145 XL",          750000),
    426:  ("Tom Ford FRAME TF5040-B 001 52-20-140",         700000),
    319:  ("Prada FRAME VPR A52 01U-1O1 54-19-145",         675000),
    90:   ("Versace FRAME MOD 4445 GB1/M1 54-19-145 BLACK", 662000),
    188:  ("Versace FRAME MOD.4458 GB1/87 54-19-135 3N SUN",615000),
    202:  ("Marc Jacobs FRAME MJ1091/N/S 06JIB 59-14-140 SUN", 585000),
    1739: ("Jimmy Choo FRAME JC 3004B 5013 54-16-140",      540000),
    314:  ("Prada FRAME VPR 58Z 17I-1O1 57-19-145",         521000),
    323:  ("Dolce & Gabbana FRAME DG3376-B 502 53-18-140",  521000),
    83:   ("Prada FRAME VPR 09Z 08Q-1O1 51-17-140",         518000),
    120:  ("Prada FRAME VPR 22Z 16K-101 55-17-145 BLACK",   518000),
    1722: ("Burberry FRAME B 2387 4096 55-18-150",          510000),
    1748: ("Cartier FRAME CT0284O 56-15-145 RIMLESS",       500000),
    81:   ("Dolce & Gabbana FRAME DG 3376-B 3420 53-18-140 OPAL CRYSTAL", 482000),
    1740: ("Burberry FRAME B 2403 4119 51-17-140",          480000),
    1744: ("Moschino FRAME MOS637 807 55-17-150",           480000),
    1745: ("Dsquared2 FRAME D2 0102 3YG 58-16-145",         465000),
    1731: ("Marc Jacobs FRAME MARC848 2M2 56-17-145 BLACK", 450000),
    1742: ("David Beckham FRAME DB 7020/BOLD 807 56-19-150",450000),
    91:   ("Giorgio Armani FRAME AR7230-U 5914 55-17-145 TRANSPARENT GREY", 446000),
    93:   ("Miu Miu FRAME VMU 06V 1AB-1O1 54-17-140 BLACK", 446000),
    1724: ("Versace FRAME MOD.3339U 5406 53-16-140",        435000),
    96:   ("Versace FRAME MOD 3338 GB1 54-18-140 BLACK",    420000),
    98:   ("Versace FRAME MOD 3346 148 55-16-140 CRYSTAL",  420000),
    1510: ("Hugo FRAME HG1257 1ED 54-18-140",               411000),
    104:  ("Burberry FRAME B 1376 1340 55-17-140 DARK HAVANA", 400000),
    111:  ("Dolce & Gabbana FRAME DG5101 501 52-18-145 BLACK", 375000),
    1506: ("Hugo FRAME HG1359 807 56-15-145",               375000),
    79:   ("Burberry FRAME B2347 3943 52-19-140",           365000),
    1747: ("Cartier FRAME CT00630 55-18-135",               360000),
    74:   ("Versace FRAME MOD 3327 5381 55-18-145 BORDEAUX",352000),
    1779: ("Cartier FRAME CT0563S C2 56-18-145",            130000),
    1780: ("Cartier FRAME 30104 C9 54-15-145",              130000),
    1584: ("Tiffany & Co FRAME TF6138 001 62-13-140 2N",     40000),
    # ── Mid-Tier / Premium-Accessible ───────────────────
    470:  ("Dunhill FRAME DU00380A 003 TITANIUM 55-16-145", 900000),
    1720: ("Clary Gray FRAME DAKARIAN CNG14 24K 58-17-145", 850000),
    1692: ("Mont Blanc FRAME MB0266O 005 54-19-150",        750000),
    1696: ("Saint Laurent FRAME SL 699 006 53-21-145",      750000),
    453:  ("Mont Blanc FRAME MB01990A 006 56-17-150",        680000),
    1694: ("Saint Laurent FRAME SL 379/F SLIM 001 54-17-145",650000),
    17:   ("Oakley FRAME OO9242-0552 52-21-142 SUN MATTE BLACK", 485000),
    504:  ("Dario Martini FRAME DM 822 COL.1 55-18-135 GOLD", 400000),
    1512: ("Tommy Hilfiger FRAME TH2072 KB7 53-19-150",     390000),
    250:  ("Tommy Hilfiger FRAME TH 1892 KB7 52-19-145",    378000),
    106:  ("Ray-Ban FRAME RB 3625 003/3M 62-14-140 SUN SILVER BLACK", 376000),
    1444: ("Tommy Hilfiger FRAME TH2049 003 53-18-145",     375000),
    1446: ("Tommy Hilfiger FRAME TH1962 000 55-16-140",     375000),
    162:  ("Tommy Hilfiger FRAME TH 1990 PJP 52-18-145 BLUE", 372000),
    107:  ("Ray-Ban FRAME RB3025 9202/31 62-14-140 GOLD SUN", 335000),
    1443: ("Pierre Cardin FRAME P.C.8875 J5G 52-19-140",   330000),
    1733: ("Carrera FRAME VICTORY C 06 807 55-16-145",      315000),
    1734: ("Carrera FRAME VICTORY C 04 003 55-17-145",      315000),
    253:  ("Tommy Hilfiger FRAME TH2046 IPQ 53-18-145",     306000),
    1721: ("Carrera FRAME 344 2M2 55-17-145",               300000),
    1719: ("Polo Ralph Lauren FRAME PH 2212 5303 55-19-145",294000),
    192:  ("Ray-Ban FRAME RB3579-N 9035/1U 58-15-145 2N SUN", 285000),
    1511: ("Tommy Hilfiger FRAME TH1891 807 52-18-150",     285000),
    1738: ("Arnette FRAME AN 4332 29217J 76-09-130 2N SATURNY", 285000),
    1448: ("Levi's FRAME LV1042 J5G 53-21-145 GOLD STAINLESS STEEL", 270000),
    9:    ("Oakley FRAME OX8156-0256 56-18-137 MATTE BROWN TORTOISE", 240000),
    263:  ("Carrera FRAME 291 R80 57-19-145",               230000),
    51:   ("Vogue FRAME VO 4298-T 5191 53-18-140",          225000),
    132:  ("Seventh Street FRAME 7A 588 010 XX-XX-135 METAL SILVER", 220000),
    66:   ("Ralph Lauren FRAME PH 2257U 5407 57-16-150 SHINY TRANSPARENT GREY", 209000),
    64:   ("Vogue FRAME VO5404S 297273 54-18-145 SUN DARK BROWN", 205000),
    55:   ("Vogue FRAME VO 5409S W65613 52-18-140 SUN BLACK", 205000),
    258:  ("Carrera Ducati FRAME CARDUC 010 807 55-17-145", 190000),
    259:  ("Carrera Ducati FRAME CARDUC 010 OIT 55-17-145", 190000),
    507:  ("Dario Martini FRAME DM716 COL.2 50-19-135",     190000),
    1718: ("Vogue FRAME VO 5421 W44 53-18-140",             180000),
    212:  ("Seventh Street FRAME 7A 081 6LB 57-18-145",     170000),
    243:  ("Polaroid FRAME PLD D436 086 55-17-145",         165000),
    224:  ("Polaroid FRAME PLD D512 PJP 53-15-145",         165000),
    464:  ("Puma FRAME PU03470 002 56-18-145",              165000),
    1502: ("Polaroid FRAME PLD D389/G RHL 54-20-150",       165000),
    204:  ("Seventh Street FRAME 7A 108 086 57-18-145",     160000),
    1503: ("Polaroid FRAME PLD D373 PJP 54-17-140",         155000),
    1505: ("Polaroid FRAME PLD D379 900 53-18-145",         155000),
    448:  ("La Martina FRAME MAV749 COL.16 53-20-145",      150000),
    449:  ("La Martina FRAME MAV720 COL.12 52-17-145",      150000),
    506:  ("Dario Martini FRAME DM 796 COL.2 54-19-140 BLACK CAT-EYE SWAROVSKI", 150000),
    1466: ("S.T. Dupont FRAME DP-3985 C2 55-26-140",        150000),
    1467: ("S.T. Dupont FRAME Titanium2104 54-18-140",      150000),
    131:  ("Polaroid FRAME PLD D490/G J5G 52-18-145",       140000),
    220:  ("Polaroid FRAME PLD D508/G J5G 53-17-145",       125000),
    221:  ("Polaroid FRAME PLD D451 J5G 55-15-145",         125000),
    249:  ("Polaroid FRAME PLD D459/G 807 52-17-145",       125000),
    1471: ("Hackett Bespoke FRAME HEB306 190 56-17-145",    125000),
    414:  ("Daniel Hechter FRAME DHM378-3 1/P222 55-16-145",120000),
    1476: ("Sandro FRAME SD3017 940 56-17-140",             120000),
    1480: ("Daniel Hechter FRAME DHM193-7 53-16-135",       120000),
    1481: ("Daniel Hechter FRAME DHM340-2 1/P1121 56-16-150",120000),
    1482: ("Daniel Hechter FRAME DHM281-7 P620 52-17-140",  120000),
    1483: ("Daniel Hechter FRAME DHP614-2 P520 52-19-145",  120000),
    1485: ("Ted Baker FRAME Damon TB4343 562 55-17-140",    120000),
    1486: ("Ted Baker FRAME Morris 4328 667 53-17-140",     120000),
    1491: ("Ted Baker FRAME Dawson 4344 002 52-17-145",     120000),
    1494: ("Ted Baker FRAME Archer 8219 351 52-16-145",     120000),
    1496: ("Ted Baker FRAME Vincent 2323 104 55-17-140",    120000),
    242:  ("Polaroid FRAME PLD D448 ZX9 55-16-140 BLUE",    110000),
    172:  ("Carolina Herrera FRAME HER 0150 086 53-16-145 HAVANA", 110000),
    228:  ("Polaroid FRAME PLD D482 086 53-19-145",         105000),
    215:  ("Polaroid FRAME PLD D488 807 56-17-145",         105000),
    # Value tier: Macruona, Guess, Puma, etc.
    367:  ("Macruona FRAME D3333 C5 53-16-142",              70000),
    328:  ("Macruona FRAME MB1402-A C5 54-19-145",           70000),
    393:  ("Macruona FRAME SH9103 C4 56-17-142",             70000),
    355:  ("Macruona FRAME XL110 C3 52-17-145",              70000),
    370:  ("Macruona FRAME TA9067 C5 51-20-140",             70000),
    396:  ("Macruona FRAME MG3850 C5 55-17-142",             70000),
    327:  ("Macruona FRAME TA9066 C4 57-17-142",             70000),
    351:  ("Macruona FRAME 8604 C3 56-17-140",               70000),
    354:  ("Macruona FRAME 8592 C1 53-17-142",               70000),
    1460: ("Tommy Hilfiger FRAME TH1948 COL.03 55-15-145",   65000),
    361:  ("Macruona FRAME D3337 C1 56-18-145",              65000),
    372:  ("Macruona FRAME D3337 C2 56-18-145",              65000),
    399:  ("Macruona FRAME 9869 C1 55-17-145",               65000),
    343:  ("Macruona FRAME MG6557A C1 50-18-142",            60000),
    358:  ("Macruona FRAME TA9067 C1 51-20-140",             60000),
    360:  ("Macruona FRAME HC-16068 C1 56-16-145",           60000),
    398:  ("Macruona FRAME PY-526 C8 54-17-145 SUN",         60000),
    344:  ("Macruona FRAME MB1403 C4 49-19-140",             60000),
    357:  ("Macruona FRAME TA9067 C4 51-20-140",             60000),
    406:  ("Macruona FRAME TA9068 C2 54-19-142",             60000),
    574:  ("Guess FRAME GU2879 028 55-17-140",               55000),
    576:  ("Guess FRAME GU2878 071 55-15-140",               55000),
    350:  ("Macruona FRAME 8563 C3 54-16-140",               50000),
    337:  ("Macruona FRAME 8563 C2 54-16-140",               50000),
    338:  ("Macruona FRAME 8563 C1 54-16-140",               50000),
    551:  ("Pepper Jean FRAME PJ1301 C4 TOPSY 53-17-135",    50000),
    569:  ("Sandro FRAME SD6018 118 54-17-140 CAT3",          50000),
    573:  ("GF Ferre FRAME GFF 0164 005 54-17-140",           50000),
    1405: ("Columbia FRAME C8036 022 57-17-150",             50000),
    1400: ("Columbia FRAME C3016 201 59-17-150",             50000),
    1403: ("Columbia FRAME C3015 072 61-17-150",             50000),
    1399: ("Cole Haan FRAME CH4045 971 CRYSTAL 53-18-140",   45000),
    331:  ("Macruona FRAME MR01-02 C.03 50-21-145",          40000),
    330:  ("Macruona FRAME MR01-01 C.01H 49-21-145",         40000),
    1371: ("Swarovski FRAME SW 1028 16W 60-16-140 3N",       40000),
    1372: ("Swarovski FRAME SW 1028 18M 60-16-140 3N",       40000),
    1378: ("Menrad FRAME MOD.14111-2100 56-17-140",          40000),
    1380: ("Linda Farrow FRAME LFL/351/2 56-17-145 CAT2",    40000),
    1381: ("Linda Farrow FRAME LFL/351/4 56-17-145 CAT4",    40000),
    400:  ("Macruona FRAME FE06-12 C.01 48-22-145",          35000),
    362:  ("Macruona FRAME FE06-12 C.03 48-22-145",          35000),
    1595: ("Gentle Monster FRAME LOVE PUNCH COL.02 55-20-145",35000),
    1596: ("Gentle Monster FRAME OLLIE COL.PC3 57-19-156",   35000),
    1377: ("Joseph Marc FRAME ENGLER IG1803 HAVANA 54-17-145",30000),
    1651: ("M&H FRAME BS1003 C9 56-17-145",                  30000),
    1654: ("M&H FRAME FD8819 C2 54-21-145",                  30000),
    1729: ("Polaroid FRAME PLD 0036/R/BB 086 53-15-145",     30000),
    1730: ("Polaroid FRAME PLD 0035/R/BB PJP 54-17-145",     30000),
}


# ─── Parse Functions ──────────────────────────────────

def parse_description(raw: str) -> dict:
    """
    Extract brand, model, measurements, color, and lens_type from
    an ECMS Item Description string.

    Format: BRAND FRAME MODEL LL-BB-TTT [SIZE] [COLOR] [FLAGS]
    Examples:
      "Cartier FRAME CT03490 001 55-18-145 L TITANIUM"
      "Dario Martini FRAME DM 796 COL.2 54-19-140 BLACK CAT-EYE SWAROVSKI"
      "Cartier FRAME CT0344O 003 Rimless 56-19-145"
      "Ray-Ban FRAME RB3025 9202/31 62-14-140 GOLD SUN"
    """
    result = {
        "brand": None, "model": None, "color": None,
        "lens_width": None, "bridge_width": None, "temple_length": None,
        "lens_type": "Optical",   # Optical | Sunglasses
    }

    # Strip leading BRAND FRAME prefix
    # Multi-word brands: "Tiffany & Co", "Dolce & Gabbana", "Polo Ralph Lauren",
    # "Saint Laurent", "Tom Ford", "Ray-Ban", "Mont Blanc", "La Martina",
    # "GF Ferré", "Carrera Ducati", "David Beckham", "S.T. Dupont",
    # "Jimmy Choo", "Giorgio Armani", "Gentle Monster", "Marc Jacobs",
    # "Hackett Bespoke", "Linda Farrow", "Joseph Marc", "Clary Gray",
    # "Carolina Herrera", "Pepper Jean", "Seventh Street", "Cole Haan",
    # "Miu Miu", "Ted Baker", "Polo Ralph Lauren", "Ralph Lauren"
    MULTI_WORD = [
        "Tiffany & Co", "Dolce & Gabbana", "Polo Ralph Lauren",
        "Saint Laurent", "Tom Ford", "Ray-Ban", "Mont Blanc", "La Martina",
        "GF Ferre", "GF Ferré", "Carrera Ducati", "David Beckham",
        "S.T. Dupont", "Jimmy Choo", "Giorgio Armani", "Gentle Monster",
        "Marc Jacobs", "Hackett Bespoke", "Linda Farrow", "Joseph Marc",
        "Clary Gray", "Carolina Herrera", "Pepper Jean", "Seventh Street",
        "Cole Haan", "Miu Miu", "Ted Baker", "Ralph Lauren",
        "Tommy Hilfiger", "Dario Martini", "Clary Gray", "Polo Ralph Lauren",
        "Pierre Cardin", "Daniel Hechter", "Seventh Street",
    ]
    brand = None
    remainder = raw
    for b in sorted(MULTI_WORD, key=len, reverse=True):
        if raw.upper().startswith(b.upper()):
            brand = b
            remainder = raw[len(b):].strip()
            break
    if brand is None:
        # Single-word brand
        parts = raw.split()
        brand = parts[0]
        remainder = " ".join(parts[1:])

    result["brand"] = brand

    # Strip "FRAME" keyword
    if remainder.upper().startswith("FRAME"):
        remainder = remainder[5:].strip()

    # Find measurement pattern: digits-digits-digits (may have XX)
    meas_pattern = re.search(
        r'\b(\d{2})-(\d{2})-(\d{2,3})\b|\b(XX)-(\d{2})-(XXX|\d{2,3})\b'
        r'|\b(\d{2,3})-(XX)-(\d{2,3})\b|\b(XX)-(XX)-(XXX|\d{2,3})\b',
        remainder
    )
    if meas_pattern:
        span_start = meas_pattern.start()
        model_raw  = remainder[:span_start].strip()
        after_meas = remainder[meas_pattern.end():].strip()

        # Extract numeric measurements
        groups = [g for g in meas_pattern.groups() if g is not None]
        # groups order depends on which branch matched; take first 3
        m = re.search(r'(\d+|XX)-(\d+|XX)-(\d+|XXX)', meas_pattern.group())
        if m:
            lw = m.group(1)
            bw = m.group(2)
            tl = m.group(3)
            result["lens_width"]     = int(lw) if lw.isdigit() else None
            result["bridge_width"]   = int(bw) if bw.isdigit() else None
            result["temple_length"]  = int(tl) if tl.isdigit() else None
    else:
        model_raw  = remainder
        after_meas = ""

    # Clean model: strip trailing size tags S/M/L/XL standalone, and "Rimless"
    model_clean = re.sub(
        r'\s+(?:Rimless|RIMLESS)\s*$', '', model_raw, flags=re.IGNORECASE
    ).strip()
    # Also handle "Rimless" appearing BEFORE measurements in Item Description
    result["model"] = model_clean.strip()

    # Determine lens type
    flags = after_meas.upper()
    if any(k in flags for k in ("SUN", " 2N", " 3N", "CAT2", "CAT3", "CAT4")):
        result["lens_type"] = "Sunglasses"

    # Color: what remains after stripping size letters and type flags
    color_raw = re.sub(
        r'\b(?:SUN|2N|3N|CAT[0-9]|UV400|SATURNY)\b', '', after_meas,
        flags=re.IGNORECASE
    ).strip()
    # Remove standalone single letters (S/M/L) that are likely size codes
    color_raw = re.sub(r'\b(?:XL|[SML])\b', '', color_raw).strip()
    result["color"] = color_raw if color_raw else None

    return result


def get_brand_tier(brand: str) -> str:
    for b in LUXURY_BRANDS:
        if b.lower() in brand.lower():
            return "Luxury"
    for b in PREMIUM_BRANDS:
        if b.lower() in brand.lower():
            return "Premium"
    for b in ACCESSIBLE_BRANDS:
        if b.lower() in brand.lower():
            return "Accessible"
    return "Value"


def get_frame_shape(model: str, brand: str) -> str:
    """Best-guess frame shape from model name keywords."""
    combined = f"{brand} {model}".upper()
    if "RIMLESS" in combined:
        return "Oval"
    if "CAT-EYE" in combined or "CAT EYE" in combined:
        return "Cat-Eye"
    if "AVIATOR" in combined:
        return "Aviator"
    if "WAYFARER" in combined:
        return "Wayfarer"
    # Check shape hints dict
    for hint_key, shape in SHAPE_HINTS.items():
        if hint_key.upper() in combined:
            return shape
    return "Rectangular"   # safe default for most optical frames


def get_size_label(lens_width) -> str:
    """Map lens width to M&H size label (framework §4)."""
    if lens_width is None:
        return "Medium"
    if lens_width <= 50:   return "Narrow"
    if lens_width <= 53:   return "Small"
    if lens_width <= 56:   return "Medium"
    if lens_width <= 59:   return "Large"
    return "Extra Large"


def get_pd_range(size_label: str) -> str:
    """Default PD ranges by size (framework §5)."""
    if size_label in ("Narrow", "Small"):
        return "54 – 68mm"
    if size_label == "Medium":
        return "56 – 72mm"
    return "58 – 76mm"


def get_rx_range(material: str, rim: str) -> tuple:
    """Default RX range and progressive compatibility (framework §6)."""
    mat = material.upper()
    if "TITANIUM" in mat:
        return "SPH: -8.00 to +6.00", "Yes"
    if "RIMLESS" in rim.upper() or "SEMI" in rim.upper():
        return "SPH: -4.00 to +4.00", "No"
    if "TR-90" in mat or "TR90" in mat:
        return "SPH: -6.00 to +4.00", "No"
    # Default: acetate or metal full-rim
    return "SPH: -8.00 to +6.00", "Yes"


def guess_material(brand: str, model: str, raw: str) -> str:
    """Infer frame material from description hints."""
    combined = f"{brand} {model} {raw}".upper()
    if "TITANIUM" in combined:
        return "Titanium"
    if "TR-90" in combined or "TR90" in combined:
        return "TR-90"
    if "RIMLESS" in combined:
        return "Metal"
    # Brand-level defaults — these brands use metal as their primary material
    METAL_BRANDS = ("CARTIER","GUCCI","MONT BLANC","SAINT LAURENT","DUNHILL",
                    "CLARY GRAY","HUGO","HACKETT","ARNETTE","OAKLEY",
                    "RAY-BAN","CARRERA","SEVENTH STREET","PUMA")
    for b in METAL_BRANDS:
        if b in combined:
            return "Metal"
    return "Acetate"


# ─── Build Image Map ──────────────────────────────────
def build_image_map():
    img_map = {}
    if not os.path.isdir(IMAGES_DIR):
        return img_map
    for fname in os.listdir(IMAGES_DIR):
        m = re.search(r'(MH-\d+)', fname, re.IGNORECASE)
        if m:
            sku = m.group(1).upper()
            ext = os.path.splitext(fname)[1].lower()
            # Prefer .png over .jpg
            if sku not in img_map or ext == ".png":
                img_map[sku] = fname
    return img_map


# ─── Main ─────────────────────────────────────────────
def main():
    img_map = build_image_map()

    frames = {}

    for product_id, (raw_desc, price) in EXCEL_FRAMES.items():
        sku  = f"MH-{product_id}"
        info = parse_description(raw_desc)

        brand  = info["brand"]
        model  = info["model"]
        color  = info["color"]
        lens_w = info["lens_width"]
        brdg_w = info["bridge_width"]
        tmpl_l = info["temple_length"]
        ltype  = info["lens_type"]

        tier        = get_brand_tier(brand)
        shape       = get_frame_shape(model, brand)
        size_label  = get_size_label(lens_w)
        material    = guess_material(brand, model, raw_desc)
        rim_type    = "Rimless" if "RIMLESS" in raw_desc.upper() else "Full-rim"
        pd_range    = get_pd_range(size_label)
        rx_range, progressive = get_rx_range(material, rim_type)

        img_file   = img_map.get(sku)
        img_ready  = img_file is not None
        img_ext    = os.path.splitext(img_file)[1].lower() if img_file else None
        png_ready  = img_ext == ".png" if img_ext else False

        frames[sku] = {
            "sku":            sku,
            "product_id":     product_id,
            "brand":          brand,
            "model":          model,
            "color":          color,
            "price_ngn":      price,
            "tier":           tier,
            "tier_tone":      TIER_TONE[tier],
            "lens_type":      ltype,
            "lens_width":     lens_w,
            "bridge_width":   brdg_w,
            "temple_length":  tmpl_l,
            "lens_height":    None,      # not in ECMS data
            "total_frame_width": None,   # not in ECMS data
            "size_label":     size_label,
            "frame_shape":    shape,
            "frame_material": material,
            "rim_type":       rim_type,
            "gender":         "Unisex",  # default; update manually if known
            "pd_range":       pd_range,
            "rx_range":       rx_range,
            "progressive":    progressive,
            "image_file":     img_file,
            "image_ready":    img_ready,
            "png_ready":      png_ready,
            "raw_description": raw_desc,
        }

    # ── Save JSON ──────────────────────────────────────
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(frames, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(frames)} frames -> {OUT_JSON}")

    # ── Save CSV for AI batch generation ──────────────
    CSV_COLS = [
        "sku","brand","model","color","tier","tier_tone","lens_type",
        "frame_shape","frame_material","rim_type",
        "lens_width","bridge_width","temple_length",
        "size_label","price_ngn","gender",
        "pd_range","rx_range","progressive",
        "image_ready","png_ready","image_file",
        "ai_prompt",
    ]

    def make_prompt(f: dict) -> str:
        meas = (
            f"{f['lens_width']}mm" if f["lens_width"] else "XX"
        )
        brdg = (
            f"{f['bridge_width']}mm" if f["bridge_width"] else "XX"
        )
        tmpl = (
            f"{f['temple_length']}mm" if f["temple_length"] else "XX"
        )
        return (
            f"BRAND TIER: {f['tier']}\n"
            f"BRAND: {f['brand']}\n"
            f"MODEL: {f['model']}\n"
            f"FRAME SHAPE: {f['frame_shape']}\n"
            f"FRAME MATERIAL: {f['frame_material']}\n"
            f"COLOR: {f['color'] or 'See product image'}\n"
            f"LENS WIDTH: {meas}\n"
            f"BRIDGE: {brdg}\n"
            f"LENS HEIGHT: (measure from image)\n"
            f"TOTAL WIDTH: (calculate)\n"
            f"TEMPLE: {tmpl}\n"
            f"GENDER: {f['gender']}\n"
            f"LENS TYPE: {f['lens_type']}\n"
            f"Tone: {f['tier_tone']}\n"
            "Do not use: stunning, amazing, perfect, sleek, elevate, game-changer.\n"
            "Under 120 words total."
        )

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLS)
        writer.writeheader()
        for sku_key in sorted(frames):
            fr = frames[sku_key]
            row = {c: fr.get(c, "") for c in CSV_COLS if c != "ai_prompt"}
            row["ai_prompt"] = make_prompt(fr)
            writer.writerow(row)
    print(f"Saved AI batch CSV -> {OUT_CSV}")

    # ── Summary ────────────────────────────────────────
    total     = len(frames)
    png_ready = sum(1 for f in frames.values() if f["png_ready"])
    jpg_only  = sum(1 for f in frames.values() if f["image_ready"] and not f["png_ready"])
    no_image  = sum(1 for f in frames.values() if not f["image_ready"])

    by_tier = {}
    for f in frames.values():
        by_tier[f["tier"]] = by_tier.get(f["tier"], 0) + 1

    print(f"\n{'='*50}")
    print(f"Total frames in database : {total}")
    print(f"  PNG ready (processed)  : {png_ready}")
    print(f"  JPG only (needs bg rm) : {jpg_only}")
    print(f"  No image yet           : {no_image}")
    print(f"\nBy tier:")
    for tier in ("Luxury","Premium","Accessible","Value"):
        print(f"  {tier:12s}: {by_tier.get(tier, 0)}")
    print("="*50)

    # ── Priority list: Luxury PNGs first ──────────────
    priority = [
        f for f in frames.values()
        if f["png_ready"] and f["tier"] in ("Luxury","Premium")
    ]
    priority.sort(key=lambda x: x["price_ngn"], reverse=True)
    print(f"\nPriority batch (Luxury/Premium PNGs) — {len(priority)} frames:")
    for f in priority:
        print(f"  {f['sku']:10s}  {f['brand']:20s}  {f['model']:30s}  NGN {f['price_ngn']:,}")


if __name__ == "__main__":
    main()
