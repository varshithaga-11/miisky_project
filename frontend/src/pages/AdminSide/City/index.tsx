import { useEffect, useState, useMemo, useRef } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getCityList, deleteCity, City } from "./cityapi";
import { getStateList, State } from "../State/stateapi";
import AddCity from "./AddCity";
import EditCity from "./EditCity";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { getCountryList, Country, checkLocationDependency } from "../Country/countryapi";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getUserList, getDeliveryProfileList } from "../UserManagement/api";
import { getMicroKitchenList } from "../MicroKitchenInformation/api";

const CityManagementPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCityId, setEditCityId] = useState<number | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | "">("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | "">("");
  const [cityToDelete, setCityToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof City | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchingCountriesRef = useRef(false);
  const fetchingStatesRef = useRef(false);

  useEffect(() => {
    fetchCities();
  }, [currentPage, pageSize, searchTerm, selectedStateId, selectedCountryId]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const cityRes = await getCityList(currentPage, pageSize, searchTerm, selectedStateId, selectedCountryId);
      setCities(cityRes.results);
      setTotalItems(cityRes.count);
      setTotalPages(cityRes.total_pages);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    if (states.length > 0 || fetchingStatesRef.current) return;
    fetchingStatesRef.current = true;
    try {
      const stateRes = await getStateList(1, "all");
      setStates(stateRes.results);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      fetchingStatesRef.current = false;
    }
  };

  const fetchCountries = async () => {
    if (countries.length > 0 || fetchingCountriesRef.current) return;
    fetchingCountriesRef.current = true;
    try {
      const countryRes = await getCountryList(1, "all");
      setCountries(countryRes.results);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      fetchingCountriesRef.current = false;
    }
  };

  const getStateName = (city: City) => {
    return city.state_name || states.find(s => s.id === city.state)?.name || "N/A";
  };

  const getCountryName = (city: City) => {
    return city.country_name || states.find(s => s.id === city.state)?.country_name || "N/A";
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await checkLocationDependency({ city_id: id });
      if (res.detail !== "none") {
        toast.error(`Cannot delete as it has ${res.detail}. Please remove them first.`);
        return;
      }
      setCityToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (cityToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteCity(cityToDelete);
      toast.success("City deleted successfully.");
      
      // Optimistic update: remove from local state immediately
      setCities((prev) => prev.filter((c) => c.id !== cityToDelete));
      setTotalItems((prev) => prev - 1);
      
      setCityToDelete(null);
      
      // Fetch latest data to sync pagination and other states
      await fetchCities();
      
      // If we are on a page that is now empty, go to the previous page
      if (cities.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch {
      toast.error("Failed to delete city. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: keyof City) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCities = useMemo(() => {
    if (!sortField) return cities;
    return [...cities].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'state') {
          aValue = getStateName(a);
          bValue = getStateName(b);
      } else if (sortField === 'country_name' as any) {
          aValue = getCountryName(a);
          bValue = getCountryName(b);
      }

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [cities, sortField, sortDirection, states]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  if (loading && cities.length === 0) return <div className="text-black dark:text-white p-6">Loading cities...</div>;

  return (
    <>
      <PageMeta title="City Management" description="Manage cities and municipalities efficiently" />
      <PageBreadcrumb pageTitle="City Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search city or state..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => { fetchCountries(); fetchStates(); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <SearchableSelect
                options={[
                  { value: "", label: "All Countries" },
                  ...countries.map(c => ({ value: c.id!, label: c.name }))
                ]}
                value={selectedCountryId}
                onChange={(val) => {
                  setSelectedCountryId(val as number | "");
                  setSelectedStateId(""); // Reset state filter when country changes
                  setCurrentPage(1);
                }}
                onFocus={fetchCountries}
                placeholder="Filter by Country"
              />
            </div>

            <div className="w-full sm:w-64">
              <SearchableSelect
                options={[
                  { value: "", label: "All States" },
                  ...states
                    .filter(s => !selectedCountryId || s.country === selectedCountryId)
                    .map(s => ({ value: s.id!, label: s.name }))
                ]}
                value={selectedStateId}
                onChange={(val) => {
                  setSelectedStateId(val as number | "");
                  setCurrentPage(1);
                }}
                onFocus={fetchStates}
                placeholder="Filter by State"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ImportButton onSuccess={fetchCities} />
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus /> Add City
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-20"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
           <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            {searchTerm && ` (filtered from search)`}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                <TableCell 
                    isHeader 
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    City Name
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell 
                    isHeader 
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('state')}
                >
                  <div className="flex items-center gap-2">
                    State
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'state' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell 
                    isHeader 
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('country_name' as any)}
                >
                  <div className="flex items-center gap-2">
                    Country
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'country_name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedCities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No cities found</TableCell>
                </TableRow>
              ) : (
                sortedCities.map((city, index) => (
                  <TableRow key={city.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                        {city.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium dark:bg-orange-900/30">
                            {getStateName(city)}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium dark:bg-blue-900/30">
                            {getCountryName(city)}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => { setEditCityId(city.id!); setIsEditModalOpen(true); }}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(city.id!)}><FiTrash2 /></button>
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
           <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddCity 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={() => {
            fetchCities();
            setIsAddModalOpen(false);
            setCurrentPage(1);
          }} 
        />
      )}
      {isEditModalOpen && editCityId !== null && (
        <EditCity
          cityId={editCityId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => { 
            fetchCities(); 
            setIsEditModalOpen(false); 
            setEditCityId(null); 
          }}
        />
      )}

      <ConfirmationModal
        isOpen={cityToDelete !== null}
        onClose={() => setCityToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete City?"
        message="Are you sure you want to permanently delete this city record? This action cannot be reversed."
        confirmText="Delete City"
      />
    </>
  );
};

export default CityManagementPage;
