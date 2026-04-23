import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

type HealthIssueRow = { name: string; value: "yes" | "no" | ""; sinceWhen: string; comments: string };
type YesNo = "yes" | "no" | "";

export interface QuestionnaireData {
  title: string;
  name: string; age: string; gender: string; height: string; weight: string; workType: string;
  anyHealthIssues: YesNo; healthRows: HealthIssueRow[];
  autoimmuneOptions: string[]; autoimmuneSelected: string[];
  symptomOptions: string[]; symptomSelected: string[];
  skinOptions: string[]; skinSelected: string[];
  deficiencyOptions: string[]; deficiencySelected: string[];
  surgeryHistory: YesNo; surgeryDetails: string;
  medicineAllergy: YesNo; medicineAllergyName: string;
  consultedDoctor: YesNo; doctorName: string; doctorSpecialty: string; doctorPhone: string;
  otherHealthConcerns: string; menstrualPattern: string;
  dietPattern: string; nonVegFrequency: string;
  consumeEgg: YesNo; consumeMilk: YesNo;
  foodAllergy: YesNo; foodAllergyName: string;
  mealSlotsSelected: string[]; snacksBetweenMeals: YesNo; skipMeals: YesNo;
  foodSource: string[];
  dieticianConsulted: YesNo; dieticianName: string; dieticianLocation: string; dieticianPhone: string;
  physicalActivity: YesNo;
  activityOptions: string[]; activitySelected: string[];
  activityOtherText: string;
  habitOptions: string[]; habitSelected: string[];
  habitOtherText: string;
  improvementThoughts: string;
}

const yn = (v: YesNo) => (v === "" ? "-" : v.toUpperCase());

// ─── PDF ─────────────────────────────────────────────────────────────────────

