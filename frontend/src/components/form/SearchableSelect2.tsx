import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiX } from "react-icons/fi";

export interface Option<T = string | number> {
  value: T;
  label: string;
}

interface SearchableSelect2Props<T = string | number> {
  label?: string;
  options: Option<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  onFocus?: () => void | Promise<void>;
}

const SearchableSelect2 = <T extends string | number>({
  label,
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Select options",
  className = "",
  disabled = false,
  error,
  required = false,
  onFocus,
}: SearchableSelect2Props<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = onSearch 
    ? options 
    : options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      );

  const showError =
    required &&
    touched &&
    (!value || value.length === 0);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleOption = (optionValue: T) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeValue = (v: T) => {
    onChange(value.filter((val) => val !== v));
  };

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div
          onClick={() => {
            if (disabled) return;
            if (!open && onFocus) onFocus();
            setOpen((o) => !o);
            setTouched(true);
          }}
          className={`min-h-[44px] w-full rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-900 px-3 py-1.5 text-left text-sm cursor-pointer
            text-gray-900 dark:text-white/90 focus-within:ring-2 focus-within:ring-brand-500/20
            flex flex-wrap gap-1.5 items-center pr-10
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${showError ? "border-red-500" : ""}
          `}
        >
          {value.length > 0 ? (
            value.map((v) => {
              const opt = options.find((o) => o.value === v);
              return (
                <span
                  key={String(v)}
                  className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-md text-xs font-medium"
                >
                  {opt?.label || String(v)}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(v);
                    }}
                    className="hover:text-red-500"
                  >
                    <FiX size={12} />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
            <FiChevronDown className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </div>
        </div>

        {open && (
          <div
            className="absolute z-[100] mt-1 w-full rounded-lg
                       border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900
                       shadow-xl flex flex-col"
            style={{ maxHeight: '350px' }}
          >
            {/* Search input */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 text-sm
                           text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <ul className="flex-1 overflow-y-auto py-1 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <li key={String(opt.value)}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(opt.value);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors
                          ${isSelected ? "bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"}`}
                      >
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all
                          ${isSelected ? "bg-brand-500 border-brand-500" : "border-gray-300 dark:border-gray-600 bg-transparent"}`}>
                          {isSelected && <FiCheck className="text-white" size={12} />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </li>
              )}
            </ul>

            {/* Footer with Close button */}
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <span className="text-[10px] text-gray-400 font-bold uppercase px-2">
                {value.length} Selected
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {(showError || error) && (
        <p className="text-red-500 text-xs mt-1">
          {error || "Please select at least one option"}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect2;
