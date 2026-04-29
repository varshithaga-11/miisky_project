import { useEffect, useRef, useState } from "react";

export interface Option<T = string | number> {
  value: T;
  label: string;
}

interface SearchableSelectProps<T = string | number> {
  name?: string;
  options: Option<T>[];
  value?: T;
  onChange: (value: T) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  onFocus?: () => void | Promise<void>;
}

const SearchableSelect = <T extends string | number>({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  error,
  required = false,
  onFocus,
}: SearchableSelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = onSearch 
    ? options // if onSearch is provided, depend on backend filtering which populates `options`
    : options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      );

  const showError =
    required &&
    touched &&
    (value === "" || value === undefined || value === null);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Reset touched state when value is cleared from outside (e.g., form reset)
  useEffect(() => {
    if (value === "" || value === undefined || value === null) {
      setTouched(false);
    }
  }, [value]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTouched(true);
          if (onFocus) onFocus();
        }}
        disabled={disabled}
        className={`h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900 px-4 pr-10 text-left text-sm
          text-gray-900 dark:text-white/90 focus:outline-none relative
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${showError ? "border-red-500" : ""}
        `}
      >
        {selected ? (
          selected.label
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}

        {/* Dropdown arrow */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg
                     border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900
                     shadow-lg max-h-64 overflow-hidden"
        >
          {/* Search input */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (onSearch) {
                  onSearch(e.target.value);
                }
              }}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700
                         bg-white dark:bg-gray-800 px-3 py-2 text-sm
                         text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                      if (onSearch) onSearch(""); // Reset backend search when item selected
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm
                      ${
                        value === opt.value
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/70"
                      }
                      text-gray-900 dark:text-gray-100`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            ) : (
              <li>
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {(showError || error) && (
        <p className="text-red-500 text-xs mt-1">
          {error || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect;
