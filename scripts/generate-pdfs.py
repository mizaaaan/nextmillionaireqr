#!/usr/bin/env python3
"""Generate sample PDF documents for the member portal.

Usage:
    python3 scripts/generate-pdfs.py

This will regenerate all 6 PDFs in the docs/ folder:
  - docs/financial-report-2025.pdf
  - docs/meeting-minutes-q2-2026.pdf
  - docs/announcements.pdf
  - docs/member-guide.pdf
  - docs/events-calendar.pdf
  - docs/tshirt-sizes.pdf

Requires: reportlab (pip install reportlab)
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs")
BRAND_BLUE = HexColor("#54C2FE")
BRAND_DARK = HexColor("#1a4f6e")
LIGHT_GRAY = HexColor("#f5f5f5")

# ── Register Bangla font (Noto Sans Bengali) ──
BANGLA_FONT_PATH = os.path.expanduser("~/.fonts/NotoSansBengali.ttf")
if os.path.exists(BANGLA_FONT_PATH):
    pdfmetrics.registerFont(TTFont("NotoSansBengali", BANGLA_FONT_PATH))
    HAS_BANGLA_FONT = True
else:
    print("  Warning: NotoSansBengali.ttf not found. Bangla text may not render correctly.")
    HAS_BANGLA_FONT = False

styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    "CoverTitle", fontSize=28, leading=34, fontName="Helvetica-Bold",
    textColor=BRAND_DARK, spaceAfter=12, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    "CoverSub", fontSize=14, leading=18, fontName="Helvetica",
    textColor=HexColor("#666666"), spaceAfter=6, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    "MyH1", fontSize=20, leading=26, fontName="Helvetica-Bold",
    textColor=BRAND_DARK, spaceAfter=14, spaceBefore=20
))
styles.add(ParagraphStyle(
    "MyH2", fontSize=14, leading=18, fontName="Helvetica-Bold",
    textColor=black, spaceAfter=8, spaceBefore=14
))
styles.add(ParagraphStyle(
    "MyBody", fontSize=11, leading=16, fontName="Helvetica",
    textColor=black, spaceAfter=8, alignment=TA_JUSTIFY
))
styles.add(ParagraphStyle(
    "MyMeta", fontSize=9, leading=12, fontName="Helvetica",
    textColor=HexColor("#999999"), spaceAfter=4, alignment=TA_CENTER
))


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND_BLUE)
    canvas.rect(0, A4[1] - 8, A4[0], 8, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 7)
    canvas.drawString(20, A4[1] - 6.5, "Next Millionaire Co-operative")
    canvas.drawRightString(A4[0] - 20, A4[1] - 6.5, "CONFIDENTIAL - MEMBERS ONLY")
    canvas.setFillColor(HexColor("#bbbbbb"))
    canvas.setFont("Helvetica", 7)
    canvas.drawCentredString(A4[0] / 2, 12, f"Page {canvas.getPageNumber()}")
    canvas.restoreState()


def add_divider():
    return HRFlowable(width="100%", thickness=0.5, color=HexColor("#dddddd"),
                       spaceBefore=10, spaceAfter=10)


# ── Financial Report ──
def generate_financial_report():
    path = os.path.join(OUT_DIR, "financial-report-2025.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=20*mm, bottomMargin=18*mm,
                            leftMargin=22*mm, rightMargin=22*mm)
    story = []

    story.append(Spacer(1, 60))
    story.append(Paragraph("NEXT MILLIONAIRE", ParagraphStyle(
        "CoverBrand", fontSize=12, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=30, alignment=TA_CENTER)))
    story.append(Paragraph("Annual Financial Report 2025", styles["CoverTitle"]))
    story.append(Paragraph("For the Year Ended December 31, 2025", styles["CoverSub"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Registration No. CO-4471/2010", styles["MyMeta"]))
    story.append(Paragraph("Prepared: February 28, 2026", styles["MyMeta"]))
    story.append(Spacer(1, 50))
    story.append(HRFlowable(width="40%", thickness=2, color=BRAND_BLUE,
                              spaceBefore=0, spaceAfter=20))
    story.append(Paragraph(
        "This report contains confidential financial information for members only. "
        "Please do not distribute outside the co-operative.",
        ParagraphStyle("Disclaimer", fontSize=9, leading=13, fontName="Helvetica-Oblique",
                       textColor=HexColor("#888888"), alignment=TA_CENTER, spaceAfter=20)))
    story.append(PageBreak())

    story.append(Paragraph("1. Executive Summary", styles["MyH1"]))
    story.append(Paragraph(
        "The Next Millionaire Co-operative Society Limited completed its fifteenth year of "
        "operations in 2025 with strong financial performance across all business segments. "
        "Total revenue increased by 18.7% compared to the previous year, driven primarily by "
        "the expansion of our commercial fleet and increased member contributions.",
        styles["MyBody"]))
    story.append(Paragraph(
        "Net surplus for the year was BDT 4,280,000 (2024: BDT 3,620,000), representing a "
        "growth of 18.2%. The board recommends a dividend of 12% on member share capital, "
        "subject to approval at the Annual General Meeting.",
        styles["MyBody"]))
    story.append(add_divider())

    story.append(Paragraph("2. Revenue Breakdown", styles["MyH1"]))
    rev_data = [
        ["Segment", "2025 (BDT)", "2024 (BDT)", "Change"],
        ["Fleet Rental Income", "3,850,000", "3,120,000", "+23.4%"],
        ["Member Subscription Fees", "890,000", "840,000", "+6.0%"],
        ["Investment Income", "420,000", "380,000", "+10.5%"],
        ["Other Income", "180,000", "160,000", "+12.5%"],
        ["Total Revenue", "5,340,000", "4,500,000", "+18.7%"],
    ]
    t = Table(rev_data, colWidths=[200, 120, 120, 80])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("BACKGROUND", (0, -1), (-1, -1), HexColor("#e8f4fd")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    story.append(Paragraph("3. Operating Expenses", styles["MyH1"]))
    exp_data = [
        ["Expense Category", "2025 (BDT)", "% of Revenue"],
        ["Vehicle Maintenance", "320,000", "6.0%"],
        ["Fuel & Lubricants", "280,000", "5.2%"],
        ["Salaries & Benefits", "180,000", "3.4%"],
        ["Office & Administration", "95,000", "1.8%"],
        ["Insurance", "75,000", "1.4%"],
        ["Depreciation", "110,000", "2.1%"],
        ["Total Expenses", "1,060,000", "19.9%"],
    ]
    t2 = Table(exp_data, colWidths=[200, 120, 120])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("BACKGROUND", (0, -1), (-1, -1), HexColor("#e8f4fd")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t2)
    story.append(Spacer(1, 20))

    story.append(Paragraph("4. Balance Sheet Highlights (as at Dec 31, 2025)", styles["MyH1"]))
    bs_data = [
        ["Item", "Amount (BDT)"],
        ["Total Assets", "8,750,000"],
        ["Total Liabilities", "1,920,000"],
        ["Member Share Capital", "4,550,000"],
        ["Retained Earnings", "2,280,000"],
        ["Net Worth", "6,830,000"],
    ]
    t3 = Table(bs_data, colWidths=[250, 150])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t3)
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        "The financial position remains strong with a debt-to-equity ratio of 0.28 and "
        "current ratio of 2.4. The board is satisfied with the financial health of the "
        "co-operative and recommends continued investment in fleet expansion.",
        styles["MyBody"]))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


# ── Meeting Minutes ──
def generate_meeting_minutes():
    path = os.path.join(OUT_DIR, "meeting-minutes-q2-2026.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=20*mm, bottomMargin=18*mm,
                            leftMargin=22*mm, rightMargin=22*mm)
    story = []

    story.append(Spacer(1, 30))
    story.append(Paragraph("NEXT MILLIONAIRE CO-OPERATIVE", ParagraphStyle(
        "Brand", fontSize=11, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=4, alignment=TA_CENTER)))
    story.append(Paragraph("Minutes of the Quarterly General Meeting", styles["CoverTitle"]))
    story.append(Paragraph("Second Quarter 2026", styles["CoverSub"]))
    story.append(Spacer(1, 8))
    story.append(add_divider())
    story.append(Paragraph(
        "<b>Date:</b> July 12, 2026 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Time:</b> 10:00 AM "
        "&nbsp;&nbsp;|&nbsp;&nbsp; <b>Venue:</b> Co-operative Hall, Dhaka",
        styles["MyBody"]))
    story.append(Paragraph(
        "<b>Chairperson:</b> Md. Rafiqul Islam &nbsp;&nbsp;|&nbsp;&nbsp; "
        "<b>Secretary:</b> Fatima Begum",
        styles["MyBody"]))
    story.append(Paragraph(
        "<b>Members Present:</b> 47 out of 52 registered members (90.4% attendance)",
        styles["MyBody"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Agenda", styles["MyH1"]))
    for i, item in enumerate([
        "Call to order and welcome remarks",
        "Approval of minutes from the previous meeting (Q1 2026)",
        "Review of Q2 financial performance",
        "Fleet expansion update — 3 new vehicles acquired",
        "Proposed member dividend for 2025",
        "Election of audit committee for FY 2026-27",
        "Any other business",
        "Adjournment",
    ], 1):
        story.append(Paragraph(f"{i}. {item}", styles["MyBody"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Proceedings", styles["MyH1"]))

    proceedings = [
        ("1. Call to Order",
         "The Chairperson called the meeting to order at 10:15 AM. A welcome address was "
         "delivered thanking members for their continued support and participation."),
        ("2. Approval of Previous Minutes",
         "The minutes of the Q1 2026 meeting held on April 10, 2026 were read and approved "
         "unanimously. No corrections were proposed."),
        ("3. Financial Performance Review",
         "The Treasurer presented the Q2 financial summary. Total revenue for the quarter was "
         "BDT 1,420,000 (16% above budget). Fleet rental income remained the largest contributor "
         "at BDT 980,000. Operating expenses were within budget at BDT 265,000. The net surplus "
         "for Q2 was BDT 1,155,000."),
        ("4. Fleet Expansion Update",
         "The Fleet Manager reported that three new Toyota Axio vehicles were acquired in May "
         "2026 at a total cost of BDT 2,850,000. All three vehicles have already been leased to "
         "members under the driver program. The fleet now stands at 15 vehicles with plans to "
         "add 3 more by December 2026."),
        ("5. Member Dividend Proposal",
         "The board proposed a 12% dividend on member share capital for FY 2025, amounting to "
         "BDT 546,000. The proposal was discussed and will be put to vote at the Annual General "
         "Meeting in August 2026. Members expressed satisfaction with the proposed rate."),
        ("6. Audit Committee Election",
         "The following members were elected to the Audit Committee for FY 2026-27: "
         "1) Md. Kamal Hossain (Chair), 2) Sharmin Akhter, 3) Abdul Karim. "
         "The committee will serve a one-year term."),
        ("7. Any Other Business",
         "A member raised the possibility of introducing a health insurance scheme for members. "
         "The board agreed to form a sub-committee to study the feasibility and report back at "
         "the next meeting."),
        ("8. Adjournment",
         "The meeting was adjourned at 12:30 PM. The next quarterly meeting is scheduled for "
         "October 11, 2026."),
    ]
    for title, body in proceedings:
        story.append(Paragraph(title, styles["MyH2"]))
        story.append(Paragraph(body, styles["MyBody"]))

    story.append(Spacer(1, 30))
    story.append(add_divider())
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "_________________________<br/>Md. Rafiqul Islam<br/>Chairperson",
        ParagraphStyle("Sig1", fontSize=11, leading=16, fontName="Helvetica",
                       textColor=black, spaceAfter=20)))
    story.append(Paragraph(
        "_________________________<br/>Fatima Begum<br/>Secretary",
        ParagraphStyle("Sig2", fontSize=11, leading=16, fontName="Helvetica",
                       textColor=black)))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


# ── Announcements ──
def generate_announcements():
    path = os.path.join(OUT_DIR, "announcements.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=20*mm, bottomMargin=18*mm,
                            leftMargin=22*mm, rightMargin=22*mm)
    story = []

    story.append(Spacer(1, 20))
    story.append(Paragraph("NEXT MILLIONAIRE", ParagraphStyle(
        "Brand", fontSize=11, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=4, alignment=TA_CENTER)))
    story.append(Paragraph("Member Announcements", styles["CoverTitle"]))
    story.append(Paragraph("July 2026", styles["CoverSub"]))
    story.append(add_divider())

    announcements = [
        ("📌 AGM Notice", "July 28, 2026",
         "The 15th Annual General Meeting of Next Millionaire Co-operative Society Limited "
         "will be held on <b>Sunday, August 15, 2026 at 10:00 AM</b> at the Co-operative Hall, "
         "42/B Segunbagicha, Dhaka. All members are cordially invited. Agenda: approval of "
         "annual accounts, dividend declaration, and board election. "
         "Please confirm attendance by August 5."),
        ("🚗 Fleet Update: 3 New Cars Added", "July 15, 2026",
         "We are pleased to announce the addition of three new Toyota Axio vehicles to our "
         "commercial fleet. These vehicles are now available for lease under our driver program. "
         "Interested members may apply through the Fleet page or contact the office directly. "
         "Our fleet now totals 15 vehicles."),
        ("🎓 Member Training Program", "July 10, 2026",
         "A two-day training workshop on <b>\"Financial Literacy for Co-operative Members\"</b> "
         "will be conducted on August 5-6, 2026. Topics include savings planning, loan management, "
         "and understanding financial statements. Lunch and materials will be provided. "
         "Please register at the office by July 30. Limited to 30 participants."),
        ("📋 Audit Committee Election Results", "July 12, 2026",
         "The following members were elected to the Audit Committee for FY 2026-27 at the "
         "Q2 General Meeting: <b>Md. Kamal Hossain</b> (Chair), <b>Sharmin Akhter</b>, "
         "and <b>Abdul Karim</b>. We extend our gratitude to the outgoing committee for "
         "their dedicated service."),
        ("🏆 Member Spotlight: Success Story", "July 5, 2026",
         "Member <b>Md. Shahidul Islam</b> joined the driver program in January 2025 and has "
         "since generated a steady monthly income of BDT 45,000-55,000 through our fleet rental "
         "program. \"This program changed my life,\" says Shahidul. If you'd like to share your "
         "story, please contact the communications team."),
        ("📢 Office Holiday Notice", "June 28, 2026",
         "The co-operative office will remain closed on <b>July 7, 2026 (Eid-ul-Azha)</b>. "
         "Regular operations will resume on July 8. For urgent matters, please contact "
         "the duty officer at +880 1700-000000."),
    ]

    for title, date, body in announcements:
        story.append(Spacer(1, 8))
        story.append(Paragraph(title, styles["MyH2"]))
        story.append(Paragraph(f"<i>{date}</i>", ParagraphStyle(
            "Date", fontSize=9, leading=12, fontName="Helvetica-Oblique",
            textColor=HexColor("#999999"), spaceAfter=6)))
        story.append(Paragraph(body, styles["MyBody"]))
        story.append(add_divider())

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


# ── Member Guide ──
def generate_member_guide():
    path = os.path.join(OUT_DIR, "member-guide.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=20*mm, bottomMargin=18*mm,
                            leftMargin=22*mm, rightMargin=22*mm)
    story = []

    story.append(Spacer(1, 50))
    story.append(Paragraph("NEXT MILLIONAIRE", ParagraphStyle(
        "Brand", fontSize=12, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=20, alignment=TA_CENTER)))
    story.append(Paragraph("Member Guide<br/>and<br/>Co-operative By-Laws", styles["CoverTitle"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("2026 Edition", styles["CoverSub"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Registration No. CO-4471/2010", styles["MyMeta"]))
    story.append(Spacer(1, 40))
    story.append(add_divider())
    story.append(PageBreak())

    toc_items = [
        "1. About Next Millionaire Co-operative",
        "2. Membership Eligibility & Application",
        "3. Member Rights & Responsibilities",
        "4. Share Capital & Dividends",
        "5. Fleet Rental Program",
        "6. Loan & Credit Facilities",
        "7. Meetings & Voting",
        "8. Code of Conduct",
        "9. Grievance Redressal",
        "10. Contact Information",
    ]
    story.append(Paragraph("Table of Contents", styles["MyH1"]))
    for item in toc_items:
        story.append(Paragraph(item, styles["MyBody"]))
    story.append(PageBreak())

    sections = [
        ("1. About Next Millionaire Co-operative",
         "Next Millionaire Co-operative Society Limited was registered in 2010 under the "
         "Co-operative Societies Act, 2001 (Registration No. CO-4471/2010). We are a member-owned "
         "organization committed to building community wealth through shared ownership and "
         "collective enterprise. Our primary activities include commercial fleet management, "
         "member savings and credit services, and community development initiatives."),
        ("2. Membership Eligibility & Application",
         "Any individual aged 18 or above, residing in the co-operative's operational area, "
         "and subscribing to the principles of co-operation may apply for membership. "
         "Application process: (a) Submit a completed membership application form, (b) Provide "
         "two passport-sized photographs and valid ID proof, (c) Pay the membership fee of "
         "BDT 500 and purchase at least one share (BDT 1,000 per share), (d) Attend an "
         "orientation session. Admission is subject to board approval."),
        ("3. Member Rights & Responsibilities",
         "<b>Rights:</b> Vote in general meetings, stand for election, access co-operative "
         "services, share in surplus (dividend), inspect books of accounts (with notice).<br/><br/>"
         "<b>Responsibilities:</b> Adhere to by-laws, attend meetings regularly, "
         "use co-operative services responsibly, maintain confidentiality of member information, "
         "promote the co-operative spirit."),
        ("4. Share Capital & Dividends",
         "Each member must hold a minimum of one share (face value BDT 1,000). Members may "
         "purchase up to 20% of the total share capital. Dividends are declared annually based "
         "on surplus and are subject to board recommendation and AGM approval. The co-operative "
         "also maintains a reserve fund as per legal requirements."),
        ("5. Fleet Rental Program",
         "The fleet rental program allows members to lease commercial vehicles on a monthly basis "
         "to generate income. Key terms: (a) Monthly lease rate: BDT 25,000-35,000 depending on "
         "vehicle, (b) Security deposit: BDT 50,000 (refundable), (c) Minimum lease period: "
         "6 months, (d) Vehicle maintenance: co-operative covers major repairs, driver covers "
         "routine maintenance. Eligibility: must be a member in good standing for at least 3 months."),
        ("6. Loan & Credit Facilities",
         "Members may access the following credit facilities: (a) Emergency Loan: up to BDT 50,000 "
         "at 8% interest, (b) Vehicle Purchase Loan: up to 70% of vehicle value at 10% interest, "
         "(c) Education Loan: up to BDT 100,000 at 6% interest. All loans require a guarantor "
         "and are subject to the co-operative's credit assessment."),
        ("7. Meetings & Voting",
         "The co-operative holds quarterly general meetings and one Annual General Meeting each "
         "year. Each member has one vote regardless of shareholding. Voting may be conducted by "
         "show of hands or secret ballot. A quorum of 30% of members is required for any general "
         "meeting. Special general meetings may be called by the board or upon requisition by "
         "20% of members."),
        ("8. Code of Conduct",
         "Members are expected to: (a) Act in good faith and in the best interest of the "
         "co-operative, (b) Avoid conflicts of interest, (c) Treat fellow members with respect, "
         "(d) Use co-operative assets responsibly, (e) Maintain confidentiality, (f) Comply with "
         "all applicable laws and regulations. Violation may result in suspension or termination "
         "of membership after due process."),
        ("9. Grievance Redressal",
         "Any member with a grievance may: (a) Raise the issue with their respective committee, "
         "(b) Submit a written complaint to the board secretary, (c) Request mediation by the "
         "Grievance Redressal Committee. The committee will respond within 15 working days. "
         "If unsatisfied, the member may appeal to the board, whose decision shall be final."),
        ("10. Contact Information",
         "<b>Office Address:</b> 42/B Segunbagicha, Dhaka 1000, Bangladesh<br/>"
         "<b>Phone:</b> +880 1700-000000<br/>"
         "<b>Email:</b> info@nextmillionaire.com<br/>"
         "<b>Office Hours:</b> Sunday-Thursday, 9:00 AM - 5:00 PM<br/>"
         "<b>Website:</b> https://mizaaaan.github.io/nextmillionaireqr2/<br/><br/>"
         "<i>\"Building community wealth through shared ownership.\"</i>"),
    ]

    for i, (title, body) in enumerate(sections):
        story.append(Paragraph(title, styles["MyH1"]))
        story.append(Paragraph(body, styles["MyBody"]))
        story.append(Spacer(1, 8))
        if i < len(sections) - 1:
            story.append(add_divider())
        story.append(Spacer(1, 4))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


# ── Events Calendar ──
def generate_events_calendar():
    path = os.path.join(OUT_DIR, "events-calendar.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=20*mm, bottomMargin=18*mm,
                            leftMargin=22*mm, rightMargin=22*mm)
    story = []

    story.append(Spacer(1, 40))
    story.append(Paragraph("NEXT MILLIONAIRE", ParagraphStyle(
        "Brand", fontSize=12, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=20, alignment=TA_CENTER)))
    story.append(Paragraph("Events Calendar 2026", styles["CoverTitle"]))
    story.append(Paragraph("Upcoming Meetings, Training & Key Dates", styles["CoverSub"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Next Millionaire Co-operative Society Limited", styles["MyMeta"]))
    story.append(Paragraph("Registration No. CO-4471/2010", styles["MyMeta"]))
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="40%", thickness=2, color=BRAND_BLUE, spaceBefore=0, spaceAfter=30))

    months = [
        ["Month", "Date", "Event", "Venue"],
        ["August", "Aug 5-6", "Financial Literacy Training", "Training Room"],
        ["August", "Aug 15", "Annual General Meeting", "Co-operative Hall"],
        ["September", "Sep 12", "Board Meeting", "Board Room"],
        ["October", "Oct 11", "Q3 General Meeting", "Co-operative Hall"],
        ["November", "Nov 9", "Fleet Review Meeting", "Board Room"],
        ["November", "Nov 20-21", "Member Workshop: Savings & Investment", "Training Room"],
        ["December", "Dec 7", "Board Meeting (Budget Session)", "Board Room"],
        ["December", "Dec 20", "Annual Member Appreciation Day", "Community Center"],
        ["January 2027", "Jan 11", "Q4 General Meeting", "Co-operative Hall"],
        ["February 2027", "Feb 15", "Annual Audit Review", "Board Room"],
    ]
    t = Table(months, colWidths=[100, 90, 230, 120])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t)

    story.append(Spacer(1, 30))
    story.append(add_divider())

    story.append(Paragraph("Key Highlights", styles["MyH1"]))

    highlights = [
        ("\U0001f31f Annual General Meeting \u2014 August 15, 2026",
         "The 15th AGM will feature approval of annual accounts, dividend declaration (proposed 12%), "
         "and election of the board of directors. All 52 members are encouraged to attend. "
         "Agenda documents will be shared 7 days prior via the member portal."),
        ("\U0001f4da Financial Literacy Training \u2014 August 5-6",
         "A two-day workshop covering savings planning, loan management, and understanding financial "
         "statements. Lunch and materials provided. Limited to 30 participants \u2014 "
         "register at the office by July 30."),
        ("\U0001f3c6 Member Appreciation Day \u2014 December 20",
         "Join us for our annual celebration recognizing member contributions. Awards, cultural programs, "
         "and a community dinner will be held at the Community Center. All members and their families are welcome."),
        ("\U0001f4cb Quarterly General Meetings",
         "Regular QGMs are held on the second Sunday of January, April, July, and October. "
         "Stay informed and participate in co-operative decision-making. Minutes from past meetings "
         "are available on the member portal."),
    ]

    for title, body in highlights:
        story.append(Paragraph(title, styles["MyH2"]))
        story.append(Paragraph(body, styles["MyBody"]))
        story.append(add_divider())

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "<i>Note: Dates are subject to change. Members will be notified of any updates via the portal "
        "and email. Please check the member portal regularly for the latest information.</i>",
        ParagraphStyle("Note", fontSize=9, leading=13, fontName="Helvetica-Oblique",
                       textColor=HexColor("#888888"), alignment=TA_CENTER, spaceAfter=20)))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


# ── T-Shirt Sizes ──
def generate_tshirt_sizes():
    path = os.path.join(OUT_DIR, "tshirt-sizes.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=18*mm, bottomMargin=16*mm,
                            leftMargin=18*mm, rightMargin=18*mm)

    # Extra paragraph styles for compact tables
    bn = "NotoSansBengali" if HAS_BANGLA_FONT else "Helvetica"
    SmallNote = ParagraphStyle("sn", fontSize=8, leading=11, fontName="Helvetica-Oblique",
        textColor=HexColor("#888888"), alignment=TA_CENTER)
    GrandTotal = ParagraphStyle("gt", fontSize=12, leading=16, fontName="Helvetica-Bold",
        textColor=BRAND_DARK, alignment=TA_CENTER, spaceAfter=10)
    TH1 = ParagraphStyle("th1", fontSize=16, leading=20, fontName="Helvetica-Bold",
        textColor=BRAND_DARK, spaceAfter=10, spaceBefore=14)

    story = []
    story.append(Spacer(1, 30))
    story.append(Paragraph("NEXT MILLIONAIRE", ParagraphStyle(
        "Brand", fontSize=11, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=4, alignment=TA_CENTER)))
    story.append(Paragraph("\U0001f455 \u09a4\u09bf-\u09b6\u09be\u09b0\u09cd\u099f \u09b8\u09be\u0987\u099c \u0995\u09be\u09b2\u09c7\u0995\u09b6\u09a8 \u09ab\u09b0\u09cd\u09ae", styles["CoverTitle"] if not HAS_BANGLA_FONT else ParagraphStyle("ctbn", fontSize=24, leading=30, fontName=bn,
        textColor=BRAND_DARK, spaceAfter=8, alignment=TA_CENTER)))
    story.append(Paragraph("T-Shirt Size Collection Form", styles["CoverSub"]))
    story.append(Paragraph("Next Millionaire Co-operative Society Limited", styles["MyMeta"]))
    story.append(Paragraph("Registration No. CO-4471/2010", styles["MyMeta"]))
    story.append(Spacer(1, 14))

    # ── Qatar ──
    story.append(Paragraph("\U0001f1f6\U0001f1e6 Qatar (Total: 24)", TH1))
    story.append(Paragraph("Sizes: S=3, M=5, L=7, XL=5, XXL=4", SmallNote))
    story.append(Spacer(1, 4))
    qatar_data = [
        ["#", "Name", "Size", "Phone"],
        ["1", "Md mezanur Rahman", "M", "+8801795617389"],
        ["2", "\u09ae\u09cb: \u09ae\u09be\u09ae\u09c1\u09a8", "XL (42\" / 29\")", "1912142028"],
        ["3", "Abdur Rakib", "XXL (44\" / 30\")", "74032403"],
        ["4", "\u09a8\u09c7\u099b\u09be\u09b0 \u0989\u09a6\u09cd\u09a6\u09bf\u09a8 \u0986\u09b9\u09ae\u09c7\u09a6", "L (40\" / 28\")", "50428240"],
        ["5", "RUHUL AMIN", "L (40\" / 28\")", "+97466745799"],
        ["6", "Abul Bashar", "XL (42\" / 29\")", "+97433836996"],
        ["7", "\u09b8\u09c1\u09ae\u09be\u0987\u09af\u09bc\u09be \u099a\u09cc\u09a7\u09c1\u09b0\u09c0", "L (40\" / 28\")", "55794220"],
        ["8", "\u09ab\u09c1\u09af\u09bc\u09be\u09a6 \u09ac\u09bf\u09a8 \u0986\u09ac\u09cd\u09a6\u09c1\u09b2 \u0986\u09b2\u09c0\u09ae", "S (36\" / 26\")", "55794220"],
        ["9", "\u09b9\u09be\u09ae\u09be\u09a6 \u09ac\u09bf\u09a8 \u0986\u09ac\u09cd\u09a6\u09c1\u09b2 \u0986\u09b2\u09c0\u09ae", "S (36\" / 26\")", "55794220"],
        ["10", "\u09a4\u09be\u09b8\u09a8\u09bf\u09ae \u09ac\u09bf\u09a8\u09a4\u09c7 \u0986\u09ac\u09cd\u09a6\u09c1\u09b2 \u0986\u09b2\u09c0\u09ae", "S (36\" / 26\")", "55794220"],
        ["11", "\u09ae\u09cb: \u0986\u09ac\u09cd\u09a6\u09c1\u09b2 \u0986\u09b2\u09c0\u09ae", "L (40\" / 28\")", "55794220"],
        ["12", "FAkHRU DDIN", "XXL (44\" / 30\")", "+97466102494"],
        ["13", "Md imam uddin babu", "XL (42\" / 29\")", "+97455852649"],
        ["14", "\u098f\u09ae \u098f \u09ae\u09be\u09b9\u09ae\u09c1\u09a6 (APEL MAHMUD)", "L (40\" / 28\")", "+97466988646"],
        ["15", "MD. Abdul Wadud", "L (40\" / 28\")", "51083191"],
        ["16", "Nazmul Hossain Sujan", "M (38\" / 27\")", "70047375"],
        ["17", "Sahajan Mridha", "M (38\" / 27\")", "33686696"],
        ["18", "Abdullah Jahangir", "XL (42\" / 29\")", "+97450904458"],
        ["19", "Taj Mohammed", "L (40\" / 28\")", "+97433667909"],
        ["20", "Mohiuddin babul", "M (38\" / 27\")", "+97431034683"],
        ["21", "\u0986\u09ac\u09cd\u09a6\u09c1\u09b8 \u09b8\u09be\u09b2\u09be\u09ae", "XL (42\" / 29\")", "+97455110506"],
        ["22", "\u09b9\u09c1\u099c\u09be\u0987\u09ab\u09be", "M (38\" / 27\")", "55110506"],
        ["23", "\u0993\u09ac\u09be\u09af\u09bc\u09a6\u09c1\u09b0 \u09b0\u09b9\u09ae\u09be\u09a8", "XXL (44\" / 30\")", "+966568135426"],
        ["24", "\u09ae\u09c1\u09b9\u09be\u09ae\u09cd\u09ae\u09a6 \u09af\u09c1\u09b8\u09c1\u09ab", "XXL (44\" / 30\")", "55147432"],
    ]
    data_font = bn if HAS_BANGLA_FONT else "Helvetica"
    t = Table(qatar_data, colWidths=[20, 130, 90, 110])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), data_font),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # ── Saudi ──
    story.append(Paragraph("\U0001f1f8\U0001f1e6 Saudi Arabia (Total: 1)", TH1))
    story.append(Spacer(1, 4))
    saudi_data = [
        ["#", "Name", "Size", "Phone"],
        ["1", "Md. Saddam hossain", "M (38\" / 27\")", "+9660599086200"],
    ]
    t = Table(saudi_data, colWidths=[20, 130, 90, 110])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), data_font),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # ── Bangladesh ──
    story.append(Paragraph("\U0001f1e7\U0001f1e9 Bangladesh (Total: 12)", TH1))
    story.append(Paragraph("Sizes: S=1, L=5, XL=4, XXL=1, XXXL=1", SmallNote))
    story.append(Spacer(1, 4))
    bd_data = [
        ["#", "Name", "Size", "Phone"],
        ["1", "Md Mizanur Rahman", "XL (42\" / 29\")", "01725752500"],
        ["2", "\u09ab\u09be\u09b0\u09be\u09ac\u09c0 \u09b0\u09b9\u09ae\u09be\u09a8 \u0987\u09b6\u09be\u09a8", "L (40\" / 28\")", "01912-142028"],
        ["3", "\u09b9\u09be\u09ab\u09bf\u099c\u09c1\u09b0 \u09b0\u09b9\u09ae\u09be\u09a8 \u099c\u09be\u09b9\u09be\u0999\u09cd\u0997\u09c0\u09b0", "L (40\" / 28\")", "01911393568"],
        ["4", "Lokman hossain", "L (40\" / 28\")", "01813663709"],
        ["5", "Kazi Moinul Haque", "XXXL (46\" / 31\")", "+8801914132631"],
        ["6", "MD. Monirul Islam Babu", "XL (42\" / 29\")", "01711979462"],
        ["7", "Kazi Ashraful Haque", "XXL (44\" / 30\")", "01301247406"],
        ["8", "Md. Abdur Rahim", "XL (42\" / 29\")", "01917130670"],
        ["9", "Kabir Hasan", "XL (42\" / 29\")", "01988980087"],
        ["10", "Lovly Islam", "S (36\" / 26\")", "+8801935166488"],
        ["11", "\u09b0\u09ab\u09bf\u0995\u09c1\u09b0 \u09b0\u09b9\u09ae\u09be\u09a8 \u09ae\u09be\u09b0\u09c1\u09ab", "L (40\" / 28\")", "01676300530"],
        ["12", "Gm Nojir Ahmed", "L (40\" / 28\")", "01740644091"],
    ]
    t = Table(bd_data, colWidths=[20, 130, 90, 110])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), data_font),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(t)

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="60%", thickness=1, color=BRAND_BLUE, spaceBefore=0, spaceAfter=12))
    story.append(Paragraph("<b>Grand Total: 37 Members</b>", GrandTotal))
    story.append(Paragraph("Measurements: Chest (\u09ac\u09c1\u0995) x Length (\u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af) in inches", SmallNote))
    story.append(Paragraph("S=36x26 | M=38x27 | L=40x28 | XL=42x29 | XXL=44x30 | XXXL=46x31", SmallNote))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


# ── Share Balance Statement ──
def generate_share_balance():
    path = os.path.join(OUT_DIR, "share-statement.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
                            topMargin=20*mm, bottomMargin=18*mm,
                            leftMargin=22*mm, rightMargin=22*mm)
    story = []

    story.append(Spacer(1, 40))
    story.append(Paragraph("NEXT MILLIONAIRE", ParagraphStyle(
        "Brand", fontSize=12, leading=14, fontName="Helvetica-Bold",
        textColor=BRAND_BLUE, spaceAfter=20, alignment=TA_CENTER)))
    story.append(Paragraph("Member Share Balance Statement", styles["CoverTitle"]))
    story.append(Paragraph("Next Millionaire Co-operative Society Limited", styles["CoverSub"]))
    story.append(Paragraph("Registration No. CO-4471/2010", styles["MyMeta"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Statement Date: July 30, 2026", styles["CoverSub"]))
    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="40%", thickness=2, color=BRAND_BLUE, spaceBefore=0, spaceAfter=30))
    story.append(PageBreak())

    story.append(Paragraph("Member Details", styles["MyH1"]))
    member_data = [
        ["Field", "Details"],
        ["Member Name", "Md. Mizanur Rahman"],
        ["Member ID", "NM-2024-0047"],
        ["Date of Joining", "January 15, 2024"],
        ["Member Status", "Active (in good standing)"],
        ["Share Class", "Ordinary Class A"],
    ]
    t = Table(member_data, colWidths=[180, 280])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(t)
    story.append(Spacer(1, 24))

    story.append(Paragraph("Share Balance Summary", styles["MyH1"]))
    share_data = [
        ["Description", "Details"],
        ["Total Shares Held", "25 Shares"],
        ["Face Value per Share", "BDT 1,000"],
        ["Total Share Capital", "BDT 25,000"],
        ["Additional Paid-in Capital", "BDT 5,000"],
        ["Total Investment", "BDT 30,000"],
    ]
    t2 = Table(share_data, colWidths=[180, 280])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, 1), [white, LIGHT_GRAY]),
        ("BACKGROUND", (0, 4), (-1, 4), HexColor("#e8f4fd")),
        ("FONTNAME", (0, 4), (-1, 4), "Helvetica-Bold"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(t2)
    story.append(Spacer(1, 24))

    story.append(Paragraph("Dividend History", styles["MyH1"]))
    div_data = [
        ["Financial Year", "Dividend Rate", "Dividend Earned", "Status"],
        ["2024 (FY 2023-24)", "10%", "BDT 2,500", "Paid"],
        ["2025 (FY 2024-25)", "12%", "BDT 3,000", "Paid"],
        ["2026 (FY 2025-26)", "Proposed 12%", "BDT 3,600", "Pending (AGM Approval)"],
    ]
    t3 = Table(div_data, colWidths=[120, 100, 110, 130])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("BACKGROUND", (0, 3), (-1, 3), HexColor("#fff3cd")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t3)
    story.append(Spacer(1, 24))

    story.append(Paragraph("Transaction History (Last 6 Months)", styles["MyH1"]))
    tx_data = [
        ["Date", "Description", "Amount (BDT)", "Type"],
        ["Feb 15, 2026", "Dividend Payment FY 2024-25", "3,000", "Credit"],
        ["Mar 10, 2026", "Share Purchase (5 Shares)", "5,000", "Credit"],
        ["May 5, 2026", "Dividend Reinvestment", "1,200", "Credit"],
        ["Jul 1, 2026", "Share Transfer Fee", "(100)", "Debit"],
    ]
    t4 = Table(tx_data, colWidths=[100, 200, 100, 60])
    t4.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (2, 0), (3, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(t4)
    story.append(Spacer(1, 20))

    story.append(add_divider())
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Next Steps:</b> If you have any questions regarding your share balance or dividend "
        "entitlements, please contact the co-operative office or send an email to "
        "accounts@nextmillionaireqr.com. The AGM for approving FY 2025-26 dividends is "
        "scheduled for August 15, 2026.",
        styles["MyBody"]))
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        "This is a computer-generated statement and does not require a signature.",
        ParagraphStyle("Disclaimer", fontSize=9, leading=13, fontName="Helvetica-Oblique",
                       textColor=HexColor("#888888"), alignment=TA_CENTER, spaceAfter=20)))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"  Created: {os.path.basename(path)}")


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    print("Generating portal PDFs...")
    generate_financial_report()
    generate_meeting_minutes()
    generate_announcements()
    generate_member_guide()
    generate_events_calendar()
    generate_tshirt_sizes()
    generate_share_balance()
    print("Done! All PDFs saved in docs/")
