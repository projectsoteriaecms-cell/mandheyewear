#!/usr/bin/env python3
"""
M&H Frame Image Downloader
Downloads product images for all 162 M&H frames.
Run this on your local Windows machine:
  pip install requests beautifulsoup4
  python download_frame_images.py

Images are saved to ./frame_images/ as MH-{ProductId}.jpg
"""

import requests
import re
import os
import json
import time
from bs4 import BeautifulSoup

OUTPUT_DIR = "frame_images"
REPORT_FILE = "download_report.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# All 162 product page URLs (sku → product page url)
# SmartBuyGlasses pages will have CDN image URLs constructed automatically
FRAMES = [
    # ── LUXURY TIER ──────────────────────────────────────────────────────
    {"sku": "MH-1793", "brand": "Cartier", "model": "CT0344O 003", "url": "https://pretavoir.us/products/cartier-ct0344o-003"},
    {"sku": "MH-474",  "brand": "Cartier", "model": "CT0349O 001", "url": None, "notes": "Not found online"},
    {"sku": "MH-471",  "brand": "Cartier", "model": "C34C38MJ",    "url": None, "notes": "Unusual model - not found"},
    {"sku": "MH-470",  "brand": "Dunhill",  "model": "DU0038OA 003","url": "https://www.designeroptics.com/dunhill-du-0038oa-003.html"},
    {"sku": "MH-460",  "brand": "Gucci",    "model": "GG1221O 002", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1221O-002-610522.html"},
    {"sku": "MH-1699", "brand": "Gucci",    "model": "GG1504O 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1504O-006-668965.html"},
    {"sku": "MH-1703", "brand": "Gucci",    "model": "GG1438O 003", "url": None, "notes": "Color 003 not found - 001 available"},
    {"sku": "MH-457",  "brand": "Gucci",    "model": "GG1219O 001", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1219O-001-610518.html"},
    {"sku": "MH-1693", "brand": "Gucci",    "model": "GG1497O 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1497O-006-668953.html"},
    {"sku": "MH-1704", "brand": "Gucci",    "model": "GG1303O 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1303O-006-641882.html"},
    {"sku": "MH-320",  "brand": "Burberry", "model": "BE4406U 300187","url": "https://www.smartbuyglasses.com/designer-sunglasses/Burberry/Burberry-BE4406U-300187-660312.html"},
    {"sku": "MH-322",  "brand": "Burberry", "model": "BE2387 4096", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2387-4096-676432.html"},
    {"sku": "MH-1672", "brand": "Burberry", "model": "BE2403 4119", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2403-4119-636380.html"},
    {"sku": "MH-1673", "brand": "Burberry", "model": "BE1376 1340", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE1376-1340-676353.html"},
    {"sku": "MH-319",  "brand": "Prada",    "model": "PR A52V 01U1O1","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-A52V-01U1O1-667639.html"},
    {"sku": "MH-431",  "brand": "Prada",    "model": "PR 58ZV 17I1O1","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-58ZV-17I1O1-629001.html"},
    {"sku": "MH-432",  "brand": "Prada",    "model": "PR 09ZV 08Q1O1","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-09ZV-08Q1O1-629008.html"},
    {"sku": "MH-1701", "brand": "Prada",    "model": "PR 22ZV 16K1O1","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-22ZV-16K1O1-668058.html"},
    {"sku": "MH-426",  "brand": "Tom Ford",  "model": "FT5040-B 001","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Tom-Ford/Tom-Ford-FT5040-B-Blue-Light-Block-001-661805.html"},
    {"sku": "MH-1726", "brand": "Tom Ford",  "model": "FT5939-B 052","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Tom-Ford/Tom-Ford-FT5939-B-052-651516.html"},
    {"sku": "MH-440",  "brand": "Versace",  "model": "VE4445 GB1/M1","url": "https://www.smartbuyglasses.com/designer-sunglasses/Versace/Versace-VE4445-GB1-M1-640621.html"},
    {"sku": "MH-1741", "brand": "Versace",  "model": "VE4458 GB1/87","url": "https://www.smartbuyglasses.com/designer-sunglasses/Versace/Versace-VE4458-GB1-87-675082.html"},
    {"sku": "MH-441",  "brand": "Versace",  "model": "VE3339U 5406", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3339U-5406-654424.html"},
    {"sku": "MH-1742", "brand": "Versace",  "model": "VE3338 GB1",   "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3338-GB1-668297.html"},
    {"sku": "MH-1743", "brand": "Versace",  "model": "VE3346 148",   "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3346-148-675088.html"},
    {"sku": "MH-1720", "brand": "Clary Gray","model": "DAKARIAN CNG14 24K","url": "https://www.clarygray.com/products/dakarian"},
    {"sku": "MH-1510", "brand": "Hugo",     "model": "HG1257 1ED",   "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Hugo/Hugo-HG1257-1ED-676268.html"},
    {"sku": "MH-455",  "brand": "Marc Jacobs","model": "MARC848 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Marc-Jacobs/Marc-Jacobs-MARC848-807-676253.html"},
    {"sku": "MH-456",  "brand": "Marc Jacobs","model": "MARC617 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Marc-Jacobs/Marc-Jacobs-MARC617-807-602668.html"},
    {"sku": "MH-462",  "brand": "Miu Miu",  "model": "VMU 57ZV 1AB1O1","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Miu-Miu/Miu-Miu-VMU-57ZV-1AB1O1-641942.html"},
    {"sku": "MH-463",  "brand": "Dolce & Gabbana","model": "DG3357 501","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Dolce-Gabbana/Dolce-Gabbana-DG3357-501-640985.html"},
    {"sku": "MH-464",  "brand": "Dolce & Gabbana","model": "DG3361 501","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Dolce-Gabbana/Dolce-Gabbana-DG3361-501-641003.html"},
    {"sku": "MH-466",  "brand": "Giorgio Armani","model": "AR7234 5042","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Giorgio-Armani/Giorgio-Armani-AR7234-5042-668361.html"},
    {"sku": "MH-468",  "brand": "David Beckham","model": "DB7110 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/David-Beckham/David-Beckham-DB7110-807-668329.html"},
    {"sku": "MH-1739", "brand": "Jimmy Choo","model": "JC3004B 5013", "url": None, "notes": "Color 5013 not found; 5000/5002 available"},
    {"sku": "MH-1795", "brand": "Tiffany",  "model": "TF4197 8001/3B","url": "https://www.smartbuyglasses.com/designer-sunglasses/Tiffany/Tiffany-TF4197-8001-3B-674826.html"},
    {"sku": "MH-1796", "brand": "Mont Blanc","model": "MB0293O 001",  "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Mont-Blanc/Mont-Blanc-MB0293O-001-673613.html"},
    {"sku": "MH-1797", "brand": "Mont Blanc","model": "MB0310O 005",  "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Mont-Blanc/Mont-Blanc-MB0310O-005-676413.html"},
    {"sku": "MH-459",  "brand": "Saint Laurent","model": "SL M116 002","url": "https://www.smartbuyglasses.com/designer-sunglasses/Saint-Laurent/Saint-Laurent-SL-M116-002-668434.html"},
    {"sku": "MH-1798", "brand": "Saint Laurent","model": "SL 641 001","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Saint-Laurent/Saint-Laurent-SL-641-001-676434.html"},
    {"sku": "MH-465",  "brand": "Oakley",   "model": "OX8156 0256",  "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Oakley/Oakley-OX8156-0256-604867.html"},
    {"sku": "MH-1800", "brand": "Dario Martini","model": "DM822 Col1","url": "https://www.hovinaglasses.com/product/dario-martini-dm-822-col-1-eyeglasses/"},
    {"sku": "MH-1801", "brand": "Dsquared2","model": "D20122 807",   "url": "https://www.smartbuyglasses.com/designer-eyeglasses/DSquared2/DSquared2-D20122-807-668318.html"},
    {"sku": "MH-1802", "brand": "Moschino", "model": "MOS616/G 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Moschino/Moschino-MOS616G-807-676384.html"},

    # ── PREMIUM TIER ─────────────────────────────────────────────────────
    {"sku": "MH-111",  "brand": "Dolce & Gabbana","model": "DG5101 501","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Dolce-Gabbana/Dolce-Gabbana-DG5101-501-641032.html"},
    {"sku": "MH-112",  "brand": "Dolce & Gabbana","model": "DG1349 501","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Dolce-Gabbana/Dolce-Gabbana-DG1349-501-609498.html"},
    {"sku": "MH-490",  "brand": "Ray-Ban",  "model": "RB3025 9035/1U","url": "https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB3025-9035-1U-595688.html"},
    {"sku": "MH-491",  "brand": "Ray-Ban",  "model": "RB4194 601/31", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB4194-601-31-507116.html"},
    {"sku": "MH-492",  "brand": "Ray-Ban",  "model": "RB2140 901",    "url": "https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB2140-901-507145.html"},
    {"sku": "MH-493",  "brand": "Ray-Ban",  "model": "RB4171 601/2",  "url": "https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB4171-601-2-507142.html"},
    {"sku": "MH-1512", "brand": "Tommy Hilfiger","model": "TH2072 KB7","url": None, "notes": "Not found on authorized retailers"},
    {"sku": "MH-1443", "brand": "Pierre Cardin","model": "P.C.8875 J5G","url": None, "notes": "Not found online"},
    {"sku": "MH-253",  "brand": "Tommy Hilfiger","model": "TH2046 IPQ","url": None, "notes": "Not found"},
    {"sku": "MH-1448", "brand": "Levi's",   "model": "LV1042 J5G",   "url": None, "notes": "Not found"},
    {"sku": "MH-507",  "brand": "Dario Martini","model": "DM716 COL.2","url": None, "notes": "Not on major retailers"},
    {"sku": "MH-212",  "brand": "Seventh Street","model": "7A 081 6LB","url": None, "notes": "Brand not found online"},
    {"sku": "MH-1503", "brand": "Polaroid", "model": "PLD D373 PJP",  "url": None, "notes": "Discontinued model"},
    {"sku": "MH-448",  "brand": "La Martina","model": "MAV749 COL.16","url": None, "notes": "Not on international retailers"},
    {"sku": "MH-449",  "brand": "La Martina","model": "MAV720 COL.12","url": None, "notes": "Not on international retailers"},
    {"sku": "MH-506",  "brand": "Dario Martini","model": "DM796 COL.2","url": None, "notes": "Not found"},
    {"sku": "MH-1466", "brand": "S.T. Dupont","model": "DP-3985 C2", "url": None, "notes": "Not found"},
    {"sku": "MH-1467", "brand": "S.T. Dupont","model": "Titanium2104","url": None, "notes": "Not found"},
    {"sku": "MH-503",  "brand": "Guess",    "model": "GU2781 091",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Guess/Guess-GU2781-091-502673.html"},
    {"sku": "MH-504",  "brand": "Guess",    "model": "GU2784 005",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Guess/Guess-GU2784-005-502686.html"},
    {"sku": "MH-494",  "brand": "Michael Kors","model": "MK3075 1108","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Michael-Kors/Michael-Kors-MK3075-1108-660218.html"},
    {"sku": "MH-496",  "brand": "Michael Kors","model": "MK4096 3006","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Michael-Kors/Michael-Kors-MK4096-3006-660219.html"},
    {"sku": "MH-498",  "brand": "Michael Kors","model": "MK3069 1108","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Michael-Kors/Michael-Kors-MK3069-1108-641107.html"},
    {"sku": "MH-500",  "brand": "Michael Kors","model": "MK4068 3005","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Michael-Kors/Michael-Kors-MK4068-3005-641104.html"},
    {"sku": "MH-509",  "brand": "Ted Baker", "model": "TB2323 104",   "url": "https://www.burghleyandco.uk/products/ted-baker-optical-frame-tb2323-104"},
    {"sku": "MH-510",  "brand": "Ted Baker", "model": "TB4343 562",   "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB4343-562-598531.html"},
    {"sku": "MH-511",  "brand": "Tommy Hilfiger","model": "TH1891 807","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH1891-807-507396.html"},
    {"sku": "MH-512",  "brand": "Tommy Hilfiger","model": "TH1948 COL.03","url": "https://www.framesdirect.com/tommy-hilfiger-th-1948-eyeglasses"},
    {"sku": "MH-513",  "brand": "Levi's",   "model": "LV1053 807",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Levi-s/Levi-s-LV1053-807-641144.html"},
    {"sku": "MH-514",  "brand": "Levi's",   "model": "LV1058 807",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Levi-s/Levi-s-LV1058-807-641155.html"},
    {"sku": "MH-515",  "brand": "Levi's",   "model": "LV5034 807",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Levi-s/Levi-s-LV5034-807-612584.html"},
    {"sku": "MH-516",  "brand": "Hackett",  "model": "HEB306 190",    "url": "https://www.edel-optics.com/306-190-by-Hackett.html"},
    {"sku": "MH-517",  "brand": "Sandro",   "model": "SD3017 940",    "url": "https://designershadesdirect.com/en-us/products/sandro-glasses-frames-sd3017-940"},
    {"sku": "MH-518",  "brand": "Daniel Hechter","model": "DHM340 2", "url": "https://www.selectspecs.com/glasses/daniel-hechter/dhm340/ss2724.08.html"},
    {"sku": "MH-519",  "brand": "Ted Baker", "model": "TB4328 667",   "url": "https://www.designerglasses.co.uk/product/ted-baker-tb4328-morris/"},
    {"sku": "MH-520",  "brand": "Ted Baker", "model": "TB4344 002",   "url": "https://pretavoir.us/products/ted-baker-dawson-4344-002"},
    {"sku": "MH-521",  "brand": "Ted Baker", "model": "TB8219 351",   "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB8219-351-604889.html"},
    {"sku": "MH-522",  "brand": "Ted Baker", "model": "TB2323 104",   "url": "https://www.burghleyandco.uk/products/ted-baker-optical-frame-tb2323-104"},
    {"sku": "MH-523",  "brand": "Vogue",    "model": "VO5421 W44",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Vogue/Vogue-VO5421-W44-630516.html"},
    {"sku": "MH-524",  "brand": "Vogue",    "model": "VO5462 W44",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Vogue/Vogue-VO5462-W44-654438.html"},
    {"sku": "MH-525",  "brand": "Vogue",    "model": "VO5286 W44",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Vogue/Vogue-VO5286-W44-609537.html"},
    {"sku": "MH-526",  "brand": "Vogue",    "model": "VO4250 297",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Vogue/Vogue-VO4250-297-668549.html"},
    {"sku": "MH-527",  "brand": "Vogue",    "model": "VO5536 W44",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Vogue/Vogue-VO5536-W44-676525.html"},

    # ── STANDARD TIER ────────────────────────────────────────────────────
    {"sku": "MH-1779", "brand": "Cartier",  "model": "CT0563S C2",   "url": None, "notes": "Not found on retailers"},
    {"sku": "MH-1780", "brand": "Cartier",  "model": "30104 C9",     "url": None, "notes": "Not found"},
    {"sku": "MH-131",  "brand": "Polaroid", "model": "PLD D490/G J5G","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D490G-J5G-598483.html"},
    {"sku": "MH-220",  "brand": "Polaroid", "model": "PLD D508/G J5G","url": "https://lookeronline.com/products/polaroid-d508-g-j5g"},
    {"sku": "MH-221",  "brand": "Polaroid", "model": "PLD D451 J5G",  "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D451-J5G-641895.html"},
    {"sku": "MH-249",  "brand": "Polaroid", "model": "PLD D459/G 807","url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Polaroid/Polaroid-PLD-D459G-807-598488.html"},
    {"sku": "MH-242",  "brand": "Polaroid", "model": "PLD D448 ZX9",  "url": "https://optimaloptic.com/prescription-glasses/polaroid-pld-d448-zx9.html"},
    {"sku": "MH-228",  "brand": "Polaroid", "model": "PLD D482 086",  "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Polaroid/Polaroid-PLD-D482-086-630547.html"},
    {"sku": "MH-215",  "brand": "Polaroid", "model": "PLD D488 807",  "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D488-807-630537.html"},
    {"sku": "MH-414",  "brand": "Daniel Hechter","model": "DHM378 3","url": None, "notes": "Not found"},
    {"sku": "MH-1480", "brand": "Daniel Hechter","model": "DHM193 7","url": None, "notes": "Not found"},
    {"sku": "MH-1481", "brand": "Daniel Hechter","model": "DHM340 2","url": "https://www.selectspecs.com/glasses/daniel-hechter/dhm340/ss2724.08.html"},
    {"sku": "MH-1482", "brand": "Daniel Hechter","model": "DHM281 7","url": None, "notes": "Not found"},
    {"sku": "MH-1483", "brand": "Daniel Hechter","model": "DHP614 2","url": None, "notes": "Not found"},
    {"sku": "MH-1485", "brand": "Ted Baker", "model": "TB4343 562",   "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB4343-562-598531.html"},
    {"sku": "MH-1486", "brand": "Ted Baker", "model": "TB4328 667",   "url": "https://www.designerglasses.co.uk/product/ted-baker-tb4328-morris/"},
    {"sku": "MH-1491", "brand": "Ted Baker", "model": "TB4344 002",   "url": "https://pretavoir.us/products/ted-baker-dawson-4344-002"},
    {"sku": "MH-1494", "brand": "Ted Baker", "model": "TB8219 351",   "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB8219-351-604889.html"},
    {"sku": "MH-1496", "brand": "Ted Baker", "model": "TB2323 104",   "url": "https://www.burghleyandco.uk/products/ted-baker-optical-frame-tb2323-104"},
    {"sku": "MH-1460", "brand": "Tommy Hilfiger","model": "TH1948 COL.03","url": "https://www.framesdirect.com/tommy-hilfiger-th-1948-eyeglasses"},
    {"sku": "MH-574",  "brand": "Guess",    "model": "GU2879 028",    "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Guess/Guess-GU2879-028-641083.html"},
    {"sku": "MH-576",  "brand": "Guess",    "model": "GU2878 071",    "url": "https://www.framesdirect.com/guess-gu2878-eyeglasses"},
    {"sku": "MH-551",  "brand": "Pepe Jeans","model": "PJ1301 C4",   "url": "https://www.rxframesnlenses.com/pepe-jeans-pj-1301-topsy.html"},
    {"sku": "MH-1476", "brand": "Sandro",   "model": "SD3017 940",    "url": "https://designershadesdirect.com/en-us/products/sandro-glasses-frames-sd3017-940"},
    {"sku": "MH-172",  "brand": "Carolina Herrera","model": "HER 0150 086","url": "https://pretavoir.us/collections/welcomediscount/products/carolina-herrera-her-0150-086"},
    {"sku": "MH-1405", "brand": "Columbia", "model": "C8036 022",     "url": "https://www.framesdirect.com/columbia-c8036-eyeglasses"},
    {"sku": "MH-1400", "brand": "Columbia", "model": "C3016 201",     "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Columbia/Columbia-C3016-201-597765.html"},
    {"sku": "MH-1403", "brand": "Columbia", "model": "C3015 072",     "url": "https://www.framesdirect.com/columbia-c3015-eyeglasses"},
    {"sku": "MH-569",  "brand": "Sandro",   "model": "SD6018 118",    "url": None, "notes": "Not found"},
    {"sku": "MH-573",  "brand": "GF Ferre", "model": "GFF 0164 005",  "url": None, "notes": "Not found"},
    # Macruona (local brand - manual sourcing required)
    {"sku": "MH-367",  "brand": "Macruona", "model": "D3333 C5",      "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-328",  "brand": "Macruona", "model": "MB1402-A C5",   "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-393",  "brand": "Macruona", "model": "SH9103 C4",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-355",  "brand": "Macruona", "model": "XL110 C3",      "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-370",  "brand": "Macruona", "model": "TA9067 C5",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-396",  "brand": "Macruona", "model": "MG3850 C5",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-327",  "brand": "Macruona", "model": "TA9066 C4",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-351",  "brand": "Macruona", "model": "8604 C3",       "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-354",  "brand": "Macruona", "model": "8592 C1",       "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-361",  "brand": "Macruona", "model": "D3337 C1",      "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-372",  "brand": "Macruona", "model": "D3337 C2",      "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-399",  "brand": "Macruona", "model": "9869 C1",       "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-343",  "brand": "Macruona", "model": "MG6557A C1",    "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-358",  "brand": "Macruona", "model": "TA9067 C1",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-360",  "brand": "Macruona", "model": "HC-16068 C1",   "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-398",  "brand": "Macruona", "model": "PY-526 C8",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-344",  "brand": "Macruona", "model": "MB1403 C4",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-357",  "brand": "Macruona", "model": "TA9067 C4",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-406",  "brand": "Macruona", "model": "TA9068 C2",     "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-350",  "brand": "Macruona", "model": "8563 C3",       "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-337",  "brand": "Macruona", "model": "8563 C2",       "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-338",  "brand": "Macruona", "model": "8563 C1",       "url": None, "notes": "Local brand - manual sourcing"},

    # ── BUDGET TIER (to be added after budget agent completes) ────────────
    {"sku": "MH-1584", "brand": "Tiffany & Co","model": "TF6138 001","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Tiffany/Tiffany-TF6138-001-668490.html"},
    {"sku": "MH-1399", "brand": "Cole Haan","model": "CH4045 971",   "url": "https://www.framesdirect.com/cole-haan-ch4045-eyeglasses"},
    {"sku": "MH-331",  "brand": "Macruona", "model": "MR01-02 C.03", "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-330",  "brand": "Macruona", "model": "MR01-01 C.01H","url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-1371", "brand": "Swarovski","model": "SW1028 16W",   "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Swarovski/Swarovski-SW1028-16W-630565.html"},
    {"sku": "MH-1372", "brand": "Swarovski","model": "SW1028 18M",   "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Swarovski/Swarovski-SW1028-18M-630566.html"},
    {"sku": "MH-1378", "brand": "Menrad",   "model": "MOD.14111 2100","url": None, "notes": "Not found on international retailers"},
    {"sku": "MH-1380", "brand": "Linda Farrow","model": "LFL/351/2","url": "https://www.gaffos.com/linda-farrow-lfl-351-2-eyeglasses.html"},
    {"sku": "MH-1381", "brand": "Linda Farrow","model": "LFL/351/4","url": "https://www.gaffos.com/linda-farrow-lfl-351-4-eyeglasses.html"},
    {"sku": "MH-400",  "brand": "Macruona", "model": "FE06-12 C.01", "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-362",  "brand": "Macruona", "model": "FE06-12 C.03", "url": None, "notes": "Local brand - manual sourcing"},
    {"sku": "MH-1595", "brand": "Gentle Monster","model": "LOVE PUNCH COL.02","url": "https://www.gentlemonster.com/us/shop/product/love-punch-02"},
    {"sku": "MH-1596", "brand": "Gentle Monster","model": "OLLIE COL.PC3","url": "https://www.gentlemonster.com/us/shop/product/ollie-pc3"},
    {"sku": "MH-589",  "brand": "Essilor Eyezen","model": "HD0116 FINN GUN","url": None, "notes": "Prescription lens brand - not found"},
    {"sku": "MH-591",  "brand": "Essilor Eyezen","model": "HD0116 TIBBY BRY","url": None, "notes": "Prescription lens brand - not found"},
    {"sku": "MH-1377", "brand": "Joseph Marc","model": "ENGLER IG1803","url": "https://www.josephmarc.com/collections/eyeglasses/products/engler"},
    {"sku": "MH-1651", "brand": "M&H",      "model": "BS1003 C9",    "url": None, "notes": "In-house brand - manual photo needed"},
    {"sku": "MH-1654", "brand": "M&H",      "model": "FD8819 C2",    "url": None, "notes": "In-house brand - manual photo needed"},
    {"sku": "MH-1729", "brand": "Polaroid", "model": "PLD 0036/R/BB 086","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-0036-R-BB-086-641913.html"},
    {"sku": "MH-1730", "brand": "Polaroid", "model": "PLD 0035/R/BB PJP","url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-0035-R-BB-PJP-641912.html"},
]


def extract_product_id(sbg_url):
    """Extract numeric product ID from SmartBuyGlasses URL."""
    m = re.search(r"-(\d+)\.html$", sbg_url)
    return m.group(1) if m else None


def build_cdn_urls(sbg_url):
    """Build SmartBuyGlasses CDN image URLs from product page URL."""
    filename = sbg_url.split("/")[-1].replace(".html", "")
    # Remove trailing product ID
    product_part = re.sub(r"-\d+$", "", filename)
    brand_path = re.search(r"designer-(?:eyeglasses|sunglasses)/([^/]+)/", sbg_url)
    if not brand_path:
        return []
    bp = brand_path.group(1)
    return [
        f"https://img1-image.cdnsbg.com/product_image/designer_eyeglasses/{bp}/{product_part}.jpg_w600h300q80",
        f"https://img1-image.cdnsbg.com/product_image/designer_sunglasses/{bp}/{product_part}.jpg_w600h300q80",
    ]


def download_image(url, save_path, session):
    """Download image from URL, return True on success."""
    try:
        resp = session.get(url, timeout=15, stream=True)
        if resp.status_code == 200 and "image" in resp.headers.get("Content-Type", ""):
            with open(save_path, "wb") as f:
                for chunk in resp.iter_content(8192):
                    f.write(chunk)
            return True
    except Exception:
        pass
    return False


def get_og_image(page_url, session):
    """Fetch a product page and extract the og:image URL."""
    try:
        resp = session.get(page_url, timeout=20)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")
        og = soup.find("meta", property="og:image")
        if og and og.get("content"):
            return og["content"]
        # Fallback: look for main product image
        img = soup.select_one(".product-image img, .product__image img, #main-image")
        if img and img.get("src"):
            src = img["src"]
            if not src.startswith("http"):
                src = "https:" + src
            return src
    except Exception:
        pass
    return None


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)

    report = []
    found_count = 0
    skip_count = 0
    fail_count = 0

    for frame in FRAMES:
        sku = frame["sku"]
        product_id = sku.replace("MH-", "")
        save_path = os.path.join(OUTPUT_DIR, f"{sku}.jpg")

        if os.path.exists(save_path):
            print(f"[SKIP] {sku} already downloaded")
            skip_count += 1
            report.append({"sku": sku, "status": "skipped", "file": save_path})
            continue

        if not frame.get("url"):
            print(f"[SKIP] {sku} — {frame.get('notes', 'No URL')}")
            skip_count += 1
            report.append({"sku": sku, "status": "no_url", "notes": frame.get("notes", "")})
            continue

        page_url = frame["url"]
        success = False

        # Strategy 1: SmartBuyGlasses CDN URLs (direct image)
        if "smartbuyglasses.com" in page_url:
            cdn_urls = build_cdn_urls(page_url)
            for cdn_url in cdn_urls:
                if download_image(cdn_url, save_path, session):
                    print(f"[OK-CDN] {sku} → {cdn_url[:70]}")
                    report.append({"sku": sku, "status": "ok", "source": cdn_url, "file": save_path})
                    success = True
                    found_count += 1
                    break

        # Strategy 2: Fetch product page and extract og:image
        if not success:
            img_url = get_og_image(page_url, session)
            if img_url and download_image(img_url, save_path, session):
                print(f"[OK-OG]  {sku} → {img_url[:70]}")
                report.append({"sku": sku, "status": "ok", "source": img_url, "file": save_path})
                success = True
                found_count += 1

        if not success:
            print(f"[FAIL]   {sku} — could not download from {page_url[:60]}")
            report.append({"sku": sku, "status": "failed", "url": page_url})
            fail_count += 1

        time.sleep(0.5)  # polite delay between requests

    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2)

    total = len(FRAMES)
    print(f"\n{'='*50}")
    print(f"DONE: {found_count} downloaded | {skip_count} skipped | {fail_count} failed")
    print(f"Images saved to: ./{OUTPUT_DIR}/")
    print(f"Report saved to: ./{REPORT_FILE}")
    print(f"\nFrames needing MANUAL photos ({fail_count + skip_count} total):")
    for r in report:
        if r["status"] in ("failed", "no_url"):
            frame = next((f for f in FRAMES if f["sku"] == r["sku"]), {})
            print(f"  {r['sku']} — {frame.get('brand','')} {frame.get('model','')}")


if __name__ == "__main__":
    main()
