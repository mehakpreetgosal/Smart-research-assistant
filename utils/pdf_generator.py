"""
PDF Generator
-------------------------
Creates professional research reports as PDF files.
"""

import os
from io import BytesIO

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# --------------------------------------------------
# Register Font (Optional)
# --------------------------------------------------

try:
    pdfmetrics.registerFont(
        TTFont(
            "Inter",
            "static/fonts/Inter-Regular.ttf"
        )
    )

    FONT_NAME = "Inter"

except Exception:
    FONT_NAME = "Helvetica"


# --------------------------------------------------
# Clean Markdown
# --------------------------------------------------

def clean_markdown(text: str) -> str:
    """
    Remove common markdown syntax for PDF rendering.
    """

    replacements = [
        ("#", ""),
        ("**", ""),
        ("__", ""),
        ("```", ""),
        ("`", ""),
        ("---", ""),
    ]

    for old, new in replacements:
        text = text.replace(old, new)

    return text


# --------------------------------------------------
# Generate PDF
# --------------------------------------------------

def generate_pdf(query, mode, report, sources):

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = styles["Heading1"]
    title_style.fontName = FONT_NAME
    title_style.alignment = TA_CENTER
    title_style.textColor = HexColor("#4F46E5")

    heading_style = styles["Heading2"]
    heading_style.fontName = FONT_NAME

    body_style = styles["BodyText"]
    body_style.fontName = FONT_NAME
    body_style.leading = 22

    story = []

    # ------------------------------------------
    # Title
    # ------------------------------------------

    story.append(
        Paragraph(
            "AI Research Assistant",
            title_style
        )
    )

    story.append(
        Spacer(1, 0.30 * inch)
    )

    # ------------------------------------------
    # Query
    # ------------------------------------------

    story.append(
        Paragraph(
            f"<b>Research Topic:</b> {query}",
            heading_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Mode:</b> {mode}",
            body_style
        )
    )

    story.append(
        Spacer(1, 0.20 * inch)
    )

    # ------------------------------------------
    # Report
    # ------------------------------------------

    report = clean_markdown(report)

    paragraphs = report.split("\n")

    for line in paragraphs:

        line = line.strip()

        if not line:
            continue

        story.append(
            Paragraph(
                line,
                body_style
            )
        )

        story.append(
            Spacer(1, 0.08 * inch)
        )

    # ------------------------------------------
    # Sources
    # ------------------------------------------

    story.append(
        Spacer(1, 0.20 * inch)
    )

    story.append(
        Paragraph(
            "Sources",
            heading_style
        )
    )

    story.append(
        Spacer(1, 0.15 * inch)
    )

    for source in sources:

        title = source.get("title", "")

        url = source.get("url", "")

        story.append(
            Paragraph(
                f"• <b>{title}</b>",
                body_style
            )
        )

        story.append(
            Paragraph(
                url,
                body_style
            )
        )

        story.append(
            Spacer(1, 0.10 * inch)
        )

    doc.build(story)

    buffer.seek(0)

    return buffer


# --------------------------------------------------
# Save PDF (Optional)
# --------------------------------------------------

def save_pdf(
    query,
    mode,
    report,
    sources,
    filename="research_report.pdf"
):

    pdf = generate_pdf(
        query,
        mode,
        report,
        sources
    )

    with open(filename, "wb") as f:

        f.write(pdf.read())

    return filename