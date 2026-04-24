import { useEffect, useMemo, useState } from "react";
import { generatePDF, generateDOCX, type QuestionnaireData } from "./downloadHelpers";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import {
  fetchActivityMasters,
  fetchAutoimmuneMasters,
  fetchDeficiencyMasters,
  fetchDigestiveIssueMasters,
  fetchHabitMasters,
  fetchHealthConditionMasters,
  fetchSkinIssueMasters,
  fetchSymptomMasters,
} from "./api";

type HealthIssueRow = {
  name: string;
  value: "yes" | "no" | "";
  sinceWhen: string;
  comments: string;
};

type Gender = "male" | "female" | "other" | "";
type YesNo = "yes" | "no" | "";
type WorkType = "sedentary" | "moderate" | "heavy" | "";
type DietPattern = "veg" | "non_veg" | "";

const DEFAULT_HEALTH_ISSUES = [
  "Pre- Diabetic",
  "Diabetes Type I",
  "Diabetes type II",
  "Juvenile Diabetes",
  "Hypertension",
  "Cardiac Issues",
  "CKD",
  "Anemia",
  "Thyroid",
  "Migraine",
  "PCOD & PCOS",
  "Triglycerides",
  "Cholesterol",
  "Cancer",
  "Gout",
  "Osteoporosis",
  "Obesity",
  "Urine Infection",
  "Glucoma",
  "Malaria",
  "Dengue",
  "Chicken Pox",
  "Herpes",
  "Gall stone",
  "Fatty liver",
  "Liver Cirrhosis",
  "Kidney stone",
  "IBS",
  "Gastritis",
];

const DEFAULT_AUTOIMMUNE = [
  "Rheumatoid Arthritis",
  "Celiac disease",
  "Pernicious Anemia",
  "Vitiligo",
  "Addison's disease",
  "Ulcerative Colitis",
  "Crohn's disease",
  "Guillain- Barre Syndrome",
  "Kawasaki disease",
  "Psoriasis",
  "Alopecia Areata",
  "Fibromyalgia",
  "None",
];

const DEFAULT_SYMPTOMS = [
  "Fatigue/ Tiredness",
  "Sudden weight loss",
  "Sudden weight Gain",
  "Muscle pain",
  "Joint pain",
  "Hair loss",
  "Bloating",
  "Diarrhoea",
  "Constipation",
  "Numbness or tingling in Hand/feet",
  "Difficulty Concentrating",
  "Palpitations",
  "Blurry vision",
  "Mouth ulcers",
  "None",
];

const DEFAULT_SKIN_ISSUES = ["Allergy", "Acne prone", "Eczema", "Dandruff", "Dryness", "Itchiness", "None"];
const DEFAULT_DEFICIENCIES = [
  "Vitamin A",
  "Vitamin B1",
  "Vitamin B9",
  "Vitamin B12",
  "Vitamin C",
  "Vitamin D3",
  "Vitamin K",
  "Calcium",
  "Magnesium",
  "Zinc",
  "Iron",
  "Potassium",
  "Sodium",
  "None",
];
const DEFAULT_HABITS = [
  "Smoking",
  "Alcohol consumption",
  "Tobacco / Pan masala",
  "Excess tea/coffee intake",
  "Skipping meals",
  "Intake of excess junk food",
  "Others",
  "None",
];
const DEFAULT_ACTIVITIES = [
  "Walking",
  "Jogging / Running",
  "Gym / Strength Training",
  "Yoga",
  "Cycling",
  "Swimming",
  "Aerobics / Zumba",
  "Sports (e.g., badminton, football, cricket)",
  "Home workout",
  "Others",
];

function mergeOptions(primary: string[], secondary: string[]): string[] {
  const merged = [...primary];
  for (const item of secondary) {
    const cleaned = item.trim();
    if (!cleaned) continue;
    if (!merged.some((x) => x.toLowerCase() === cleaned.toLowerCase())) {
      merged.push(cleaned);
    }
  }
  return merged;
}

