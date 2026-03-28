import { useEffect, useState } from "react";
import { FiEye, FiSearch } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { fetchNonPatientUserList, type UserRegister } from "./api";
import { NonPatientUserDetailModal } from "../UserManagement/NonPatientUserDetailModal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

function coordSummary(u: UserRegister): string {
  const lat = u.latitude;
  const lng = u.longitude;
  if (lat == null && lng == null) return "—";
  if (lat != null && lng != null) return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  return lat != null ? `lat ${lat}` : `lng ${lng}`;
}

export default function NonPatientInformationPage() {
  const [rows, setRows] = useState<UserRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [detailUser, setDetailUser] = useState<UserRegister | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchNonPatientUserList(currentPage, pageSize, searchTerm);
        setRows(res.results ?? []);
        setTotalItems(res.count ?? 0);
        setTotalPages(res.total_pages ?? 0);
      } catch (e) {
        console.error(e);
        setRows([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, pageSize, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Non-Patient Users"
        description="Retail food customers: profile, address, map coordinates, and order history"
      />
      <PageBreadcrumb pageTitle="Non-Patient Information" />

      <div className="mb-6 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
          Users with role <span className="font-semibold text-gray-800 dark:text-gray-200">non_patient</span> order
          meals from micro kitchens. Open a row to see full profile, delivery address, coordinates, and every order
          (amounts, distance, charges, line items).
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md w-full">
            <input
              type="text"
              placeholder="Search name, email, mobile…"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Rows:</Label>
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
              className="w-24"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> non-patient
          {totalItems === 1 ? " user" : " users"}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  #
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Mobile
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Address
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Coordinates
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Active
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Details
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-400 italic">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-400 italic">
                    No non-patient users found. Try another search or create users with role non_patient in User
                    Management.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((u, index) => {
                  const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "—";
                  const addr = (u.address || "").trim();
                  const addrShort = addr.length > 48 ? `${addr.slice(0, 48)}…` : addr || "—";
                  return (
                    <TableRow key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <TableCell className="px-5 py-4 text-sm text-gray-500">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{name}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{u.email}</TableCell>
                      <TableCell className="px-5 py-4 text-sm">{u.mobile || "—"}</TableCell>
                      <TableCell className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400 max-w-[220px]">
                        {addrShort}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {coordSummary(u)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.is_active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {u.is_active ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="inline-flex items-center gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
                          onClick={() => setDetailUser(u)}
                        >
                          <FiEye className="w-4 h-4" />
                          View all
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {detailUser && detailUser.id != null && (
        <NonPatientUserDetailModal
          user={detailUser}
          open={!!detailUser}
          onClose={() => setDetailUser(null)}
        />
      )}
    </>
  );
}
