import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getUnitList, deleteUnit, Unit } from "./unitapi";
import AddUnit from "./AddUnit";
import EditUnit from "./EditUnit";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

const UnitManagementPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUnitId, setEditUnitId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const list = await getUnitList();
      setUnits(list);
    } catch {
      alert("Failed to load units.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteUnit(id);
      setUnits(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete unit.");
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [units, searchTerm]);

  return (
    <>
      <PageMeta title="Unit Management" description="Manage measurement units" />
      <PageBreadcrumb pageTitle="Unit Management" />

      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search units..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <Button onClick={() => setIsAddModalOpen(true)}>Add Unit</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>#</TableCell>
              <TableCell isHeader>Unit Name</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>
                  <div className="flex gap-3 text-lg">
                    <button onClick={() => { setEditUnitId(u.id!); setIsEditModalOpen(true); }} className="text-blue-500"><FiEdit /></button>
                    <button onClick={() => handleDelete(u.id!)} className="text-red-500"><FiTrash2 /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isAddModalOpen && <AddUnit onClose={() => setIsAddModalOpen(false)} onAdd={() => { fetchUnits(); setIsAddModalOpen(false); }} />}
      {isEditModalOpen && editUnitId && (
        <EditUnit unitId={editUnitId} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdated={() => { fetchUnits(); setIsEditModalOpen(false); }} />
      )}
    </>
  );
};

export default UnitManagementPage;
