import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSend, FiUser, FiInfo, FiPaperclip, FiFile, FiDownload, FiX } from "react-icons/fi";
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
  TicketAttachment,
  getTicketAttachments,
  uploadTicketAttachment,
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
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [userTypeFilter, setUserTypeFilter] = useState<SupportTicketUserType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tickets.filter((t) => `${t.id} ${t.title} ${t.description}`.toLowerCase().includes(s));
  }, [tickets, search]);

  const conversation = useMemo(() => {
    const combined = [
      ...messages.map((m) => ({ ...m, type: "message" as const, timestamp: new Date(m.created_at).getTime() })),
      ...attachments.map((a) => ({ ...a, type: "attachment" as const, timestamp: new Date(a.uploaded_at).getTime() })),
    ];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, attachments]);

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
      const [msgData, attachData] = await Promise.all([
        getTicketMessages(ticketId),
        getTicketAttachments(ticketId)
      ]);
      setMessages(msgData);
      setAttachments(attachData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load chat data");
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
    if (!text && !pendingFile) return;

    setUploading(true);
    try {
      if (pendingFile) {
        const saved = await uploadTicketAttachment(active.id, pendingFile);
        setAttachments((prev) => [...prev, saved]);
        setPendingFile(null);
      }
      if (text) {
        const msg = await sendTicketMessage({ ticket: active.id, message: text, is_internal: isInternal });
        setMessages((prev) => [...prev, msg]);
        setMessageText("");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to send");
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
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
            <option value="doctor">Doctor</option>
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
                        {t.user_type} → {t.target_user_type?.toUpperCase() || "ADMIN"} • {formatName(t.created_by_details)}
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
              conversation.map((item) => {
                const isMe = (item.type === "message" ? (item as TicketMessage).sender : (item as TicketAttachment).uploaded_by) === currentUserId;
                if (item.type === "message") {
                  const m = item as TicketMessage;
                  return (
                    <div key={`msg-${m.id}`} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
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
                } else {
                  const a = item as TicketAttachment;
                  const fileName = a.file.split("/").pop() || "Attachment";
                  return (
                    <div key={`att-${a.id}`} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                       <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm border border-dashed transition-all ${
                        isMe ? "bg-blue-50 border-blue-200 text-blue-800 rounded-tr-none" : "bg-gray-50 border-gray-200 text-gray-800 rounded-tl-none"
                      }`}>
                         <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                             <FiFile className="w-5 h-5" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <div className="text-xs font-bold truncate">{fileName}</div>
                             <div className="text-[10px] opacity-70">Uploaded by {isMe ? "you" : formatName(a.uploaded_by_details)}</div>
                           </div>
                           <a href={a.file} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-black/5 rounded-full transition-colors">
                             <FiDownload className="w-4 h-4" />
                           </a>
                         </div>
                         <div className="mt-2 flex justify-end">
                           <span className="text-[9px] font-medium opacity-60">
                             {a.uploaded_at ? new Date(a.uploaded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                           </span>
                         </div>
                       </div>
                    </div>
                  );
                }
              })
            )}
          </div>

          {active && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.05] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 inline-flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                    checked={isInternal} 
                    onChange={(e) => setIsInternal(e.target.checked)} 
                  />
                  <span className="group-hover:text-amber-600 transition-colors font-medium">Internal note (hidden from patient)</span>
                </label>
                <Button variant="outline" size="sm" onClick={() => loadMessages(active.id)} className="text-[10px] h-7 px-2">
                  Refresh chat
                </Button>
              </div>

              {pendingFile && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl max-w-xs transition-all animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <FiFile className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate">{pendingFile.name}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Ready to send</div>
                  </div>
                  <button
                    onClick={() => setPendingFile(null)}
                    className="p-1.5 hover:bg-red-100 hover:text-red-600 text-gray-400 rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <label className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border-2 border-dashed transition-all cursor-pointer ${
                  pendingFile ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 hover:border-blue-400 text-gray-400 hover:text-blue-500"
                }`}>
                  <FiPaperclip className={uploading ? "animate-spin" : ""} />
                  <input type="file" className="hidden" onChange={onFileSelect} />
                </label>
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={isInternal ? "Type an internal note..." : "Type a reply..."}
                    className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-900 resize-none max-h-32 transition-all outline-none focus:ring-2 ${
                      isInternal ? "border-amber-200 dark:border-amber-800 focus:ring-amber-500" : "dark:border-gray-700 focus:ring-blue-500"
                    }`}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                  />
                </div>
                <Button onClick={onSend} disabled={uploading} className={`h-11 px-5 shadow-lg active:scale-95 transition-all ${
                  isInternal ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" : "shadow-blue-500/20"
                }`}>
                  <FiSend />
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

