import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id: string;
  label?: string;
  mode?: "single" | "multiple" | "range" | "time";
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
};

export default function DatePicker2({
  id,
  label,
  mode = "single",
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);

  // Update onChange ref without triggering re-initialization
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Flatpickr once
  useEffect(() => {
    if (!inputRef.current) return;

    // Destroy existing instance if any
    if (pickerRef.current) {
      pickerRef.current.destroy();
    }

    pickerRef.current = flatpickr(inputRef.current, {
      mode,
      dateFormat: "Y-m-d",
      defaultDate: value || undefined,
      minDate,
      maxDate,
      clickOpens: true,
      allowInput: false,
      closeOnSelect: true,
      disableMobile: false,
      appendTo: document.body, // Append to body to avoid parent container issues
      positionElement: inputRef.current, // Position relative to input
      onChange: (selectedDates) => {
        if (onChangeRef.current && selectedDates.length > 0) {
          // onChangeRef.current(selectedDates[0].toISOString().split("T")[0]);
          const localDate = selectedDates[0];
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, "0");
          const day = String(localDate.getDate()).padStart(2, "0");
          onChangeRef.current(`${year}-${month}-${day}`);
        }
      },
      onOpen: function(this: flatpickr.Instance) {
        // Prevent any parent click handlers from interfering
        const calendar = this.calendarContainer;
        if (calendar) {
          calendar.addEventListener('click', (e: Event) => {
            e.stopPropagation();
          });
        }
      },
    });

    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, [mode, minDate, maxDate]); // Removed 'value' and 'onChange' from dependencies

  // Update the value separately without destroying the instance
  useEffect(() => {
    if (pickerRef.current && value) {
      pickerRef.current.setDate(value, false); // false = don't trigger onChange
    }
  }, [value]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          placeholder={placeholder || "Select date"}
          defaultValue={value}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 cursor-pointer"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
