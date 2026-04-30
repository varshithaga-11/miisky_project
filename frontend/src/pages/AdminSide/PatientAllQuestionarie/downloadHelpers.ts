import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

type YesNo = "yes" | "no" | "";

export interface HealthIssueRow {
  name: string;
  value: YesNo;
  sinceWhen: string;
  comments: string;
}

const isSelectedMatch = (opt: string, selected: string | string[]) => {
  const sList = Array.isArray(selected) ? selected : [selected];
  const normalizedOpt = opt.toLowerCase().replace(/_/g, " ").trim();
  return sList.some((s) => {
    if (!s) return false;
    const normalizedS = String(s).toLowerCase().replace(/_/g, " ").trim();
    return (
      normalizedOpt === normalizedS ||
      normalizedOpt.includes(normalizedS) ||
      normalizedS.includes(normalizedOpt)
    );
  });
};

export interface ProfileSection {
  title: string;
  fields: { 
    label: string; 
    value: string | boolean | number | null | undefined; 
    type?: 'text' | 'image' 
  }[];
}

async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface QuestionnaireData {
  title: string;
  name: string; age: string; gender: string; religion: string; caste: string; height: string; weight: string; workType: string;
  anyHealthIssues: YesNo; healthRows: HealthIssueRow[];
  autoimmuneOptions: string[]; autoimmuneSelected: string[];
  symptomOptions: string[]; symptomSelected: string[];
  skinOptions: string[]; skinSelected: string[];
  deficiencyOptions: string[]; deficiencySelected: string[];
  digestiveOptions: string[]; digestiveSelected: string[];
  surgeryHistory: YesNo; surgeryDetails: string;
  medicineAllergy: YesNo; medicineAllergyDetails: string;
  dietitianConsultationBefore: YesNo;
  dietitianConsultationName: string;
  dietitianConsultationSpecialty: string;
  dietitianConsultationPhone: string;
  dietitianConsultationLocation: string;
  dietitianConsultationNotes: string;
  consultedDoctor: YesNo;
  consultantDoctorName: string;
  consultantDoctorSpecialty: string;
  consultantDoctorPhone: string;
  otherHealthConcerns: string; menstrualPattern: string;
  dietPattern: string; nonVegFrequency: string;
  consumeEgg: YesNo; consumeMilk: YesNo;
  foodAllergy: YesNo; foodAllergyDetails: string;
  mealSlotsSelected: string[]; snacksBetweenMeals: YesNo; skipMeals: YesNo;
  mealsPerDay: string;
  foodSource: string[];
  physicalActivity: YesNo;
  activityOptions: string[]; activitySelected: string[];
  activityOtherText: string;
  habitOptions: string[]; habitSelected: string[];
  habitOtherText: string;
  improvementThoughts: string;
  fruitsPerDay: string; vegetablesPerDay: string;
  onMedication: YesNo;
  specifyMedication: string;
  sleepQuality: string; stressLevel: string; fallsSickFrequency: string;
  foodPreferences: string; additionalNotes: string;
  anyOtherComments: string; anyNotesForCareTeam: string;
}

const yn = (v: YesNo) => (v === "" ? "-" : v.toUpperCase());

// ─── PDF ─────────────────────────────────────────────────────────────────────

