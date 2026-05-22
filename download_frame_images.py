#!/usr/bin/env python3
"""
M&H Frame Image Downloader — all 162 products
Run on your local Windows machine:
  pip install requests beautifulsoup4
  python download_frame_images.py

Images saved to ./frame_images/ as MH-{ProductId}.jpg
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

# 162 frames: url=None means manual photo required
FRAMES = [
    # LUXURY TIER
    {"sku": "MH-1793", "brand": "Cartier", "model": "CT0344O 003", "url": "https://pretavoir.us/products/cartier-ct0344o-003"},
    {"sku": "MH-471", "brand": "Cartier", "model": "C34C38MJ", "url": None, "notes": "Vintage/discontinued - not found online"},
    {"sku": "MH-474", "brand": "Cartier", "model": "CT0349O 001 Titanium", "url": None, "notes": "Not found on authorised retailers"},
    {"sku": "MH-183", "brand": "Tiffany & Co", "model": "TF4197 8001/S4", "url": "https://pretavoir.us/products/tiffany-tf4197-8001s4"},
    {"sku": "MH-460", "brand": "Gucci", "model": "GG1221O 002", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1221O-002-610522.html"},
    {"sku": "MH-1699", "brand": "Gucci", "model": "GG1504O 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1504O-006-668965.html"},
    {"sku": "MH-1703", "brand": "Gucci", "model": "GG1438O 003", "url": None, "notes": "Color 003 not listed on major retailers"},
    {"sku": "MH-320", "brand": "Burberry", "model": "BE4406U 3001/87", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Burberry/Burberry-BE4406U-300187-660312.html"},
    {"sku": "MH-457", "brand": "Gucci", "model": "GG1219O 001", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1219O-001-610518.html"},
    {"sku": "MH-1693", "brand": "Gucci", "model": "GG1497O 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1497O-006-668953.html"},
    {"sku": "MH-1704", "brand": "Gucci", "model": "GG1303O 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1303O-006-641882.html"},
    {"sku": "MH-426", "brand": "Tom Ford", "model": "FT5040-B 001", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Tom-Ford/Tom-Ford-FT5040-B-Blue-Light-Block-001-661805.html"},
    {"sku": "MH-319", "brand": "Prada", "model": "PR A52V 01U1O1", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-A52V-01U1O1-667639.html"},
    {"sku": "MH-90", "brand": "Versace", "model": "VE4445 GB1/M1", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Versace/Versace-VE4445-GB1M1-634769.html"},
    {"sku": "MH-188", "brand": "Versace", "model": "VE4458 GB1/87", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Versace/Versace-VE4458-GB187-658282.html"},
    {"sku": "MH-202", "brand": "Marc Jacobs", "model": "MJ 1091/N/S 06JIB", "url": "https://pretavoir.us/products/marc-jacobs-mj-1091ns-06jib-with-detachable-chain"},
    {"sku": "MH-1739", "brand": "Jimmy Choo", "model": "JC3004B 5013", "url": None, "notes": "Color 5013 not found; 5000/5002 available"},
    {"sku": "MH-314", "brand": "Prada", "model": "PR 58ZV 17I1O1", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-58ZV-17I1O1-644632.html"},
    {"sku": "MH-323", "brand": "Dolce & Gabbana", "model": "DG3376B 502", "url": "https://www.framesdirect.com/dolce-gabbana-dg3376b-eyeglasses"},
    {"sku": "MH-83", "brand": "Prada", "model": "PR 09ZV 08Q1O1", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-09ZV-08Q1O1-674861.html"},
    {"sku": "MH-120", "brand": "Prada", "model": "PR 22ZV 16K1O1", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-22ZV-16K1O1-644602.html"},
    {"sku": "MH-1722", "brand": "Burberry", "model": "BE2387 4096", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2387F-Asian-Fit-4096-679024.html"},
    {"sku": "MH-1748", "brand": "Cartier", "model": "CT0284O", "url": "https://pretavoir.us/products/cartier-ct0284o-002"},
    {"sku": "MH-81", "brand": "Dolce & Gabbana", "model": "DG3376B 3420", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Dolce-&-Gabbana/Dolce-Gabbana-DG3376B-3420-656091.html"},
    {"sku": "MH-1740", "brand": "Burberry", "model": "BE2403 4119", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2403-4119-679030.html"},
    {"sku": "MH-1744", "brand": "Moschino", "model": "MOS637 807", "url": "https://www.smartbuyglasses.ie/designer-eyeglasses/Moschino/Moschino-MOS637-807-695501.html"},
    {"sku": "MH-1745", "brand": "Dsquared2", "model": "D2 0102 3YG", "url": "https://www.smartbuyglasses.it/occhiali-da-vista/Dsquared2/Dsquared2-D2-0102-3YG-691835.html"},
    {"sku": "MH-1731", "brand": "Marc Jacobs", "model": "MARC848 2M2", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Marc-Jacobs/Marc-Jacobs-MARC-848-2M2-702725.html"},
    {"sku": "MH-1742", "brand": "David Beckham", "model": "DB 7020/BOLD 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/David-Beckham/David-Beckham-DB-7020BOLD-807-589588.html"},
    {"sku": "MH-91", "brand": "Giorgio Armani", "model": "AR7230U 5914", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Giorgio-Armani/Giorgio-Armani-AR7230U-5914-659501.html"},
    {"sku": "MH-93", "brand": "Miu Miu", "model": "MU06VV 1AB1O1", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Miu-Miu/Miu-Miu-MU06VV-1AB1O1-637001.html"},
    {"sku": "MH-1724", "brand": "Versace", "model": "VE3339U 5406", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3339U-5406-634745.html"},
    {"sku": "MH-96", "brand": "Versace", "model": "VE3338 GB1", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3338-GB1-634739.html"},
    {"sku": "MH-98", "brand": "Versace", "model": "VE3346 148", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3346-148-658253.html"},
    {"sku": "MH-1510", "brand": "Hugo", "model": "HG1257 1ED", "url": None, "notes": "Only found on eBay/otticasm - not authorised retailer"},
    {"sku": "MH-104", "brand": "Burberry", "model": "BE1376 1340", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE1376-VIRGINIA-Asian-Fit-1340-641633.html"},
    {"sku": "MH-470", "brand": "Dunhill", "model": "DU0038OA 003", "url": "https://designeroptics.com/products/dunhill-du0038oa-eyeglasses"},
    {"sku": "MH-1720", "brand": "Clary Gray", "model": "DAKARIAN CNG14 24K", "url": None, "notes": "Product page not confirmed on authorised retailer"},
    {"sku": "MH-1692", "brand": "Mont Blanc", "model": "MB0266O 005", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Montblanc/Mont-Blanc-MB0266O-005-619726.html"},
    {"sku": "MH-1696", "brand": "Saint Laurent", "model": "SL 699 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Saint-Laurent/Saint-Laurent-SL-699-Asian-Fit-006-668763.html"},
    {"sku": "MH-453", "brand": "Mont Blanc", "model": "MB0199OA 006", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Mont-Blanc/Mont-Blanc-MB0199OA-Asian-Fit-006-573756.html"},
    {"sku": "MH-1694", "brand": "Saint Laurent", "model": "SL 379/F SLIM 001", "url": "https://gaffos.com/products/saint-laurent-sl-379f-slim-001-rectangle-metal-silver-eyeglasses-with-demo-lens"},
    {"sku": "MH-17", "brand": "Oakley", "model": "OO9242 HSTN 0552", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Oakley/Oakley-OO9242-HSTN-924201-639464.html"},
    {"sku": "MH-504", "brand": "Dario Martini", "model": "DM 822 COL.1", "url": "https://www.hovinaglasses.com/product/dario-martini-dm-822-col-1-eyeglasses/"},
    # PREMIUM TIER
    {"sku": "MH-111", "brand": "Dolce & Gabbana", "model": "DG5101 501", "url": "https://www.framesdirect.com/dolce-gabbana-dg5101-eyeglasses"},
    {"sku": "MH-1506", "brand": "Hugo", "model": "HG1359 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/HUGO/HUGO-HG-1359-807-708826.html"},
    {"sku": "MH-79", "brand": "Burberry", "model": "BE2347 3943", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2347-EVELYN-3943-580423.html"},
    {"sku": "MH-1747", "brand": "Cartier", "model": "CT0063O", "url": "https://solsticesunglasses.com/products/cartier-ct0063o-ct0063o"},
    {"sku": "MH-74", "brand": "Versace", "model": "VE3327U 5381", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3327U-5381-616641.html"},
    {"sku": "MH-1512", "brand": "Tommy Hilfiger", "model": "TH2072 KB7", "url": None, "notes": "Not found on authorised retailers"},
    {"sku": "MH-250", "brand": "Tommy Hilfiger", "model": "TH 1892 KB7", "url": "https://www.framesdirect.com/tommy-hilfiger-th-1892-eyeglasses"},
    {"sku": "MH-106", "brand": "Ray-Ban", "model": "RB3625 NEW AVIATOR 003/3M", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB3625-New-Aviator-0033M-657937.html"},
    {"sku": "MH-1444", "brand": "Tommy Hilfiger", "model": "TH2049 003", "url": "https://www.framesdirect.com/tommy-hilfiger-th-2049-eyeglasses"},
    {"sku": "MH-1446", "brand": "Tommy Hilfiger", "model": "TH1962 000", "url": "https://www.framesdirect.com/tommy-hilfiger-th-1962-eyeglasses"},
    {"sku": "MH-162", "brand": "Tommy Hilfiger", "model": "TH 1990 PJP", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH-1990-PJP-643287.html"},
    {"sku": "MH-107", "brand": "Ray-Ban", "model": "RB3025 9202/31", "url": "https://www.framesdirect.com/ray-ban-rb3025-large-metal-aviator-sunglasses"},
    {"sku": "MH-1443", "brand": "Pierre Cardin", "model": "P.C.8875 J5G", "url": None, "notes": "Not found on major retailers"},
    {"sku": "MH-1733", "brand": "Carrera", "model": "VICTORY C 06 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-VICTORY-C-06-8072Y-693535.html"},
    {"sku": "MH-1734", "brand": "Carrera", "model": "VICTORY C 04 003", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-VICTORY-C-04-003-671292.html"},
    {"sku": "MH-253", "brand": "Tommy Hilfiger", "model": "TH2046 IPQ", "url": None, "notes": "Not found on major retailers"},
    {"sku": "MH-1721", "brand": "Carrera", "model": "344 2M2", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-344-2M2-693478.html"},
    {"sku": "MH-1719", "brand": "Polo Ralph Lauren", "model": "PH 2212 5303", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polo-Ralph-Lauren/Polo-Ralph-Lauren-PH2212-5303-476257.html"},
    {"sku": "MH-192", "brand": "Ray-Ban", "model": "RB3579-N 9035/1U", "url": "https://www.framesdirect.com/ray-ban-rb3579n-blaze-sunglasses"},
    {"sku": "MH-1511", "brand": "Tommy Hilfiger", "model": "TH1891 807", "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH-1891-807-590586.html"},
    {"sku": "MH-1738", "brand": "Arnette", "model": "AN4332 SATURNY 29217J", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Arnette/Arnette-AN4332-Saturnya-29217J-660131.html"},
    {"sku": "MH-1448", "brand": "Levi's", "model": "LV1042 J5G", "url": None, "notes": "Not found on SBG/FramesDirect"},
    {"sku": "MH-9", "brand": "Oakley", "model": "OX8156-0256 MATTE BROWN TORTOISE", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Oakley/Oakley-OX8156-HOLBROOK-RX-815602-434179.html"},
    {"sku": "MH-263", "brand": "Carrera", "model": "291 R80", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-291-R80-611120.html"},
    {"sku": "MH-51", "brand": "Vogue", "model": "VO 4298-T 5191", "url": "https://www.framesdirect.com/vogue-vo4298t-eyeglasses"},
    {"sku": "MH-66", "brand": "Ralph Lauren", "model": "PH 2257U 5407", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polo-Ralph-Lauren/Polo-Ralph-Lauren-PH2257U-5407-617035.html"},
    {"sku": "MH-64", "brand": "Vogue", "model": "VO5404S 297273", "url": "https://www.smartbuyglasses.de/designer-sonnenbrillen/Vogue-Eyewear/Vogue-Eyewear-VO5404S-297273-583552.html"},
    {"sku": "MH-55", "brand": "Vogue", "model": "VO 5409S W65613", "url": "https://www.smartbuyglasses.com/designer-sunglasses/Vogue-Eyewear/Vogue-Eyewear-VO5409S-W4411-583578.html"},
    {"sku": "MH-258", "brand": "Carrera Ducati", "model": "CARDUC 010 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Carrera-Ducati/Carrera-Ducati-CARDUC-010-807-585005.html"},
    {"sku": "MH-259", "brand": "Carrera Ducati", "model": "CARDUC 010 OIT", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Carrera-Ducati/Carrera-Ducati-CARDUC-010-OIT-585006.html"},
    {"sku": "MH-507", "brand": "Dario Martini", "model": "DM716 COL.2", "url": None, "notes": "Not on major international retailers"},
    {"sku": "MH-1718", "brand": "Vogue", "model": "VO 5421 W44", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Vogue-Eyewear/Vogue-Eyewear-VO5421-W44-602385.html"},
    {"sku": "MH-212", "brand": "Seventh Street", "model": "7A 081 6LB", "url": None, "notes": "Not found on target retailers"},
    {"sku": "MH-243", "brand": "Polaroid", "model": "PLD D436 086", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D436-086-572197.html"},
    {"sku": "MH-224", "brand": "Polaroid", "model": "PLD D512 PJP", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D512-PJP-655793.html"},
    {"sku": "MH-464", "brand": "Puma", "model": "PU03470 002", "url": "https://www.framesdirect.com/puma-pu0347o-eyeglasses"},
    {"sku": "MH-1502", "brand": "Polaroid", "model": "PLD D389/G RHL", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D389G-RHL-539099.html"},
    {"sku": "MH-204", "brand": "Seventh Street", "model": "7A 108 086", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Seventh-Street/Seventh-Street-7A108-08A-631587.html"},
    {"sku": "MH-1503", "brand": "Polaroid", "model": "PLD D373 PJP", "url": None, "notes": "PJP colour not found; discontinued"},
    {"sku": "MH-1505", "brand": "Polaroid", "model": "PLD D379 900", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D379-900-513431.html"},
    {"sku": "MH-448", "brand": "La Martina", "model": "MAV749 COL.16", "url": None, "notes": "Not on international retailers"},
    {"sku": "MH-449", "brand": "La Martina", "model": "MAV720 COL.12", "url": None, "notes": "Not on international retailers"},
    {"sku": "MH-506", "brand": "Dario Martini", "model": "DM 796 COL.2", "url": None, "notes": "Not on major international retailers"},
    {"sku": "MH-1466", "brand": "S.T. Dupont", "model": "DP-3985 C2", "url": None, "notes": "Not found on major retailers"},
    {"sku": "MH-1467", "brand": "S.T. Dupont", "model": "Titanium2104", "url": None, "notes": "Not found online"},
    # STANDARD TIER
    {"sku": "MH-1779", "brand": "Cartier", "model": "CT0563S C2", "url": None, "notes": "Not found as optical frame on retailers"},
    {"sku": "MH-1780", "brand": "Cartier", "model": "30104 C9", "url": None, "notes": "Model number not indexed anywhere"},
    {"sku": "MH-131", "brand": "Polaroid", "model": "PLD D490/G J5G", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D490G-J5G-634108.html"},
    {"sku": "MH-220", "brand": "Polaroid", "model": "PLD D508/G J5G", "url": "https://lookeronline.com/products/polaroid-d508-g-j5g"},
    {"sku": "MH-221", "brand": "Polaroid", "model": "PLD D451 J5G", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D451-J5G-591488.html"},
    {"sku": "MH-249", "brand": "Polaroid", "model": "PLD D459/G 807", "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Polaroid/Polaroid-PLD-D459G-807-591519.html"},
    {"sku": "MH-1471", "brand": "Hackett Bespoke", "model": "HEB306 190", "url": "https://www.edel-optics.com/306-190-by-Hackett.html"},
    {"sku": "MH-414", "brand": "Daniel Hechter", "model": "DHM378-3", "url": None, "notes": "Not found on any authorised retailer"},
    {"sku": "MH-1476", "brand": "Sandro", "model": "SD3017 940", "url": "https://designershadesdirect.com/en-us/products/sandro-glasses-frames-sd3017-940-56"},
    {"sku": "MH-1480", "brand": "Daniel Hechter", "model": "DHM193-7", "url": None, "notes": "Not found online"},
    {"sku": "MH-1481", "brand": "Daniel Hechter", "model": "DHM340-2", "url": "https://www.selectspecs.com/glasses/daniel-hechter/dhm340/ss2724.08.html"},
    {"sku": "MH-1482", "brand": "Daniel Hechter", "model": "DHM281-7", "url": None, "notes": "Not found online"},
    {"sku": "MH-1483", "brand": "Daniel Hechter", "model": "DHP614-2", "url": None, "notes": "Not found online"},
    {"sku": "MH-1485", "brand": "Ted Baker", "model": "Damon TB4343 562", "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB4343-562-619095.html"},
    {"sku": "MH-1486", "brand": "Ted Baker", "model": "Morris TB4328 667", "url": "https://www.designerglasses.co.uk/product/ted-baker-tb4328-morris/"},
    {"sku": "MH-1491", "brand": "Ted Baker", "model": "Dawson TB4344 002", "url": "https://pretavoir.us/products/ted-baker-dawson-4344-002"},
    {"sku": "MH-1494", "brand": "Ted Baker", "model": "Archer TB8219 351", "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB8219-Archer-351-501200.html"},
    {"sku": "MH-1496", "brand": "Ted Baker", "model": "Vincent TB2323 104", "url": "https://www.burghleyandco.uk/products/ted-baker-optical-frame-tb2323-104-55"},
    {"sku": "MH-242", "brand": "Polaroid", "model": "PLD D448 ZX9", "url": "https://optimaloptic.com/prescription-glasses/polaroid-pld-d448-zx9.html"},
    {"sku": "MH-172", "brand": "Carolina Herrera", "model": "HER 0150 086", "url": "https://pretavoir.us/collections/welcomediscount/products/carolina-herrera-her-0150-086"},
    {"sku": "MH-228", "brand": "Polaroid", "model": "PLD D482 086", "url": "https://www.smartbuyglasses.co.uk/designer-eyeglasses/Polaroid/Polaroid-PLD-D482-086-634078.html"},
    {"sku": "MH-215", "brand": "Polaroid", "model": "PLD D488 807", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D488-Polarized-807-638181.html"},
    {"sku": "MH-367", "brand": "Macruona", "model": "D3333 C5", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-328", "brand": "Macruona", "model": "MB1402-A C5", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-393", "brand": "Macruona", "model": "SH9103 C4", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-355", "brand": "Macruona", "model": "XL110 C3", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-370", "brand": "Macruona", "model": "TA9067 C5", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-396", "brand": "Macruona", "model": "MG3850 C5", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-327", "brand": "Macruona", "model": "TA9066 C4", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-351", "brand": "Macruona", "model": "8604 C3", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-354", "brand": "Macruona", "model": "8592 C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-1460", "brand": "Tommy Hilfiger", "model": "TH1948 COL.03", "url": "https://www.framesdirect.com/tommy-hilfiger-th-1948-eyeglasses"},
    {"sku": "MH-361", "brand": "Macruona", "model": "D3337 C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-372", "brand": "Macruona", "model": "D3337 C2", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-399", "brand": "Macruona", "model": "9869 C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-343", "brand": "Macruona", "model": "MG6557A C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-358", "brand": "Macruona", "model": "TA9067 C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-360", "brand": "Macruona", "model": "HC-16068 C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-398", "brand": "Macruona", "model": "PY-526 C8", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-344", "brand": "Macruona", "model": "MB1403 C4", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-357", "brand": "Macruona", "model": "TA9067 C4", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-406", "brand": "Macruona", "model": "TA9068 C2", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-574", "brand": "Guess", "model": "GU2879 028", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Guess/Guess-GU2879-028-595226.html"},
    {"sku": "MH-576", "brand": "Guess", "model": "GU2878 071", "url": "https://www.framesdirect.com/guess-gu2878-eyeglasses"},
    {"sku": "MH-350", "brand": "Macruona", "model": "8563 C3", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-337", "brand": "Macruona", "model": "8563 C2", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-338", "brand": "Macruona", "model": "8563 C1", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-551", "brand": "Pepe Jeans", "model": "PJ1301 C4 TOPSY", "url": "https://www.rxframesnlenses.com/pepe-jeans-pj-1301-topsy.html"},
    {"sku": "MH-569", "brand": "Sandro", "model": "SD6018 118", "url": None, "notes": "Not found on any retailer"},
    {"sku": "MH-573", "brand": "GF Ferre", "model": "GFF 0164 005", "url": None, "notes": "Not found on authorised retailers"},
    {"sku": "MH-1405", "brand": "Columbia", "model": "C8036 022", "url": "https://www.framesdirect.com/columbia-c8036-eyeglasses"},
    {"sku": "MH-1400", "brand": "Columbia", "model": "C3016 201", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Columbia/Columbia-C3016-201-436092.html"},
    {"sku": "MH-1403", "brand": "Columbia", "model": "C3015 072", "url": "https://www.framesdirect.com/columbia-c3015-eyeglasses"},
    # BUDGET TIER
    {"sku": "MH-1584", "brand": "Tiffany & Co", "model": "TF6138 001", "url": None, "notes": "Discontinued - not in current catalog"},
    {"sku": "MH-1399", "brand": "Cole Haan", "model": "CH4045 971 CRYSTAL", "url": "https://www.framesdirect.com/cole-haan-ch4045-eyeglasses"},
    {"sku": "MH-331", "brand": "Macruona", "model": "MR01-02 C.03", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-330", "brand": "Macruona", "model": "MR01-01 C.01H", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-1371", "brand": "Swarovski", "model": "SW1028 16W", "url": None, "notes": "Discontinued SW-prefix model"},
    {"sku": "MH-1372", "brand": "Swarovski", "model": "SW1028 18M", "url": None, "notes": "Discontinued SW-prefix model"},
    {"sku": "MH-1378", "brand": "Menrad", "model": "MOD.14111 2100", "url": None, "notes": "Not found on international retailers"},
    {"sku": "MH-1380", "brand": "Linda Farrow", "model": "LFL/351/2", "url": None, "notes": "Not found on authorised retailers"},
    {"sku": "MH-1381", "brand": "Linda Farrow", "model": "LFL/351/4", "url": None, "notes": "Not found on authorised retailers"},
    {"sku": "MH-400", "brand": "Macruona", "model": "FE06-12 C.01", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-362", "brand": "Macruona", "model": "FE06-12 C.03", "url": None, "notes": "Local brand - manual photo"},
    {"sku": "MH-1595", "brand": "Gentle Monster", "model": "LOVE PUNCH COL.02", "url": "https://www.fwrd.com/product-gentle-monster-love-punch-sunglasses-in-silver-titanium-mirror/GMON-UG4/"},
    {"sku": "MH-1596", "brand": "Gentle Monster", "model": "OLLIE COL.PC3", "url": "https://www.farfetch.com/ca/shopping/women/gentle-monster-ollie-pc3-sunglasses-item-13408477.aspx"},
    {"sku": "MH-589", "brand": "Eyezen", "model": "HD0116 FINN GUN", "url": "https://www.fostergrant.com/store/digital-glasses/eyezen/finn"},
    {"sku": "MH-591", "brand": "Eyezen", "model": "HD0116 TIBBY BRY", "url": "https://www.londondrugs.com/foster-grant-eyezen-tibby-digital-glasses/L6295695.html"},
    {"sku": "MH-1377", "brand": "Joseph Marc", "model": "ENGLER IG1803 HAVANA", "url": "https://www.clearly.ca/glasses/joseph-marc/joseph-marc-engler-54"},
    {"sku": "MH-1651", "brand": "M&H", "model": "BS1003 C9", "url": None, "notes": "In-house brand - manual photo needed"},
    {"sku": "MH-1654", "brand": "M&H", "model": "FD8819 C2", "url": None, "notes": "In-house brand - manual photo needed"},
    {"sku": "MH-1729", "brand": "Polaroid", "model": "PLD 0036/R/BB 086", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-0036RBB-Blue-Light-Block-086G6-655659.html"},
    {"sku": "MH-1730", "brand": "Polaroid", "model": "PLD 0035/R/BB PJP", "url": "https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-0035-R-BB-with-Blue-Light-Block-PJP-G6-666151.html"},
]


def build_cdn_urls(sbg_url):
    """Build SmartBuyGlasses CDN image URLs from product page URL."""
    filename = sbg_url.split("/")[-1].replace(".html", "")
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
        ct = resp.headers.get("Content-Type", "")
        if resp.status_code == 200 and ("image" in ct or url.endswith((".jpg", ".png", ".webp"))):
            with open(save_path, "wb") as f:
                for chunk in resp.iter_content(8192):
                    f.write(chunk)
            size = os.path.getsize(save_path)
            if size < 1000:  # too small = probably an error page
                os.remove(save_path)
                return False
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
            src = og["content"]
            if not src.startswith("http"):
                src = "https:" + src
            return src
        # Fallback: main product image
        for sel in (".product-image img", ".product__image img", "#main-image", ".product-photo img"):
            img = soup.select_one(sel)
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
        save_path = os.path.join(OUTPUT_DIR, f"{sku}.jpg")

        if os.path.exists(save_path):
            print(f"[SKIP] {sku} already downloaded")
            skip_count += 1
            report.append({"sku": sku, "status": "skipped", "file": save_path})
            continue

        if not frame.get("url"):
            note = frame.get("notes", "No URL - manual photo required")
            print(f"[MANUAL] {sku} — {note}")
            skip_count += 1
            report.append({"sku": sku, "status": "manual", "notes": note,
                            "brand": frame["brand"], "model": frame["model"]})
            continue

        page_url = frame["url"]
        success = False

        # Strategy 1: SmartBuyGlasses CDN direct image URL
        if "smartbuyglasses.com" in page_url:
            for cdn_url in build_cdn_urls(page_url):
                if download_image(cdn_url, save_path, session):
                    print(f"[CDN] {sku} ✓")
                    report.append({"sku": sku, "status": "ok", "source": cdn_url})
                    success = True
                    found_count += 1
                    break

        # Strategy 2: Fetch product page → og:image
        if not success:
            img_url = get_og_image(page_url, session)
            if img_url and download_image(img_url, save_path, session):
                print(f"[OG]  {sku} ✓  ({img_url[:60]})")
                report.append({"sku": sku, "status": "ok", "source": img_url})
                success = True
                found_count += 1

        if not success:
            print(f"[FAIL] {sku} — {page_url[:70]}")
            report.append({"sku": sku, "status": "failed", "url": page_url,
                            "brand": frame["brand"], "model": frame["model"]})
            fail_count += 1

        time.sleep(0.5)

    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n{'='*55}")
    print(f"COMPLETE: {found_count} downloaded | {skip_count} skipped/manual | {fail_count} failed")
    print(f"Images → ./{OUTPUT_DIR}/   Report → ./{REPORT_FILE}")

    manual = [r for r in report if r["status"] == "manual"]
    failed = [r for r in report if r["status"] == "failed"]
    need_manual = manual + failed
    if need_manual:
        print(f"\n── {len(need_manual)} frames need manual photos ──")
        for r in need_manual:
            print(f"  {r['sku']} — {r.get('brand','')} {r.get('model','')}")
        print("\nName each photo MH-{ProductId}.jpg and place in frame_images/")


if __name__ == "__main__":
    main()
