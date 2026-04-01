import React, { useState, useRef, useEffect } from "react";

export interface IconItem {
  value: string;
  label: string;
  src: string;
}

interface IconPickerDropdownProps {
  value: string;
  onChange: (value: string) => void;
  icons: IconItem[];
  getIcon: (value: string) => IconItem;
  disabled?: boolean;
  placeholder?: string;
}

const IconPickerDropdown: React.FC<IconPickerDropdownProps> = ({ 
  value, 
  onChange, 
  icons, 
  getIcon, 
  disabled,
  placeholder = "Select an icon..."
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = getIcon(value);
  const filtered = icons.filter((icon) =>
    icon.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-900 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {value ? (
          <>
            <img
              src={selected.src}
              alt={selected.label}
              className="w-12 h-12 object-contain flex-shrink-0"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{selected.label}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}
        <svg
          className={`ml-auto w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-72 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="text"
              autoFocus
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Icon grid */}
          <div className="overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No icons found</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {filtered.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    title={icon.label}
                    onClick={() => {
                      onChange(icon.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 ${
                      value === icon.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={icon.src}
                      alt={icon.label}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight text-center max-w-full truncate w-full">
                      {icon.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPickerDropdown;
