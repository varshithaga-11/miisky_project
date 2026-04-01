/**
 * departmentIcons.ts
 * Central registry of all available department icons.
 * The `value` is stored in the database as `icon_class`.
 * The `src` points to the public SVG asset path.
 */

export interface DepartmentIcon {
  value: string;       // stored in DB (icon_class field)
  label: string;       // displayed in dropdown
  src: string;         // public path to the SVG
}

export const DEPARTMENT_ICONS: DepartmentIcon[] = [
  { value: "dept-cardiology",       label: "Cardiology",        src: "/website/assets/images/dept-icons/cardiology.svg" },
  { value: "dept-dental",           label: "Dental",            src: "/website/assets/images/dept-icons/dental.svg" },
  { value: "dept-neurology",        label: "Neurology",         src: "/website/assets/images/dept-icons/neurology.svg" },
  { value: "dept-orthopedics",      label: "Orthopedics",       src: "/website/assets/images/dept-icons/orthopedics.svg" },
  { value: "dept-ophthalmology",    label: "Ophthalmology",     src: "/website/assets/images/dept-icons/ophthalmology.svg" },
  { value: "dept-gastroenterology", label: "Gastroenterology",  src: "/website/assets/images/dept-icons/gastroenterology.svg" },
  { value: "dept-pulmonology",      label: "Pulmonology",       src: "/website/assets/images/dept-icons/pulmonology.svg" },
  { value: "dept-pediatrics",       label: "Pediatrics",        src: "/website/assets/images/dept-icons/pediatrics.svg" },
  { value: "dept-dermatology",      label: "Dermatology",       src: "/website/assets/images/dept-icons/dermatology.svg" },
  { value: "dept-oncology",         label: "Oncology",          src: "/website/assets/images/dept-icons/oncology.svg" },
  { value: "dept-urology",          label: "Urology",           src: "/website/assets/images/dept-icons/urology.svg" },
  { value: "dept-surgery",          label: "Surgery",           src: "/website/assets/images/dept-icons/surgery.svg" },
  { value: "dept-radiology",        label: "Radiology",         src: "/website/assets/images/dept-icons/radiology.svg" },
  { value: "dept-nutrition",        label: "Nutrition",         src: "/website/assets/images/dept-icons/nutrition.svg" },
  { value: "dept-technology",       label: "Technology",        src: "/website/assets/images/dept-icons/technology.svg" },
  { value: "dept-operations",       label: "Operations",        src: "/website/assets/images/dept-icons/operations.svg" },
  { value: "dept-hr",               label: "HR",                src: "/website/assets/images/dept-icons/hr.svg" },
  { value: "dept-sales",            label: "Sales & Marketing", src: "/website/assets/images/dept-icons/sales.svg" },
  { value: "dept-leadership",       label: "Leadership",        src: "/website/assets/images/dept-icons/leadership.svg" },
  { value: "dept-medical",          label: "Medical",           src: "/website/assets/images/dept-icons/medical.svg" },
];

/**
 * Given an icon_class value, returns the matching icon object.
 * Falls back to the medical icon if not found.
 */
export function getDepartmentIcon(iconClass: string): DepartmentIcon {
  return (
    DEPARTMENT_ICONS.find((icon) => icon.value === iconClass) ??
    DEPARTMENT_ICONS[DEPARTMENT_ICONS.length - 1]
  );
}
