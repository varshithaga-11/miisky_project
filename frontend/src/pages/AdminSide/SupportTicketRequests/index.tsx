import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSend, FiUser, FiInfo } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import {
  getSupportTickets,
  getTicketMessages,
  sendTicketMessage,
  updateSupportTicket,
  SupportTicket,
  SupportTicketStatus,
  TicketMessage,
  SupportTicketUserType,
} from "./api";
import { getUserIdFromToken } from "../../../utils/auth";

const asArray = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data?.results && Array.isArray(data.results)) return data.results as T[];
  return [];
};

const formatName = (u?: { first_name?: string; last_name?: string; username?: string } | null) => {
  const name = [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim();
  return name || u?.username || "User";
};

const SupportTicketRequestsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUserId = useMemo(() => getUserIdFromToken(), []);

  const [active, setActive] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [userTypeFilter, setUserTypeFilter] = useState<SupportTicketUserType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return tickets;
    return tickets.filter((t) => `${t.id} ${t.title} ${t.description}`.toLowerCase().includes(s));
  }, [tickets, search]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets({ status: statusFilter, user_type: userTypeFilter });
      setTickets(asArray<SupportTicket>(data));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: number) => {
    try {
      const data = await getTicketMessages(ticketId);
      setMessages(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load chat");
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, userTypeFilter]);

  useEffect(() => {
    if (active?.id) loadMessages(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const changeStatus = async (next: SupportTicketStatus) => {
    if (!active) return;
    try {
      const up = await updateSupportTicket(active.id, { status: next });
      setActive(up);
      setTickets((prev) => prev.map((t) => (t.id === up.id ? up : t)));
      toast.success("Status updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    }
  };

  const onSend = async () => {
    if (!active) return;
    const text = messageText.trim();
    if (!text) return;
    try {
      const msg = await sendTicketMessage({ ticket: active.id, message: text, is_internal: isInternal });
      setMessages((prev) => [...prev, msg]);
      setMessageText("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message");
    }
  };

  const getStatusBadge = (status: SupportTicketStatus) => {
    const map: Record<SupportTicketStatus, string> = {
      open: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      closed: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{status.replace("_", " ")}</span>;
  };

  return (
    <>
      <PageMeta title="Support Ticket Requests" description="Admin support ticket inbox" />
      <PageBreadcrumb pageTitle="Support Ticket Requests" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="all">All status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="all">All user types</option>
            <option value="patient">Patient</option>
            <option value="nutritionist">Nutritionist</option>
            <option value="kitchen">Kitchen</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 w-full sm:w-72"
          />
        </div>

        <Button variant="outline" size="sm" onClick={loadTickets} className="inline-flex items-center gap-2">
          <FiRefreshCw /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
            <div className="font-semibold text-gray-900 dark:text-white">Inbox</div>
            <div className="text-xs text-gray-500">{loading ? "Loading..." : `${filtered.length}`}</div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500">No tickets</div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                    active?.id === t.id ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        #{t.id} {t.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {t.user_type} • {formatName(t.created_by_details)}
                      </div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(t.status)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05]">
            {active ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    Ticket #{active.id} — {active.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatName(active.created_by_details)} • {active.user_type} • Priority: {active.priority}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => changeStatus("in_progress")}>
                    In Progress
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => changeStatus("resolved")}>
                    Resolve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => changeStatus("closed")}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Select a ticket to view chat</div>
            )}
          </div>

          <div className="h-[55vh] overflow-y-auto px-4 py-4 space-y-3">
            {!active ? (
              <div className="text-center text-gray-500 py-10">No ticket selected</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No messages yet</div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-300 ${
                        m.is_internal
                          ? "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                          : isMe
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/[0.05] text-gray-800 dark:text-gray-100 rounded-tl-none"
                      }`}
                    >
                      <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider ${
                        m.is_internal ? "text-amber-600" : isMe ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {m.is_internal ? <FiInfo /> : !isMe && <FiUser />}
                        <span>
                          {isMe ? "You" : formatName(m.sender_details)}
                          {m.is_internal ? " (Internal Note)" : ""}
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</div>
                      <div className={`mt-1.5 text-[9px] text-right font-medium ${
                        m.is_internal ? "text-amber-500" : isMe ? "text-blue-100/70" : "text-gray-400"
                      }`}>
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {active && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 inline-flex items-center gap-2">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                  Internal note (hidden from patient)
                </label>
                <Button variant="outline" size="sm" onClick={() => loadMessages(active.id)}>
                  Refresh chat
                </Button>
              </div>
              <div className="flex gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                />
                <Button onClick={onSend} className="inline-flex items-center gap-2">
                  <FiSend /> Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupportTicketRequestsPage;

