import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getCityList, deleteCity, City } from "./cityapi";
import { getStateList, State } from "../State/stateapi";
import AddCity from "./AddCity";
import EditCity from "./EditCity";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const CityManagementPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCityId, setEditCityId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cityList, stateList] = await Promise.all([
        getCityList(),
        getStateList()
      ]);
      setCities(cityList);
      setStates(stateList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStateName = (id?: number) => {
    return states.find(s => s.id === id)?.name || "N/A";
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this city?")) return;
    try {
      await deleteCity(id);
      setCities((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete city.");
    }
  };

  const filteredCities = useMemo(() => {
    return cities.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStateName(c.state).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm, states]);

  const paginatedCities = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCities.slice(startIndex, startIndex + pageSize);
  }, [filteredCities, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCities.length / pageSize);

  if (loading && cities.length === 0) return <div className="p-6">Loading cities...</div>;

  return (
    <>
      <PageMeta title="City Management" description="Manage cities" />
      <PageBreadcrumb pageTitle="City Management" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search city or state..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>Add City</Button>
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
              <TableCell isHeader>City Name</TableCell>
              <TableCell isHeader>State</TableCell>
              <TableCell isHeader>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">No cities found</TableCell>
              </TableRow>
            ) : (
              paginatedCities.map((city, index) => (
                <TableRow key={city.id}>
                  <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{getStateName(city.state)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600" onClick={() => { setEditCityId(city.id!); setIsEditModalOpen(true); }}><FiEdit /></button>
                      <button className="text-red-600" onClick={() => handleDelete(city.id!)}><FiTrash2 /></button>
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

      {isAddModalOpen && <AddCity onClose={() => setIsAddModalOpen(false)} onAdd={() => fetchData()} />}
      {isEditModalOpen && editCityId !== null && (
        <EditCity
          cityId={editCityId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => fetchData()}
        />
      )}
    </>
  );
};

export default CityManagementPage;
