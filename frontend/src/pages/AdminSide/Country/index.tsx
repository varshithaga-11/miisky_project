import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getCountryList, deleteCountry, Country } from "./countryapi";
import AddCountry from "./AddCountry";
import EditCountry from "./EditCountry";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const CountryManagementPage: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCountryId, setEditCountryId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof Country | null>(null);

  // Search, sort, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const list = await getCountryList();
      setCountries(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this country?")) return;
    try {
      await deleteCountry(id);
      setCountries((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete country.");
    }
  };

  const onCountryAdded = () => {
    fetchCountries();
    setIsAddModalOpen(false);
  };

  const onCountryUpdated = () => {
    fetchCountries();
    setIsEditModalOpen(false);
    setEditCountryId(null);
  };

  const filteredCountries = useMemo(() => {
    let filtered = countries;
    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [countries, searchTerm]);

  const sortedCountries = useMemo(() => {
    if (!sortField) return filteredCountries;
    return [...filteredCountries].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredCountries, sortField, sortDirection]);

  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedCountries.slice(startIndex, startIndex + pageSize);
  }, [sortedCountries, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedCountries.length / pageSize);

  const handleSort = (field: keyof Country) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  if (loading && countries.length === 0) return <div className="p-6">Loading countries...</div>;

  return (
    <>
      <PageMeta title="Country Management" description="Manage countries" />
      <PageBreadcrumb pageTitle="Country Management" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-4">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Country
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-400">Show:</Label>
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
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start">#</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Country Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">Created At</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedCountries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500">No countries found</TableCell>
                </TableRow>
              ) : (
                paginatedCountries.map((country, index) => (
                  <TableRow key={country.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{country.name}</TableCell>
                    <TableCell className="px-5 py-4">{country.created_at || "N/A"}</TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit" onClick={() => { setEditCountryId(country.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Delete" onClick={() => handleDelete(country.id!)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isAddModalOpen && <AddCountry onClose={() => setIsAddModalOpen(false)} onAdd={onCountryAdded} />}
      {isEditModalOpen && editCountryId !== null && (
        <EditCountry
          countryId={editCountryId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={onCountryUpdated}
        />
      )}
    </>
  );
};

export default CountryManagementPage;
