import { useEffect, useState } from "react";
import { FiSearch, FiEye, FiDownload } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { getAllOrders, getMicroKitchens } from "./api";

interface OrderRow {
  id: number;
  order_id: string;
  patient_name: string;
  kitchen_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const OrderManagementPage: React.FC = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedKitchen, setSelectedKitchen] = useState("");
  const [kitchens, setKitchens] = useState<{ id: number; brand_name: string }[]>([]);

  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const res = await getMicroKitchens();
        setKitchens(res.results || []);
      } catch (err) {
        console.error("Failed to load kitchens", err);
      }
    };
    fetchKitchens();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllOrders(currentPage, pageSize, searchTerm, selectedKitchen);
        setRows(res.results || []);
        setTotalItems(res.count || 0);
        setTotalPages(res.total_pages || 0);
      } catch (e) {
        console.error(e);
        // Fallback or empty state
        setRows([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, pageSize, searchTerm, selectedKitchen]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'pending': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'completed': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
    }
  };

  return (
    <>
      <PageMeta title="Orders Management" description="Oversight of all patient and non-patient orders" />
      <PageBreadcrumb pageTitle="Orders Management" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm transition-all duration-300">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search Order ID, Patient, Kitchen..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all"
                />
                <FiSearch className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              </div>

              <div className="flex-1 max-w-xs">
                <Select
                  value={selectedKitchen}
                  onChange={(val) => {
                    setSelectedKitchen(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "", label: "All Micro-Kitchens" },
                    ...kitchens.map((k) => ({
                      value: String(k.id),
                      label: k.brand_name || `Kitchen #${k.id}`,
                    })),
                  ]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Total Orders: {totalItems}</span>
                  <span>
                    Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm dark:text-gray-400 whitespace-nowrap font-medium">Show:</Label>
                  <Select
                    value={String(pageSize)}
                    onChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "10", label: "10" },
                      { value: "25", label: "25" },
                      { value: "50", label: "50" },
                    ]}
                    className="w-24 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2 rounded-xl py-2.5 px-4 shadow-sm hover:shadow-md transition-all">
                  <FiDownload /> Export
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Order Details</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Kitchen</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                          <span>Loading orders...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <span className="text-4xl">📦</span>
                          <span>No orders found</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, index) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors">
                        <TableCell className="px-6 py-5">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 dark:text-white">{r.order_id || `#ORD-${r.id}`}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{r.patient_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.kitchen_name || "—"}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">₹{r.amount}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(r.status)}`}>
                            {r.status || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-right">
                          <button className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 text-sm font-bold opacity-80 hover:opacity-100 transition-all">
                            <FiEye className="w-4 h-4" /> Details
                          </button>
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
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Page <span className="text-gray-900 dark:text-white font-bold">{currentPage}</span> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl px-4 py-2 shadow-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl px-4 py-2 shadow-sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderManagementPage;
