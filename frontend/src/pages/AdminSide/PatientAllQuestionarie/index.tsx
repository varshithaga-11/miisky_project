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

  const [healthRows, setHealthRows] = useState<HealthIssueRow[]>([]);
  const [autoimmuneOptions, setAutoimmuneOptions] = useState<string[]>([]);
  const [symptomOptions, setSymptomOptions] = useState<string[]>([]);
  const [skinOptions, setSkinOptions] = useState<string[]>([]);
  const [deficiencyOptions, setDeficiencyOptions] = useState<string[]>([]);
  const [digestiveOptions, setDigestiveOptions] = useState<string[]>([]);
  const [habitOptions, setHabitOptions] = useState<string[]>([]);
  const [activityOptions, setActivityOptions] = useState<string[]>([]);

  const [autoimmuneSelected, setAutoimmuneSelected] = useState<string[]>([]);
  const [symptomSelected, setSymptomSelected] = useState<string[]>([]);
  const [skinSelected, setSkinSelected] = useState<string[]>([]);
  const [deficiencySelected, setDeficiencySelected] = useState<string[]>([]);
  const [digestiveSelected, setDigestiveSelected] = useState<string[]>([]);
  const [habitSelected, setHabitSelected] = useState<string[]>([]);
  const [activitySelected, setActivitySelected] = useState<string[]>([]);

  const [addHealthIssue, setAddHealthIssue] = useState("");
  const [addAutoimmune, setAddAutoimmune] = useState("");
  const [addSymptom, setAddSymptom] = useState("");
  const [addSkinIssue, setAddSkinIssue] = useState("");
  const [addDeficiency, setAddDeficiency] = useState("");
  const [addDigestive, setAddDigestive] = useState("");
  const [addHabit, setAddHabit] = useState("");
  const [addActivity, setAddActivity] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [language, setLanguage] = useState("");
  const [workType, setWorkType] = useState<WorkType>("");

  const [anyHealthIssues, setAnyHealthIssues] = useState<YesNo>("");
  const [surgeryHistory, setSurgeryHistory] = useState<YesNo>("");
  const [surgeryDetails, setSurgeryDetails] = useState("");
  const [medicineAllergy, setMedicineAllergy] = useState<YesNo>("");
  const [medicineAllergyDetails, setMedicineAllergyDetails] = useState("");
  const [dietitianConsultationBefore, setDietitianConsultationBefore] = useState<YesNo>("");
  const [dietitianConsultationName, setDietitianConsultationName] = useState("");
  const [dietitianConsultationSpecialty, setDietitianConsultationSpecialty] = useState("");
  const [dietitianConsultationPhone, setDietitianConsultationPhone] = useState("");
  const [dietitianConsultationLocation, setDietitianConsultationLocation] = useState("");
  const [dietitianConsultationNotes, setDietitianConsultationNotes] = useState("");
  const [consultedDoctor, setConsultedDoctor] = useState<YesNo>("");
  const [consultantDoctorName, setConsultantDoctorName] = useState("");
  const [consultantDoctorSpecialty, setConsultantDoctorSpecialty] = useState("");
  const [consultantDoctorPhone, setConsultantDoctorPhone] = useState("");
  const [otherHealthConcerns, setOtherHealthConcerns] = useState("");
  const [menstrualPattern, setMenstrualPattern] = useState<"heavy" | "very_less" | "none" | "">("");

  const [dietPattern, setDietPattern] = useState<DietPattern | "eggetarian" | "">("");
  const [nonVegFrequency, setNonVegFrequency] = useState("");
  const [consumeEgg, setConsumeEgg] = useState<YesNo>("");
  const [consumeMilk, setConsumeMilk] = useState<YesNo>("");
  const [foodAllergy, setFoodAllergy] = useState<YesNo>("");
  const [foodAllergyDetails, setFoodAllergyDetails] = useState("");
  const [mealSlotsSelected, setMealSlotsSelected] = useState<string[]>([]);
  const [snacksBetweenMeals, setSnacksBetweenMeals] = useState<YesNo>("");
  const [skipMeals, setSkipMeals] = useState<YesNo>("");
  const [foodSource, setFoodSource] = useState<string[]>([]);

  const [physicalActivity, setPhysicalActivity] = useState<YesNo>("");
  const [activityOtherText, setActivityOtherText] = useState("");
  const [habitOtherText, setHabitOtherText] = useState("");
  const [improvementThoughts, setImprovementThoughts] = useState("");

  const [mealsPerDay, setMealsPerDay] = useState("");
  const [fruitsPerDay, setFruitsPerDay] = useState("");
  const [vegetablesPerDay, setVegetablesPerDay] = useState("");
  const [onMedication, setOnMedication] = useState<YesNo>("");
  const [specifyMedication, setSpecifyMedication] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [fallsSickFrequency, setFallsSickFrequency] = useState("");
  const [foodPreferences, setFoodPreferences] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [anyOtherComments, setAnyOtherComments] = useState("");
  const [anyNotesForCareTeam, setAnyNotesForCareTeam] = useState("");

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

        const healthNames = mergeOptions([], healthConditions.map((item) => item.name));
        setHealthRows(healthNames.map((name) => ({ name, value: "", sinceWhen: "", comments: "" })));
        setAutoimmuneOptions(mergeOptions([], autoimmune.map((item) => item.name)));
        setSymptomOptions(mergeOptions([], symptoms.map((item) => item.name)));
        setSkinOptions(mergeOptions([], skinIssues.map((item) => item.name)));
        setDeficiencyOptions(mergeOptions([], deficiencies.map((item) => item.name)));
        setDigestiveOptions(mergeOptions([], digestiveIssues.map((item) => item.name)));
        setHabitOptions(mergeOptions([], habits.map((item) => item.name)));
        setActivityOptions(mergeOptions([], activities.map((item) => item.name)));
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
      title, name, age, gender, religion, caste, language, height, weight, workType,
      anyHealthIssues, healthRows,
      autoimmuneOptions, autoimmuneSelected,
      symptomOptions, symptomSelected,
      skinOptions, skinSelected,
      deficiencyOptions, deficiencySelected,
      digestiveOptions, digestiveSelected,
      surgeryHistory, surgeryDetails,
      medicineAllergy, medicineAllergyDetails,
      dietitianConsultationBefore,
      dietitianConsultationName, dietitianConsultationSpecialty, dietitianConsultationPhone,
      dietitianConsultationLocation, dietitianConsultationNotes,
      consultedDoctor, consultantDoctorName, consultantDoctorSpecialty, consultantDoctorPhone,
      otherHealthConcerns, menstrualPattern,
      dietPattern, nonVegFrequency,
      consumeEgg, consumeMilk,
      foodAllergy, foodAllergyDetails,
      mealSlotsSelected, snacksBetweenMeals, skipMeals,
      foodSource,
      physicalActivity,
      activityOptions, activitySelected,
      activityOtherText,
      habitOptions, habitSelected,
      habitOtherText,
      improvementThoughts,
      mealsPerDay,
      fruitsPerDay,
      vegetablesPerDay,
      onMedication,
      specifyMedication,
      sleepQuality,
      stressLevel,
      fallsSickFrequency,
      foodPreferences,
      additionalNotes,
      anyOtherComments,
      anyNotesForCareTeam,
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
                  <label className="text-sm">Religion <input value={religion} onChange={(e) => setReligion(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                  <label className="text-sm">Caste <input value={caste} onChange={(e) => setCaste(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                  <label className="text-sm">Language <input value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
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
                  { title: "Any digestive issues", options: digestiveOptions, selected: digestiveSelected, setSelected: setDigestiveSelected, addValue: addDigestive, setAddValue: setAddDigestive, setOptions: setDigestiveOptions },
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
                  <p className="text-sm font-medium">History of surgery? (If yes, specify below)</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={surgeryHistory === "yes"} onChange={() => setSurgeryHistory("yes")} /> Yes</label>
                    <label><input type="radio" checked={surgeryHistory === "no"} onChange={() => setSurgeryHistory("no")} /> No</label>
                  </div>
                  <input value={surgeryDetails} onChange={(e) => setSurgeryDetails(e.target.value)} placeholder="Type of surgery" className="mt-2 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Medicine Allergy? (If yes, specify below)</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={medicineAllergy === "yes"} onChange={() => setMedicineAllergy("yes")} /> Yes</label>
                    <label><input type="radio" checked={medicineAllergy === "no"} onChange={() => setMedicineAllergy("no")} /> No</label>
                  </div>
                  <input value={medicineAllergyDetails} onChange={(e) => setMedicineAllergyDetails(e.target.value)} placeholder="Please mention the name/details" className="mt-2 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dietitianConsultationBefore === "yes"}
                      onChange={(e) => setDietitianConsultationBefore(e.target.checked ? "yes" : "no")}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Have you consulted any dietitian before? (Tick if yes)</span>
                  </label>
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input value={dietitianConsultationName} onChange={(e) => setDietitianConsultationName(e.target.value)} placeholder="Dietitian name" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <input value={dietitianConsultationSpecialty} onChange={(e) => setDietitianConsultationSpecialty(e.target.value)} placeholder="Specialty" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                      <input value={dietitianConsultationPhone} onChange={(e) => setDietitianConsultationPhone(e.target.value)} placeholder="Phone number" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                    <input value={dietitianConsultationLocation} onChange={(e) => setDietitianConsultationLocation(e.target.value)} placeholder="Location" className="w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    <textarea value={dietitianConsultationNotes} onChange={(e) => setDietitianConsultationNotes(e.target.value)} placeholder="Dietitian notes" rows={2} className="w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2 dark:border-gray-700">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consultedDoctor === "yes"}
                      onChange={(e) => setConsultedDoctor(e.target.checked ? "yes" : "no")}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Have you consulted a consultant doctor? (Tick if yes)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                    <input value={consultantDoctorName} onChange={(e) => setConsultantDoctorName(e.target.value)} placeholder="Consultant Doctor name" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    <input value={consultantDoctorSpecialty} onChange={(e) => setConsultantDoctorSpecialty(e.target.value)} placeholder="Specialty" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                    <input value={consultantDoctorPhone} onChange={(e) => setConsultantDoctorPhone(e.target.value)} placeholder="Phone number" className="rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                </div>

                <label className="text-sm block">
                  Do you have any other health problems or concerns not mentioned earlier?
                  <textarea value={otherHealthConcerns} onChange={(e) => setOtherHealthConcerns(e.target.value)} rows={3} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </label>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onMedication === "yes"}
                      onChange={(e) => setOnMedication(e.target.checked ? "yes" : "no")}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Are you currently on any medication? (Tick if yes)</span>
                  </label>
                  <input value={specifyMedication} onChange={(e) => setSpecifyMedication(e.target.value)} placeholder="Please specify medication" className="mt-2 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">FOOD HABIT</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Diet patterns</p>
                  <div className="flex gap-5 text-sm">
                    <label><input type="radio" checked={dietPattern === "veg"} onChange={() => setDietPattern("veg")} /> Veg</label>
                    <label><input type="radio" checked={dietPattern === "non_veg"} onChange={() => setDietPattern("non_veg")} /> Non Veg</label>
                    <label><input type="radio" checked={dietPattern === "eggetarian"} onChange={() => setDietPattern("eggetarian")} /> Eggetarian</label>
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
                  { label: "Do you consume Egg?", value: consumeEgg, setValue: setConsumeEgg },
                  { label: "Do you consume milk?", value: consumeMilk, setValue: setConsumeMilk },
                  { label: "Any food Allergy? (If yes, specify below)", value: foodAllergy, setValue: setFoodAllergy },
                  { label: "Do you consume Snack in between Meals?", value: snacksBetweenMeals, setValue: setSnacksBetweenMeals },
                  { label: "Do you skip meals?", value: skipMeals, setValue: setSkipMeals },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <div className="flex gap-5 text-sm">
                      <label><input type="radio" checked={item.value === "yes"} onChange={() => item.setValue("yes")} /> Yes</label>
                      <label><input type="radio" checked={item.value === "no"} onChange={() => item.setValue("no")} /> No</label>
                    </div>
                  </div>
                ))}

                  <textarea value={foodAllergyDetails} onChange={(e) => setFoodAllergyDetails(e.target.value)} placeholder="Please mention the food name" className="mt-2 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-sm">Fruits intake per day <input type="number" value={fruitsPerDay} onChange={(e) => setFruitsPerDay(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                  <label className="text-sm">Vegetables intake per day <input type="number" value={vegetablesPerDay} onChange={(e) => setVegetablesPerDay(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" /></label>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Number of meals in one day</p>
                  <input type="number" value={mealsPerDay} onChange={(e) => setMealsPerDay(e.target.value)} placeholder="Total count of meals" className="w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
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
                    rows={3}
                    value={improvementThoughts}
                    onChange={(e) => setImprovementThoughts(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700"
                  />
                </label>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Sleep quality</p>
                    <div className="flex gap-5 text-sm">
                      <label><input type="radio" checked={sleepQuality === "Fresh"} onChange={() => setSleepQuality("Fresh")} /> Fresh</label>
                      <label><input type="radio" checked={sleepQuality === "Not Fresh"} onChange={() => setSleepQuality("Not Fresh")} /> Not Fresh</label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Stress level</p>
                    <div className="flex gap-5 text-sm">
                      <label><input type="radio" checked={stressLevel === "Low"} onChange={() => setStressLevel("Low")} /> Low</label>
                      <label><input type="radio" checked={stressLevel === "Medium"} onChange={() => setStressLevel("Medium")} /> Medium</label>
                      <label><input type="radio" checked={stressLevel === "High"} onChange={() => setStressLevel("High")} /> High</label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Falls sick frequency</p>
                    <div className="flex gap-5 text-sm">
                      <label><input type="radio" checked={fallsSickFrequency === "Once"} onChange={() => setFallsSickFrequency("Once")} /> Once</label>
                      <label><input type="radio" checked={fallsSickFrequency === "Twice"} onChange={() => setFallsSickFrequency("Twice")} /> Twice</label>
                      <label><input type="radio" checked={fallsSickFrequency === "Frequent"} onChange={() => setFallsSickFrequency("Frequent")} /> Frequent</label>
                    </div>
                  </div>

                  {gender !== "male" && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Menstrual Pattern</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <label><input type="radio" checked={menstrualPattern === "heavy"} onChange={() => setMenstrualPattern("heavy")} /> Heavy bleeding</label>
                        <label><input type="radio" checked={menstrualPattern === "very_less"} onChange={() => setMenstrualPattern("very_less")} /> Very less bleeding</label>
                        <label><input type="radio" checked={menstrualPattern === "none"} onChange={() => setMenstrualPattern("none")} /> None</label>
                      </div>
                    </div>
                  )}
                </div>

                <label className="text-sm block">
                  Food Preferences
                  <textarea rows={2} value={foodPreferences} onChange={(e) => setFoodPreferences(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </label>

                <label className="text-sm block">
                  Additional Notes
                  <textarea rows={2} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </label>

                <label className="text-sm block">
                  Any Other Comments
                  <textarea rows={2} value={anyOtherComments} onChange={(e) => setAnyOtherComments(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </label>

                <label className="text-sm block">
                  Any Notes for Care Team
                  <textarea rows={2} value={anyNotesForCareTeam} onChange={(e) => setAnyNotesForCareTeam(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700" />
                </label>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
