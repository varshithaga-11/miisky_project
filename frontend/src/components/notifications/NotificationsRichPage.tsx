import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Bell,
  CheckCircle2,
  Check,
  Inbox,
  Filter,
  Clock,
  Sparkles,
  CheckCheck,
  BellRing,
  RefreshCw,
} from "lucide-react";
import {
  getAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notifications";
import { dispatchSidebarNotificationBadgesRefresh } from "../../constants/notifications";
import { useNotifications } from "../../context/NotificationContext";
import PageMeta from "../common/PageMeta";
import Label from "../form/Label";
import Select from "../form/Select";
import DatePicker2 from "../form/date-picker2";

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  created_at?: string;
  is_read: boolean;
}

export default function NotificationsRichPage() {
  const { fetchNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [periodFilter, setPeriodFilter] = useState("this_month");
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [totalPagesNumber, setTotalPagesNumber] = useState<number>(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [previousPage, setPreviousPage] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchAllNotifications = async (
    page = 1,
    limit: number | "all" = pageSize,
    period = periodFilter
  ) => {
    try {
      setLoading(true);

      const data = await getAllNotifications(
        page,
        limit,
        filter === "all" ? "all" : filter === "read" ? "true" : "false",
        period,
        dateFrom || undefined,
        dateTo || undefined
      );

      const notificationArray = Array.isArray(data.results) ? data.results : [];

      setNotifications(notificationArray);
      setCurrentPageNumber(data.current_page || page);
      setCounts(data.counts || {});
      setNextPage(data.next);
      setPreviousPage(data.previous);
      setTotalCount(data.count);
      setTotalPagesNumber(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications(currentPageNumber, pageSize, periodFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageNumber, pageSize, filter, periodFilter]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast.success("Notification marked as read");
      fetchAllNotifications(currentPageNumber, pageSize, periodFilter);
      void fetchNotifications();
      dispatchSidebarNotificationBadgesRefresh();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
      fetchAllNotifications(currentPageNumber, pageSize, periodFilter);
      void fetchNotifications();
      dispatchSidebarNotificationBadgesRefresh();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "read") return n.is_read;
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const unreadBadge = counts?.unread ?? 0;

  return (
    <>
      <PageMeta title="Notification Page" description="Manage notifications" />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/3 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full h-full relative z-10 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl shadow-theme-lg border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 dark:from-brand-400 dark:via-brand-500 dark:to-purple-500 p-4 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                      <BellRing className="w-8 h-8 text-white animate-[swing_2s_ease-in-out_infinite]" />
                    </div>
                    {unreadBadge > 0 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-error-500 to-error-600 text-white text-xs font-bold rounded-full min-w-[28px] h-7 px-2 flex items-center justify-center shadow-lg animate-bounce border-2 border-white dark:border-gray-900">
                        {unreadBadge > 99 ? "99+" : unreadBadge}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-brand-600 to-purple-600 dark:from-white dark:via-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Notifications
                      </h1>

                      {unreadBadge === 0 && (
                        <Sparkles className="w-6 h-6 text-success-500 animate-pulse" />
                      )}
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                      {unreadBadge > 0 ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-error-500 rounded-full animate-pulse"></span>
                          You have{" "}
                          <span className="text-brand-600 dark:text-brand-400 font-semibold">
                            {unreadBadge}
                          </span>{" "}
                          unread notification{unreadBadge > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-success-600 dark:text-success-400">
                          <CheckCheck className="w-4 h-4" />
                          You&apos;re all caught up! Great job!
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      fetchAllNotifications(currentPageNumber, pageSize, periodFilter)
                    }
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 
                            hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium 
                            rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 
                            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/50 dark:to-brand-900/30 rounded-xl p-3 border border-brand-200 dark:border-brand-800/50">
                      <div className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-0.5">
                        Total
                      </div>
                      <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">
                        {counts?.total ?? 0}
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 rounded-xl p-3 border border-green-200 dark:border-green-800/50">
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-0.5">
                        Read
                      </div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {counts?.read ?? 0}
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-xl p-3 border border-purple-200 dark:border-purple-800/50">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5">
                        Unread
                      </div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {counts?.unread ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative z-50 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-xl sm:rounded-2xl shadow-theme-md border border-gray-200/60 dark:border-gray-800/60 p-4 sm:p-5 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-2 duration-700"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-brand-50 dark:bg-brand-950/50 rounded-lg">
                    <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Filter by:
                  </span>
                </div>

                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                      filter === "all"
                        ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 justify-center">
                      All
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          filter === "all"
                            ? "bg-white/20"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {counts?.total ?? 0}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter("unread")}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                      filter === "unread"
                        ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 justify-center">
                      Unread
                      {(counts?.unread ?? 0) > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            filter === "unread"
                              ? "bg-white/20 animate-pulse"
                              : "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400"
                          }`}
                        >
                          {counts?.unread ?? 0}
                        </span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter("read")}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                      filter === "read"
                        ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 justify-center">
                      Read
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          filter === "read"
                            ? "bg-white/20"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {counts?.read ?? 0}
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div>
                  <Label
                    htmlFor="period"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                  >
                    Period
                  </Label>
                  <Select
                    value={periodFilter}
                    onChange={(val) => setPeriodFilter(val)}
                    options={[
                      { value: "today", label: "Today" },
                      { value: "this_week", label: "This Week" },
                      { value: "this_month", label: "This Month" },
                      { value: "last_month", label: "Last Month" },
                      { value: "this_quarter", label: "This Quarter" },
                      { value: "this_year", label: "This Year" },
                      { value: "custom", label: "Custom Range" },
                    ]}
                    className="w-full sm:w-40"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Show:
                  </Label>
                  <Select
                    value={pageSize.toString()}
                    onChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPageNumber(1);
                    }}
                    options={[
                      { value: "5", label: "5" },
                      { value: "10", label: "10" },
                      { value: "25", label: "25" },
                      { value: "50", label: "50" },
                    ]}
                    className="w-full sm:w-28"
                  />
                </div>

                {(counts?.unread ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="relative group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                        bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 
                        text-white text-sm font-semibold shadow-lg shadow-success-500/30 
                        hover:shadow-xl hover:shadow-success-500/40 transition-all duration-300 
                        transform hover:scale-105 active:scale-95 overflow-hidden mt-4"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <CheckCheck className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Mark All as Read</span>
                  </button>
                )}
              </div>
            </div>
            {periodFilter === "custom" && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                <DatePicker2 id="from_date" label="From Date" value={dateFrom} onChange={setDateFrom} />
                <DatePicker2
                  id="to_date"
                  label="To Date"
                  value={dateTo}
                  onChange={setDateTo}
                  minDate={dateFrom || undefined}
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!dateFrom || !dateTo) {
                        toast.warn("Please select both start and end dates.");
                        return;
                      }
                      setCurrentPageNumber(1);
                      fetchAllNotifications(1, pageSize, "custom");
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Apply Date Range
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-xl sm:rounded-3xl shadow-theme-lg border border-gray-200/60 dark:border-gray-800/60 p-8 sm:p-12 lg:p-16">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-brand-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-brand-400 border-l-purple-400 rounded-full animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "1s" }}
                  ></div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-gray-700 dark:text-gray-300 text-base font-semibold">
                    Loading notifications
                  </p>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-xl sm:rounded-3xl shadow-theme-lg border border-gray-200/60 dark:border-gray-800/60 p-8 sm:p-12 lg:p-16 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl">
                    <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {filter === "all" && "No notifications yet"}
                  {filter === "unread" && "All caught up! 🎉"}
                  {filter === "read" && "No read notifications"}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                  {filter === "unread"
                    ? "Great job! You have read all your notifications. Check back later for updates."
                    : filter === "read"
                      ? "You haven't marked any notifications as read yet. They will appear here once you do."
                      : "You don't have any notifications at the moment. We'll notify you when something new arrives."}
                </p>
                {filter === "unread" && unreadCount === 0 && (
                  <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-950/50 dark:to-success-900/30 rounded-2xl border border-success-200 dark:border-success-800/50">
                    <CheckCheck className="w-5 h-5 text-success-600 dark:text-success-400" />
                    <span className="text-sm font-semibold text-success-700 dark:text-success-400">
                      Everything is up to date!
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredNotifications.map((n, index) => (
                <div
                  key={n.id}
                  className={`group relative backdrop-blur-xl rounded-xl sm:rounded-2xl border transition-all duration-500 
                  shadow-theme-sm hover:shadow-theme-lg overflow-hidden transform hover:scale-[1.01] sm:hover:scale-[1.02]
                  ${
                    n.is_read
                      ? "bg-white/90 dark:bg-gray-900/90 border-gray-200/60 dark:border-gray-800/60"
                      : "bg-gradient-to-br from-brand-50/90 via-purple-50/50 to-white/90 dark:from-brand-950/50 dark:via-purple-950/30 dark:to-gray-900/90 border-brand-300/60 dark:border-brand-700/60"
                  }
                  animate-in fade-in slide-in-from-bottom-6`}
                  style={{ animationDelay: `${index * 60}ms`, animationDuration: "600ms" }}
                >
                  {!n.is_read && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  )}

                  <div className="relative p-4 sm:p-5 lg:p-6">
                    <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
                      <div className={`flex-shrink-0 mt-1 ${!n.is_read ? "animate-pulse" : ""}`}>
                        {n.is_read ? (
                          <div className="relative group/icon">
                            <div className="absolute inset-0 bg-success-500/20 blur-lg rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/40 dark:to-success-800/40 flex items-center justify-center border border-success-300 dark:border-success-700/50 shadow-md group-hover:scale-110 transition-transform">
                              <CheckCircle2 className="w-6 h-6 text-success-600 dark:text-success-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="relative group/icon">
                            <div className="absolute inset-0 bg-brand-500/40 blur-xl rounded-full animate-pulse"></div>
                            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 dark:from-brand-400 dark:via-brand-500 dark:to-purple-500 flex items-center justify-center shadow-xl shadow-brand-500/30 group-hover:scale-110 transition-transform border-2 border-white/20">
                              <Bell className="w-6 h-6 text-white animate-[swing_3s_ease-in-out_infinite]" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3
                            className={`font-bold text-lg leading-snug transition-colors ${
                              n.is_read
                                ? "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                                : "text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-brand-700 to-purple-700 dark:from-white dark:via-brand-300 dark:to-purple-300 bg-clip-text"
                            }`}
                          >
                            {n.title}
                          </h3>
                          {!n.is_read && (
                            <span className="flex-shrink-0 relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm leading-relaxed mb-4 ${
                            n.is_read
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-800 dark:text-gray-300 font-medium"
                          }`}
                        >
                          {n.body}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          </div>

                          {!n.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(n.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl shrink-0
                                     bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700
                                     text-white text-xs font-bold shadow-lg shadow-brand-500/30
                                     hover:shadow-xl hover:shadow-brand-500/40
                                     active:scale-95 transform hover:scale-105"
                            >
                              <Check className="w-4 h-4" />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`h-1.5 w-full transition-all duration-500 ${
                      n.is_read
                        ? "bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800 opacity-0 group-hover:opacity-100"
                        : "bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500"
                    }`}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPagesNumber > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPageNumber(Math.max(1, currentPageNumber - 1))}
                  disabled={!previousPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: totalPagesNumber }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      type="button"
                      key={pageNum}
                      onClick={() => setCurrentPageNumber(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPageNumber === pageNum
                          ? "bg-blue-600 text-white border border-blue-600"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPageNumber(Math.min(totalPagesNumber, currentPageNumber + 1))
                  }
                  disabled={!nextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPageNumber} of {totalPagesNumber} ({totalCount} total)
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