export function generatePDF(d: QuestionnaireData) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 50;
  const usable = pageW - margin * 2;
  let y = 60;

  const brandColor: [number, number, number] = [79, 70, 229]; // Indigo-600
  const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const textColor: [number, number, number] = [30, 41, 59]; // Slate-800

  const addHeader = () => {
    pdf.setFillColor(...brandColor);
    pdf.rect(0, 0, pageW, 40, "F");

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("MIISKY", margin, 25);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Patient Assessment Report", pageW - margin, 25, { align: "right" });

    pdf.setTextColor(...textColor);
  };

  const addFooter = (pageNum: number) => {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...secondaryColor);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}  |  Page ${pageNum}`, pageW / 2, pageH - 25, { align: "center" });
  };

  const checkPage = (need: number) => {
    if (y + need > pageH - 60) {
      addFooter(pdf.internal.pages.length - 1);
      pdf.addPage();
      addHeader();
      y = 60;
    }
  };

  const heading = (text: string) => {
    checkPage(60);
    y += 10;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...brandColor);
    pdf.text(text.toUpperCase(), margin, y);

    y += 6;
    pdf.setDrawColor(...brandColor);
    pdf.setLineWidth(1.5);
    pdf.line(margin, y, margin + 40, y);

    pdf.setDrawColor(226, 232, 240); // Slate-200
    pdf.setLineWidth(0.5);
    pdf.line(margin + 40, y, pageW - margin, y);
    y += 20;
  };

  const field = (label: string, value: string) => {
    checkPage(24);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...secondaryColor);
    pdf.text(label, margin, y);

    const labelW = 120; // Fixed label width for alignment
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...textColor);

    const lines = pdf.splitTextToSize(value || "-", usable - labelW);
    pdf.text(lines, margin + labelW, y);
    y += Math.max(1, lines.length) * 14 + 4;
  };

  const hint = (text: string) => {
    checkPage(20);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...secondaryColor);
    pdf.text("• " + text, margin + 10, y);
    y += 12;
  };

  const drawCheckbox = (x: number, cy: number, checked: boolean, showBox: boolean = true): number => {
    const boxSize = 10;
    const boxY = cy - boxSize + 2;
    if (showBox) {
      pdf.setDrawColor(203, 213, 225); // Slate-300
      pdf.setLineWidth(0.8);
      pdf.rect(x, boxY, boxSize, boxSize);
    }
    if (checked) {
      pdf.setDrawColor(...brandColor);
      pdf.setLineWidth(1.5);
      pdf.line(x + 2, boxY + 5, x + 4, boxY + boxSize - 2);
      pdf.line(x + 4, boxY + boxSize - 2, x + boxSize - 2, boxY + 2);
    }
    return boxSize + 6;
  };


  const radioField = (label: string, options: string[], selected: string) => {
    checkPage(40);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...secondaryColor);
    pdf.text(label, margin, y);

    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...textColor);
    let xPos = margin + 10;
    for (const opt of options) {
      const isSelected = isSelectedMatch(opt, selected);
      const optW = pdf.getTextWidth(opt) + 25;
      if (xPos + optW > pageW - margin) {
        y += 18;
        xPos = margin + 10;
        checkPage(18);
      }
      const cbW = drawCheckbox(xPos, y, isSelected);
      pdf.text(opt, xPos + cbW, y);
      xPos += cbW + pdf.getTextWidth(opt) + 20;
    }
    y += 20;
  };

  const checklist = (title: string, options: string[], selected: string[]) => {
    checkPage(40);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...secondaryColor);
    pdf.text(title, margin, y);
    y += 16;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...textColor);

    const colWidth = usable / 3;
    let rowMaxLines = 1;

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const col = i % 3;
      const xPos = margin + col * colWidth;
      const checked = isSelectedMatch(opt, selected);
      
      const cbW = drawCheckbox(xPos, y, checked, true); // Show boxes for all
      const textX = xPos + cbW;
      const maxTextW = colWidth - cbW - 10;

      const lines = pdf.splitTextToSize(opt, maxTextW);
      pdf.text(lines, textX, y);

      if (lines.length > rowMaxLines) rowMaxLines = lines.length;

      // At end of row or end of list, advance Y
      if (col === 2 || i === options.length - 1) {
        y += rowMaxLines * 14 + 6;
        rowMaxLines = 1;
        checkPage(20);
      }
    }
    y += 10;
  };

  const yesNoField = (label: string, value: YesNo) => {
    radioField(label, ["Yes", "No"], value === "yes" ? "Yes" : value === "no" ? "No" : "");
  };

  // Initial Header
  addHeader();

  // Title
  y += 30;
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...textColor);
  pdf.text(d.title, margin, y);
  y += 25;

  // ── Personal Details
  heading("Personal Details");
  field("Name", d.name);
  field("Age", d.age);
  radioField("Gender", ["Male", "Female", "Other"], d.gender);
  field("Religion", d.religion);
  field("Caste", d.caste);
  field("Height", d.height);
  field("Weight", d.weight);
  radioField("Work Type", ["Sedentary", "Moderate", "Heavy"], d.workType);

  // ── Health Issues
  heading("Health Issues");
  yesNoField("Any Health Issues", d.anyHealthIssues);
  if (d.anyHealthIssues === "yes") {
    hint("Refer to the clinical conditions table below");
  }

  if (d.healthRows.length) {
    checkPage(100);
    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["#", "Condition", "Yes", "No", "Since", "Comments"]],
      body: d.healthRows.map((r, i) => [
        String(i + 1), r.name,
        r.value === "yes" ? "Y" : "",
        r.value === "no" ? "Y" : "",
        r.sinceWhen || "-", r.comments || "-",
      ]),
      didParseCell: (data) => {
        if (data.section === "body" && (data.column.index === 2 || data.column.index === 3)) {
          if (data.cell.text[0] === "Y") {
            (data.cell as any).isTicked = true;
          }
          data.cell.text = [""]; // Clear text early so it's not drawn
        }
      },
      didDrawCell: (data) => {
        if ((data.cell as any).isTicked) {
          const x = data.cell.x + data.cell.width / 2 - 5;
          const cy = data.cell.y + data.cell.height / 2 + 3;
          // Draw a tick (custom line drawing to avoid font issues)
          pdf.setDrawColor(...brandColor);
          pdf.setLineWidth(1.5);
          pdf.line(x + 2, cy - 5, x + 4, cy - 2);
          pdf.line(x + 4, cy - 2, x + 8, cy - 8);
        }
      },
      styles: { fontSize: 8, cellPadding: 6, font: "helvetica" },
      headStyles: { fillColor: brandColor, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50
      columnStyles: {
        0: { cellWidth: 20 },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 30, halign: "center" },
      }
    });
    y = (pdf as any).lastAutoTable.finalY + 20;
  }

  checklist("Autoimmune Diseases", d.autoimmuneOptions, d.autoimmuneSelected);
  checklist("Symptoms", d.symptomOptions, d.symptomSelected);
  checklist("Skin Issues", d.skinOptions, d.skinSelected);
  checklist("Vitamin/Mineral Deficiencies", d.deficiencyOptions, d.deficiencySelected);
  checklist("Digestive Issues", d.digestiveOptions, d.digestiveSelected);

  heading("Clinical History");
  yesNoField("History of Surgery (If yes, specify below)", d.surgeryHistory);
  field("Surgery Details", d.surgeryDetails);

  yesNoField("Medicine Allergy (If yes, specify below)", d.medicineAllergy);
  field("Medicine Details", d.medicineAllergyDetails);

  yesNoField("On Medication (Tick if yes)", d.onMedication);
  field("Medication Details", d.specifyMedication);

  yesNoField("Dietitian Consultation Before (Tick if yes)", d.dietitianConsultationBefore);
  hint("If yes, please see dietitian details below:");
  field("Dietitian Name", d.dietitianConsultationName);
  field("Specialty", d.dietitianConsultationSpecialty);
  field("Phone", d.dietitianConsultationPhone);
  field("Location", d.dietitianConsultationLocation);
  field("Notes", d.dietitianConsultationNotes);

  yesNoField("Consulted Consultant Doctor (Tick if yes)", d.consultedDoctor);
  hint("If yes, please see consultant doctor details below:");
  field("Consultant Doctor Name", d.consultantDoctorName);
  field("Specialty", d.consultantDoctorSpecialty);
  field("Phone", d.consultantDoctorPhone);
  field("Other Health Concerns", d.otherHealthConcerns);

  // ── Food Habit
  heading("Food Habits");
  radioField("Diet Pattern", ["Veg", "Non Veg", "Eggetarian"], d.dietPattern);
  radioField("Non-Veg Frequency (If Non-Veg)", ["Daily", "3-4 times a week", "1-2 times a week", "Occasionally"], d.nonVegFrequency);

  const dietGridY = y;
  field("Consume Egg", yn(d.consumeEgg));
  field("Consume Milk", yn(d.consumeMilk));
  yesNoField("Food Allergy (If yes, specify below)", d.foodAllergy);
  field("Allergy Details", d.foodAllergyDetails);

  field("Fruits/Day", d.fruitsPerDay);
  field("Veggies/Day", d.vegetablesPerDay);
  field("Meals Count", d.mealsPerDay);
  checklist("Meal Slots", ["Early Morning", "Breakfast", "Mid morning", "Lunch", "Evening snacks", "Dinner"], d.mealSlotsSelected);

  yesNoField("Snack Between Meals", d.snacksBetweenMeals);
  yesNoField("Skip Meals", d.skipMeals);
  checklist("Food Source", ["Home", "Canteen", "Hotel", "Home supplies"], d.foodSource);

  // ── Other Habit
  heading("Lifestyle & Habits");
  yesNoField("Physical Activity", d.physicalActivity);
  if (d.physicalActivity === "yes") {
    checklist("Activities", d.activityOptions, d.activitySelected);
    field("Activity Others", d.activityOtherText);
  }

  checklist("General Habits", d.habitOptions, d.habitSelected);
  field("Habit Others", d.habitOtherText);
  field("Improvement Goals", d.improvementThoughts);

  radioField("Sleep Quality", ["Fresh", "Not Fresh"], d.sleepQuality);
  radioField("Stress Level", ["Low", "Medium", "High"], d.stressLevel);
  radioField("Sick Frequency", ["Once", "Twice", "Frequent"], d.fallsSickFrequency);
  radioField("Menstrual Pattern", ["Heavy bleeding", "Very less bleeding", "None"], d.menstrualPattern);

  heading("Additional Information");
  field("Food Preferences", d.foodPreferences);
  field("Additional Notes", d.additionalNotes);
  field("Other Comments", d.anyOtherComments);
  field("Care Team Notes", d.anyNotesForCareTeam);

  // Final Footer
  addFooter(pdf.internal.pages.length - 1);

  pdf.save(`${d.name.replace(/\s+/g, "_")}_Questionnaire.pdf`);
}

export const generateProfilePDF = async (title: string, sections: ProfileSection[], userName?: string) => {
  const pdf = new jsPDF();
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const usable = pageW - margin * 2;
  const brandColor: [number, number, number] = [79, 70, 229]; // Indigo-600
  const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
  const secondaryColor: [number, number, number] = [75, 85, 99]; // Gray-600

  let y = 60;

  const addHeader = () => {
    pdf.setFillColor(...brandColor);
    pdf.rect(0, 0, pageW, 40, "F");
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("MIISKY", margin, 25);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Profile Assessment Report", pageW - margin, 25, { align: "right" });
    pdf.setTextColor(...textColor);
  };

  const checkPage = (need: number) => {
    if (y + need > pageH - 20) {
      pdf.addPage();
      addHeader();
      y = 60;
    }
  };

  const heading = (text: string) => {
    checkPage(15);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...brandColor);
    pdf.text(text, margin, y);
    y += 5;
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, y, pageW - margin, y);
    y += 10;
  };

  addHeader();

  if (userName) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...secondaryColor);
    pdf.text(`Partner: ${userName}`, margin, y);
    y += 10;
  }

  for (const section of sections) {
    heading(section.title);
    
    for (const f of section.fields) {
      if (f.value === undefined || f.value === null || f.value === "") continue;
      
      if (f.type === 'image') {
        try {
          const base64 = await urlToBase64(String(f.value));
          const imgProps = pdf.getImageProperties(base64);
          const ratio = imgProps.height / imgProps.width;
          const imgW = 60; // Standard width for images in report
          const imgH = imgW * ratio;
          
          checkPage(imgH + 15);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...secondaryColor);
          pdf.text(f.label + ":", margin, y);
          
          pdf.addImage(base64, 'JPEG', margin + 60, y - 5, imgW, imgH);
          y += imgH + 10;
        } catch (e) {
          console.error("Failed to add image to PDF", e);
        }
        continue;
      }

      checkPage(12);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...secondaryColor);
      pdf.text(f.label + ":", margin, y);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textColor);
      
      let displayValue = "";
      if (f.value === true) displayValue = "Yes";
      else if (f.value === false) displayValue = "No";
      else displayValue = String(f.value);

      const lines = pdf.splitTextToSize(displayValue, usable - 60);
      pdf.text(lines, margin + 60, y);
      
      y += Math.max(1, lines.length) * 7 + 2;
    }
    
    y += 5;
  }

  const fileName = `${(userName || "Profile").replace(/\s+/g, "_")}_${title.replace(/\s+/g, "_")}.pdf`;
  pdf.save(fileName);
};

// ─── DOCX ────────────────────────────────────────────────────────────────────

function docHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
  });
}

function docRadioField(label: string, options: string[], selected: string): Paragraph {
  const children: TextRun[] = [
    new TextRun({ text: label + ": ", bold: true, size: 20, color: "555555" }),
  ];
  options.forEach((opt, i) => {
    const isSelected = isSelectedMatch(opt, selected);
    children.push(new TextRun({ text: (isSelected ? "[\u2713] " : "[  ] ") + opt, size: 20 }));
    if (i < options.length - 1) children.push(new TextRun({ text: "   ", size: 20 }));
  });
  return new Paragraph({ spacing: { after: 60 }, children });
}

function docYesNoField(label: string, value: YesNo): Paragraph {
  return docRadioField(label, ["Yes", "No"], value === "yes" ? "Yes" : value === "no" ? "No" : "");
}

function docField(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: label + ": ", bold: true, size: 20, color: "555555" }),
      new TextRun({ text: value || "-", size: 20 }),
    ],
  });
}

function docHint(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 200 },
    children: [
      new TextRun({ text, italics: true, size: 18, color: "888888" }),
    ],
  });
}

function docChecklist(title: string, options: string[], selected: string[]): (Paragraph | Table)[] {
  const titlePara = new Paragraph({
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: title + ":", bold: true, size: 20, color: "555555" })],
  });

  const tableRows: TableRow[] = [];
  for (let i = 0; i < options.length; i += 3) {
    const cells = [0, 1, 2].map(idx => {
      const opt = options[i + idx];
      if (!opt) return new TableCell({ children: [], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } });
      const checked = isSelectedMatch(opt, selected);
      return new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: (checked ? "[\u2713] " : "[  ] ") + opt, size: 18 })]
          })
        ],
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
  });

  return [titlePara, table];
}

function docHealthTable(rows: HealthIssueRow[]): Table {
  const headerCells = ["#", "Condition", "Yes", "No", "Since when", "Comments"].map(
    (h) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
      shading: { fill: "E6E6E6" },
    })
  );
    const dataRows = rows.map((r, i) =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.name, size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.value === "yes" ? "✓" : "", size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.value === "no" ? "✓" : "", size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.sinceWhen || "-", size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.comments || "-", size: 18 })] })] }),
      ],
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...dataRows],
  });
}

export async function generateDOCX(d: QuestionnaireData) {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(new Paragraph({
    text: d.title,
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 100 },
  }));
  children.push(new Paragraph({
    spacing: { after: 200 },
    // children: [new TextRun({ text: "Generated: " + new Date().toLocaleDateString(), size: 16, color: "888888", italics: true })],
  }));

  // Personal Details
  children.push(docHeading("PERSONAL DETAILS"));
  children.push(docField("Name", d.name));
  children.push(docField("Age", d.age));
  children.push(docRadioField("Gender", ["Male", "Female", "Other"], d.gender));
  children.push(docField("Religion", d.religion));
  children.push(docField("Caste", d.caste));
  children.push(docField("Height", d.height));
  children.push(docField("Weight", d.weight));
  children.push(docRadioField("Types of work", ["Sedentary", "Moderate", "Heavy"], d.workType));

  // Health Issues
  children.push(docHeading("HEALTH ISSUES"));
  children.push(docYesNoField("Any Health Issues", d.anyHealthIssues));
  children.push(docHint("If yes, please fill the health conditions table below:"));
  if (d.healthRows.length) {
    children.push(docHealthTable(d.healthRows));
  }
  children.push(...docChecklist("Any auto immune Diseases", d.autoimmuneOptions, d.autoimmuneSelected));
  children.push(...docChecklist("Symptoms", d.symptomOptions, d.symptomSelected));
  children.push(...docChecklist("Any skin issue", d.skinOptions, d.skinSelected));
  children.push(...docChecklist("Any vitamin or Mineral deficiency", d.deficiencyOptions, d.deficiencySelected));
  children.push(...docChecklist("Digestive issues", d.digestiveOptions, d.digestiveSelected));
  children.push(docYesNoField("History of surgery (If yes, specify below)", d.surgeryHistory));
  children.push(docHint("If yes, please specify the type of surgery below:"));
  children.push(docField("Type of surgery", d.surgeryDetails));
  children.push(docYesNoField("Allergy from medicine (If yes, specify below)", d.medicineAllergy));
  children.push(docHint("If yes, please mention the medicine name/details below:"));
  children.push(docField("Medicine details", d.medicineAllergyDetails));
  children.push(docYesNoField("On Medication (Tick if yes)", d.onMedication));
  children.push(docHint("If yes, please specify the medication below:"));
  children.push(docField("Medication details", d.specifyMedication));
  children.push(docYesNoField("Dietitian consultation before (Tick if yes)", d.dietitianConsultationBefore));
  children.push(docHint("If yes, please fill the dietitian details below:"));
  children.push(docField("Dietitian name", d.dietitianConsultationName));
  children.push(docField("Specialty", d.dietitianConsultationSpecialty));
  children.push(docField("Phone number", d.dietitianConsultationPhone));
  children.push(docField("Location", d.dietitianConsultationLocation));
  children.push(docField("Notes", d.dietitianConsultationNotes));

  children.push(docYesNoField("Consulted a consultant doctor (Tick if yes)", d.consultedDoctor));
  children.push(docHint("If yes, please fill the consultant doctor details below:"));
  children.push(docField("Consultant Doctor name", d.consultantDoctorName));
  children.push(docField("Specialty", d.consultantDoctorSpecialty));
  children.push(docField("Phone number", d.consultantDoctorPhone));
  children.push(docField("Other health concerns", d.otherHealthConcerns));

  // Food Habit
  children.push(docHeading("FOOD HABIT"));
  children.push(docRadioField("Diet patterns", ["Veg", "Non Veg", "Eggetarian"], d.dietPattern));
  children.push(docHint("If Non Veg, please select the frequency below:"));
  children.push(docRadioField("Frequency of Non-Veg Intake (If Non-Veg)", ["Daily", "3-4 times a week", "1-2 times a week", "Occasionally (once in 2-3 weeks)"], d.nonVegFrequency));
  children.push(docYesNoField("Consume Egg", d.consumeEgg));
  children.push(docYesNoField("Consume milk", d.consumeMilk));
  children.push(docYesNoField("Food Allergy (If yes, specify below)", d.foodAllergy));
  children.push(docHint("If yes, please mention the food allergy name below:"));
  children.push(docField("Food allergy details", d.foodAllergyDetails));
  children.push(docField("Fruits per day", d.fruitsPerDay));
  children.push(docField("Vegetables per day", d.vegetablesPerDay));
  children.push(...docChecklist("Meals in one day", ["Early Morning", "Breakfast", "Mid morning", "Lunch", "Evening snacks", "Dinner", "None"], d.mealSlotsSelected));
  children.push(docField("Meals per day (count)", d.mealsPerDay));
  children.push(docYesNoField("Snack between Meals", d.snacksBetweenMeals));
  children.push(docYesNoField("Skip meals", d.skipMeals));
  children.push(...docChecklist("Food source", ["Home", "Canteen", "Hotel", "Home supplies"], d.foodSource));

  // Other Habit
  children.push(docHeading("OTHER HABIT"));
  children.push(docYesNoField("Physical activity", d.physicalActivity));
  children.push(docHint("If yes, please choose from the activities list below:"));
  children.push(...docChecklist("Activities", d.activityOptions, d.activitySelected));
  children.push(docField("Others (activity)", d.activityOtherText));
  children.push(...docChecklist("Other habits", d.habitOptions, d.habitSelected));
  children.push(docField("Others (habit)", d.habitOtherText));
  children.push(docField("Improvement thoughts", d.improvementThoughts));
  children.push(docRadioField("Sleep quality", ["Fresh", "Not Fresh"], d.sleepQuality));
  children.push(docRadioField("Stress level", ["Low", "Medium", "High"], d.stressLevel));
  children.push(docRadioField("Falls sick frequency", ["Once", "Twice", "Frequent"], d.fallsSickFrequency));
  children.push(docRadioField("Menstrual Pattern", ["Heavy bleeding", "Very less bleeding", "None"], d.menstrualPattern));
  children.push(docField("Food preferences", d.foodPreferences));
  children.push(docField("Additional notes", d.additionalNotes));
  children.push(docField("Any other comments", d.anyOtherComments));
  children.push(docField("Any notes for care team", d.anyNotesForCareTeam));

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "patient_questionnaire_preview.docx");
}
