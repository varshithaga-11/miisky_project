import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { TimeIcon } from "../../icons";
import type { Hook, DateOption } from "flatpickr/dist/types/options";

type TimeFormat = "12" | "24";

type TimePickerProps = {
  id: string;
  label?: string;
  placeholder?: string;
  defaultTime?: DateOption;
  onChange?: Hook | Hook[];
  timeFormat?: TimeFormat;
  enableSeconds?: boolean;
  minuteIncrement?: number;
  allowInput?: boolean;
};

export default function TimePicker({
  id,
  label,
  placeholder,
  defaultTime,
  onChange,
  timeFormat = "12",
  enableSeconds = false,
  minuteIncrement = 5,
  allowInput = false,
}: TimePickerProps) {
  useEffect(() => {
    const fp = flatpickr(`#${id}`, {
      enableTime: true,
      noCalendar: true,
      dateFormat:
        timeFormat === "24"
          ? enableSeconds
            ? "H:i:S"
            : "H:i"
          : enableSeconds
            ? "h:i:S K"
            : "h:i K",
      defaultDate: defaultTime,
      onChange,
      time_24hr: timeFormat === "24",
      enableSeconds,
      minuteIncrement,
      static: true,
      allowInput,
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, [
    id,
    defaultTime,
    onChange,
    timeFormat,
    enableSeconds,
    minuteIncrement,
    allowInput,
  ]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <span className="absolute flex items-center gap-1 text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <TimeIcon className="size-5" />
        </span>
      </div>
    </div>
  );
}


