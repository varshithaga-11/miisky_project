import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadcrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchKitchenDeliveryProfiles,
  verifyDeliveryProfile,
  type KitchenDeliveryProfile,
} from "./api";
import { CheckCircle2, FileText, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const mediaHref = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
};

function ProfileDetail({ row, onVerified }: { row: KitchenDeliveryProfile; onVerified: (p: KitchenDeliveryProfile) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const name =
    row.user_details != null
      ? `${row.user_details.first_name || ""} ${row.user_details.last_name || ""}`.trim() || "Delivery staff"
      : "Delivery staff";

  const verify = async () => {
    setBusy(true);
    try {
      const updated = await verifyDeliveryProfile(row.id);
      onVerified(updated);
      toast.success("Marked as verified");
    } catch (e) {
      console.error(e);
      toast.error("Could not verify");
    } finally {
      setBusy(false);
    }
  };

  const docRow = (label: string, url: string | null | undefined) => (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-100 dark:border-white/10 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      {url ? (
        <a
          href={mediaHref(url)}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
        >
          <FileText size={14} /> View
        </a>
      ) : (
        <span className="text-gray-400 text-xs">Not uploaded</span>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">
            {row.user_details?.mobile || row.user_details?.email || "—"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {row.is_verified ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              <CheckCircle2 size={14} /> Verified
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Pending</span>
          )}
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-gray-100 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Vehicle type</span>
              <p className="text-gray-900 dark:text-white">{row.vehicle_type || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Other vehicle</span>
              <p className="text-gray-900 dark:text-white">{row.other_vehicle_name || "—"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Vehicle details</span>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{row.vehicle_details || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Registration no.</span>
              <p className="text-gray-900 dark:text-white">{row.register_number || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Licence no.</span>
              <p className="text-gray-900 dark:text-white">{row.license_number || "—"}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Documents</h4>
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-3">
              {docRow("Licence copy", row.license_copy)}
              {docRow("RC", row.rc_copy)}
              {docRow("Insurance", row.insurance_copy)}
              {docRow("PUC", row.puc_image)}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Aadhaar number</span>
              <p className="text-gray-900 dark:text-white">{row.aadhar_number || "—"}</p>
            </div>
            {docRow("Aadhaar image", row.aadhar_image)}
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-400">PAN number</span>
              <p className="text-gray-900 dark:text-white">{row.pan_number || "—"}</p>
            </div>
            {docRow("PAN image", row.pan_image)}
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Bank</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p>
                <span className="text-gray-400 text-xs block">Holder</span>
                {row.account_holder_name || "—"}
              </p>
              <p>
                <span className="text-gray-400 text-xs block">Bank</span>
                {row.bank_name || "—"}
              </p>
              <p>
                <span className="text-gray-400 text-xs block">Account</span>
                {row.bank_account_number || "—"}
              </p>
              <p>
                <span className="text-gray-400 text-xs block">IFSC</span>
                {row.ifsc_code || "—"}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-gray-400">Availability / slots</span>
            <pre className="mt-1 text-xs bg-gray-50 dark:bg-black/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {row.available_slots || "—"}
            </pre>
          </div>

          {row.is_verified && row.verified_on && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Verified on {new Date(row.verified_on).toLocaleString()}
              {row.verified_by_details && (
                <> by {row.verified_by_details.first_name} {row.verified_by_details.last_name}</>
              )}
            </p>
          )}

          {!row.is_verified && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void verify()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              <ShieldCheck size={18} />
              {busy ? "Saving…" : "Verify this profile"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveryPersonInfoPage() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<KitchenDeliveryProfile[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchKitchenDeliveryProfiles(page, limit);
      setRows(res.results || []);
      setTotalPages(res.total_pages || 1);
      setCount(res.count ?? 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load delivery profiles");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchRow = (updated: KitchenDeliveryProfile) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="min-h-screen">
      <PageMeta title="Delivery staff profiles" description="Review and verify supply-chain delivery profiles" />
      <PageBreadcrumb pageTitle="Delivery person information" />
      <ToastContainer position="bottom-right" />

      <div className="max-w-4xl space-y-6 pb-16">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Supply-chain staff linked to your kitchen through global or daily assignments. Review documents and verify when
          satisfied.
        </p>

        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/20 p-12 text-center text-gray-500">
            No delivery profiles found for your kitchen yet.
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <ProfileDetail key={row.id} row={row} onVerified={patchRow} />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} · {count} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
