#!/usr/bin/env python3
"""
Build a 10-page professional PDF for Job Discovery Studio (cover + 8 screenshots + summary).

Requires:
  - Backend: http://127.0.0.1:5000
  - Frontend (Vite dev with /api proxy): http://127.0.0.1:5173

  pip install playwright reportlab pillow
  playwright install chromium

Usage:
  cd scripts && ../backend/venv/bin/python generate_project_pdf.py
"""

from __future__ import annotations

import json
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path
from urllib.parse import quote

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image as RLImage
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

BACKEND = "http://127.0.0.1:5000"
FRONTEND = "http://127.0.0.1:5173"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs"
OUT_PDF = OUT_DIR / "Job_Discovery_Studio_Project.pdf"


def http_json(url: str, timeout: float = 15.0):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def check_servers() -> None:
    for name, url in (("Backend", BACKEND + "/api/filters"), ("Frontend", FRONTEND)):
        try:
            urllib.request.urlopen(url, timeout=5)
        except OSError as e:
            print(f"Cannot reach {name} at {url}: {e}", file=sys.stderr)
            print(
                "Start backend:  cd backend && ./venv/bin/python app.py",
                file=sys.stderr,
            )
            print(
                "Start frontend: cd frontend && npm run dev",
                file=sys.stderr,
            )
            sys.exit(1)


def first_job() -> dict:
    jobs = http_json(f"{BACKEND}/api/search?limit=5")
    if not jobs:
        print("No jobs returned from API. Seed the database first.", file=sys.stderr)
        sys.exit(1)
    return jobs[0]


def fit_rl_image(path: Path, max_w: float, max_h: float) -> RLImage:
    with PILImage.open(path) as im:
        w, h = im.size
    scale = min(max_w / w, max_h / h, 1.0)
    return RLImage(str(path), width=w * scale, height=h * scale)


def take_screenshots(tmp: Path, job: dict) -> list[tuple[str, Path]]:
    """Return list of (caption, png_path)."""
    from playwright.sync_api import sync_playwright

    jid = int(job["id"])
    company = (job.get("company") or "Company").strip()
    company_encoded = quote(company, safe="")

    shots: list[tuple[str, Path]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            device_scale_factor=1,
        )
        page = context.new_page()

        def shot(caption: str, name: str, full_page: bool = True) -> None:
            pth = tmp / f"{name}.png"
            page.screenshot(path=str(pth), full_page=full_page)
            shots.append((caption, pth))

        # 1 Home
        page.goto(f"{FRONTEND}/", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(800)
        shot("Home — discovery dashboard and AI search", "01_home")

        # 2 Search results
        page.goto(f"{FRONTEND}/", wait_until="networkidle", timeout=60000)
        box = page.locator('input[type="text"]').first
        box.fill("Python developer remote")
        page.keyboard.press("Enter")
        page.wait_for_timeout(2000)
        shot("Smart search — ranked role matches", "02_search")

        # 3 Job detail
        page.goto(f"{FRONTEND}/job/{jid}", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(800)
        shot("Job detail — role overview and apply", "03_job_detail")

        # 4 Apply path (unauthenticated users are sent to sign in to apply)
        page.goto(f"{FRONTEND}/job/{jid}", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(500)
        btn = page.locator('button:has-text("Apply for this role")')
        if btn.count():
            btn.first.click()
            page.wait_for_timeout(1200)
        shot("Apply — sign in to submit an application", "04_apply_signin")

        # 5 Company
        page.goto(f"{FRONTEND}/company/{company_encoded}", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(800)
        shot(f"Company view — open roles at {company}", "05_company")

        # 6 Login
        page.goto(f"{FRONTEND}/login", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(500)
        shot("Sign in — email and Google options", "06_login")

        # 7 Register
        page.goto(f"{FRONTEND}/register", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(500)
        shot("Create account — registration", "07_register")

        # 8 Forgot password
        page.goto(f"{FRONTEND}/forgot-password", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(500)
        shot("Account recovery — password reset", "08_forgot")

        browser.close()

    return shots


def build_pdf(shots: list[tuple[str, Path]]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#0f172a"),
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    subtitle = ParagraphStyle(
        "DocSub",
        parent=styles["Normal"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        alignment=TA_CENTER,
        spaceAfter=8,
    )
    cap = ParagraphStyle(
        "Caption",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=6,
        spaceAfter=10,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
    )

    doc = SimpleDocTemplate(
        str(OUT_PDF),
        pagesize=A4,
        rightMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.6 * inch,
    )
    story = []

    # Page 1 — Cover
    story.append(Spacer(1, 2.2 * inch))
    story.append(Paragraph("Job Discovery Studio", title))
    story.append(Paragraph("AI-powered job search &amp; application workflow", subtitle))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Project documentation", subtitle))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(f"{date.today().strftime('%B %Y')}", subtitle))
    story.append(Spacer(1, 0.35 * inch))
    story.append(
        Paragraph(
            "Flask · React · Vite · Tailwind · SQLite · scikit-learn",
            ParagraphStyle(
                "tech",
                parent=styles["Normal"],
                fontSize=9,
                textColor=colors.HexColor("#64748b"),
                alignment=TA_CENTER,
            ),
        )
    )
    story.append(PageBreak())

    # Pages 2–9 — Screenshots
    max_w = 6.9 * inch
    max_h = 8.5 * inch
    for caption, path in shots:
        story.append(Paragraph(caption.replace("&", "&amp;"), cap))
        story.append(fit_rl_image(path, max_w, max_h))
        story.append(PageBreak())

    # Page 10 — Summary
    story.append(Paragraph("Platform overview", cap))
    summary = """
    <b>Job Discovery Studio</b> helps candidates find relevant technology roles using semantic search
    (TF-IDF similarity over job text), manage a shortlist, and submit structured applications with
    a reference ID. The stack pairs a Flask REST API with a React single-page application, backed
    by SQLite for users and application records. Authentication supports email/password and Google OAuth.
    """
    story.append(Paragraph(summary.strip(), body))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("<b>Key capabilities</b>", body))
    story.append(
        Paragraph(
            "• Natural-language job search with relevance ranking<br/>"
            "• Filters for location, job type, and experience<br/>"
            "• Role detail pages with similar roles and company listings<br/>"
            "• Shortlist and saved applications with pipeline status<br/>"
            "• Secure account management (sign-in, registration, password recovery)",
            body,
        )
    )

    doc.build(story)
    print(f"Wrote {OUT_PDF}")


def main():
    check_servers()
    job = first_job()
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        shots = take_screenshots(tmp, job)
        build_pdf(shots)


if __name__ == "__main__":
    main()
