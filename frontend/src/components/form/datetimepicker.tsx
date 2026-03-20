import { useEffect, useMemo, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon, TimeIcon } from "../../icons";
import type { Hook, DateOption, DateLimit } from "flatpickr/dist/types/options";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type TimeFormat = "12" | "24";

type DisableList = DateLimit[];
type DisableProp = DisableList | DateLimit;

type DateTimePickerProps = {
  id: string;
  label?: string;
  placeholder?: string;
  defaultDate?: DateOption;
  onChange?: Hook | Hook[];
  timeFormat?: TimeFormat;
  enableSeconds?: boolean;
  minDate?: DateOption;
  maxDate?: DateOption;
  disableDates?: DisableProp;
  /**
   * Array of weekday numbers to disable. 0 = Sunday ... 6 = Saturday
   * Example: [2] disables every Tuesday.
   */
  disabledWeekdays?: number[];
  /**
   * Weekdays to visually highlight (0 = Sunday ... 6 = Saturday).
   */
  highlightWeekdays?: number[];
  disabled?: boolean;
  className?: string;
  required?: boolean;
};

export default function DateTimePicker({
  id,
  label,
  placeholder,
  defaultDate,
  onChange,
  timeFormat = "12",
  enableSeconds = false,
  minDate,
  maxDate,
  disableDates,
  disabledWeekdays,
  highlightWeekdays,
  disabled = false,
  className,
  required = false,
}: DateTimePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef<Hook | Hook[] | undefined>(onChange);

  const disableRules = useMemo(() => {
    const rules: DisableList = Array.isArray(disableDates)
      ? [...disableDates]
      : disableDates
        ? [disableDates]
        : [];

    if (disabledWeekdays && disabledWeekdays.length > 0) {
      const normalized = disabledWeekdays.map((day) => ((day % 7) + 7) % 7);
      rules.push((date) => normalized.includes(date.getDay()));
    }

    return rules;
  }, [disableDates, disabledWeekdays]);

  const highlightedWeekdays = useMemo(() => {
    if (!highlightWeekdays || highlightWeekdays.length === 0) return undefined;
    const normalized = highlightWeekdays.map((day) => ((day % 7) + 7) % 7);
    return Array.from(new Set(normalized));
  }, [highlightWeekdays]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!inputRef.current) return;

    const applyPreferredStyles = (instance: flatpickr.Instance) => {
      const calendar = instance.calendarContainer;
      if (!calendar) return;
      const allDays = calendar.querySelectorAll(".flatpickr-day");
      allDays.forEach((day: Element) => {
        const dayElem = day as HTMLElement & { dateObj?: Date };
        const dateObj = dayElem.dateObj;
        if (!highlightedWeekdays || highlightedWeekdays.length === 0 || !dateObj) {
          dayElem.classList.remove("preferred-day");
          return;
        }

        if (highlightedWeekdays.includes(dateObj.getDay())) {
          dayElem.classList.add("preferred-day");
        } else {
          dayElem.classList.remove("preferred-day");
        }
      });
    };

    const fp = flatpickr(inputRef.current, {
      enableTime: true,
      enableSeconds,
      time_24hr: timeFormat === "24",
      dateFormat: timeFormat === "24" ? "Y-m-d H:i" : enableSeconds ? "Y-m-d h:i:S K" : "Y-m-d h:i K",
      defaultDate,
      minDate,
      maxDate,
      disable: disableRules,
      onChange: disabled
        ? undefined
        : (selectedDates, dateStr, instance, data) => {
            const handler = onChangeRef.current;
            if (!handler) return;
            if (Array.isArray(handler)) {
              handler.forEach((fn) => fn(selectedDates, dateStr, instance, data));
            } else {
              handler(selectedDates, dateStr, instance, data);
            }
          },
      clickOpens: !disabled,
      onReady: (_selectedDates: Date[], _dateStr: string, instance: flatpickr.Instance) => {
        setTimeout(() => applyPreferredStyles(instance), 50);
      },
      onDayCreate: (_dObj: Date[], _dStr: string, _instance: flatpickr.Instance, dayElem: HTMLElement) => {
        const enrichedDay = dayElem as HTMLElement & { dateObj?: Date };
        const dateObj = enrichedDay.dateObj;
        if (dateObj) {
          enrichedDay.dataset.weekday = dateObj.getDay().toString();
        } else {
          delete enrichedDay.dataset.weekday;
        }

        if (highlightedWeekdays && highlightedWeekdays.length > 0 && dateObj) {
          if (highlightedWeekdays.includes(dateObj.getDay())) {
            dayElem.classList.add("preferred-day");
          } else {
            dayElem.classList.remove("preferred-day");
          }
        } else {
          dayElem.classList.remove("preferred-day");
        }
      },
      onMonthChange: (_selectedDates: Date[], _dateStr: string, instance: flatpickr.Instance) => {
        setTimeout(() => applyPreferredStyles(instance), 50);
      },
      onYearChange: (_selectedDates: Date[], _dateStr: string, instance: flatpickr.Instance) => {
        setTimeout(() => applyPreferredStyles(instance), 50);
      },
    });
    fpRef.current = Array.isArray(fp) ? fp[0] : fp;

    // Add custom CSS styles dynamically
    const styleId = `flatpickr-custom-styles-${id}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Preferred dates - blue pill */
        .flatpickr-calendar .preferred-day:not(.selected) {
          background-color: #dbeafe !important;
          border-color: #2563eb !important;
          color: #1e3a8a !important;
        }
        .flatpickr-calendar.darkMode .preferred-day:not(.selected) {
          background-color: rgba(37, 99, 235, 0.25) !important;
          border-color: #60a5fa !important;
          color: #dbeafe !important;
        }
        /* Selected date - filled circle */
        .flatpickr-calendar .flatpickr-day.selected {
          background-color: #4f46e5 !important;
          border-color: #4f46e5 !important;
          border-radius: 50% !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.4) !important;
        }
        .flatpickr-calendar.darkMode .flatpickr-day.selected {
          background-color: #6366f1 !important;
          border-color: #6366f1 !important;
        }
        /* Today indicator */
        .flatpickr-calendar .flatpickr-day.today {
          border-color: #4f46e5 !important;
          border-width: 2px !important;
        }
        .flatpickr-calendar .flatpickr-day.today.selected {
          border-color: white !important;
          border-width: 2px !important;
        }
        /* Disabled dates - grayed out, no circle */
        .flatpickr-calendar .flatpickr-day.flatpickr-disabled {
          color: #9ca3af !important;
          cursor: not-allowed !important;
          border: none !important;
          background-color: transparent !important;
          opacity: 0.5 !important;
        }
        /* Previous/next month dates */
        .flatpickr-calendar .flatpickr-day.prevMonthDay,
        .flatpickr-calendar .flatpickr-day.nextMonthDay {
          color: #d1d5db !important;
        }
        .flatpickr-calendar.darkMode .flatpickr-day.prevMonthDay,
        .flatpickr-calendar.darkMode .flatpickr-day.nextMonthDay {
          color: #a5b4fc !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
      }
      fpRef.current = null;
      // Clean up style element
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [id, minDate, maxDate, disableRules, timeFormat, enableSeconds, disabled, highlightedWeekdays]);

  useEffect(() => {
    if (!fpRef.current) return;
    if (defaultDate) {
      fpRef.current.setDate(defaultDate, false);
    } else {
      fpRef.current.clear();
    }
  }, [defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={disabled}
          required={required}
          className={twMerge(
            clsx(
              "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )
          )}
        />
        <span className="absolute flex items-center gap-1 text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-5" />
          <TimeIcon className="size-5" />
        </span>
      </div>
    </div>
  );
}


