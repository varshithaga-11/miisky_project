import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getStateList, deleteState, State } from "./stateapi";
import { getCountryList, Country } from "../Country/countryapi";
import AddState from "./AddState";
import EditState from "./EditState";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const StateManagementPage: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStateId, setEditStateId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stateList, countryList] = await Promise.all([
        getStateList(),
        getCountryList()
      ]);
      setStates(stateList);
      setCountries(countryList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (id?: number) => {
    return countries.find(c => c.id === id)?.name || "N/A";
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this state?")) return;
    try {
      await deleteState(id);
      setStates((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete state.");
    }
  };

  const filteredStates = useMemo(() => {
    return states.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCountryName(s.country).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [states, searchTerm, countries]);

  const paginatedStates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStates.slice(startIndex, startIndex + pageSize);
  }, [filteredStates, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStates.length / pageSize);

  if (loading && states.length === 0) return <div className="p-6">Loading states...</div>;

  return (
    <>
      <PageMeta title="State Management" description="Manage states" />
      <PageBreadcrumb pageTitle="State Management" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search state or country..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>Add State</Button>
            <Select
              value={String(pageSize)}
              onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
              options={[
                { value: "5", label: "5" },
                { value: "10", label: "10" },
                { value: "25", label: "25" },
              ]}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-white/[0.03]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>#</TableCell>
              <TableCell isHeader>State Name</TableCell>
              <TableCell isHeader>Country</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">No states found</TableCell>
              </TableRow>
            ) : (
              paginatedStates.map((state, index) => (
                <TableRow key={state.id}>
                  <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="font-medium">{state.name}</TableCell>
                  <TableCell>{getCountryName(state.country)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600" onClick={() => { setEditStateId(state.id!); setIsEditModalOpen(true); }}><FiEdit /></button>
                      <button className="text-red-600" onClick={() => handleDelete(state.id!)}><FiTrash2 /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>Page {currentPage} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {isAddModalOpen && <AddState onClose={() => setIsAddModalOpen(false)} onAdd={() => fetchData()} />}
      {isEditModalOpen && editStateId !== null && (
        <EditState
          stateId={editStateId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => fetchData()}
        />
      )}
    </>
  );
};

export default StateManagementPage;
