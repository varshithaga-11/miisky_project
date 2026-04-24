import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { createApiUrl } from "../../../access/access";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchKitchenDeliveryProfiles,
  verifyDeliveryProfile,
  type KitchenDeliveryProfile,
} from "./api";
import { DeliveryProfileDetailModal } from "./DeliveryProfileDetailModal";
import {
  CheckCircle2,
  ShieldCheck,
  Eye,
} from "lucide-react";

// ─── InfiniteScrollTrigger ───────────────────────────────────────────────────
function InfiniteScrollTrigger({
  hasMore,
  loading,
  onLoad,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoad: () => void;
}) {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerTarget || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoad();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [observerTarget, hasMore, loading, onLoad]);

  if (!hasMore) return null;

  return (
    <div ref={setObserverTarget} className="flex justify-center py-6">
      {loading ? (
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest animate-pulse">
           <div className="size-1.5 rounded-full bg-indigo-500 animate-bounce" />
           Loading more…
        </div>
      ) : (
        <div className="h-4" /> 
      )}
    </div>
  );
}

function ProfileDetail({
  row,
  onVerified,
  onViewDetails,
}: {
  row: KitchenDeliveryProfile;
  onVerified: (p: KitchenDeliveryProfile) => void;
  onViewDetails: (p: KitchenDeliveryProfile) => void;
}) {
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

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 lg:p-5">
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate lg:text-base">{name}</p>
            <p className="text-xs text-gray-500 truncate">
              {row.user_details?.mobile || row.user_details?.email || "—"}
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-auto mr-4 lg:mr-8">
            {row.kitchen_team_info && (
              <div className="flex flex-col items-end gap-1 mr-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  row.kitchen_team_info.role === 'primary' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-50 text-gray-500 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {row.kitchen_team_info.role}
                </span>
                {(row.kitchen_team_info.zone_name || row.kitchen_team_info.pincode) && (
                  <span className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[80px]">
                    {row.kitchen_team_info.zone_name || row.kitchen_team_info.pincode}
                  </span>
                )}
              </div>
            )}
            {row.is_verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
                <CheckCircle2 size={12} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 uppercase tracking-widest border border-amber-100 dark:border-amber-800/30">
                Pending
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!row.is_verified && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void verify()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
            >
              <ShieldCheck size={14} />
              {busy ? "…" : "Verify"}
            </button>
          )}

          {/* View Details button */}
          <button
            type="button"
            onClick={() => onViewDetails(row)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            title="View full delivery staff details"
          >
            <Eye size={14} />
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryPersonInfoPage() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<KitchenDeliveryProfile[]>([]);

  // Modal state
  const [detailProfile, setDetailProfile] = useState<KitchenDeliveryProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await fetchKitchenDeliveryProfiles(p, limit);
      if (append) {
        setRows(prev => [...prev, ...(res.results || [])]);
      } else {
        setRows(res.results || []);
      }
      setHasMore(res.current_page < res.total_pages);
      setCount(res.count ?? 0);
      setPage(p);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load delivery profiles");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [limit]);

  useEffect(() => {
    void load(1);
  }, [load]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      void load(page + 1, true);
    }
  };

  const patchRow = (updated: KitchenDeliveryProfile) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    // also patch the modal profile if it's open for this same row
    if (detailProfile?.id === updated.id) {
      setDetailProfile(updated);
    }
  };

  const openDetails = (profile: KitchenDeliveryProfile) => {
    setDetailProfile(profile);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <PageMeta title="Delivery staff profiles" description="Review and verify supply-chain delivery profiles" />
      <PageBreadcrumb pageTitle="Delivery person information" />
      <ToastContainer position="bottom-right" />

      <div className="max-w-4xl space-y-6 pb-16">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Supply-chain staff linked to your kitchen through global or daily assignments. Review documents and verify when
          satisfied. Click <strong>Details</strong> on any profile to see orders, payments, leaves, reviews and issues.
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
              <ProfileDetail
                key={row.id}
                row={row}
                onVerified={patchRow}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}

        <InfiniteScrollTrigger hasMore={hasMore} loading={loadingMore} onLoad={loadMore} />
      </div>

      {/* Delivery Profile Detail Modal */}
      {detailProfile && (
        <DeliveryProfileDetailModal
          profile={detailProfile}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