export function generatePDF(d: QuestionnaireData) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 40;
  const usable = pageW - margin * 2;
  let y = 40;

  const checkPage = (need: number) => {
    if (y + need > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      y = 40;
    }
  };

  const heading = (text: string) => {
    checkPage(40);
    y += 14;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(33, 33, 33);
    pdf.text(text, margin, y);
    y += 4;
    pdf.setDrawColor(200);
    pdf.line(margin, y, pageW - margin, y);
    y += 12;
  };

  const field = (label: string, value: string) => {
    checkPage(20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80);
    pdf.text(label + ":", margin, y);
    const labelW = pdf.getTextWidth(label + ": ");
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(33);
    const lines = pdf.splitTextToSize(value || "-", usable - labelW);
    pdf.text(lines, margin + labelW, y);
    y += lines.length * 14;
  };

  /** Draw a small checkbox square; if checked, draw a tick inside it. Returns the width consumed. */
  const drawCheckbox = (x: number, cy: number, checked: boolean): number => {
    const boxSize = 8;
    const boxY = cy - boxSize + 1;
    pdf.setDrawColor(80);
    pdf.setLineWidth(0.6);
    pdf.rect(x, boxY, boxSize, boxSize);
    if (checked) {
      pdf.setDrawColor(0, 128, 0);
      pdf.setLineWidth(1.2);
      // draw a tick: short stroke then long stroke
      pdf.line(x + 1.5, boxY + boxSize * 0.55, x + boxSize * 0.38, boxY + boxSize - 1.5);
      pdf.line(x + boxSize * 0.38, boxY + boxSize - 1.5, x + boxSize - 1.5, boxY + 1.5);
    }
    return boxSize + 4;
  };

  const radioField = (label: string, options: string[], selected: string) => {
    checkPage(20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80);
    pdf.text(label + ":", margin, y);
    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(33);
    let xPos = margin + 10;
    for (const opt of options) {
      const isSelected = opt.toLowerCase() === selected.toLowerCase();
      const optW = pdf.getTextWidth(opt) + 24;
      if (xPos + optW > pageW - margin) {
        y += 14;
        xPos = margin + 10;
        checkPage(14);
      }
      const cbW = drawCheckbox(xPos, y, isSelected);
      pdf.text(opt, xPos + cbW, y);
      xPos += cbW + pdf.getTextWidth(opt) + 14;
    }
    y += 16;
  };

  const yesNoField = (label: string, value: YesNo) => {
    radioField(label, ["Yes", "No"], value === "yes" ? "Yes" : value === "no" ? "No" : "");
  };

  const checklist = (title: string, options: string[], selected: string[]) => {
    checkPage(20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(80);
    pdf.text(title + ":", margin, y);
    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(33);
    for (const opt of options) {
      checkPage(14);
      const checked = selected.includes(opt);
      const cbW = drawCheckbox(margin + 10, y, checked);
      pdf.text(opt, margin + 10 + cbW, y);
      y += 14;
    }
    y += 4;
  };

  // Title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(33);
  pdf.text(d.title, margin, y);
  y += 10;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(130);
  pdf.text("Generated: " + new Date().toLocaleDateString(), margin, y + 10);
  y += 24;

  // ── Personal Details
  heading("PERSONAL DETAILS");
  field("Name", d.name);
  field("Age", d.age);
  radioField("Gender", ["Male", "Female", "Other"], d.gender);
  field("Height", d.height);
  field("Weight", d.weight);
  radioField("Types of work", ["Sedentary", "Moderate", "Heavy"], d.workType);

  // ── Health Issues
  heading("HEALTH ISSUES");
  yesNoField("Any Health Issues", d.anyHealthIssues);

  if (d.anyHealthIssues === "yes" && d.healthRows.length) {
    checkPage(60);
    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["#", "Condition", "Yes", "No", "Since when", "Comments"]],
      body: d.healthRows.map((r, i) => [
        String(i + 1), r.name,
        r.value === "yes" ? "Yes" : "", r.value === "no" ? "Yes" : "",
        r.sinceWhen || "-", r.comments || "-",
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [230, 230, 230], textColor: [33, 33, 33], fontStyle: "bold" },
    });
    y = (pdf as any).lastAutoTable.finalY + 12;
  }

  checklist("Any auto immune Diseases", d.autoimmuneOptions, d.autoimmuneSelected);
  checklist("Symptoms", d.symptomOptions, d.symptomSelected);
  checklist("Any skin issue", d.skinOptions, d.skinSelected);
  checklist("Any vitamin or Mineral deficiency", d.deficiencyOptions, d.deficiencySelected);

  yesNoField("History of surgery", d.surgeryHistory);
  if (d.surgeryHistory === "yes") field("Type of surgery", d.surgeryDetails);
  yesNoField("Allergy from medicine", d.medicineAllergy);
  if (d.medicineAllergy === "yes") field("Medicine name", d.medicineAllergyName);
  yesNoField("Consulted a doctor", d.consultedDoctor);
  if (d.consultedDoctor === "yes") {
    field("Doctor name", d.doctorName);
    field("Specialty", d.doctorSpecialty);
    field("Phone number", d.doctorPhone);
  }
  field("Other health concerns", d.otherHealthConcerns);
  if (d.gender === "female") radioField("Menstrual problem", ["Heavy bleeding", "Very less bleeding", "None"], d.menstrualPattern);

  // ── Food Habit
  heading("FOOD HABIT");
  radioField("Diet patterns", ["Veg", "Non Veg"], d.dietPattern === "non_veg" ? "Non Veg" : d.dietPattern === "veg" ? "Veg" : "");
  if (d.dietPattern === "non_veg") radioField("Frequency of Non-Veg Intake", ["Daily", "3-4 times a week", "1-2 times a week", "Occasionally (once in 2-3 weeks)"], d.nonVegFrequency);
  yesNoField("Consume Egg", d.consumeEgg);
  yesNoField("Consume milk", d.consumeMilk);
  yesNoField("Food Allergy", d.foodAllergy);
  if (d.foodAllergy === "yes") field("Food allergy name", d.foodAllergyName);
  checklist("Meals in one day", ["Early Morning", "Breakfast", "Mid morning", "Lunch", "Evening snacks", "Dinner", "None"], d.mealSlotsSelected);
  yesNoField("Snack between Meals", d.snacksBetweenMeals);
  yesNoField("Skip meals", d.skipMeals);
  checklist("Food source", ["Home", "Canteen", "Hotel", "Home supplies"], d.foodSource);
  yesNoField("Consulted dietician", d.dieticianConsulted);
  if (d.dieticianConsulted === "yes") {
    field("Dietician Name", d.dieticianName);
    field("Location", d.dieticianLocation);
    field("Phone number", d.dieticianPhone);
  }

  // ── Other Habit
  heading("OTHER HABIT");
  yesNoField("Physical activity", d.physicalActivity);
  if (d.physicalActivity === "yes") {
    checklist("Activities", d.activityOptions, d.activitySelected);
    field("Others (activity)", d.activityOtherText);
  }
  checklist("Other habits", d.habitOptions, d.habitSelected);
  field("Others (habit)", d.habitOtherText);
  field("Improvement thoughts", d.improvementThoughts);

  pdf.save("patient_questionnaire_preview.pdf");
}

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
    const isSelected = opt.toLowerCase() === selected.toLowerCase();
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