function toggleItem(list: string[], item: string): string[] {
  if (list.includes(item)) return list.filter((x) => x !== item);
  return [...list, item];
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function PatientAllQuestionariePage() {
  const [title] = useState("QUESTIONNAIRE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<"pdf" | "docx" | null>(null);

  const [healthRows, setHealthRows] = useState<HealthIssueRow[]>(DEFAULT_HEALTH_ISSUES.map((name) => ({ name, value: "", sinceWhen: "", comments: "" })));
  const [autoimmuneOptions, setAutoimmuneOptions] = useState<string[]>(DEFAULT_AUTOIMMUNE);
  const [symptomOptions, setSymptomOptions] = useState<string[]>(DEFAULT_SYMPTOMS);
  const [skinOptions, setSkinOptions] = useState<string[]>(DEFAULT_SKIN_ISSUES);
  const [deficiencyOptions, setDeficiencyOptions] = useState<string[]>(DEFAULT_DEFICIENCIES);
  const [habitOptions, setHabitOptions] = useState<string[]>(DEFAULT_HABITS);
  const [activityOptions, setActivityOptions] = useState<string[]>(DEFAULT_ACTIVITIES);

  const [autoimmuneSelected, setAutoimmuneSelected] = useState<string[]>([]);
  const [symptomSelected, setSymptomSelected] = useState<string[]>([]);
  const [skinSelected, setSkinSelected] = useState<string[]>([]);
  const [deficiencySelected, setDeficiencySelected] = useState<string[]>([]);
  const [habitSelected, setHabitSelected] = useState<string[]>([]);
  const [activitySelected, setActivitySelected] = useState<string[]>([]);

  const [addHealthIssue, setAddHealthIssue] = useState("");
  const [addAutoimmune, setAddAutoimmune] = useState("");
  const [addSymptom, setAddSymptom] = useState("");
  const [addSkinIssue, setAddSkinIssue] = useState("");
  const [addDeficiency, setAddDeficiency] = useState("");
  const [addHabit, setAddHabit] = useState("");
  const [addActivity, setAddActivity] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [workType, setWorkType] = useState<WorkType>("");

  const [anyHealthIssues, setAnyHealthIssues] = useState<YesNo>("");
  const [surgeryHistory, setSurgeryHistory] = useState<YesNo>("");
  const [surgeryDetails, setSurgeryDetails] = useState("");
  const [medicineAllergy, setMedicineAllergy] = useState<YesNo>("");
  const [medicineAllergyName, setMedicineAllergyName] = useState("");
  const [consultedDoctor, setConsultedDoctor] = useState<YesNo>("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [otherHealthConcerns, setOtherHealthConcerns] = useState("");
  const [menstrualPattern, setMenstrualPattern] = useState<"heavy" | "very_less" | "none" | "">("");

  const [dietPattern, setDietPattern] = useState<DietPattern>("");
  const [nonVegFrequency, setNonVegFrequency] = useState("");
  const [consumeEgg, setConsumeEgg] = useState<YesNo>("");
  const [consumeMilk, setConsumeMilk] = useState<YesNo>("");
  const [foodAllergy, setFoodAllergy] = useState<YesNo>("");
  const [foodAllergyName, setFoodAllergyName] = useState("");
  const [mealSlotsSelected, setMealSlotsSelected] = useState<string[]>([]);
  const [snacksBetweenMeals, setSnacksBetweenMeals] = useState<YesNo>("");
  const [skipMeals, setSkipMeals] = useState<YesNo>("");
  const [foodSource, setFoodSource] = useState<string[]>([]);
  const [dieticianConsulted, setDieticianConsulted] = useState<YesNo>("");
  const [dieticianName, setDieticianName] = useState("");
  const [dieticianLocation, setDieticianLocation] = useState("");
  const [dieticianPhone, setDieticianPhone] = useState("");

  const [physicalActivity, setPhysicalActivity] = useState<YesNo>("");
  const [activityOtherText, setActivityOtherText] = useState("");
  const [habitOtherText, setHabitOtherText] = useState("");
  const [improvementThoughts, setImprovementThoughts] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          healthConditions,
          symptoms,
          autoimmune,
          deficiencies,
          digestiveIssues,
          skinIssues,
          habits,
          activities,
        ] = await Promise.all([
          fetchHealthConditionMasters(),
          fetchSymptomMasters(),
          fetchAutoimmuneMasters(),
          fetchDeficiencyMasters(),
          fetchDigestiveIssueMasters(),
          fetchSkinIssueMasters(),
          fetchHabitMasters(),
          fetchActivityMasters(),
        ]);

        const healthNames = mergeOptions(
          DEFAULT_HEALTH_ISSUES,
          healthConditions.map((item) => item.name)
        );
        setHealthRows(healthNames.map((name) => ({ name, value: "", sinceWhen: "", comments: "" })));
        setAutoimmuneOptions(mergeOptions(DEFAULT_AUTOIMMUNE, autoimmune.map((item) => item.name)));
        setSymptomOptions(mergeOptions(DEFAULT_SYMPTOMS, symptoms.map((item) => item.name)));
        setSkinOptions(mergeOptions(DEFAULT_SKIN_ISSUES, skinIssues.map((item) => item.name)));
        setDeficiencyOptions(mergeOptions(DEFAULT_DEFICIENCIES, deficiencies.map((item) => item.name)));
        setHabitOptions(mergeOptions(DEFAULT_HABITS, habits.map((item) => item.name)));
        setActivityOptions(mergeOptions(DEFAULT_ACTIVITIES, activities.map((item) => item.name)));
      } catch (err) {
        console.error(err);
        setError("Failed to load questionnaire questions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalQuestions = useMemo(() => {
    return (
      26 +
      healthRows.length +
      autoimmuneOptions.length +
      symptomOptions.length +
      skinOptions.length +
      deficiencyOptions.length +
      habitOptions.length +
      activityOptions.length
    );
  }, [healthRows.length, autoimmuneOptions.length, symptomOptions.length, skinOptions.length, deficiencyOptions.length, habitOptions.length, activityOptions.length]);

  const handleDownload = async (format: "pdf" | "docx") => {
    const data: QuestionnaireData = {
      title, name, age, gender, height, weight, workType,
      anyHealthIssues, healthRows,
      autoimmuneOptions, autoimmuneSelected,
      symptomOptions, symptomSelected,
      skinOptions, skinSelected,
      deficiencyOptions, deficiencySelected,
      surgeryHistory, surgeryDetails,
      medicineAllergy, medicineAllergyName,
      consultedDoctor, doctorName, doctorSpecialty, doctorPhone,
      otherHealthConcerns, menstrualPattern,
      dietPattern, nonVegFrequency,
      consumeEgg, consumeMilk,
      foodAllergy, foodAllergyName,
      mealSlotsSelected, snacksBetweenMeals, skipMeals,
      foodSource,
      dieticianConsulted, dieticianName, dieticianLocation, dieticianPhone,
      physicalActivity,
      activityOptions, activitySelected,
      activityOtherText,
      habitOptions, habitSelected,
      habitOtherText,
      improvementThoughts,
    };

    try {
      setDownloadingFormat(format);
      if (format === "pdf") {
        generatePDF(data);
      } else {
        await generateDOCX(data);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to download ${format.toUpperCase()} file.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const updateHealthRow = (index: number, patch: Partial<HealthIssueRow>) => {
    setHealthRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <>
      <PageMeta title="Patient Questionnaire Questions" description="Admin view of patient questionnaire question list" />
      <PageBreadcrumb pageTitle="Patient Questionnaire Questions" />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total fields: {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={downloadingFormat !== null}
                onClick={() => handleDownload("docx")}
              >
                {downloadingFormat === "docx" ? "Downloading..." : "Download .docx"}
              </Button>
              <Button type="button" disabled={downloadingFormat !== null} onClick={() => handleDownload("pdf")}>
                {downloadingFormat === "pdf" ? "Downloading..." : "Download PDF"}
              </Button>
            </div>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>

        <div className="space-y-4 pb-8">
          {loading ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-300">
              Loading questions...
            </div>
          ) : (
            <>
              <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">PERSONAL DETAILS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm">Name <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                  <label className="text-sm">Age <input value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                  <label className="text-sm">Height <input value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                  <label className="text-sm">Weight <input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Gender</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label><input type="radio" checked={gender === "male"} onChange={() => setGender("male")} /> Male</label>
                    <label><input type="radio" checked={gender === "female"} onChange={() => setGender("female")} /> Female</label>
                    <label><input type="radio" checked={gender === "other"} onChange={() => setGender("other")} /> Other</label>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Types of work</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label><input type="radio" checked={workType === "sedentary"} onChange={() => setWorkType("sedentary")} /> Sedentary</label>
                    <label><input type="radio" checked={workType === "moderate"} onChange={() => setWorkType("moderate")} /> Moderate</label>
                    <label><input type="radio" checked={workType === "heavy"} onChange={() => setWorkType("heavy")} /> Heavy</label>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">HEALTH ISSUES</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Any Health Issues</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={anyHealthIssues === "yes"} onChange={() => setAnyHealthIssues("yes")} /> Yes</label>
                    <label><input type="radio" checked={anyHealthIssues === "no"} onChange={() => setAnyHealthIssues("no")} /> No</label>
                  </div>
                </div>

                {anyHealthIssues === "yes" ? (
                  <div className="overflow-x-auto rounded border dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/70">
                        <tr>
                          <th className="text-left p-2">Condition</th>
                          <th className="text-center p-2">Yes</th>
                          <th className="text-center p-2">No</th>
                          <th className="text-left p-2">Since when</th>
                          <th className="text-left p-2">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {healthRows.map((row, idx) => (
                          <tr key={row.name} className="border-t dark:border-gray-700">
                            <td className="p-2">{idx + 1}. {row.name}</td>
                            <td className="p-2 text-center"><input type="radio" checked={row.value === "yes"} onChange={() => updateHealthRow(idx, { value: "yes" })} /></td>
                            <td className="p-2 text-center"><input type="radio" checked={row.value === "no"} onChange={() => updateHealthRow(idx, { value: "no", sinceWhen: "", comments: "" })} /></td>
                            <td className="p-2"><input value={row.sinceWhen} disabled={row.value !== "yes"} onChange={(e) => updateHealthRow(idx, { sinceWhen: e.target.value })} className="w-full rounded border px-2 py-1 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50" /></td>
                            <td className="p-2"><input value={row.comments} disabled={row.value !== "yes"} onChange={(e) => updateHealthRow(idx, { comments: e.target.value })} className="w-full rounded border px-2 py-1 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-3 border-t dark:border-gray-700 flex gap-2">
                      <input value={addHealthIssue} onChange={(e) => setAddHealthIssue(e.target.value)} placeholder="Add more +" className="flex-1 rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <Button type="button" variant="outline" onClick={() => {
                        const val = addHealthIssue.trim();
                        if (!val) return;
                        setHealthRows((prev) => [...prev, { name: val, value: "", sinceWhen: "", comments: "" }]);
                        setAddHealthIssue("");
                      }}>Add</Button>
                    </div>
                  </div>
                ) : null}

                {[
                  { title: "Any auto immune Diseases", options: autoimmuneOptions, selected: autoimmuneSelected, setSelected: setAutoimmuneSelected, addValue: addAutoimmune, setAddValue: setAddAutoimmune, setOptions: setAutoimmuneOptions },
                  { title: "Symptoms any other", options: symptomOptions, selected: symptomSelected, setSelected: setSymptomSelected, addValue: addSymptom, setAddValue: setAddSymptom, setOptions: setSymptomOptions },
                  { title: "Any skin issue", options: skinOptions, selected: skinSelected, setSelected: setSkinSelected, addValue: addSkinIssue, setAddValue: setAddSkinIssue, setOptions: setSkinOptions },
                  { title: "Any vitamin or Mineral deficiency", options: deficiencyOptions, selected: deficiencySelected, setSelected: setDeficiencySelected, addValue: addDeficiency, setAddValue: setAddDeficiency, setOptions: setDeficiencyOptions },
                ].map((group) => (
                  <div key={group.title} className="space-y-2">
                    <p className="text-sm font-medium">{group.title}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map((option) => (
                        <label key={`${group.title}-${option}`} className="text-sm flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={group.selected.includes(option)}
                            onChange={() => group.setSelected((prev) => toggleItem(prev, option))}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={group.addValue} onChange={(e) => group.setAddValue(e.target.value)} placeholder="Add more +" className="flex-1 rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <Button type="button" variant="outline" onClick={() => {
                        const val = group.addValue.trim();
                        if (!val) return;
                        group.setOptions((prev) => mergeOptions(prev, [val]));
                        group.setAddValue("");
                      }}>Add</Button>
                    </div>
                  </div>
                ))}

                <div className="space-y-1">
                  <p className="text-sm font-medium">Do you have any history of surgery?</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={surgeryHistory === "yes"} onChange={() => setSurgeryHistory("yes")} /> Yes</label>
                    <label><input type="radio" checked={surgeryHistory === "no"} onChange={() => setSurgeryHistory("no")} /> No</label>
                  </div>
                  {surgeryHistory === "yes" ? (
                    <input value={surgeryDetails} onChange={(e) => setSurgeryDetails(e.target.value)} placeholder="Please specify the type of surgery" className="mt-2 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                  ) : null}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Any Allergy from medicine</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={medicineAllergy === "yes"} onChange={() => setMedicineAllergy("yes")} /> Yes</label>
                    <label><input type="radio" checked={medicineAllergy === "no"} onChange={() => setMedicineAllergy("no")} /> No</label>
                  </div>
                  {medicineAllergy === "yes" ? (
                    <input value={medicineAllergyName} onChange={(e) => setMedicineAllergyName(e.target.value)} placeholder="Please mention the name" className="mt-2 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                  ) : null}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Have you consulted a doctor?</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={consultedDoctor === "yes"} onChange={() => setConsultedDoctor("yes")} /> Yes</label>
                    <label><input type="radio" checked={consultedDoctor === "no"} onChange={() => setConsultedDoctor("no")} /> No</label>
                  </div>
                  {consultedDoctor === "yes" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Consultant Doctor name" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <input value={doctorSpecialty} onChange={(e) => setDoctorSpecialty(e.target.value)} placeholder="Specialty" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <input value={doctorPhone} onChange={(e) => setDoctorPhone(e.target.value)} placeholder="Phone number" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                  ) : null}
                </div>

                <label className="text-sm block">
                  Do you have any other health problems or concerns not mentioned earlier?
                  <textarea value={otherHealthConcerns} onChange={(e) => setOtherHealthConcerns(e.target.value)} rows={3} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </label>

                {gender === "female" ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Any menstrual problem</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <label><input type="radio" checked={menstrualPattern === "heavy"} onChange={() => setMenstrualPattern("heavy")} /> Heavy bleeding</label>
                      <label><input type="radio" checked={menstrualPattern === "very_less"} onChange={() => setMenstrualPattern("very_less")} /> Very less bleeding</label>
                      <label><input type="radio" checked={menstrualPattern === "none"} onChange={() => setMenstrualPattern("none")} /> None</label>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">FOOD HABIT</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Diet patterns</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={dietPattern === "veg"} onChange={() => setDietPattern("veg")} /> Veg</label>
                    <label><input type="radio" checked={dietPattern === "non_veg"} onChange={() => setDietPattern("non_veg")} /> Non Veg</label>
                  </div>
                  {dietPattern === "non_veg" ? (
                    <div className="space-y-2 mt-2 text-sm">
                      <p>Frequency of Non-Veg Intake</p>
                      {[
                        "Daily",
                        "3–4 times a week",
                        "1–2 times a week",
                        "Occasionally (once in 2–3 weeks)",
                      ].map((freq) => (
                        <label key={freq} className="block">
                          <input type="radio" checked={nonVegFrequency === freq} onChange={() => setNonVegFrequency(freq)} /> {freq}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>

                {[
                  { label: "Do you consume Egg", value: consumeEgg, setValue: setConsumeEgg },
                  { label: "Do you consume milk", value: consumeMilk, setValue: setConsumeMilk },
                  { label: "Any food Allergy", value: foodAllergy, setValue: setFoodAllergy },
                  { label: "Do you consume Snack in between Meals", value: snacksBetweenMeals, setValue: setSnacksBetweenMeals },
                  { label: "Do you skip meals", value: skipMeals, setValue: setSkipMeals },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <div className="flex gap-5 text-sm">
                      <label><input type="radio" checked={item.value === "yes"} onChange={() => item.setValue("yes")} /> Yes</label>
                      <label><input type="radio" checked={item.value === "no"} onChange={() => item.setValue("no")} /> No</label>
                    </div>
                  </div>
                ))}

                {foodAllergy === "yes" ? (
                  <input value={foodAllergyName} onChange={(e) => setFoodAllergyName(e.target.value)} placeholder="Please mention the name" className="w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                ) : null}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Number of meals in one day</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {["Early Morning", "Breakfast", "Mid morning", "Lunch", "Evening snacks", "Dinner", "None"].map((slot) => (
                      <label key={slot}><input type="checkbox" checked={mealSlotsSelected.includes(slot)} onChange={() => setMealSlotsSelected((prev) => toggleItem(prev, slot))} /> {slot}</label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">From where do you consume food</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {["Home", "Canteen", "Hotel", "Home supplies"].map((source) => (
                      <label key={source}><input type="checkbox" checked={foodSource.includes(source)} onChange={() => setFoodSource((prev) => toggleItem(prev, source))} /> {source}</label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Have you taken any consultation from a dietician previously?</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={dieticianConsulted === "yes"} onChange={() => setDieticianConsulted("yes")} /> Yes</label>
                    <label><input type="radio" checked={dieticianConsulted === "no"} onChange={() => setDieticianConsulted("no")} /> No</label>
                  </div>
                  {dieticianConsulted === "yes" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      <input value={dieticianName} onChange={(e) => setDieticianName(e.target.value)} placeholder="Dietician Name" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <input value={dieticianLocation} onChange={(e) => setDieticianLocation(e.target.value)} placeholder="Location" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <input value={dieticianPhone} onChange={(e) => setDieticianPhone(e.target.value)} placeholder="Phone number" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">OTHER HABIT</h3>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Do you indulge in any physical activity?</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={physicalActivity === "yes"} onChange={() => setPhysicalActivity("yes")} /> Yes</label>
                    <label><input type="radio" checked={physicalActivity === "no"} onChange={() => setPhysicalActivity("no")} /> No</label>
                  </div>
                </div>

                {physicalActivity === "yes" ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">If yes, please choose from the list below</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {activityOptions.map((option) => (
                        <label key={option}><input type="checkbox" checked={activitySelected.includes(option)} onChange={() => setActivitySelected((prev) => toggleItem(prev, option))} /> {option}</label>
                      ))}
                    </div>
                    {activitySelected.some((x) => x.toLowerCase().includes("other")) ? (
                      <input value={activityOtherText} onChange={(e) => setActivityOtherText(e.target.value)} placeholder="Others (please specify)" className="w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    ) : null}
                    <div className="flex gap-2">
                      <input value={addActivity} onChange={(e) => setAddActivity(e.target.value)} placeholder="Add more +" className="flex-1 rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <Button type="button" variant="outline" onClick={() => {
                        const val = addActivity.trim();
                        if (!val) return;
                        setActivityOptions((prev) => mergeOptions(prev, [val]));
                        setAddActivity("");
                      }}>Add</Button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Do you have any other habits</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {habitOptions.map((option) => (
                      <label key={option}><input type="checkbox" checked={habitSelected.includes(option)} onChange={() => setHabitSelected((prev) => toggleItem(prev, option))} /> {option}</label>
                    ))}
                  </div>
                  {habitSelected.some((x) => x.toLowerCase().includes("other")) ? (
                    <input value={habitOtherText} onChange={(e) => setHabitOtherText(e.target.value)} placeholder="Others (please specify)" className="w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                  ) : null}
                  <div className="flex gap-2">
                    <input value={addHabit} onChange={(e) => setAddHabit(e.target.value)} placeholder="Add more +" className="flex-1 rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    <Button type="button" variant="outline" onClick={() => {
                      const val = addHabit.trim();
                      if (!val) return;
                      setHabitOptions((prev) => mergeOptions(prev, [val]));
                      setAddHabit("");
                    }}>Add</Button>
                  </div>
                </div>

                <label className="text-sm block">
                  Please share your thoughts on what can help us improve your health
                  <textarea
                    rows={5}
                    value={improvementThoughts}
                    onChange={(e) => setImprovementThoughts(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700"
                  />
                </label>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
