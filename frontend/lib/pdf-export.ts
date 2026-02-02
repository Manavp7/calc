import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClientPrice, Timeline, CostBreakdown, PricingInputs } from './types';

export function generatePricingPDF(
    inputs: PricingInputs,
    clientPrice: ClientPrice,
    timeline: Timeline,
    costBreakdown: CostBreakdown[],
    profitAnalysis?: { profit: number; margin: number; health: string },
    laborBreakdown?: { role: string; hours: number; rate: number; cost: number }[]
) {
    const doc = new jsPDF();

    // Colors
    const primaryColor: [number, number, number] = [14, 165, 233]; // #0ea5e9
    const accentColor: [number, number, number] = [139, 92, 246]; // #8b5cf6
    const darkBg: [number, number, number] = [10, 10, 10];
    const grayText: [number, number, number] = [107, 114, 128]; // gray-500
    const lightGray: [number, number, number] = [243, 244, 246]; // gray-100

    let yPos = 20;

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Estimate', 105, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString(), 105, 33, { align: 'center' });

    // Client Details (Sub-header)
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200); // Light gray for details on dark background

    let subHeaderY = 38;
    const clientInfo = [
        inputs.clientName || 'Valued Client',
        inputs.companyName,
        inputs.email,
        inputs.phone
    ].filter(Boolean).join(' • '); // Separator dot

    // Check if text fits or needs wrapping (simple check)
    if (clientInfo.length > 0) {
        doc.text(clientInfo, 105, 38, { align: 'center' });
    }

    yPos = 55;

    // Main Price Section
    doc.setFillColor(240, 249, 255); // light blue bg
    doc.roundedRect(15, yPos, 180, 45, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, 180, 45, 3, 3, 'S');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.text('Your Estimated Investment', 105, yPos + 12, { align: 'center' });
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${clientPrice.totalPrice.toLocaleString()}`, 105, yPos + 28, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.text(
        `Range: $${clientPrice.priceRange.min.toLocaleString()} - $${clientPrice.priceRange.max.toLocaleString()}`,
        105,
        yPos + 38,
        { align: 'center' }
    );

    yPos += 60;

    // Key Metrics
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Key Metrics', 15, yPos);
    yPos += 10;

    // Timeline and Team Size boxes
    const boxWidth = 85;
    const boxHeight = 35;
    const spacing = 10;

    // Timeline Box
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, yPos, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(...grayText);
    doc.text('Estimated Timeline', 15 + boxWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`${timeline.totalWeeks} weeks`, 15 + boxWidth / 2, yPos + 25, { align: 'center' });

    // Team Size Box
    doc.setFillColor(...lightGray);
    doc.roundedRect(15 + boxWidth + spacing, yPos, boxWidth, boxHeight, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    doc.text('Team Size', 15 + boxWidth + spacing + boxWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text(
        `${timeline.teamSize.min}-${timeline.teamSize.max}`,
        15 + boxWidth + spacing + boxWidth / 2,
        yPos + 25,
        { align: 'center' }
    );
    doc.setFontSize(10);
    doc.text('professionals', 15 + boxWidth + spacing + boxWidth / 2, yPos + 32, { align: 'center' });

    yPos += boxHeight + 20;

    // Cost Breakdown Table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Cost Breakdown', 15, yPos);
    yPos += 5;

    const tableData = costBreakdown.map(item => [
        item.label,
        item.description,
        `${item.percentage}%`,
        `$${item.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Description', 'Percentage', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        margin: { left: 15, right: 15 },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 70 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' }
        }
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 20;

    // --- GANTT CHART SECTION ---
    if (yPos > 200) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Project Timeline', 15, yPos);
    yPos += 15;

    // Draw Gantt Chart
    const chartX = 15;
    const chartWidth = 180;
    const chartRowHeight = 12;

    // Calculate total duration from phases to ensure everything fits
    const totalPhaseWeeks = timeline.phases.reduce((acc, phase) => acc + phase.duration, 0);
    const scaleWeeks = Math.max(timeline.totalWeeks, totalPhaseWeeks);

    // Header Row (Weeks)
    doc.setFillColor(245, 245, 245);
    doc.rect(chartX, yPos, chartWidth, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...grayText);

    // Draw week markers
    doc.text('Start', chartX, yPos + 6);
    doc.text(`${scaleWeeks} Weeks`, chartX + chartWidth, yPos + 6, { align: 'right' });

    yPos += 10;

    // Phase Bars
    let currentStart = 0;

    timeline.phases.forEach((phase, index) => {
        const barWidth = (phase.duration / scaleWeeks) * chartWidth;
        const barStart = (currentStart / scaleWeeks) * chartWidth;

        // Phase Label
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text(phase.name, chartX, yPos + 6);

        // Duration Label
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${phase.duration} wks`, chartX + chartWidth, yPos + 6, { align: 'right' });

        yPos += 8;

        // Bar Background
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(chartX, yPos, chartWidth, 6, 1, 1, 'F');

        // Colored Bar
        // Alternate colors based on phase type for visual distinction
        if (index % 3 === 0) doc.setFillColor(...primaryColor); // Blue
        else if (index % 3 === 1) doc.setFillColor(...accentColor); // Purple
        else doc.setFillColor(16, 185, 129); // Green (emerald-500)

        doc.roundedRect(chartX + barStart, yPos, barWidth, 6, 1, 1, 'F');

        currentStart += phase.duration;
        yPos += 15; // Space between rows logic
    });

    // Project Details (New Page if needed)
    if (yPos > 220) {
        doc.addPage();
        yPos = 20;
    } else {
        yPos += 10;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Project Specification', 15, yPos);
    yPos += 10;

    const formatValue = (val: string | undefined) => {
        if (!val) return 'Not specified';
        return val.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const details = [
        ['Idea Type', formatValue(inputs.ideaType ?? undefined)],
        ['Product Format', formatValue(inputs.productFormat ?? undefined)],
        ['Technology Stack', formatValue(inputs.techStack ?? undefined)],
        ['Delivery Speed', formatValue(inputs.deliverySpeed ?? undefined)],
        ['Support Duration', formatValue(inputs.supportDuration ?? undefined)],
        ['Features Selected', inputs.selectedFeatures.length.toString()]
    ];

    autoTable(doc, {
        startY: yPos,
        body: details,
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 4,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 130 }
        },
        margin: { left: 15 }
    });

});

// @ts-ignore
yPos = doc.lastAutoTable.finalY + 20;

// --- INTERNAL SECTIONS (Company Head Only) ---
if (profitAnalysis || laborBreakdown) {
    if (yPos > 180) {
        doc.addPage();
        yPos = 20;
    }

    // Profit Analysis Section
    if (profitAnalysis) {
        doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]); // Dark background for sensitive info
        doc.rect(15, yPos, 180, 50, 'F');

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Internal Profitability', 25, yPos + 12);

        // Net Profit
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text('Net Profit', 25, yPos + 25);
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129); // green-500
        doc.text(`$${profitAnalysis.profit.toLocaleString()}`, 25, yPos + 35);

        // Margin
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text('Margin', 90, yPos + 25);
        doc.setFontSize(20);
        doc.setTextColor(profitAnalysis.health === 'healthy' ? '#10B981' : profitAnalysis.health === 'warning' ? '#F59E0B' : '#EF4444');
        doc.text(`${profitAnalysis.margin.toFixed(1)}%`, 90, yPos + 35);

        // Health
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text('Health Status', 145, yPos + 25);
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(profitAnalysis.health.toUpperCase(), 145, yPos + 35);

        yPos += 65;
    }

    // Resource Allocation Table
    if (laborBreakdown) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Resource Allocation', 15, yPos);
        yPos += 5;

        const laborData = laborBreakdown.map(item => [
            item.role.charAt(0).toUpperCase() + item.role.slice(1),
            `${item.hours} hrs`,
            `$${item.rate}/hr`,
            `$${item.cost.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Role', 'Hours', 'Rate', 'Total Cost']],
            body: laborData,
            theme: 'grid',
            headStyles: {
                fillColor: [71, 85, 105], // slate-600
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [50, 50, 50]
            },
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 45, halign: 'right' }
            }
        });

        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 20;
    }
}


// Footer
const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
    );
    doc.text(
        'This is an estimate and subject to change based on project requirements',
        105,
        285,
        { align: 'center' }
    );
}

// Save the PDF
doc.save(`project-estimate-${new Date().toISOString().split('T')[0]}.pdf`);
}
