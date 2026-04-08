import React, { useEffect, useMemo, useState } from "react";
import { FiMessageSquare, FiPlus, FiRefreshCw, FiSend, FiPaperclip, FiFile, FiDownload, FiX } from "react-icons/fi";
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

const formatRole = (role?: string | null) => {
  if (!role) return "";
  return role.replace(/_/g, " ");
};

const formatNameWithRole = (u?: { first_name?: string; last_name?: string; username?: string; role?: string } | null) => {
  if (!u) return "—";
  const name = formatName(u);
  const role = formatRole((u as any).role);
  return role ? `${name} (${role})` : name;
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
    // Modal-specific data (categories, providers) is now fetched on-demand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (activeTicket?.id) loadMessages(activeTicket.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTicket?.id]);

  useEffect(() => {
    if (form.target_user_type === "admin") {
      setForm(p => ({ ...p, assigned_to: "" }));
    } else {
      const list = providers.kitchens;
      if (list.length === 1) {
        setForm(p => ({ ...p, assigned_to: list[0].id }));
      } else {
        setForm(p => ({ ...p, assigned_to: "" }));
      }
    }
  }, [form.target_user_type, providers]);

  const handleOpenCreateModal = () => {
    setIsNewOpen(true);
    loadProviders();
    loadCategories();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter title and description");
      return;
    }
    try {
      const created = await createSupportTicket({
        user_type: "non_patient",
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
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 font-bold text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Channels</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadTickets} className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>

        <Button size="sm" onClick={handleOpenCreateModal} className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20">
          <FiPlus /> Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-[32px] border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
            <div className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">My Tickets</div>
            <div className="text-[10px] font-black bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">{loading ? "..." : `${filteredTickets.length}`}</div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05] no-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="px-4 py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <FiMessageSquare size={32} />
                </div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`w-full text-left px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors relative group ${activeTicket?.id === t.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                >
                  {activeTicket?.id === t.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="font-black text-gray-900 dark:text-white truncate uppercase tracking-tight text-sm">#{t.id} {t.title}</div>
                    </div>
                    <div className="shrink-0">{getStatusBadge(t.status)}</div>
                  </div>
                  <div className="text-[11px] font-medium text-gray-500 truncate mb-4 italic">
                    {t.description}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    From: {formatNameWithRole(t.created_by_details)} • To: {formatNameWithRole(t.assigned_to_details)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className={`inline-flex items-center gap-1.5 ${t.priority === 'high' ? 'text-rose-500' : t.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                      {t.priority}
                    </span>
                    <span className="text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[32px] border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm flex flex-col min-h-[70vh]">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-black/20 shrink-0">
            {activeTicket ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-black text-gray-900 dark:text-white truncate uppercase tracking-tight text-base">
                    Ticket #{activeTicket.id} — {activeTicket.title}
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Channel: {activeTicket.status.replace("_", " ")} • Priority: {activeTicket.priority} • From: {formatNameWithRole(activeTicket.created_by_details)} • To: {formatNameWithRole(activeTicket.assigned_to_details)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => loadMessages(activeTicket.id)} className="font-black uppercase tracking-widest text-[9px]">
                  Sync Chat
                </Button>
              </div>
            ) : (
              <div className="text-gray-400 font-black uppercase tracking-widest text-xs">Communication Protocol</div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar custom-chat-layout">
            {!activeTicket ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-[40px] flex items-center justify-center mb-6">
                  <FiMessageSquare size={48} />
                </div>
                <p className="font-black uppercase tracking-[0.3em] text-[11px]">Select active ticket thread</p>
              </div>
            ) : conversation.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">Awaiting response from support team...</p>
              </div>
            ) : (
              conversation.map((item) => {
                const isMe = (item.type === "message" ? (item as TicketMessage).sender : (item as TicketAttachment).uploaded_by) === currentUserId;
                if (item.type === "message") {
                  const m = item as TicketMessage;
                  return (
                    <div key={`msg-${m.id}`} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                      <div
                        className={`max-w-[85%] rounded-[28px] px-6 py-4 shadow-sm transition-all duration-300 ${isMe
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none shadow-blue-500/10"
                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/[0.05] text-gray-800 dark:text-gray-100 rounded-tl-none"
                          }`}
                      >
                        <div className={`flex items-center gap-2 mb-2 text-[9px] font-black uppercase tracking-wider ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                          {!isMe && <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />}
                          <span>{isMe ? "You" : formatName(m.sender_details)}</span>
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{m.message}</div>
                        <div className={`mt-3 text-[8px] text-right font-black uppercase tracking-tighter ${isMe ? "text-blue-100/70" : "text-gray-400"}`}>
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
                      <div className={`max-w-[85%] rounded-[28px] px-6 py-5 shadow-sm border-2 border-dashed transition-all ${isMe ? "bg-blue-50/50 border-blue-200 text-blue-900 rounded-tr-none" : "bg-gray-50 border-gray-200 text-gray-800 rounded-tl-none"
                        }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMe ? "bg-blue-200 text-blue-700" : "bg-gray-200 text-gray-500"}`}>
                            <FiFile className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black truncate uppercase tracking-tight">{fileName}</div>
                            <div className="text-[10px] font-black uppercase opacity-60 mt-1">Shared by {isMe ? "you" : formatName(a.uploaded_by_details)}</div>
                          </div>
                          <a href={a.file} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                            <FiDownload className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">
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
            <div className="px-6 py-5 border-t border-gray-100 dark:border-white/[0.05] space-y-4 shrink-0 bg-gray-50/30 dark:bg-black/10">
              {pendingFile && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl max-w-sm transition-all animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                  <div className="p-2.5 bg-blue-200 dark:bg-blue-900/40 text-blue-700 rounded-xl">
                    <FiFile className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-black text-blue-900 dark:text-blue-100 truncate uppercase">{pendingFile.name}</div>
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Ready for upload</div>
                  </div>
                  <button
                    onClick={() => setPendingFile(null)}
                    className="p-2 hover:bg-rose-100 hover:text-rose-600 text-gray-400 rounded-xl transition-all"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-4 items-end">
                <label className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all cursor-pointer ${pendingFile ? "border-blue-500 bg-blue-100 text-blue-600" : "border-gray-200 dark:border-white/10 hover:border-blue-400 text-gray-400 hover:text-blue-500"
                  }`}>
                  <FiPaperclip size={20} className={uploading ? "animate-spin" : ""} />
                  <input type="file" className="hidden" onChange={handleFileSelect} />
                </label>
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Brief description of your query..."
                    className="w-full px-5 py-4 border-2 border-transparent rounded-[24px] bg-white dark:bg-gray-900 dark:border-white/5 resize-none max-h-32 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium shadow-inner"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={uploading} className="h-14 w-14 rounded-2xl flex items-center justify-center p-0 shadow-xl shadow-blue-500/20 active:scale-90 flex-shrink-0">
                  <FiSend size={24} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[48px] bg-white dark:bg-gray-900 p-10 border border-gray-100 dark:border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50 dark:border-white/5">
              <div>
                <div className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">New Channel</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2 italic">Awaiting Priority Specification</div>
              </div>
              <button
                onClick={() => setIsNewOpen(false)}
                className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic italic">Ask To / Recipient Channel</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "admin", label: "MIISKY BASE", icon: "🏢" },
                    { id: "kitchen", label: "MICRO KITCHEN", icon: "👨‍🍳" },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, target_user_type: target.id as SupportTicketTargetType }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-[28px] border-2 transition-all gap-2 ${form.target_user_type === target.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-xl scale-105"
                          : "border-gray-50 dark:border-white/5 hover:border-blue-200"
                        }`}
                    >
                      <span className="text-2xl">{target.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-center">{target.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(form.target_user_type === "kitchen") && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic italic">
                    Select Micro Kitchen
                  </label>
                  <select
                    value={form.assigned_to}
                    onChange={(e) => setForm(p => ({ ...p, assigned_to: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="w-full px-5 py-4 border-2 border-transparent rounded-2xl bg-gray-50 dark:bg-gray-950 font-black text-xs uppercase tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- IDENTIFY RECIPIENT --</option>
                    {providers.kitchens.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {!p.is_active && "(OFFLINE/INACTIVE)"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Context Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="w-full px-5 py-4 border-2 border-transparent rounded-2xl bg-gray-50 dark:bg-gray-950 font-black text-xs uppercase tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                  >
                    <option value="">Choose Path</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as SupportTicketPriority }))}
                    className="w-full px-5 py-4 border-2 border-transparent rounded-2xl bg-gray-50 dark:bg-gray-950 font-black text-xs uppercase tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                  >
                    <option value="low">Low Impact</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">Critical Need</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Header</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-5 py-4 border-2 border-transparent rounded-2xl bg-gray-50 dark:bg-gray-950 font-black text-sm tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                  placeholder="Concise issue summary..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-5 py-4 border-2 border-transparent rounded-3xl bg-gray-50 dark:bg-gray-950 font-medium text-sm tracking-tight focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none"
                  rows={4}
                  placeholder="Provide comprehensive details of the observed anomaly..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" className="px-10 py-5 h-auto rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/30">
                  Initialize Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportTicketPage;
