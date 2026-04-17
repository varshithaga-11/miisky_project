import React from "react";
import DatePicker2 from "../form/date-picker2";
import { FiCalendar, FiClock } from "react-icons/fi";

interface FilterBarProps {
    startDate: string;
    endDate: string;
    activePeriod: string;
    onPeriodChange: (period: string) => void;
    onFilterChange: (startDate: string, endDate: string, period: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    startDate,
    endDate,
    activePeriod,
    onPeriodChange,
    onFilterChange
}) => {
    const periods = [
        { id: "today", label: "Today" },
        { id: "tomorrow", label: "Tomorrow" },
        { id: "this_week", label: "This Week" },
        { id: "last_week", label: "Last Week" },
        { id: "this_month", label: "This Month" },
        { id: "last_month", label: "Last Month" },
        { id: "this_year", label: "This Year" },
        { id: "custom_range", label: "Custom Range" },
        { id: "all", label: "All Records" },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-white/5">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => {
                                onPeriodChange(p.id);
                                if (p.id !== "custom_range") {
                                    onFilterChange("", "", p.id);
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activePeriod === p.id
                                    ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-gray-100 dark:border-white/5"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {activePeriod === "custom_range" && (
                    <div className="flex items-center gap-2 ml-auto p-1 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                            <FiCalendar size={14} className="text-gray-400" />
                            <DatePicker2
                                id="filter-start-date"
                                value={startDate}
                                onChange={(d) => onFilterChange(d, endDate, activePeriod)}
                                maxDate={endDate || undefined}
                                placeholder="Start Date"
                                className="!bg-transparent !p-0 !border-none !text-[10px] font-bold uppercase"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                            <FiCalendar size={14} className="text-gray-400" />
                            <DatePicker2
                                id="filter-end-date"
                                value={endDate}
                                onChange={(d) => onFilterChange(startDate, d, activePeriod)}
                                minDate={startDate || undefined}
                                placeholder="End Date"
                                className="!bg-transparent !p-0 !border-none !text-[10px] font-bold uppercase"
                            />
                        </div>
                    </div>
                )}

                {activePeriod !== "custom_range" && activePeriod !== "all" && (
                    <div className="ml-auto px-4 py-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10 italic flex items-center gap-2">
                        <FiClock size={12} /> Live Delta Window
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
