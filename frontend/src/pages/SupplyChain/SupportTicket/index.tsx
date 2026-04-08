import React, { useEffect, useMemo, useState } from "react";
import { FiMessageSquare, FiPlus, FiRefreshCw, FiSend, FiUser, FiPaperclip, FiFile, FiDownload, FiX, FiInfo } from "react-icons/fi";
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
  getMyKitchens,
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
  const [kitchens, setKitchens] = useState<SupportServiceProvider[]>([]);
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
    }
  };

  const loadKitchens = async () => {
    try {
      const data = await getMyKitchens();
      setKitchens(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCategories();
    loadKitchens();
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
      if (kitchens.length === 1) {
        setForm(p => ({ ...p, assigned_to: kitchens[0].id }));
      } else {
        setForm(p => ({ ...p, assigned_to: "" }));
      }
    }
  }, [form.target_user_type, kitchens]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter title and description");
      return;
    }
    try {
      const created = await createSupportTicket({
        user_type: "supply_chain",
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
      <PageMeta title="Delivery Support" description="Create and track support tickets" />
      <PageBreadcrumb pageTitle="Support Tickets" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadTickets} className="inline-flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </Button>
        </div>

        <Button size="sm" onClick={() => setIsNewOpen(true)} className="inline-flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <FiPlus /> New Support Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="font-semibold text-gray-900 dark:text-white">Recent Tickets</div>
            <div className="text-xs text-gray-400 font-medium font-mono">{loading ? "..." : `${filteredTickets.length}`}</div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.05] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
            {filteredTickets.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                   <FiMessageSquare className="text-gray-400" />
                </div>
                <div className="text-sm text-gray-500">No support tickets found</div>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all relative group ${
                    activeTicket?.id === t.id ? "bg-blue-50/50 dark:bg-blue-900/10 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-blue-600" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-white truncate text-sm mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        #{t.id} {t.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-2">{t.description}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                        <span className="truncate">From: {formatNameWithRole(t.created_by_details)}</span>
                        <span>•</span>
                        <span className="truncate">To: {formatNameWithRole(t.assigned_to_details)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                       {getStatusBadge(t.status)}
                       <span className="text-[10px] text-gray-400 font-medium">{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.01] overflow-hidden flex flex-col h-[75vh]">
          {activeTicket ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.05] bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                        {activeTicket.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-mono bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500">#{activeTicket.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{activeTicket.status.replace("_", " ")}</span>
                      <span>•</span>
                      <span>Priority: {activeTicket.priority}</span>
                      <span>•</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        From: {formatNameWithRole(activeTicket.created_by_details)} • To: {formatNameWithRole(activeTicket.assigned_to_details)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadMessages(activeTicket.id)} className="h-9 px-3 rounded-xl border-gray-200 dark:border-white/10 hover:bg-gray-50">
                      <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scroll-smooth">
                {messages.length === 0 && attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                     <FiMessageSquare className="w-10 h-10 mb-2" />
                     <p className="text-sm">Start the conversation below</p>
                  </div>
                ) : (
                  conversation.map((item) => {
                    const isMe = (item.type === "message" ? (item as TicketMessage).sender : (item as TicketAttachment).uploaded_by) === currentUserId;
                    if (item.type === "message") {
                      const m = item as TicketMessage;
                      return (
                        <div key={`msg-${m.id}`} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col group`}>
                            <div className={`px-4 py-3 rounded-2xl shadow-sm relative transition-all duration-300 ${
                              isMe ? "bg-blue-600 text-white rounded-tr-none scale-in" : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/[0.05] text-gray-800 dark:text-gray-100 rounded-tl-none scale-in"
                            }`}>
                              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">
                                {isMe ? "You" : formatName(m.sender_details)}
                              </div>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</div>
                              <div className={`mt-1.5 text-[9px] font-medium text-right opacity-60`}>
                                {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      const a = item as TicketAttachment;
                      const fileName = a.file.split("/").pop() || "Attachment";
                      return (
                        <div key={`att-${a.id}`} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`w-full max-w-[280px] rounded-2xl p-3 border border-dashed transition-all ${
                            isMe ? "bg-blue-50/50 border-blue-200 text-blue-800 rounded-tr-none ml-auto" : "bg-gray-50/50 border-gray-200 text-gray-800 rounded-tl-none mr-auto"
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isMe ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 shadow-sm text-gray-500"}`}>
                                <FiFile className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold truncate">{fileName}</div>
                                <div className="text-[10px] opacity-60 truncate">via {isMe ? "You" : formatName(a.uploaded_by_details)}</div>
                              </div>
                              <a href={a.file} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-black/5 rounded-full transition-colors shrink-0">
                                <FiDownload className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] bg-white/50 dark:bg-black/20 backdrop-blur-md">
                <div className="space-y-3">
                  {pendingFile && (
                    <div className="flex items-center gap-2 p-2.5 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl max-w-sm animate-in zoom-in-95">
                      <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                        <FiFile className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate">{pendingFile.name}</div>
                        <div className="text-[10px] text-blue-600 font-medium">Ready to upload</div>
                      </div>
                      <button onClick={() => setPendingFile(null)} className="p-1.5 hover:bg-red-100 hover:text-red-600 text-gray-400 rounded-full transition-colors">
                        <FiX />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-end">
                    <label className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all cursor-pointer group ${
                      pendingFile ? "border-blue-600 bg-blue-600 text-white scale-105" : "border-gray-200 dark:border-white/10 hover:border-blue-400 text-gray-400 hover:text-blue-500"
                    }`}>
                      <FiPaperclip className={`w-5 h-5 ${uploading ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`} />
                      <input type="file" className="hidden" onChange={handleFileSelect} />
                    </label>
                    <div className="flex-1 relative">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write your message..."
                        className="w-full pl-4 pr-12 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 resize-none max-h-32 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={uploading || (!messageText.trim() && !pendingFile)}
                        className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-90 transition-all z-20"
                      >
                         <FiSend className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center text-blue-600 mb-2">
                <FiMessageSquare className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Support Ticket</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">Select a ticket from the left sidebar to view the conversation history and send updates.</p>
              </div>
              <Button onClick={() => setIsNewOpen(true)} className="mt-4 rounded-2xl py-3 px-8 shadow-xl shadow-blue-500/20">
                 Create Your First Ticket
              </Button>
            </div>
          )}
        </div>
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-white dark:bg-gray-900 p-8 border border-gray-100 dark:border-white/5 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create Support Ticket</h2>
                <p className="text-sm text-gray-500 mt-1">Our support team and micro-kitchens are here to help you.</p>
              </div>
              <button onClick={() => setIsNewOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-3xl bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-all text-gray-500">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FiInfo className="text-blue-500" /> Send support request to
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "admin", label: "Miisky Admin", icon: "🏢", desc: "For technical/account issues" },
                    { id: "kitchen", label: "Micro Kitchen", icon: "🍳", desc: "For food/delivery issues" },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, target_user_type: target.id as SupportTicketTargetType }))}
                      className={`flex flex-col items-start p-5 rounded-3xl border-2 transition-all group ${
                        form.target_user_type === target.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                          : "border-gray-100 dark:border-white/5 hover:border-blue-100 dark:hover:border-blue-900/30"
                      }`}
                    >
                      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{target.icon}</span>
                      <span className="font-bold text-sm tracking-tight">{target.label}</span>
                      <span className="text-[10px] opacity-60 mt-1 font-medium">{target.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.target_user_type === "kitchen" && (
                <div className="md:col-span-2 space-y-2 animate-in slide-in-from-top-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Select Assigned Micro Kitchen</label>
                  <select
                    value={form.assigned_to}
                    onChange={(e) => setForm(p => ({ ...p, assigned_to: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  >
                    <option value="">-- Choose Kitchen --</option>
                    {kitchens.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                  {kitchens.length === 0 && (
                     <p className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-xl border border-amber-100 dark:border-amber-900/30 font-medium">
                       Note: No kitchens found in your recent assignments. Send to Admin instead if needed.
                     </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Issue Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value === "" ? "" : Number(e.target.value) }))}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Priority Level</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as SupportTicketPriority }))}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm uppercase tracking-wider"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Subject</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  placeholder="Summarize your issue"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Detailed Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm min-h-[120px]"
                  placeholder="Provide any additional details or context..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)} className="rounded-2xl px-8 h-12 font-bold border-gray-200">
                  Discard
                </Button>
                <Button type="submit" className="rounded-2xl px-10 h-12 font-extrabold shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                  Submit Request
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
