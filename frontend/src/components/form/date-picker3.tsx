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
  /** When mode is "range", called after both start and end are chosen. */
  onRangeChange?: (start: string, end: string) => void;
  /** Controlled range (YYYY-MM-DD) for mode "range". */
  rangeValue?: { start: string; end: string };
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
};

function formatLocalYmd(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePicker3({
  id,
  label,
  mode = "single",
  value,
  onChange,
  onRangeChange,
  rangeValue,
  placeholder,
  minDate,
  maxDate,
  className,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);
  const onRangeChangeRef = useRef(onRangeChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onRangeChangeRef.current = onRangeChange;
  }, [onRangeChange]);

  useEffect(() => {
    if (!inputRef.current) return;

    if (pickerRef.current) {
      pickerRef.current.destroy();
    }

    const defaultDate =
      mode === "range" && rangeValue?.start && rangeValue?.end
        ? [rangeValue.start, rangeValue.end]
        : value || undefined;

    pickerRef.current = flatpickr(inputRef.current, {
      mode,
      dateFormat: "Y-m-d",
      defaultDate,
      minDate,
      maxDate,
      clickOpens: true,
      allowInput: false,
      closeOnSelect: mode !== "range",
      disableMobile: false,
      appendTo: document.body,
      positionElement: inputRef.current,
      onChange: (selectedDates) => {
        if (mode === "range") {
          if (selectedDates.length === 2 && onRangeChangeRef.current) {
            onRangeChangeRef.current(
              formatLocalYmd(selectedDates[0]),
              formatLocalYmd(selectedDates[1])
            );
          }
          return;
        }
        if (onChangeRef.current && selectedDates.length > 0) {
          onChangeRef.current(formatLocalYmd(selectedDates[0]));
        }
      },
      onOpen: function (this: flatpickr.Instance) {
        const calendar = this.calendarContainer;
        if (calendar) {
          calendar.addEventListener("click", (e: Event) => {
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
  }, [mode, minDate, maxDate]);

  useEffect(() => {
    if (!pickerRef.current) return;
    if (mode === "range" && rangeValue?.start && rangeValue?.end) {
      pickerRef.current.setDate([rangeValue.start, rangeValue.end], false);
    } else if (mode !== "range" && value) {
      pickerRef.current.setDate(value, false);
    }
  }, [value, mode, rangeValue?.start, rangeValue?.end]);

  return (
    <div onClick={(e) => e.stopPropagation()} className={className}>
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
