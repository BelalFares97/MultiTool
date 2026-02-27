import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND_DARK = [49, 0, 70];      // #310046
const BRAND_MID = [126, 0, 53];     // #7E0035
const HEADER_BG = [30, 30, 40];
const GOLD = [153, 120, 0];          // #997800
const LIGHT_GRAY = [245, 245, 250];
const MID_GRAY = [200, 200, 210];
const TEXT_DARK = [20, 20, 30];
const TEXT_MED = [80, 80, 100];
const WHITE = [255, 255, 255];

const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
};

const SPEAKER_PALETTE = ['#310046', '#7E0035', '#B8861D', '#A90000', '#4f46e5'];

const getSpeakerRGB = (speaker) => {
    let hash = 0;
    const str = speaker || 'Unknown';
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hex2rgb(SPEAKER_PALETTE[Math.abs(hash) % SPEAKER_PALETTE.length]);
};

const drawPageHeader = (doc, pageNum, totalTitle) => {
    const pw = doc.internal.pageSize.getWidth();
    // Top gradient bar
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pw, 14, 'F');
    doc.setFillColor(...BRAND_MID);
    doc.rect(pw * 0.6, 0, pw * 0.4, 14, 'F');

    // Logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text('Mujaz', 14, 9);

    // Right label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(totalTitle, pw - 14, 9, { align: 'right' });
};

const drawPageFooter = (doc, pageNum) => {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, ph - 10, pw, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MED);
    doc.text(`Confidential Meeting Report  •  Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, ph - 3.5);
    doc.text(`Page ${pageNum}`, pw - 14, ph - 3.5, { align: 'right' });
};

const sectionTitle = (doc, label, y) => {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(...GOLD);
    doc.roundedRect(14, y, pw - 28, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(label.toUpperCase(), 19, y + 5.5);
    return y + 12;
};

export const generateMujazPDF = ({ analysisResult, metadata }) => {
    if (!analysisResult) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const MARGIN = 14;
    const CONTENT_TOP = 22;
    const CONTENT_BOTTOM = ph - 14;

    // -------------------------------------------------------
    // PAGE 1 — Meeting Overview
    // -------------------------------------------------------
    drawPageHeader(doc, 1, 'Meeting Overview');

    // Hero section
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(MARGIN, CONTENT_TOP, pw - MARGIN * 2, 26, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...BRAND_DARK);
    doc.text('Meeting Minutes Report', MARGIN + 6, CONTENT_TOP + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MED);
    doc.text('Powered by DataScience Middle East  •  Mujaz Platform', MARGIN + 6, CONTENT_TOP + 19);

    // Divider
    doc.setDrawColor(...MID_GRAY);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, CONTENT_TOP + 30, pw - MARGIN, CONTENT_TOP + 30);

    // ── Meeting Details table ──
    let y = sectionTitle(doc, 'Meeting Details', CONTENT_TOP + 34);

    const meetingDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'grid',
        styles: { fontSize: 9.5, cellPadding: 4, textColor: TEXT_DARK },
        headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 55, fillColor: [235, 235, 245] },
        },
        body: [
            ['Date of Meeting', meetingDate],
            ['Meeting Type', 'Microsoft Teams'],
            ['Duration', metadata?.length || 'N/A'],
            ['Source File', metadata?.name || 'N/A'],
        ],
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Attendees table ──
    const uniqueSpeakers = [...new Set((analysisResult.diarization || []).map(s => s.speaker))];
    y = sectionTitle(doc, `Attendees  (${uniqueSpeakers.length} identified)`, y);

    const attendeeRows = uniqueSpeakers.map((sp, idx) => [
        { content: String(idx + 1), styles: { halign: 'center', fontStyle: 'bold', textColor: TEXT_MED } },
        {
            content: sp,
            styles: {
                fontStyle: 'bold',
                textColor: getSpeakerRGB(sp),
            }
        },
        { content: `Participant ${String.fromCharCode(65 + idx)}`, styles: {} },
    ]);

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'grid',
        head: [['#', 'Speaker Label', 'Role Designation']],
        body: attendeeRows,
        styles: { fontSize: 9.5, cellPadding: 4, textColor: TEXT_DARK },
        headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 80 },
        },
    });

    drawPageFooter(doc, 1);

    // -------------------------------------------------------
    // PAGE 2 — Full Transcript (Diarization)
    // -------------------------------------------------------
    doc.addPage();
    drawPageHeader(doc, 2, 'Full Transcript');

    y = CONTENT_TOP;
    y = sectionTitle(doc, 'Full Transcript — Speaker Diarization', y);

    const diarizationRows = (analysisResult.diarization || []).map(seg => [
        seg.timestamp || '',
        seg.speaker || 'Unknown',
        seg.text || '',
    ]);

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [['Timestamp', 'Speaker', 'Utterance']],
        body: diarizationRows,
        theme: 'striped',
        styles: { fontSize: 8.5, cellPadding: 3.5, textColor: TEXT_DARK, overflow: 'linebreak' },
        headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        columnStyles: {
            0: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: TEXT_MED },
            1: { cellWidth: 36, fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
        },
        didParseCell: (data) => {
            if (data.column.index === 1 && data.section === 'body') {
                const row = diarizationRows[data.row.index];
                const rgb = getSpeakerRGB(row?.[1] || '');
                data.cell.styles.textColor = rgb;
            }
        },
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
    });

    drawPageFooter(doc, 2);

    // -------------------------------------------------------
    // PAGE 3 — Key Meeting Notes & Action Items
    // -------------------------------------------------------
    doc.addPage();
    drawPageHeader(doc, 3, 'Key Notes & Action Items');

    y = CONTENT_TOP;

    // ── Key Meeting Notes ──
    y = sectionTitle(doc, 'Key Meeting Notes', y);

    const notesRows = (analysisResult.notes || []).map((note, i) => [i + 1, note]);

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [['#', 'Note']],
        body: notesRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, textColor: TEXT_DARK, overflow: 'linebreak' },
        headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: TEXT_MED },
            1: { cellWidth: 'auto' },
        },
        rowPageBreak: 'avoid',
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── Action Items ──
    y = sectionTitle(doc, 'Action Items', y);

    const actionRows = (analysisResult.actionItems || []).map((item, i) => [i + 1, '☐', item]);

    autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN },
        head: [['#', 'Status', 'Action Item']],
        body: actionRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, textColor: TEXT_DARK, overflow: 'linebreak' },
        headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [255, 248, 248] },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: TEXT_MED },
            1: { cellWidth: 14, halign: 'center', fontSize: 11 },
            2: { cellWidth: 'auto' },
        },
        rowPageBreak: 'avoid',
    });

    drawPageFooter(doc, 3);

    // Save
    const fileName = metadata?.name ? metadata.name.split('.')[0] : 'meeting-report';
    doc.save(`${fileName}_mujaz_report.pdf`);
};
