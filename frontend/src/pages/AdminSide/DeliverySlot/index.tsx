import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { fetchDeliverySlots, deleteDeliverySlot, DeliverySlot } from "./api";
import { formatTime12hDisplay } from "./timeUtils";
import AddDeliverySlot from "./AddDeliverySlot";
import EditDeliverySlot from "./EditDeliverySlot";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { checkFoodDependency, deleteFoodRecord } from "../shared/foodManagementApi";

const DeliverySlotManagementPage: React.FC = () => {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<DeliverySlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDeliverySlots();
      setSlots(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return slots;
    return slots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.micro_kitchen_brand && s.micro_kitchen_brand.toLowerCase().includes(q))
    );
  }, [slots, searchTerm]);

  const handleDelete = async (id: number) => {
    try {
      const res = await checkFoodDependency("delivery_slot", id);
      if (res.detail !== "none") {
        toast.error(`Cannot delete as it has ${res.detail}. Please remove them first.`);
        return;
      }
      setIdToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteFoodRecord("delivery_slot", idToDelete);
      toast.success("Delivery slot deleted successfully!");
      setIdToDelete(null);
      load();
    } catch {
      toast.error("Failed to delete delivery slot.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalItems = filtered.length;

  return (
    <>
      <PageMeta title="Delivery slots" description="Manage delivery time windows for diet plans" />
      <PageBreadcrumb pageTitle="Delivery slots" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or kitchen…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setAddOpen(true)}>
            <FiPlus />
            Add slot
          </Button>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems} {totalItems === 1 ? "entry" : "entries"}
            {searchTerm.trim() && ` (filtered from search)`}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400">Loading…</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    #
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Time window
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Micro kitchen
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      No slots found. Add one to use at payment verification and kitchen delivery settings.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, index) => (
                    <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                        {formatTime12hDisplay(row.start_time)} – {formatTime12hDisplay(row.end_time)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                        {row.micro_kitchen == null
                          ? "Global"
                          : row.micro_kitchen_brand || `Kitchen #${row.micro_kitchen}`}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditSlot(row)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {addOpen && <AddDeliverySlot onClose={() => setAddOpen(false)} onAdded={load} />}
      {editSlot && (
        <EditDeliverySlot 
           key={editSlot.id} 
           slot={editSlot} 
           onClose={() => setEditSlot(null)} 
           onUpdated={load} 
        />
      )}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Delivery Slot?"
        message="Are you sure you want to delete this delivery slot? This may affect active plans and kitchen delivery schedules."
        confirmText="Delete Slot"
      />
    </>
  );
};

export default DeliverySlotManagementPage;
