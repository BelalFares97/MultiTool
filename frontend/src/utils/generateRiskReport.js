import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Enhanced Branding Colors
const BRAND_DARK = [49, 0, 70];      // #310046
const BRAND_MID = [126, 0, 53];     // #7E0035
const GOLD = [153, 120, 0];          // #997800
const LIGHT_GRAY = [248, 249, 250];
const MID_GRAY = [200, 200, 210];
const TEXT_DARK = [33, 37, 41];
const TEXT_MED = [73, 80, 87];
const WHITE = [255, 255, 255];

const drawPageHeader = (doc, title, clientName, clientLogo) => {
    const pw = doc.internal.pageSize.getWidth();
    // Top gradient bar with gold accent
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pw, 18, 'F');
    doc.setFillColor(...BRAND_MID);
    doc.rect(pw * 0.6, 0, pw * 0.4, 18, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(0, 18, pw, 1.5, 'F');

    // App Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text('MIQYAS CREDIT', 14, 12);

    // Right label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(title, pw - 14, 12, { align: 'right' });
};

const drawPageFooter = (doc, pageNum) => {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, ph - 12, pw, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MED);
    doc.text(`Confidential Risk Assessment Report  •  Aafaq MultiTool`, 14, ph - 5);
    doc.text(`Page ${pageNum}`, pw - 14, ph - 5, { align: 'right' });
};

const sectionTitle = (doc, label, y) => {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(...BRAND_DARK);
    doc.rect(14, y, pw - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(label.toUpperCase(), 18, y + 5.5);
    return y + 12;
};

const sanitizeForPdf = (text) => {
    if (!text) return '';
    return text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014\u2015]/g, '-')
        .replace(/[\u2026]/g, '...')
        .replace(/\u00A0/g, ' ')
        .replace(/≈/g, '~')
        .replace(/≥/g, '>=')
        .replace(/≤/g, '<=')
        .replace(/[\u2022]/g, '-')
        .replace(/[^\x00-\x7F]/g, '');
};

// Simple Markdown Renderer for jsPDF
const renderMarkdownText = (doc, text, startX, startY, maxWidth, onPageBreak) => {
    let currentY = startY;
    const lines = text.split('\n');
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();

    const checkPageBreak = (neededSpace) => {
        if (currentY + neededSpace > pageHeight - 20) {
            currentY = onPageBreak(doc);
        }
    };

    let tableRows = [];

    lines.forEach(rawLine => {
        let line = sanitizeForPdf(rawLine.replace(/\r/g, ''));

        // Advanced: Handle Markdown Tables
        if (line.trim().startsWith('|') && line.includes('|')) {
            if (line.includes('---')) return; // skip markdown divider
            const cols = line.split('|').map(c => c.trim()).filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
            // Remove markdown bold asterisks for clean cells
            const cleanCols = cols.map(c => c.replace(/\*\*/g, ''));
            if (cleanCols.length > 0) tableRows.push(cleanCols);
            return;
        } else if (tableRows.length > 0) {
            // Render accumulated table lines as an autoTable!
            autoTable(doc, {
                startY: currentY + 2,
                margin: { left: startX },
                tableWidth: maxWidth,
                head: [tableRows[0]],
                body: tableRows.slice(1),
                theme: 'grid',
                headStyles: { fillColor: BRAND_DARK, textColor: WHITE, fontStyle: 'bold' },
                styles: { fontSize: 9 },
            });
            currentY = doc.lastAutoTable.finalY + 6;
            tableRows = [];
        }

        if (line.trim() === '') {
            checkPageBreak(2);
            currentY += 2;
            return;
        }

        if (line.startsWith('### ')) {
            checkPageBreak(lineHeight * 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...BRAND_DARK);
            const textLines = doc.splitTextToSize(line.replace('### ', ''), maxWidth);
            doc.text(textLines, startX, currentY);
            currentY += textLines.length * lineHeight + 2;
            return;
        }

        if (line.startsWith('## ') || line.startsWith('# ')) {
            checkPageBreak(lineHeight * 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(...BRAND_DARK);
            const textLines = doc.splitTextToSize(line.replace(/^##? /, ''), maxWidth);
            doc.text(textLines, startX, currentY);
            currentY += textLines.length * lineHeight + 2;
            return;
        }

        let isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        let content = line.trim().replace(/^[-*]\s/, '');

        doc.setFontSize(10);

        // Simple bold detection for the line
        if (content.includes('**')) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...TEXT_DARK);
            content = content.replace(/\*\*/g, '');
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...TEXT_DARK);
        }

        let xOffset = startX;
        if (isBullet) {
            doc.setFont('helvetica', 'bold');
            doc.text('•', startX + 2, currentY);
            xOffset = startX + 6;
            if (!content.includes('**')) doc.setFont('helvetica', 'normal');
        }

        const textLines = doc.splitTextToSize(content, maxWidth - (xOffset - startX));
        checkPageBreak(textLines.length * lineHeight);

        doc.text(textLines, xOffset, currentY);
        currentY += textLines.length * lineHeight;
    });

    if (tableRows.length > 0) {
        autoTable(doc, {
            startY: currentY + 2,
            margin: { left: startX },
            tableWidth: maxWidth,
            head: [tableRows[0]],
            body: tableRows.slice(1),
            theme: 'grid',
            headStyles: { fillColor: BRAND_DARK, textColor: WHITE, fontStyle: 'bold' },
            styles: { fontSize: 9 },
        });
        currentY = doc.lastAutoTable.finalY + 6;
    }

    return currentY;
};

