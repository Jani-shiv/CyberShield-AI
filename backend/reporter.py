import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(scan_data, output_path, student_name="Student Name Placeholder", guide_name="Guide Name Placeholder"):
    # Setup document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.HexColor('#2563EB'),
        alignment=1, # Center
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    footer_style = ParagraphStyle(
        'FooterText',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#94A3B8'),
        alignment=1
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1E293B')
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )

    story = []
    
    # ------------------ COVER PAGE ------------------
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("MSc CYBER SECURITY", ParagraphStyle('CoverCategory', parent=title_style, fontSize=14, leading=16, spaceAfter=20, textColor=colors.HexColor('#06B6D4'))))
    story.append(Paragraph("CyberShield AI", title_style))
    story.append(Paragraph("Intelligent Website Security Assessment & Vulnerability Scanner", subtitle_style))
    
    story.append(Spacer(1, 0.5 * inch))
    
    # Visual Separator Line
    d_table = Table([['']], colWidths=[500], rowHeights=[2])
    d_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#2563EB')),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(d_table)
    story.append(Spacer(1, 1.2 * inch))
    
    # Project Details Table
    details_data = [
        [Paragraph("Project Title:", meta_label), Paragraph("CyberShield AI Security Scanner Report", meta_val)],
        [Paragraph("Target URL:", meta_label), Paragraph(scan_data['target_url'], meta_val)],
        [Paragraph("Assessment Date:", meta_label), Paragraph(datetime.now().strftime('%Y-%m-%d %H:%M:%S'), meta_val)],
        [Paragraph("Student Name:", meta_label), Paragraph(student_name, meta_val)],
        [Paragraph("Project Guide:", meta_label), Paragraph(guide_name, meta_val)],
        [Paragraph("Department:", meta_label), Paragraph("Department of Computer Science & Cyber Security", meta_val)],
    ]
    details_table = Table(details_data, colWidths=[130, 370])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#F1F5F9')),
    ]))
    story.append(details_table)
    story.append(PageBreak())
    
    # ------------------ EXECUTIVE SUMMARY ------------------
    story.append(Paragraph("1. Executive Summary", h1_style))
    summary_text = (
        f"This security assessment report evaluates the cybersecurity posture of the target system: "
        f"<b>{scan_data['target_url']}</b>. The scanning was completed dynamically by CyberShield AI on "
        f"{datetime.now().strftime('%Y-%m-%d')}. "
        f"The risk assessment engine analyzed the target system's SSL parameters, HTTP security headers, "
        f"vulnerable parameter configurations, directory exposures, and port services. "
        f"Based on the analysis, the target system has been assigned a security risk score of "
        f"<b>{scan_data['risk_score']}/100</b>, classifying its threat level as <b>{scan_data['risk_level'].upper()}</b>."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 10))

    # Metric Table Card
    metrics_data = [
        [Paragraph("Risk Score", bold_body), Paragraph(f"{scan_data['risk_score']} / 100", body_style)],
        [Paragraph("Overall Risk Level", bold_body), Paragraph(scan_data['risk_level'], body_style)],
        [Paragraph("Vulnerabilities Identified", bold_body), Paragraph(str(len(scan_data.get('vulnerabilities', []))), body_style)],
        [Paragraph("HTTPS Status", bold_body), Paragraph("Enabled" if scan_data['ssl_check'].get('enabled') else "Disabled / Insecure", body_style)],
    ]
    metrics_table = Table(metrics_data, colWidths=[200, 300])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 20))
    
    # ------------------ SECURITY HEADERS ------------------
    story.append(Paragraph("2. HTTP Security Headers Analysis", h1_style))
    story.append(Paragraph("HTTP Security Headers are critical protection components that reduce the vulnerability surface against clickjacking, script injection, and leakage vectors.", body_style))
    story.append(Spacer(1, 5))

    headers_table_data = [[
        Paragraph("Header", bold_body),
        Paragraph("Status", bold_body),
        Paragraph("Assessed Risk", bold_body)
    ]]
    for header, info in scan_data.get('headers_check', {}).items():
        status_text = "Present" if info['present'] else "Missing"
        risk_color = '#EF4444' if not info['present'] else '#10B981'
        headers_table_data.append([
            Paragraph(header, body_style),
            Paragraph(f"<font color='{risk_color}'><b>{status_text}</b></font>", body_style),
            Paragraph(info['risk'], body_style)
        ])
    
    headers_table = Table(headers_table_data, colWidths=[200, 150, 150])
    headers_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(headers_table)
    story.append(PageBreak())

    # ------------------ PORT SCANNER RESULTS ------------------
    story.append(Paragraph("3. Socket TCP Port Scan Results", h1_style))
    story.append(Paragraph("Open, unmonitored listening ports provide hackers entry vectors into internal systems. The scanner scanned common network service ports:", body_style))
    story.append(Spacer(1, 5))

    ports_table_data = [[
        Paragraph("Port", bold_body),
        Paragraph("Service", bold_body),
        Paragraph("Status", bold_body),
        Paragraph("Risk Level", bold_body)
    ]]
    for port in scan_data.get('ports_scan', []):
        status_color = '#EF4444' if port['status'] == 'Open' else '#64748B'
        ports_table_data.append([
            Paragraph(str(port['port']), body_style),
            Paragraph(port['service'], body_style),
            Paragraph(f"<font color='{status_color}'><b>{port['status']}</b></font>", body_style),
            Paragraph(port['risk'], body_style)
        ])
    
    ports_table = Table(ports_table_data, colWidths=[100, 150, 120, 130])
    ports_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(ports_table)
    story.append(Spacer(1, 20))

    # ------------------ DETECTED VULNERABILITIES ------------------
    story.append(Paragraph("4. Detected Vulnerabilities", h1_style))
    vulns = scan_data.get('vulnerabilities', [])
    if not vulns:
        story.append(Paragraph("No major injection or security vulnerabilities were flagged by the detection modules.", body_style))
    else:
        for idx, vuln in enumerate(vulns, 1):
            vuln_elements = [
                Paragraph(f"4.{idx} {vuln['type']}", h2_style),
                Paragraph(f"<b>Severity:</b> {vuln['severity']}", body_style),
                Paragraph(f"<b>Endpoint:</b> {vuln['endpoint']}", body_style),
                Paragraph(f"<b>Description:</b> {vuln['description']}", body_style),
                Paragraph(f"<b>Remediation Recommendation:</b> {vuln['remediation']}", body_style),
                Spacer(1, 10)
            ]
            story.append(KeepTogether(vuln_elements))

    story.append(PageBreak())

    # ------------------ RECOMMENDATIONS & CONCLUSION ------------------
    story.append(Paragraph("5. Hardening Recommendations", h1_style))
    recs = [
        "Enable Content-Security-Policy (CSP) header configuration to restrict unauthorized injection sources.",
        "Verify all query-driven variables and inputs are strictly filtered using parameterized bindings/queries.",
        "Restrict open database and socket ports to internal configurations using host Firewalls.",
        "Enforce HSTS (Strict-Transport-Security) settings to redirect standard connections securely to TLS/HTTPS."
    ]
    for rec in recs:
        story.append(Paragraph(f"• {rec}", body_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("6. Project Synopsis & Conclusion", h1_style))
    conclusion_text = (
        "This tool demonstrates how automated scanners verify security postures. "
        "CyberShield AI performs scans rapidly to discover vulnerabilities prior to potential exploitation. "
        "To satisfy the MSc requirements, future versions will integrate threat intelligence feeds, "
        "machine learning pattern analysis, and automated docker configurations."
    )
    story.append(Paragraph(conclusion_text, body_style))

    story.append(Spacer(1, 30))
    story.append(Paragraph("--- End of Academic Security Report ---", footer_style))
    
    # Build Document
    doc.build(story)
