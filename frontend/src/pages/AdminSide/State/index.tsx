import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getStateList, deleteState, State } from "./stateapi";
import { getCityList } from "../City/cityapi";
import { getCountryList, Country } from "../Country/countryapi";
import { getUserList, getDeliveryProfileList } from "../UserManagement/api";
import { getMicroKitchenList } from "../MicroKitchenInformation/api";
import AddState from "./AddState";
import EditState from "./EditState";
import ImportButton from "../../../components/common/ImportButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import SearchableSelect from "../../../components/form/SearchableSelect";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const StateManagementPage: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStateId, setEditStateId] = useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number | "">("");
  const [stateToDelete, setStateToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof State | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm, selectedCountryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stateRes, countryRes] = await Promise.all([
        getStateList(currentPage, pageSize, searchTerm, selectedCountryId),
        getCountryList(1, "all")
      ]);
      setStates(stateRes.results);
      setTotalItems(stateRes.count);
      setTotalPages(stateRes.total_pages);
      setCountries(countryRes.results);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (state: State) => {
    return state.country_name || countries.find(c => c.id === state.country)?.name || "N/A";
  };

  const handleDelete = async (id: number) => {
    try {
      // 1. Check for Cities
      const citiesResponse = await getCityList(1, 1, "", id);
      if (citiesResponse.count > 0) {
        toast.error(`Cannot delete state. It has ${citiesResponse.count} associated cities. Please delete them first.`);
        return;
      }

      // 2. Check for Users
      const userRes = await getUserList(1, 1, "", "all", "all", { state: id });
      if (userRes.count > 0) {
        toast.error(`Cannot delete state. It is associated with ${userRes.count} users. Please reassign or delete those users first.`);
        return;
      }

      // 3. Check for Micro Kitchens
      const mkRes = await getMicroKitchenList(1, "", "all", { state: id });
      if (mkRes.count > 0) {
        toast.error(`Cannot delete state. It is associated with ${mkRes.count} micro kitchens. Please delete them first.`);
        return;
      }

      // 4. Check for Delivery Profiles
      const dpRes = await getDeliveryProfileList(1, 1, "", { state: id });
      if (dpRes.count > 0) {
        toast.error(`Cannot delete state. It is associated with ${dpRes.count} delivery profiles. Please delete them first.`);
        return;
      }

      setStateToDelete(id);
    } catch {
      toast.error("An error occurred while checking dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (stateToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteState(stateToDelete);
      toast.success("State deleted successfully.");
      setStateToDelete(null);
      fetchData();
    } catch {
      toast.error("Failed to delete state. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: keyof State) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStates = useMemo(() => {
    if (!sortField) return states;
    return [...states].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'country') {
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
  }, [states, sortField, sortDirection, countries]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  if (loading && states.length === 0) return <div className="text-black dark:text-white p-6">Loading states...</div>;

  return (
    <>
      <PageMeta title="State Management" description="Manage states and provinces efficiently" />
      <PageBreadcrumb pageTitle="State Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search state or country..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="w-full sm:w-64">
             <SearchableSelect
               options={[
                 { value: "", label: "All Countries" },
                 ...countries.map(c => ({ value: c.id!, label: c.name }))
               ]}
               value={selectedCountryId}
               onChange={(val) => {
                 setSelectedCountryId(val as number | "");
                 setCurrentPage(1);
               }}
               placeholder="Filter by Country"
             />
          </div>
          
          <div className="flex items-center gap-6">
            <ImportButton onSuccess={fetchData} />
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus /> Add State
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
                    State Name
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell 
                    isHeader 
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('country')}
                >
                  <div className="flex items-center gap-2">
                    Country
                    <span className="text-gray-300 dark:text-gray-600">
                      {sortField === 'country' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sortedStates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No states found</TableCell>
                </TableRow>
              ) : (
                sortedStates.map((state, index) => (
                  <TableRow key={state.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">
                        {state.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium dark:bg-blue-900/30">
                            {getCountryName(state)}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => { setEditStateId(state.id!); setIsEditModalOpen(true); }}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(state.id!)}><FiTrash2 /></button>
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

      {isAddModalOpen && <AddState onClose={() => setIsAddModalOpen(false)} onAdd={() => fetchData()} />}
      {isEditModalOpen && editStateId !== null && (
        <EditState
          stateId={editStateId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => { fetchData(); setIsEditModalOpen(false); setEditStateId(null); }}
        />
      )}

      <ConfirmationModal
        isOpen={stateToDelete !== null}
        onClose={() => setStateToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete State?"
        message="Are you sure you want to permanently remove this state and its administrative configuration? This action is irreversible."
        confirmText="Delete State"
      />
    </>
  );
};

export default StateManagementPage;
