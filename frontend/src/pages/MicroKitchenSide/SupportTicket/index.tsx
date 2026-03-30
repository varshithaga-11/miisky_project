import React, { useEffect, useMemo, useState } from "react";
import { FiMessageSquare, FiPlus, FiRefreshCw, FiSend, FiUser, FiPaperclip, FiFile, FiDownload, FiX } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import {
  createSupportTicket,
  getMySupportTickets,
  getTicketCategories,
  getTicketMessages,
  sendTicketMessage,
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketTargetType,
  TicketCategory,
  TicketMessage,
  TicketAttachment,
  getTicketAttachments,
  uploadTicketAttachment,
  getServiceProviders,
  SupportServiceProvider,
} from "./api";
import { getUserIdFromToken } from "../../../utils/auth";

const formatName = (u?: { first_name?: string; last_name?: string; username?: string } | null) => {
  const name = [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim();
  return name || u?.username || "User";
};

const asArray = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data?.results && Array.isArray(data.results)) return data.results as T[];
  return [];
};

const SupportTicketPage: React.FC = () => {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{ nutritionists: SupportServiceProvider[]; kitchens: SupportServiceProvider[] }>({
    nutritionists: [],
    kitchens: [],
  });
  const currentUserId = useMemo(() => getUserIdFromToken(), []);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState<{
    category: number | "";
    target_user_type: SupportTicketTargetType;
    assigned_to: number | "";
    title: string;
    description: string;
    priority: SupportTicketPriority;
  }>({ category: "", target_user_type: "admin", assigned_to: "", title: "", description: "", priority: "medium" });

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [messageText, setMessageText] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const filteredTickets = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const conversation = useMemo(() => {
    const combined = [
      ...messages.map((m) => ({ ...m, type: "message" as const, timestamp: new Date(m.created_at).getTime() })),
      ...attachments.map((a) => ({ ...a, type: "attachment" as const, timestamp: new Date(a.uploaded_at).getTime() })),
    ];
    return combined.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, attachments]);

  const loadCategories = async () => {
    try {
      const data = await getTicketCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load ticket categories");
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getMySupportTickets({ status: statusFilter });
      setTickets(asArray<SupportTicket>(data));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tickets");
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

  const loadProviders = async () => {
    try {
      const data = await getServiceProviders();
      setProviders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProviders();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (activeTicket?.id) loadMessages(activeTicket.id);
  }, [activeTicket?.id]);

  useEffect(() => {
    if (form.target_user_type === "admin") {
      setForm(p => ({ ...p, assigned_to: "" }));
    } else {
      const list = form.target_user_type === "nutritionist" ? providers.nutritionists : providers.kitchens;
      if (list.length === 1) {
        setForm(p => ({ ...p, assigned_to: list[0].id }));
      } else {
        setForm(p => ({ ...p, assigned_to: "" }));
      }
    }
  }, [form.target_user_type, providers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter title and description");
      return;
    }
    try {
      const created = await createSupportTicket({
        user_type: "kitchen",
        target_user_type: form.target_user_type,
        assigned_to: form.assigned_to === "" ? null : Number(form.assigned_to),
        category: form.category === "" ? null : Number(form.category),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      toast.success("Ticket created");
      setIsNewOpen(false);
      setForm({ category: "", target_user_type: "admin", assigned_to: "", title: "", description: "", priority: "medium" });
      setTickets((prev) => [created, ...prev]);
      setActiveTicket(created);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create ticket");
    }
  };

  const handleSendMessage = async () => {
    if (!activeTicket) return;
    const text = messageText.trim();
    if (!text && !pendingFile) return;

    setUploading(true);
    try {
      if (pendingFile) {
        const saved = await uploadTicketAttachment(activeTicket.id, pendingFile);
        setAttachments((prev) => [...prev, saved]);
        setPendingFile(null);
      }
      if (text) {
        const msg = await sendTicketMessage({ ticket: activeTicket.id, message: text, is_internal: false });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <PageMeta title="Support Tickets" description="Create and track support tickets" />
      <PageBreadcrumb pageTitle="Support Tickets" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadTickets} className="inline-flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </Button>
        </div>

        <Button size="sm" onClick={() => setIsNewOpen(true)} className="inline-flex items-center gap-2">
          <FiPlus /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
            <div className="font-semibold text-gray-900 dark:text-white">Kitchen Support Tickets</div>
            <div className="text-xs text-gray-500">{loading ? "Loading..." : `${filteredTickets.length}`}</div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filteredTickets.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500">No tickets</div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                    activeTicket?.id === t.id ? "bg-blue-50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {t.assigned_to === currentUserId && t.created_by !== currentUserId && (
                          <span className="mr-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[9px] font-black uppercase rounded">From Patient</span>
                        )}
                        #{t.id} {t.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{t.description}</div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(t.status)}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><FiMessageSquare /> {t.priority}</span>
                    <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05]">
            {activeTicket ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    Ticket #{activeTicket.id} — {activeTicket.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {activeTicket.status.replace("_", " ")} • Priority: {activeTicket.priority}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadMessages(activeTicket.id)}>
                  Refresh chat
                </Button>
              </div>
            ) : (
              <div className="text-gray-500">Select a ticket to view conversation</div>
            )}
          </div>

          <div className="h-[55vh] overflow-y-auto px-4 py-4 space-y-3">
            {!activeTicket ? (
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
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-300 ${
                          isMe
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none"
                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/[0.05] text-gray-800 dark:text-gray-100 rounded-tl-none"
                        }`}
                      >
                        <div className={`flex items-center gap-2 mb-1 text-[10px] font-medium uppercase tracking-wider ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                          {!isMe && <FiUser className="animate-pulse" />}
                          <span>{isMe ? "You" : formatName(m.sender_details)}</span>
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</div>
                        <div className={`mt-1.5 text-[9px] text-right font-medium ${isMe ? "text-blue-100/70" : "text-gray-400"}`}>
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
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border border-dashed transition-all ${
                        isMe ? "bg-blue-50 border-blue-200 text-blue-800 rounded-tr-none" : "bg-gray-50 border-gray-200 text-gray-800 rounded-tl-none"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
                            <FiFile className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate">{fileName}</div>
                            <div className="text-[10px] opacity-70">Shared by {isMe ? "you" : formatName(a.uploaded_by_details)}</div>
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

          {activeTicket && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.05] space-y-3">
              {pendingFile && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl max-w-xs transition-all animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <FiFile className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate">{pendingFile.name}</div>
                    <div className="text-[10px] text-blue-600">Ready to send</div>
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
                  <input type="file" className="hidden" onChange={handleFileSelect} />
                </label>
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 resize-none max-h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={uploading} className="h-11 px-5 shadow-lg shadow-blue-500/20 active:scale-95">
                  <FiSend />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-white/[0.05]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">Create Support Ticket</div>
                <div className="text-sm text-gray-500">Describe your issue and our team will respond</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsNewOpen(false)}>
                Close
              </Button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 italic">Who is this for? / Ask To</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "admin", label: "Miisky Support", icon: "🏢" },
                    { id: "nutritionist", label: "Nutrition Expert", icon: "🥗" },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, target_user_type: target.id as SupportTicketTargetType }))}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
                        form.target_user_type === target.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md"
                          : "border-gray-100 dark:border-white/5 hover:border-blue-200"
                      }`}
                    >
                      <span className="text-xl">{target.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{target.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.target_user_type === "nutritionist" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Select Expert Nutritionist
                  </label>
                  <select
                    value={form.assigned_to}
                    onChange={(e) => setForm(p => ({ ...p, assigned_to: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Choose --</option>
                    {providers.nutritionists.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {!p.is_active ? "(Inactive)" : ""}
                      </option>
                    ))}
                  </select>
                  {providers.nutritionists.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-medium">Note: No expert found. Admin will route this for you.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as SupportTicketPriority }))}
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                  placeholder="Short summary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                  rows={5}
                  placeholder="Explain the issue in detail"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportTicketPage;
