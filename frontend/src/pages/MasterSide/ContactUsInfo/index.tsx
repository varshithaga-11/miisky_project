import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit, FiSearch } from "react-icons/fi";
import { getContactUsInfoList, deleteContactUsInfo, ContactUsInfo } from "./contactusinfoapi";
import AddContactUsInfo from "./AddContactUsInfo";
import EditContactUsInfo from "./EditContactUsInfo";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ContactUsInfoPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactUsInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContactUid, setSelectedContactUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uidToDelete, setUidToDelete] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContactUsInfoList(currentPage, pageSize, search);
      setContacts(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast.error("Failed to load contact information");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = (uid: string) => {
    setUidToDelete(uid);
  };

  const confirmDelete = async () => {
    if (uidToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteContactUsInfo(uidToDelete);
      toast.success("Contact information deleted successfully!");
      setUidToDelete(null);
      fetchContacts();
    } catch {
      toast.error("Failed to delete contact information.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddContact = () => {
    fetchContacts();
    setShowAddModal(false);
  };

  const handleEditContact = () => {
    fetchContacts();
    setShowEditModal(false);
  };

  return (
    <>
      <PageMeta title="Contact Us Info Management" description="Manage company office locations and contact details" />
      <PageBreadcrumb pageTitle="Contact Us Info" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contact info..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setShowAddModal(true)}
            >
              <FiPlus /> Add Contact Info
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
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
              <span className="text-sm text-gray-400 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
           <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Country</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">State / City</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Address</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Primary Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Support Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No contact info entries found</TableCell>
                </TableRow>
              ) : (
                contacts.map((contact, index) => (
                  <TableRow key={contact.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-900 text-theme-sm dark:text-white">
                        {contact.country}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-600 text-theme-sm dark:text-gray-400">
                        {contact.city ? `${contact.city}, ` : ""}{contact.state || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-600 text-theme-sm dark:text-gray-400 max-w-xs truncate">
                        {contact.address || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-600 text-theme-sm dark:text-gray-400">
                        {contact.phone_primary || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-gray-600 text-theme-sm dark:text-gray-400">
                        {contact.email_support || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <div className="flex items-center gap-3">
                          <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => { setSelectedContactUid(contact.uid!); setShowEditModal(true); }}><FiEdit /></button>
                          <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(contact.uid!)}><FiTrash2 /></button>
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

      {showAddModal && (
        <AddContactUsInfo onClose={() => setShowAddModal(false)} onAdd={handleAddContact} />
      )}

      {showEditModal && selectedContactUid && (
        <EditContactUsInfo
          contactUid={selectedContactUid}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleEditContact}
        />
      )}

      <ConfirmationModal
        isOpen={uidToDelete !== null}
        onClose={() => setUidToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Contact Information?"
        message="Are you sure you want to delete this contact information? This action cannot be undone."
        confirmText="Delete Contact Info"
      />
    </>
  );
};

export default ContactUsInfoPage;
