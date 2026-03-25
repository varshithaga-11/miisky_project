import React, { useEffect, useMemo, useState } from "react";
import { FiMessageSquare, FiPlus, FiRefreshCw, FiSend } from "react-icons/fi";
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
  TicketCategory,
  TicketMessage,
} from "./api";

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

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState<{
    category: number | "";
    title: string;
    description: string;
    priority: SupportTicketPriority;
  }>({ category: "", title: "", description: "", priority: "medium" });

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");

  const filteredTickets = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

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
      const data = await getTicketMessages(ticketId);
      setMessages(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    loadCategories();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter title and description");
      return;
    }
    try {
      const created = await createSupportTicket({
        user_type: "patient",
        category: form.category === "" ? null : Number(form.category),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      toast.success("Ticket created");
      setIsNewOpen(false);
      setForm({ category: "", title: "", description: "", priority: "medium" });
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
    if (!text) return;
    try {
      const msg = await sendTicketMessage({ ticket: activeTicket.id, message: text, is_internal: false });
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
            <div className="font-semibold text-gray-900 dark:text-white">My Tickets</div>
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
                      <div className="font-medium text-gray-900 dark:text-white truncate">#{t.id} {t.title}</div>
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
              <div className="text-gray-500">Select a ticket to view chat</div>
            )}
          </div>

          <div className="h-[55vh] overflow-y-auto px-4 py-4 space-y-3">
            {!activeTicket ? (
              <div className="text-center text-gray-500 py-10">No ticket selected</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No messages yet</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-900/30 p-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{formatName(m.sender_details)}</span>
                    <span>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{m.message}</div>
                </div>
              ))
            )}
          </div>

          {activeTicket && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.05] flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} className="inline-flex items-center gap-2">
                <FiSend /> Send
              </Button>
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