export const generateRiskReport = ({ formData, predictionResult, aiAnalysis, clientName, clientLogo, t }) => {
    if (!formData || !predictionResult) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const MARGIN = 14;
    let y = 28;

    drawPageHeader(doc, 'Credit Risk Assessment', clientName, clientLogo);

    // --- Header Section ---
    if (clientLogo && (clientLogo.startsWith('data:image') || clientLogo.startsWith('http'))) {
        try {
            doc.addImage(clientLogo, 'PNG', MARGIN, y, 16, 16);
        } catch (e) {
            console.warn("Could not add logo to PDF:", e);
        }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...BRAND_DARK);
    doc.text(clientName || 'Financial Institution', clientLogo ? MARGIN + 20 : MARGIN, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_MED);
    doc.text(`Report ID: CR-${formData.customer_id}-${Date.now().toString().slice(-4)}`, clientLogo ? MARGIN + 20 : MARGIN, y + 11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, clientLogo ? MARGIN + 20 : MARGIN, y + 16);

    y += 24;

    // --- Decision Banner ---
    const decision = predictionResult.decision || 'Review';
    const bannerColor = decision === 'Approved' ? [16, 185, 129] : (decision === 'Rejected' ? [239, 68, 68] : [245, 158, 11]);

    doc.setFillColor(...bannerColor);
    doc.roundedRect(MARGIN, y, pw - MARGIN * 2, 24, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...WHITE);
    doc.text(`DECISION: ${decision.toUpperCase()}`, MARGIN + 8, y + 10);

    doc.setFontSize(9.5);
    doc.text(`Confidence Score: ${(predictionResult.confidence * 100).toFixed(1)}%`, MARGIN + 8, y + 18);
    doc.text(`Acceptance Probability: ${(predictionResult.all_probabilities['Approved'] * 100).toFixed(1)}%`, pw - MARGIN - 8, y + 18, { align: 'right' });

    y += 28;

    const commonStyles = { fontSize: 9, cellPadding: 3.5 };
    const commonHeadStyles = { fillColor: [240, 242, 245], textColor: BRAND_DARK, fontStyle: 'bold' };

    // --- Customer Information ---
    y = sectionTitle(doc, 'Customer Profile', y);
    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'grid',
        styles: commonStyles,
        headStyles: commonHeadStyles,
        body: [
            ['Customer ID', formData.customer_id, 'National ID', formData.national_id],
            ['Nationality', formData.nationality_group, 'Gender', formData.gender],
            ['Age', `${formData.age} Years`, 'Marital Status', formData.marital_status],
            ['Education', formData.education_level, 'Dependents', formData.dependents],
        ],
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [250, 251, 253], cellWidth: 35 },
            2: { fontStyle: 'bold', fillColor: [250, 251, 253], cellWidth: 35 },
        }
    });

    y = doc.lastAutoTable.finalY + 8;

    // --- Employment & Income ---
    y = sectionTitle(doc, 'Employment & Financial Stability', y);
    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'grid',
        styles: commonStyles,
        body: [
            ['Employment Type', formData.employment_type, 'Monthly Salary', `${formData.monthly_salary.toLocaleString()} AED`],
            ['Employer Sector', formData.employer_sector, 'Job Title', formData.job_title],
            ['Years of Exp.', `${formData.employment_years} Years`, 'Payment Method', formData.salary_payment_method],
            ['Stability Score', `${(formData.income_stability_score * 100).toFixed(0)}%`, 'DTI Ratio', `${(formData.dti_ratio * 100).toFixed(1)}%`],
        ],
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [250, 251, 253], cellWidth: 35 },
            2: { fontStyle: 'bold', fillColor: [250, 251, 253], cellWidth: 35 },
        }
    });

    y = doc.lastAutoTable.finalY + 8;

    // --- Facility Details ---
    y = sectionTitle(doc, 'Requested Facility & Collateral', y);
    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'grid',
        styles: commonStyles,
        body: [
            ['Property Type', formData.property_type, 'Property Value', `${formData.property_value.toLocaleString()} AED`],
            ['Project Status', formData.project_status, 'Down Payment', `${formData.down_payment.toLocaleString()} AED`],
            ['Finance Amount', `${formData.financing_amount.toLocaleString()} AED`, 'LTV Ratio', `${(formData.ltv_ratio * 100).toFixed(1)}%`],
            ['Takaful Coverage', `${formData.takaful_coverage.toLocaleString()} AED`, 'Term Years', `${formData.takaful_term_years} Years`],
        ],
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [250, 251, 253], cellWidth: 35 },
            2: { fontStyle: 'bold', fillColor: [250, 251, 253], cellWidth: 35 },
        }
    });

    // ==========================================
    // PAGE 2 (Credit Risk Metrics + AI Analysis)
    // ==========================================
    drawPageFooter(doc, 1);
    doc.addPage();
    drawPageHeader(doc, 'Credit Risk Assessment', clientName, clientLogo);
    y = 30;

    // --- Risk Metrics ---
    y = sectionTitle(doc, 'Credit Risk Metrics (SIMAH/External)', y);
    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'striped',
        styles: commonStyles,
        head: [['Metric', 'Value', 'Status']],
        body: [
            ['Credit Score (SIMAH)', formData.credit_score, formData.credit_score > 650 ? 'Low Risk' : 'Review'],
            ['Missed Payments (12m)', formData.missed_payments_12m, formData.missed_payments_12m === 0 ? 'Clear' : 'Warning'],
            ['Bounce Cheques (12m)', formData.bounce_cheques_12m, formData.bounce_cheques_12m === 0 ? 'Clear' : 'Warning'],
            ['Utilization Ratio', `${(formData.utilization_ratio * 100).toFixed(1)}%`, formData.utilization_ratio < 0.7 ? 'Healthy' : 'High'],
            ['Fraud Flags', formData.fraud_flags, formData.fraud_flags === 0 ? 'None' : 'CRITICAL'],
        ],
        headStyles: { fillColor: BRAND_DARK, textColor: WHITE },
        alternateRowStyles: { fillColor: [248, 249, 250] } // Lighter, enhanced striped color
    });

    y = doc.lastAutoTable.finalY + 16;

    const pageBreakCallback = (docRef) => {
        drawPageFooter(docRef, docRef.internal.getNumberOfPages());
        docRef.addPage();
        drawPageHeader(docRef, 'Credit Risk Assessment', clientName, clientLogo);
        return 30; // New Y start
    };

    // --- AI Deep Insights Section ---
    if (aiAnalysis && aiAnalysis.status === 'success') {
        y = sectionTitle(doc, 'Miqyas Descrepncy detection Tool', y);
        y += 4;

        let startBoxY = y - 4; // Start drawing box from the title baseline area
        const finalY = renderMarkdownText(doc, aiAnalysis.analysis, MARGIN + 4, y, pw - (MARGIN * 2) - 8, pageBreakCallback);

        // Add a subtle border container if it stayed on the same page. 
        // If it broke across pages naturally, border drawing logic is advanced, so we'll skip the box for now to keep the markdown styling clean and professional.
    }

    drawPageFooter(doc, doc.internal.getNumberOfPages());

    // Save
    doc.save(`Risk_Assessment_${formData.customer_id}.pdf`);
};