function docChecklist(title: string, options: string[], selected: string[]): Paragraph[] {
  const paras: Paragraph[] = [
    new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: title + ":", bold: true, size: 20, color: "555555" })],
    }),
  ];
  for (const opt of options) {
    const checked = selected.includes(opt);
    paras.push(new Paragraph({
      spacing: { after: 30 },
      indent: { left: 300 },
      children: [new TextRun({ text: (checked ? "[\u2713] " : "[  ] ") + opt, size: 20 })],
    }));
  }
  return paras;
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
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.value === "yes" ? "Yes" : "", size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.value === "no" ? "Yes" : "", size: 18 })] })] }),
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
    children: [new TextRun({ text: "Generated: " + new Date().toLocaleDateString(), size: 16, color: "888888", italics: true })],
  }));

  // Personal Details
  children.push(docHeading("PERSONAL DETAILS"));
  children.push(docField("Name", d.name));
  children.push(docField("Age", d.age));
  children.push(docRadioField("Gender", ["Male", "Female", "Other"], d.gender));
  children.push(docField("Height", d.height));
  children.push(docField("Weight", d.weight));
  children.push(docRadioField("Types of work", ["Sedentary", "Moderate", "Heavy"], d.workType));

  // Health Issues
  children.push(docHeading("HEALTH ISSUES"));
  children.push(docYesNoField("Any Health Issues", d.anyHealthIssues));
  if (d.anyHealthIssues === "yes" && d.healthRows.length) {
    children.push(docHealthTable(d.healthRows));
  }
  children.push(...docChecklist("Any auto immune Diseases", d.autoimmuneOptions, d.autoimmuneSelected));
  children.push(...docChecklist("Symptoms", d.symptomOptions, d.symptomSelected));
  children.push(...docChecklist("Any skin issue", d.skinOptions, d.skinSelected));
  children.push(...docChecklist("Any vitamin or Mineral deficiency", d.deficiencyOptions, d.deficiencySelected));
  children.push(docYesNoField("History of surgery", d.surgeryHistory));
  if (d.surgeryHistory === "yes") children.push(docField("Type of surgery", d.surgeryDetails));
  children.push(docYesNoField("Allergy from medicine", d.medicineAllergy));
  if (d.medicineAllergy === "yes") children.push(docField("Medicine name", d.medicineAllergyName));
  children.push(docYesNoField("Consulted a doctor", d.consultedDoctor));
  if (d.consultedDoctor === "yes") {
    children.push(docField("Doctor name", d.doctorName));
    children.push(docField("Specialty", d.doctorSpecialty));
    children.push(docField("Phone number", d.doctorPhone));
  }
  children.push(docField("Other health concerns", d.otherHealthConcerns));
  if (d.gender === "female") children.push(docRadioField("Menstrual problem", ["Heavy bleeding", "Very less bleeding", "None"], d.menstrualPattern));

  // Food Habit
  children.push(docHeading("FOOD HABIT"));
  children.push(docRadioField("Diet patterns", ["Veg", "Non Veg"], d.dietPattern === "non_veg" ? "Non Veg" : d.dietPattern === "veg" ? "Veg" : ""));
  if (d.dietPattern === "non_veg") children.push(docRadioField("Frequency of Non-Veg Intake", ["Daily", "3-4 times a week", "1-2 times a week", "Occasionally (once in 2-3 weeks)"], d.nonVegFrequency));
  children.push(docYesNoField("Consume Egg", d.consumeEgg));
  children.push(docYesNoField("Consume milk", d.consumeMilk));
  children.push(docYesNoField("Food Allergy", d.foodAllergy));
  if (d.foodAllergy === "yes") children.push(docField("Food allergy name", d.foodAllergyName));
  children.push(...docChecklist("Meals in one day", ["Early Morning", "Breakfast", "Mid morning", "Lunch", "Evening snacks", "Dinner", "None"], d.mealSlotsSelected));
  children.push(docYesNoField("Snack between Meals", d.snacksBetweenMeals));
  children.push(docYesNoField("Skip meals", d.skipMeals));
  children.push(...docChecklist("Food source", ["Home", "Canteen", "Hotel", "Home supplies"], d.foodSource));
  children.push(docYesNoField("Consulted dietician", d.dieticianConsulted));
  if (d.dieticianConsulted === "yes") {
    children.push(docField("Dietician Name", d.dieticianName));
    children.push(docField("Location", d.dieticianLocation));
    children.push(docField("Phone number", d.dieticianPhone));
  }

  // Other Habit
  children.push(docHeading("OTHER HABIT"));
  children.push(docYesNoField("Physical activity", d.physicalActivity));
  if (d.physicalActivity === "yes") {
    children.push(...docChecklist("Activities", d.activityOptions, d.activitySelected));
    children.push(docField("Others (activity)", d.activityOtherText));
  }
  children.push(...docChecklist("Other habits", d.habitOptions, d.habitSelected));
  children.push(docField("Others (habit)", d.habitOtherText));
  children.push(docField("Improvement thoughts", d.improvementThoughts));

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "patient_questionnaire_preview.docx");
}
