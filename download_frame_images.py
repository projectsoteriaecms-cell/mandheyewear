#!/usr/bin/env python3
"""
M&H Frame Image Downloader — all 162 products
Run on your local Windows machine:
  pip install requests beautifulsoup4
  python download_frame_images.py

Images saved to ./frame_images/ as MH-{ProductId}.jpg
Re-run safely — already-downloaded files are skipped.
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
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}

# 162 frames with ordered URL fallbacks (non-SBG sources first)
FRAMES = [
    # LUXURY TIER
    {"sku": "MH-1793", "brand": "Cartier", "model": "CT0344O 003", "urls": ['https://pretavoir.us/products/cartier-ct0344o-003', 'https://www.eyespecs.com/Cartier-Core-Range-CT0344O-Eyeglasses-Rimless-Rectangle-Shape-531660400.html', 'https://hallofframescompany.com/products/ct0344o-003']},
    {"sku": "MH-471", "brand": "Cartier", "model": "C34C38MJ", "urls": [], "notes": "Model code C34C38MJ not found on any authorized retailer site searched. Possible"},
    {"sku": "MH-474", "brand": "Cartier", "model": "CT0349O 001 Titanium", "urls": [], "notes": "CT0349O 001 titanium not found on smartbuyglasses.com or framesdirect.com. Not r"},
    {"sku": "MH-183", "brand": "Tiffany & Co", "model": "TF4197 8001/S4", "urls": ['https://pretavoir.us/products/tiffany-tf4197-8001s4', 'https://www.eyeons.com/tiffany-tf4197-8001s4-62-black', 'https://en.smartbuyglasses.ch/designer-sunglasses/Tiffany-&-Co./Tiffany-&-Co.-TF4197-8001S4-628071.html']},
    {"sku": "MH-460", "brand": "Gucci", "model": "GG1221O 002", "urls": ['https://www.framesdirect.com/gucci-gg1221o-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1221O-002-610522.html']},
    {"sku": "MH-1699", "brand": "Gucci", "model": "GG1504O 006", "urls": ['https://pretavoir.us/products/gucci-gg1504o-006', 'https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1504O-006-668965.html']},
    {"sku": "MH-1703", "brand": "Gucci", "model": "GG1438O 003", "urls": [], "notes": "GG1438O 003 not found on smartbuyglasses.com or framesdirect.com. Only 001 (blac"},
    {"sku": "MH-320", "brand": "Burberry", "model": "BE4406U 3001/87", "urls": ['https://www.framesdirect.com/burberry-be4406u-sunglasses', 'https://www.smartbuyglasses.com/designer-sunglasses/Burberry/Burberry-BE4406U-300187-660312.html']},
    {"sku": "MH-457", "brand": "Gucci", "model": "GG1219O 001", "urls": ['https://pretavoir.us/products/gucci-gg1219o-001', 'https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1219O-001-610518.html']},
    {"sku": "MH-1693", "brand": "Gucci", "model": "GG1497O 006", "urls": ['https://pretavoir.us/products/gucci-gg1497o-006', 'https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1497O-006-668953.html']},
    {"sku": "MH-1704", "brand": "Gucci", "model": "GG1303O 006", "urls": ['https://www.framesdirect.com/gucci-gg1303o-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Gucci/Gucci-GG1303O-006-641882.html']},
    {"sku": "MH-426", "brand": "Tom Ford", "model": "FT5040-B 001", "urls": ['https://www.framesdirect.com/tom-ford-blue-light-collection-ft5040-b-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Tom-Ford/Tom-Ford-FT5040-B-Blue-Light-Block-001-661805.html']},
    {"sku": "MH-319", "brand": "Prada", "model": "PR A52V 01U1O1", "urls": ['https://www.otticasm.com/en/eyeglasses-prada-pr-a52v-01u1o1.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-A52V-01U1O1-667639.html']},
    {"sku": "MH-90", "brand": "Versace", "model": "VE4445 GB1/M1", "urls": ['https://www.otticasm.com/en/sunglasses-versace-ve-4445-gb1-m1.html', 'https://www.smartbuyglasses.com/designer-sunglasses/Versace/Versace-VE4445-GB1M1-634769.html']},
    {"sku": "MH-188", "brand": "Versace", "model": "VE4458 GB1/87", "urls": ['https://designeroptics.com/products/versace-4458-sunglasses', 'https://www.smartbuyglasses.com/designer-sunglasses/Versace/Versace-VE4458-GB187-658282.html']},
    {"sku": "MH-202", "brand": "Marc Jacobs", "model": "MJ 1091/N/S 06JIB", "urls": ['https://pretavoir.us/products/marc-jacobs-mj-1091ns-06jib-with-detachable-chain']},
    {"sku": "MH-1739", "brand": "Jimmy Choo", "model": "JC3004B 5013", "urls": [], "notes": "JC3004B 5013 color not found on smartbuyglasses.com. Nearby colors 5000 and 5002"},
    {"sku": "MH-314", "brand": "Prada", "model": "PR 58ZV 17I1O1", "urls": ['https://pretavoir.us/products/prada-pr-58zv-17i1o1', 'https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-58ZV-17I1O1-644632.html']},
    {"sku": "MH-323", "brand": "Dolce & Gabbana", "model": "DG3376B 502", "urls": ['https://www.framesdirect.com/dolce-gabbana-dg3376b-eyeglasses']},
    {"sku": "MH-83", "brand": "Prada", "model": "PR 09ZV 08Q1O1", "urls": ['https://pretavoir.us/products/prada-pr-09zv-1ab1o1', 'https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-09ZV-08Q1O1-674861.html']},
    {"sku": "MH-120", "brand": "Prada", "model": "PR 22ZV 16K1O1", "urls": ['https://pretavoir.us/products/prada-pr-22zv-16k1o1', 'https://www.eyespecs.com/Prada-PR-22ZV-Eyeglasses-Men-s-Full-Rim-Square-Shape-531670945.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Prada/Prada-PR-22ZV-16K1O1-644602.html']},
    {"sku": "MH-1722", "brand": "Burberry", "model": "BE2387 4096", "urls": ['https://www.framesdirect.com/burberry-be2387-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2387F-Asian-Fit-4096-679024.html']},
    {"sku": "MH-1748", "brand": "Cartier", "model": "CT0284O", "urls": ['https://pretavoir.us/products/cartier-ct0284o-002', 'https://www.eyeons.com/cartier-ct0284o']},
    {"sku": "MH-81", "brand": "Dolce & Gabbana", "model": "DG3376B 3420", "urls": ['https://www.framesdirect.com/dolce-gabbana-dg3376b-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Dolce-&-Gabbana/Dolce-Gabbana-DG3376B-3420-656091.html']},
    {"sku": "MH-1740", "brand": "Burberry", "model": "BE2403 4119", "urls": ['https://www.framesdirect.com/burberry-be2403-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2403-4119-679030.html']},
    {"sku": "MH-1744", "brand": "Moschino", "model": "MOS637 807", "urls": ['https://pretavoir.us/products/moschino-mos-637-807', 'https://www.smartbuyglasses.ie/designer-eyeglasses/Moschino/Moschino-MOS637-807-695501.html']},
    {"sku": "MH-1745", "brand": "Dsquared2", "model": "D2 0102 3YG", "urls": ['https://www.fashioneyewear.com/en-us/products/dsquared2-d2-0102', 'https://www.smartbuyglasses.it/occhiali-da-vista/Dsquared2/Dsquared2-D2-0102-3YG-691835.html']},
    {"sku": "MH-1731", "brand": "Marc Jacobs", "model": "MARC848 2M2", "urls": ['https://designeroptics.com/products/marc-jacobs-marc848-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Marc-Jacobs/Marc-Jacobs-MARC-848-2M2-702725.html']},
    {"sku": "MH-1742", "brand": "David Beckham", "model": "DB 7020/BOLD 807", "urls": ['https://pretavoir.us/products/david-beckham-db-7020bold-807', 'https://www.smartbuyglasses.com/designer-eyeglasses/David-Beckham/David-Beckham-DB-7020BOLD-807-589588.html']},
    {"sku": "MH-91", "brand": "Giorgio Armani", "model": "AR7230U 5914", "urls": ['https://www.framesdirect.com/giorgio-armani-ar7230u-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Giorgio-Armani/Giorgio-Armani-AR7230U-5914-659501.html']},
    {"sku": "MH-93", "brand": "Miu Miu", "model": "MU06VV 1AB1O1", "urls": ['https://www.otticasm.com/en/eyeglasses-miu-miu-mu-06vv-1ab1o1.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Miu-Miu/Miu-Miu-MU06VV-1AB1O1-637001.html']},
    {"sku": "MH-1724", "brand": "Versace", "model": "VE3339U 5406", "urls": ['https://www.framesdirect.com/versace-ve3339u-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3339U-5406-634745.html']},
    {"sku": "MH-96", "brand": "Versace", "model": "VE3338 GB1", "urls": ['https://www.framesdirect.com/versace-ve3338-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3338-GB1-634739.html']},
    {"sku": "MH-98", "brand": "Versace", "model": "VE3346 148", "urls": ['https://www.framesdirect.com/versace-ve3346-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3346-148-658253.html']},
    {"sku": "MH-1510", "brand": "Hugo", "model": "HG1257 1ED", "urls": [], "notes": "HG1257 1ED not found on smartbuyglasses.com or framesdirect.com. Found on ottica"},
    {"sku": "MH-104", "brand": "Burberry", "model": "BE1376 VIRGINIA 1340", "urls": ['https://pretavoir.us/products/burberry-virginia-be1376-1340', 'https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE1376-VIRGINIA-Asian-Fit-1340-641633.html']},
    {"sku": "MH-470", "brand": "Dunhill", "model": "DU0038OA 003", "urls": ['https://designeroptics.com/products/dunhill-du0038oa-eyeglasses', 'https://pretavoir.us/products/dunhill-du0038oa-001', 'https://selecteyewear.com/products/dunhill-du0038oa']},
    {"sku": "MH-1720", "brand": "Clary Gray", "model": "DAKARIAN CNG14 24K", "urls": [], "notes": "DAKARIAN CNG14 24K specific product page not found. Clary Gray eyeglasses availa"},
    {"sku": "MH-1692", "brand": "Mont Blanc", "model": "MB0266O 005", "urls": ['https://www.framesdirect.com/mont-blanc-mb0266o-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Montblanc/Mont-Blanc-MB0266O-005-619726.html']},
    {"sku": "MH-1696", "brand": "Saint Laurent", "model": "SL 699 006", "urls": ['https://pretavoir.us/products/saint-laurent-sl-699-006', 'https://www.smartbuyglasses.com/designer-eyeglasses/Saint-Laurent/Saint-Laurent-SL-699-Asian-Fit-006-668763.html']},
    {"sku": "MH-453", "brand": "Mont Blanc", "model": "MB0199OA 006", "urls": ['https://www.framesdirect.com/mont-blanc-mb0199oa-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Mont-Blanc/Mont-Blanc-MB0199OA-Asian-Fit-006-573756.html']},
    {"sku": "MH-1694", "brand": "Saint Laurent", "model": "SL 379/F SLIM 001", "urls": ['https://gaffos.com/products/saint-laurent-sl-379f-slim-001-rectangle-metal-silver-eyeglasses-with-demo-lens', 'https://www.eyeons.com/saint-laurent-sl-379-f-slim-028-54-silver']},
    {"sku": "MH-17", "brand": "Oakley", "model": "OO9242 HSTN 0552", "urls": ['https://www.framesdirect.com/oakley-hstn-sunglasses', 'https://www.smartbuyglasses.com/designer-sunglasses/Oakley/Oakley-OO9242-HSTN-924201-639464.html']},
    {"sku": "MH-504", "brand": "Dario Martini", "model": "DM 822 COL.1", "urls": ['https://www.hovinaglasses.com/product/dario-martini-dm-822-col-1-eyeglasses/', 'https://mandheyewear.com/product/dario-martini/']},
    # PREMIUM TIER
    {"sku": "MH-111", "brand": "Dolce & Gabbana", "model": "DG5101 501", "urls": ['https://www.framesdirect.com/dolce-gabbana-dg5101-eyeglasses']},
    {"sku": "MH-1506", "brand": "Hugo", "model": "HG1359 807", "urls": ['https://www.otticasm.com/en/eyeglasses-hugo-hg-1359-109463-807.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/HUGO/HUGO-HG-1359-807-708826.html']},
    {"sku": "MH-79", "brand": "Burberry", "model": "B2347 3943", "urls": ['https://www.framesdirect.com/burberry-be2347-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Burberry/Burberry-BE2347-EVELYN-3943-580423.html']},
    {"sku": "MH-1747", "brand": "Cartier", "model": "CT00630 55-18-135", "urls": ['https://solsticesunglasses.com/products/cartier-ct0063o-ct0063o', 'https://www.coolframes.ca/glasses/cartier-eyewear/ct0063o-eyeglasses.html']},
    {"sku": "MH-74", "brand": "Versace", "model": "MOD 3327 5381", "urls": ['https://designeroptics.com/products/versace-3327u-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Versace/Versace-VE3327U-5381-616641.html']},
    {"sku": "MH-1512", "brand": "Tommy Hilfiger", "model": "TH2072 KB7", "urls": [], "notes": "TH2072 KB7 not found on SmartBuyGlasses or FramesDirect; similar KB7 models exis"},
    {"sku": "MH-250", "brand": "Tommy Hilfiger", "model": "TH 1892 KB7", "urls": ['https://www.framesdirect.com/tommy-hilfiger-th-1892-eyeglasses', 'https://www.smartbuyglasses.co.za/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH-1892-KB7-590593.html']},
    {"sku": "MH-106", "brand": "Ray-Ban", "model": "RB3625 NEW AVIATOR 003/3M", "urls": ['https://www.framesdirect.com/ray-ban-rb3625-sunglasses', 'https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB3625-New-Aviator-0033M-657937.html']},
    {"sku": "MH-1444", "brand": "Tommy Hilfiger", "model": "TH2049 003", "urls": ['https://www.framesdirect.com/tommy-hilfiger-th-2049-eyeglasses']},
    {"sku": "MH-1446", "brand": "Tommy Hilfiger", "model": "TH1962 000", "urls": ['https://www.framesdirect.com/tommy-hilfiger-th-1962-eyeglasses']},
    {"sku": "MH-162", "brand": "Tommy Hilfiger", "model": "TH 1990 PJP", "urls": ['https://designeroptics.com/products/tommy-hilfiger-th1990-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH-1990-PJP-643287.html']},
    {"sku": "MH-107", "brand": "Ray-Ban", "model": "RB3025 9202/31", "urls": ['https://www.framesdirect.com/ray-ban-rb3025-large-metal-aviator-sunglasses', 'https://www.smartbuyglasses.com/designer-sunglasses/Ray-Ban/Ray-Ban-RB3025-Aviator-Large-Metal-Asian-Fit-920231-632757.html']},
    {"sku": "MH-1443", "brand": "Pierre Cardin", "model": "P.C.8875 J5G", "urls": [], "notes": "P.C.8875 J5G not found on SmartBuyGlasses or FramesDirect; similar J5G Pierre Ca"},
    {"sku": "MH-1733", "brand": "Carrera", "model": "VICTORY C 06 807", "urls": ['https://www.framesdirect.com/eyeglasses/carrera', 'https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-VICTORY-C-06-8072Y-693535.html']},
    {"sku": "MH-1734", "brand": "Carrera", "model": "VICTORY C 04 003", "urls": ['https://www.framesdirect.com/carrera-victory-c-04-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-VICTORY-C-04-003-671292.html']},
    {"sku": "MH-253", "brand": "Tommy Hilfiger", "model": "TH2046 IPQ", "urls": [], "notes": "TH2046 IPQ not found on SmartBuyGlasses or FramesDirect specifically"},
    {"sku": "MH-1721", "brand": "Carrera", "model": "344 2M2", "urls": ['https://www.framesdirect.com/carrera-ca-344-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-344-2M2-693478.html']},
    {"sku": "MH-1719", "brand": "Polo Ralph Lauren", "model": "PH 2212 5303", "urls": ['https://www.framesdirect.com/polo-ph2212-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polo-Ralph-Lauren/Polo-Ralph-Lauren-PH2212-5303-476257.html']},
    {"sku": "MH-192", "brand": "Ray-Ban", "model": "RB3579-N 9035/1U", "urls": ['https://www.framesdirect.com/ray-ban-rb3579n-blaze-sunglasses']},
    {"sku": "MH-1511", "brand": "Tommy Hilfiger", "model": "TH1891 807", "urls": ['https://www.quivedo.com/en/tommy-hilfiger-th-1891-105660-807', 'https://www.smartbuyglasses.co.uk/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH-1891-807-590586.html']},
    {"sku": "MH-1738", "brand": "Arnette", "model": "AN 4332 SATURNY 29217J", "urls": ['https://www.coolframes.com/glasses/arnette-eyewear/an4332-saturnya-designer-sunglasses.html', 'https://www.smartbuyglasses.com/designer-sunglasses/Arnette/Arnette-AN4332-Saturnya-29217J-660131.html']},
    {"sku": "MH-1448", "brand": "Levi's", "model": "LV1042 J5G", "urls": [], "notes": "LV1042 J5G not found on SmartBuyGlasses or FramesDirect; found on selectspecs.co"},
    {"sku": "MH-9", "brand": "Oakley", "model": "OX8156-0256 MATTE BROWN TORTOISE", "urls": ['https://www.framesdirect.com/oakley-holbrook-rx-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Oakley/Oakley-OX8156-HOLBROOK-RX-815602-434179.html']},
    {"sku": "MH-263", "brand": "Carrera", "model": "291 R80", "urls": ['https://www.framesdirect.com/carrera-carrera-291-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Carrera/Carrera-291-R80-611120.html']},
    {"sku": "MH-51", "brand": "Vogue", "model": "VO 4298-T 5191", "urls": ['https://www.framesdirect.com/vogue-vo4298t-eyeglasses']},
    {"sku": "MH-66", "brand": "Ralph Lauren", "model": "PH 2257U 5407", "urls": ['https://www.framesdirect.com/polo-ph2257u-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polo-Ralph-Lauren/Polo-Ralph-Lauren-PH2257U-5407-617035.html']},
    {"sku": "MH-64", "brand": "Vogue", "model": "VO5404S 297273", "urls": ['https://www.otticasm.com/en/sunglasses-vogue-vo-5404s-297273.html', 'https://www.smartbuyglasses.de/designer-sonnenbrillen/Vogue-Eyewear/Vogue-Eyewear-VO5404S-297273-583552.html']},
    {"sku": "MH-55", "brand": "Vogue", "model": "VO 5409S W65613", "urls": ['https://www.otticasm.com/en/sunglasses-vogue-vo-5409s-w65613.html', 'https://www.smartbuyglasses.com/designer-sunglasses/Vogue-Eyewear/Vogue-Eyewear-VO5409S-W4411-583578.html']},
    {"sku": "MH-258", "brand": "Carrera Ducati", "model": "CARDUC 010 807", "urls": ['https://www.quivedo.com/en/carrera-ducati-carduc-010-105959-807', 'https://www.smartbuyglasses.com/designer-eyeglasses/Carrera-Ducati/Carrera-Ducati-CARDUC-010-807-585005.html']},
    {"sku": "MH-259", "brand": "Carrera Ducati", "model": "CARDUC 010 OIT", "urls": ['https://pretavoir.us/products/carrera-x-ducati-carduc-010-oit', 'https://www.smartbuyglasses.com/designer-eyeglasses/Carrera-Ducati/Carrera-Ducati-CARDUC-010-OIT-585006.html']},
    {"sku": "MH-507", "brand": "Dario Martini", "model": "DM716 COL.2", "urls": [], "notes": "DM716 COL.2 not found on SmartBuyGlasses, FramesDirect, or glasses.com; brand no"},
    {"sku": "MH-1718", "brand": "Vogue", "model": "VO 5421 W44", "urls": ['https://www.framesdirect.com/vogue-vo5421-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Vogue-Eyewear/Vogue-Eyewear-VO5421-W44-602385.html']},
    {"sku": "MH-212", "brand": "Seventh Street", "model": "7A 081 6LB", "urls": [], "notes": "7A 081 6LB not found on SmartBuyGlasses or FramesDirect; found on SelectSpecs bu"},
    {"sku": "MH-243", "brand": "Polaroid", "model": "PLD D436 086", "urls": ['https://lookeronline.com/products/polaroid-d436-086', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D436-086-572197.html']},
    {"sku": "MH-224", "brand": "Polaroid", "model": "PLD D512 PJP", "urls": ['https://www.coolframes.com/glasses/polaroid-core-eyewear/pld-d512-unisex-mens-womens-eyeglasses.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D512-PJP-655793.html']},
    {"sku": "MH-464", "brand": "Puma", "model": "PU03470 002", "urls": ['https://www.framesdirect.com/puma-pu0347o-eyeglasses']},
    {"sku": "MH-1502", "brand": "Polaroid", "model": "PLD D389/G RHL", "urls": ['https://lookeronline.com/products/polaroid-d389-g-rhl', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D389G-RHL-539099.html']},
    {"sku": "MH-204", "brand": "Seventh Street", "model": "7A 108 086", "urls": ['https://www.edel-optics.com/7A-108-086-by-Seventh-Street.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Seventh-Street/Seventh-Street-7A108-08A-631587.html']},
    {"sku": "MH-1503", "brand": "Polaroid", "model": "PLD D373 PJP", "urls": [], "notes": "PLD D373 PJP not found on SmartBuyGlasses or FramesDirect; D373 exists in 086 an"},
    {"sku": "MH-1505", "brand": "Polaroid", "model": "PLD D379 900", "urls": ['https://www.otticasm.com/en/eyeglasses-polaroid-pld-d379-103199-900.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D379-900-513431.html']},
    {"sku": "MH-448", "brand": "La Martina", "model": "MAV749 COL.16", "urls": [], "notes": "La Martina MAV749 COL.16 not found on SmartBuyGlasses or FramesDirect; brand not"},
    {"sku": "MH-449", "brand": "La Martina", "model": "MAV720 COL.12", "urls": [], "notes": "La Martina MAV720 COL.12 not found on SmartBuyGlasses or FramesDirect; brand not"},
    {"sku": "MH-506", "brand": "Dario Martini", "model": "DM 796 COL.2", "urls": [], "notes": "DM 796 COL.2 not found on SmartBuyGlasses, FramesDirect, or glasses.com; brand n"},
    {"sku": "MH-1466", "brand": "S.T. Dupont", "model": "DP-3985 C2", "urls": [], "notes": "S.T. Dupont DP-3985 C2 not found on SmartBuyGlasses or FramesDirect; brand exist"},
    {"sku": "MH-1467", "brand": "S.T. Dupont", "model": "Titanium2104", "urls": [], "notes": "S.T. Dupont Titanium 2104 not found on SmartBuyGlasses or FramesDirect"},
    # STANDARD TIER
    {"sku": "MH-1779", "brand": "Cartier", "model": "CT0563S C2", "urls": [], "notes": "CT0563S (sunglasses) not found as optical/eyeglass frame on authorised retailers"},
    {"sku": "MH-1780", "brand": "Cartier", "model": "30104 C9", "urls": [], "notes": "Cartier 30104 C9 not found on any authorised retailer website. Model number not "},
    {"sku": "MH-131", "brand": "Polaroid", "model": "PLD D490/G J5G", "urls": ['https://www.quivedo.com/en/polaroid-pld-d490-g-106894-j5g', 'https://www.visio-net.com/eyeglasses/polaroid-pldd490g-j5g.html', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D490G-J5G-634108.html']},
    {"sku": "MH-220", "brand": "Polaroid", "model": "PLD D508/G J5G", "urls": ['https://lookeronline.com/products/polaroid-d508-g-j5g', 'https://www.eyeons.com/polaroid-pld-d508-g', 'https://www.visio-net.com/eyeglasses/polaroid-pldd508g-j5g.html']},
    {"sku": "MH-221", "brand": "Polaroid", "model": "PLD D451 J5G", "urls": ['https://lookeronline.com/products/polaroid-d451-j5g', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D451-J5G-591488.html']},
    {"sku": "MH-249", "brand": "Polaroid", "model": "PLD D459/G 807", "urls": ['https://www.fashioneyewear.com/en-us/products/polaroid-pld-d459-g', 'https://www.eyeons.com/products/polaroid-pld-d459-g', 'https://www.smartbuyglasses.co.uk/designer-eyeglasses/Polaroid/Polaroid-PLD-D459G-807-591519.html']},
    {"sku": "MH-1471", "brand": "Hackett Bespoke", "model": "HEB306 190", "urls": ['https://www.edel-optics.com/306-190-by-Hackett.html', 'https://www.edel-optics.com.mt/HEB306-190-by-Hackett.html']},
    {"sku": "MH-414", "brand": "Daniel Hechter", "model": "DHM378-3", "urls": [], "notes": "DHM378-3 specific page not returned in search results; closest match is DHM379 o"},
    {"sku": "MH-1476", "brand": "Sandro", "model": "SD3017 940", "urls": ['https://designershadesdirect.com/en-us/products/sandro-glasses-frames-sd3017-940-56', 'https://www.ebay.com/itm/226623172314', 'https://www.laparisienne-eyewear.com/products/sandro-optical-frame-sd3017-56900']},
    {"sku": "MH-1480", "brand": "Daniel Hechter", "model": "DHM193-7", "urls": [], "notes": "DHM193-7 not found on any authorised retailer website."},
    {"sku": "MH-1481", "brand": "Daniel Hechter", "model": "DHM340-2", "urls": ['https://www.selectspecs.com/glasses/daniel-hechter/dhm340/ss2724.08.html']},
    {"sku": "MH-1482", "brand": "Daniel Hechter", "model": "DHM281-7", "urls": [], "notes": "DHM281-7 not found on any authorised retailer website."},
    {"sku": "MH-1483", "brand": "Daniel Hechter", "model": "DHP614-2", "urls": [], "notes": "DHP614-2 not found on any authorised retailer website."},
    {"sku": "MH-1485", "brand": "Ted Baker", "model": "Damon TB4343 562", "urls": ['https://pretavoir.us/products/ted-baker-damon-4343-562', 'https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB4343-562-619095.html']},
    {"sku": "MH-1486", "brand": "Ted Baker", "model": "Morris TB4328 667", "urls": ['https://www.designerglasses.co.uk/product/ted-baker-tb4328-morris/']},
    {"sku": "MH-1491", "brand": "Ted Baker", "model": "Dawson TB4344 002", "urls": ['https://pretavoir.us/products/ted-baker-dawson-4344-002', 'https://www.fashioneyewear.com/en-us/products/ted-baker-dawson-tb4344', 'https://www.selectspecs.com/glasses/ted-baker-london/tb4344/ss2383.45.html']},
    {"sku": "MH-1494", "brand": "Ted Baker", "model": "Archer TB8219 351", "urls": ['https://discountedsunglasses.co.uk/products/ted-baker-glasses-frames-tb8219-archer-351-cognac-horn-men', 'https://www.fashioneyewear.com/en-us/products/ted-baker-archer-tb8219', 'https://www.smartbuyglasses.co.uk/designer-eyeglasses/Ted-Baker/Ted-Baker-TB8219-Archer-351-501200.html']},
    {"sku": "MH-1496", "brand": "Ted Baker", "model": "Vincent TB2323 104", "urls": ['https://www.burghleyandco.uk/products/ted-baker-optical-frame-tb2323-104-55', 'https://www.designerglasses.co.uk/product/ted-baker-tb2323-vincent/']},
    {"sku": "MH-242", "brand": "Polaroid", "model": "PLD D448 ZX9", "urls": ['https://optimaloptic.com/prescription-glasses/polaroid-pld-d448-zx9.html', 'https://www.amazon.com/Polaroid-Pld-D448-Unisex-Sunglasses/dp/B0FJ7MMCQX', 'https://www.edel-optics.ca/PLD-D448-ZX9-by-Polaroid.html']},
    {"sku": "MH-172", "brand": "Carolina Herrera", "model": "HER 0150 086", "urls": ['https://pretavoir.us/collections/welcomediscount/products/carolina-herrera-her-0150-086', 'https://solsticesunglasses.com/products/carolina-herrera-her-0150']},
    {"sku": "MH-228", "brand": "Polaroid", "model": "PLD D482 086", "urls": ['https://www.eye-oo.com/products/polaroid-pld-d482-086', 'https://www.fashioneyewear.com/en-us/products/polaroid-pld-d482', 'https://www.smartbuyglasses.co.uk/designer-eyeglasses/Polaroid/Polaroid-PLD-D482-086-634078.html']},
    {"sku": "MH-215", "brand": "Polaroid", "model": "PLD D488 807", "urls": ['https://www.fashioneyewear.com/en-us/products/polaroid-pld-d488', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-D488-Polarized-807-638181.html']},
    {"sku": "MH-367", "brand": "Macruona", "model": "D3333 C5", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-328", "brand": "Macruona", "model": "MB1402-A C5", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-393", "brand": "Macruona", "model": "SH9103 C4", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-355", "brand": "Macruona", "model": "XL110 C3", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-370", "brand": "Macruona", "model": "TA9067 C5", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-396", "brand": "Macruona", "model": "MG3850 C5", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-327", "brand": "Macruona", "model": "TA9066 C4", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-351", "brand": "Macruona", "model": "8604 C3", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-354", "brand": "Macruona", "model": "8592 C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-1460", "brand": "Tommy Hilfiger", "model": "TH1948 COL.03", "urls": ['https://www.framesdirect.com/tommy-hilfiger-th-1948-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Tommy-Hilfiger/Tommy-Hilfiger-TH-1948-GV4-616548.html']},
    {"sku": "MH-361", "brand": "Macruona", "model": "D3337 C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-372", "brand": "Macruona", "model": "D3337 C2", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-399", "brand": "Macruona", "model": "9869 C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-343", "brand": "Macruona", "model": "MG6557A C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-358", "brand": "Macruona", "model": "TA9067 C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-360", "brand": "Macruona", "model": "HC-16068 C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-398", "brand": "Macruona", "model": "PY-526 C8", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-344", "brand": "Macruona", "model": "MB1403 C4", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-357", "brand": "Macruona", "model": "TA9067 C4", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-406", "brand": "Macruona", "model": "TA9068 C2", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-574", "brand": "Guess", "model": "GU2879 028", "urls": ['https://www.framesdirect.com/guess-gu2879-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Guess/Guess-GU2879-028-595226.html']},
    {"sku": "MH-576", "brand": "Guess", "model": "GU2878 071", "urls": ['https://www.framesdirect.com/guess-gu2878-eyeglasses', 'https://www.eyeons.com/guess-gu2878']},
    {"sku": "MH-350", "brand": "Macruona", "model": "8563 C3", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-337", "brand": "Macruona", "model": "8563 C2", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-338", "brand": "Macruona", "model": "8563 C1", "urls": [], "notes": "Macruona brand not found on any major authorised retailer or indexed by search e"},
    {"sku": "MH-551", "brand": "Pepe Jeans", "model": "PJ1301 C4 TOPSY", "urls": ['https://www.rxframesnlenses.com/pepe-jeans-pj-1301-topsy.html', 'https://www.goggles4u.com/g4u/pepe-jeans-pj1301-3-topsy.html']},
    {"sku": "MH-569", "brand": "Sandro", "model": "SD6018 118", "urls": [], "notes": "SD6018 118 not found on any authorised retailer website."},
    {"sku": "MH-573", "brand": "GF Ferre", "model": "GFF 0164 005", "urls": [], "notes": "GFF 0164 not found on pretavoir, smartbuyglasses, or other authorised retailers."},
    {"sku": "MH-1405", "brand": "Columbia", "model": "C8036 022", "urls": ['https://www.framesdirect.com/columbia-c8036-eyeglasses']},
    {"sku": "MH-1400", "brand": "Columbia", "model": "C3016 201", "urls": ['https://www.framesdirect.com/columbia-c3016-eyeglasses', 'https://www.smartbuyglasses.com/designer-eyeglasses/Columbia/Columbia-C3016-201-436092.html']},
    {"sku": "MH-1403", "brand": "Columbia", "model": "C3015 072", "urls": ['https://www.framesdirect.com/columbia-c3015-eyeglasses', 'https://www.eyeons.com/columbia-c3015-072-57-satin-gunmetal-gray', 'https://www.amazon.com/Eyeglasses-Columbia-3015-SATIN-GUNMETAL/dp/B07CN3Y24P']},
    # BUDGET TIER
    {"sku": "MH-1584", "brand": "Tiffany & Co.", "model": "TF6138 001", "urls": [], "notes": "TF6138 not found on SmartBuyGlasses, FramesDirect, or any major retailer. Model "},
    {"sku": "MH-1399", "brand": "Cole Haan", "model": "CH4045 971 CRYSTAL", "urls": ['https://www.framesdirect.com/cole-haan-ch4045-eyeglasses', 'https://designeroptics.com/products/cole-haan-ch4045-eyeglasses', 'https://www.ebay.com/itm/186121557241']},
    {"sku": "MH-331", "brand": "Macruona", "model": "MR01-02 C.03", "urls": [], "notes": "Macruona is a local Nigerian brand. Not available on international optical retai"},
    {"sku": "MH-330", "brand": "Macruona", "model": "MR01-01 C.01H", "urls": [], "notes": "Macruona is a local Nigerian brand. Not available on international optical retai"},
    {"sku": "MH-1371", "brand": "Swarovski", "model": "SW 1028 16W", "urls": [], "notes": "Swarovski SW 1028 (older SW-prefix model) not found on SmartBuyGlasses, FramesDi"},
    {"sku": "MH-1372", "brand": "Swarovski", "model": "SW 1028 18M", "urls": [], "notes": "Swarovski SW 1028 (older SW-prefix model) not found on SmartBuyGlasses, FramesDi"},
    {"sku": "MH-1378", "brand": "Menrad", "model": "MOD.14111 2100", "urls": [], "notes": "Menrad MOD.14111 not found on SmartBuyGlasses, Edel-Optics, SelectSpecs, or Spec"},
    {"sku": "MH-1380", "brand": "Linda Farrow", "model": "LFL/351/2", "urls": [], "notes": "Linda Farrow LFL/351 not found on official lindafarrow.com, specscollective.com,"},
    {"sku": "MH-1381", "brand": "Linda Farrow", "model": "LFL/351/4", "urls": [], "notes": "Linda Farrow LFL/351 not found on official lindafarrow.com, specscollective.com,"},
    {"sku": "MH-400", "brand": "Macruona", "model": "FE06-12 C.01", "urls": [], "notes": "Macruona is a local Nigerian brand. Not available on international optical retai"},
    {"sku": "MH-362", "brand": "Macruona", "model": "FE06-12 C.03", "urls": [], "notes": "Macruona is a local Nigerian brand. Not available on international optical retai"},
    {"sku": "MH-1595", "brand": "Gentle Monster", "model": "LOVE PUNCH COL.02", "urls": ['https://www.fwrd.com/product-gentle-monster-love-punch-sunglasses-in-silver-titanium-mirror/GMON-UG4/', 'https://www.therealreal.com/products/women/accessories/sunglasses/gentle-monster-love-punch-cat-eye-sunglasses-idv00', 'https://hbx.com/men/brands/gentle-monster/love-punch-sunglasses']},
    {"sku": "MH-1596", "brand": "Gentle Monster", "model": "OLLIE COL.PC3", "urls": ['https://www.farfetch.com/ca/shopping/women/gentle-monster-ollie-pc3-sunglasses-item-13408477.aspx', 'https://www.ssense.com/en-us/women/product/gentle-monster/pink-and-silver-ollie-sunglasses/3832661', 'https://www.smooshop.com/en/product/gentle-monster-ollie-pc3-sunglasses/']},
    {"sku": "MH-589", "brand": "Eyezen", "model": "HD 0116 FINN GUN", "urls": ['https://www.fostergrant.com/store/digital-glasses/eyezen/finn', 'https://www.amazon.com/Foster-Grant-Eyezen-Digital-Glasses/dp/B01DVN5RX2', 'https://www.londondrugs.com/foster-grant-eyezen-finn-digital-glasses/L6295703.html']},
    {"sku": "MH-591", "brand": "Eyezen", "model": "HD 0116 TIBBY BRY", "urls": ['https://www.londondrugs.com/foster-grant-eyezen-tibby-digital-glasses/L6295695.html', 'https://www.amazon.com/Foster-Grant-Digital-Glasses-Eyeglasses/dp/B01MZ8DJTM', 'https://www.fostergrant.com/']},
    {"sku": "MH-1377", "brand": "Joseph Marc", "model": "ENGLER IG1803 HAVANA", "urls": ['https://www.clearly.ca/glasses/joseph-marc/joseph-marc-engler-54']},
    {"sku": "MH-1651", "brand": "M&H", "model": "BS1003 C9", "urls": [], "notes": "M&H is a local Nigerian brand. Not available on international optical retail sit"},
    {"sku": "MH-1654", "brand": "M&H", "model": "FD8819 C2", "urls": [], "notes": "M&H is a local Nigerian brand. Not available on international optical retail sit"},
    {"sku": "MH-1729", "brand": "Polaroid", "model": "PLD 0036/R/BB 086", "urls": ['https://www.visiondirect.com.au/designer-eyeglasses/Polaroid/Polaroid-PLD-0036RBB-Blue-Light-Block-086G6-655659.html', 'https://www.polaroideyewear.com/products/310303', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-0036RBB-Blue-Light-Block-086G6-655659.html']},
    {"sku": "MH-1730", "brand": "Polaroid", "model": "PLD 0035/R/BB PJP", "urls": ['https://www.visiondirect.com.au/designer-eyeglasses/Polaroid/Polaroid-PLD-0035-R-BB-with-Blue-Light-Block-PJP-G6-666151.html', 'https://lookeronline.com/products/polaroid-0035-r-bb-pjp', 'https://www.smartbuyglasses.com/designer-eyeglasses/Polaroid/Polaroid-PLD-0035-R-BB-with-Blue-Light-Block-PJP-G6-666151.html']},
]


def download_image(url, save_path, session, extra_headers=None):
    """Download image from URL, return True on success."""
    try:
        h = dict(session.headers)
        if extra_headers:
            h.update(extra_headers)
        resp = session.get(url, timeout=15, stream=True, headers=h)
        ct = resp.headers.get("Content-Type", "")
        if resp.status_code == 200 and "image" in ct:
            with open(save_path, "wb") as f:
                for chunk in resp.iter_content(8192):
                    f.write(chunk)
            if os.path.getsize(save_path) > 2000:
                return True
            os.remove(save_path)
    except Exception:
        pass
    return False


def get_og_image(page_url, session):
    """Fetch product page and extract best image URL."""
    try:
        referer = "/".join(page_url.split("/")[:3]) + "/"
        resp = session.get(page_url, timeout=20,
                           headers={**dict(session.headers), "Referer": referer})
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")

        # og:image is most reliable
        og = soup.find("meta", property="og:image")
        if og and og.get("content"):
            src = og["content"]
            return src if src.startswith("http") else "https:" + src

        # Shopify product JSON
        for script in soup.find_all("script", type="application/json"):
            try:
                data = json.loads(script.string or "")
                imgs = data.get("images", [])
                if imgs:
                    src = imgs[0].get("src", "")
                    return src if src.startswith("http") else "https:" + src
            except Exception:
                pass

        # CSS selectors fallback
        for sel in (
            ".product__media img",
            ".product-single__photo img",
            ".product-image img",
            ".product__image img",
            "#main-image",
            ".product-photo img",
        ):
            img = soup.select_one(sel)
            if img and img.get("src"):
                src = img["src"]
                return src if src.startswith("http") else "https:" + src
    except Exception:
        pass
    return None


def try_url(page_url, save_path, session):
    """Try to get an image from a product page URL. Returns True on success."""
    img_url = get_og_image(page_url, session)
    if img_url and download_image(img_url, save_path, session):
        return True, img_url
    return False, None


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)

    report = []
    downloaded = 0
    skipped = 0
    manual_count = 0
    failed = 0

    for frame in FRAMES:
        sku = frame["sku"]
        save_path = os.path.join(OUTPUT_DIR, f"{sku}.jpg")

        if os.path.exists(save_path):
            skipped += 1
            report.append({"sku": sku, "status": "skipped"})
            continue

        urls = frame.get("urls", [])

        if not urls:
            note = frame.get("notes", "Manual photo required")
            print(f"[MANUAL] {sku} — {note}")
            manual_count += 1
            report.append({"sku": sku, "status": "manual", "notes": note,
                            "brand": frame["brand"], "model": frame["model"]})
            continue

        success = False
        for url in urls:
            ok, img_url = try_url(url, save_path, session)
            if ok:
                label = url.split("/")[2]  # domain name
                print(f"[OK] {sku} ✓  ({label})")
                report.append({"sku": sku, "status": "ok", "page": url, "image": img_url})
                downloaded += 1
                success = True
                break
            time.sleep(0.3)

        if not success:
            print(f"[FAIL] {sku} — {frame['brand']} {frame['model']}")
            report.append({"sku": sku, "status": "failed",
                            "brand": frame["brand"], "model": frame["model"],
                            "tried": urls})
            failed += 1

        time.sleep(0.4)

    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2)

    total = len(FRAMES)
    print(f"\n{'='*55}")
    print(f"DONE: {downloaded} downloaded | {skipped} already had | {manual_count} manual | {failed} failed")
    print(f"Images → ./{OUTPUT_DIR}/   Report → ./{REPORT_FILE}")

    need_photo = [r for r in report if r["status"] in ("manual", "failed")]
    if need_photo:
        print(f"\n── {len(need_photo)} frames still need manual photos ──")
        for r in need_photo:
            b = r.get("brand", "")
            m = r.get("model", "")
            print(f"  {r['sku']} — {b} {m}")
        print("\nName each: MH-{{ProductId}}.jpg  →  place in frame_images/")


if __name__ == "__main__":
    main()
