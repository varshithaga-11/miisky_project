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

const DeliverySlotManagementPage: React.FC = () => {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<DeliverySlot | null>(null);

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
    if (!window.confirm("Delete this delivery slot? Plans referencing it may need to be updated.")) return;
    try {
      await deleteDeliverySlot(id);
      load();
    } catch {
      alert("Failed to delete. It may be in use.");
    }
  };

  return (
    <>
      <PageMeta title="Delivery slots" description="Manage delivery time windows for diet plans" />
      <PageBreadcrumb pageTitle="Delivery slots" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or kitchen…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setAddOpen(true)}>
            <FiPlus />
            Add slot
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
          {loading ? (
            <p className="p-8 text-center text-gray-500">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableCell isHeader>Name</TableCell>
                  <TableCell isHeader>Time window</TableCell>
                  <TableCell isHeader>Micro kitchen</TableCell>
                  <TableCell isHeader className="text-right w-28">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No slots found. Add one to use at payment verification and kitchen delivery settings.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-gray-900 dark:text-white">{row.name}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {formatTime12hDisplay(row.start_time)} – {formatTime12hDisplay(row.end_time)}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {row.micro_kitchen == null
                          ? "Global"
                          : row.micro_kitchen_brand || `Kitchen #${row.micro_kitchen}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => setEditSlot(row)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/20"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {addOpen && (
        <AddDeliverySlot onClose={() => setAddOpen(false)} onAdded={load} />
      )}
      {editSlot && (
        <EditDeliverySlot
          key={editSlot.id}
          slot={editSlot}
          onClose={() => setEditSlot(null)}
          onUpdated={load}
        />
      )}
    </>
  );
};

export default DeliverySlotManagementPage;
