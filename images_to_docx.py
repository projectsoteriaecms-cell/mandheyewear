"""
Run on your Windows machine inside soteriaeyeclinic/:
  python images_to_docx.py

Embeds every downloaded frame image into a Word document (images_review.docx)
so you can see the true file quality.
"""
import os, glob
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

IMAGE_DIR = "frame_images"
OUTPUT    = "images_review.docx"

files = sorted(glob.glob(os.path.join(IMAGE_DIR, "MH-*.jpg")))
if not files:
    print("No images found in frame_images/ — run download_frame_images.py first.")
    exit()

doc = Document()

# narrow margins so images can be wider
sec = doc.sections[0]
sec.left_margin  = sec.right_margin  = sec.top_margin = sec.bottom_margin = 572742  # ~0.63"

# Title
h = doc.add_heading(f"M&H Fashion — Downloaded Frame Images ({len(files)} files)", level=0)
h.alignment = WD_ALIGN_PARAGRAPH.CENTER
h.runs[0].font.color.rgb = RGBColor(0x1A, 0x1A, 0x2E)

note = doc.add_paragraph()
note.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = note.add_run(
    "Images embedded at full quality. If a frame shows a placeholder / logo / wrong photo, "
    "it still needs to be re-downloaded."
)
r.font.size = Pt(9)
r.font.italic = True
r.font.color.rgb = RGBColor(0x77, 0x77, 0x77)

doc.add_paragraph()

# 2 images per row using a table
ROW_HEIGHT = Inches(2.4)
IMG_WIDTH  = Inches(3.0)

table = doc.add_table(rows=0, cols=2)
table.style = "Table Grid"

pair = []
for path in files:
    pair.append(path)
    if len(pair) == 2:
        row = table.add_row()
        for col_i, p in enumerate(pair):
            cell = row.cells[col_i]
            sku  = os.path.basename(p).replace(".jpg", "")
            para = cell.paragraphs[0]
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = para.add_run()
            try:
                run.add_picture(p, width=IMG_WIDTH)
            except Exception as e:
                para.add_run(f"[Error loading image: {e}]")
            label = cell.add_paragraph(sku)
            label.alignment = WD_ALIGN_PARAGRAPH.CENTER
            label.runs[0].bold = True
            label.runs[0].font.size = Pt(9)
        pair = []

# handle odd last image
if pair:
    row = table.add_row()
    p = pair[0]
    cell = row.cells[0]
    sku  = os.path.basename(p).replace(".jpg", "")
    para = cell.paragraphs[0]
    para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = para.add_run()
    try:
        run.add_picture(p, width=IMG_WIDTH)
    except Exception as e:
        para.add_run(f"[Error: {e}]")
    label = cell.add_paragraph(sku)
    label.alignment = WD_ALIGN_PARAGRAPH.CENTER
    label.runs[0].bold = True
    label.runs[0].font.size = Pt(9)

doc.save(OUTPUT)
print(f"Saved {OUTPUT}  —  {len(files)} images embedded.")
print("Open images_review.docx in Word to inspect quality.")
