import React, { useState, useRef } from "react";
import { 
  X, 
  Download, 
  Upload, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { importFile, downloadTemplate } from "../../services/importService";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "../ui/table";
import { getUserRoleFromToken } from "../../utils/auth";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: string;
  submenu: string;
  onSuccess?: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  module,
  submenu,
  onSuccess,
}) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userRole = getUserRoleFromToken();
  const isAdmin = userRole === "admin" || userRole === "master";

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setExcelFile(file);
      setExcelData([]);
      setExpandedRows(new Set());
    }
  };

  const closeModal = () => {
    setExcelFile(null);
    setExcelData([]);
    setExpandedRows(new Set());
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info(`Downloading template for ${submenu}...`);
      await downloadTemplate(module, submenu);
    } catch (error) {
      toast.error("Failed to download template. Please try again.");
    }
  };

  const handleImportExcel = async () => {
    if (!excelFile) return;
    
    setIsValidating(true);
    try {
      const response = await importFile(module, submenu, excelFile, 'analyse');
      if (response.success) {
        setExcelData(response.data || []);
        toast.success("File parsed successfully. Please review the data.");
      } else {
        // Even if validation failed, show the data so user can see errors/duplicates
        if (response.data) {
          setExcelData(response.data);
        } else if (response.errors) {
          setExcelData(response.errors.map((err: any) => ({ ...err, is_error: true })));
        }
        toast.error(response.message || "Validation errors found.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error validating file.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleBulkSubmit = async () => {
    // Fatal if any row has an error that DOES NOT look like a duplicate skip
    const hasFatalErrors = excelData.some(row => 
      row.errors && row.errors.some((err: string) => 
        !err.toLowerCase().includes("already exists") && !err.toLowerCase().includes("this will be skipped")
      )
    );

    if (hasFatalErrors) {
      toast.error("Please fix critical errors before submitting.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await importFile(module, submenu, excelFile!, 'submit');
      if (response.success) {
        toast.success(`Successfully imported ${response.created || excelData.length} records!`);
        if (onSuccess) onSuccess();
        closeModal();
      } else {
        toast.error(response.message || "Import failed.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error during import.");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveRow = (indexToRemove: number) => {
    setExcelData(prev => {
      const newData = prev.filter((_, index) => index !== indexToRemove);
      return newData;
    });
    
    setExpandedRows(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx < indexToRemove) next.add(idx);
        if (idx > indexToRemove) next.add(idx - 1);
      });
      return next;
    });
    
    toast.info("Row removed from preview.");
  };

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getColumns = () => {
    if (excelData.length === 0) return [];
    return Object.keys(excelData[0]).filter(header => 
      !['errors', 'status', 'is_error', 'id', 'is_old', 'branch_status', 'department_status', 'designation_status', 'Unnamed: 0', 'is_approved', 'is_rejected'].includes(header) && !header.endsWith('_input')
    );
  };

  // Re-calculate fatal error rows only (ignoring "already exists" skips)
  const errorRows = excelData.filter(row => 
    row.errors && row.errors.some((err: string) => 
      !err.toLowerCase().includes("already exists") && !err.toLowerCase().includes("this will be skipped")
    )
  );

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Excel - {submenu.charAt(0).toUpperCase() + submenu.slice(1)}</h2>
          </div>
          <button
            onClick={closeModal}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          
          {!excelData.length ? (
            <div className="space-y-8 py-4">
              {/* Upload Excel Section */}
              <div className="text-center space-y-4">
                <div className="inline-flex flex-col items-center">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload your file</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                     Download our template file to ensure your data is in the correct format before uploading.
                   </p>
                </div>

                {/* Download Template Button */}
                <div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-100 bg-emerald-50 px-8 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:border-emerald-200 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                  >
                    <Download className="h-5 w-5" />
                    Download Sample Template
                  </button>
                </div>

                {/* File Input (Dashed Box) */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed py-16 text-center transition-all ${
                    excelFile 
                      ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10" 
                      : "border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
                    excelFile ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                  }`}>
                    <Upload className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {excelFile ? "File Selected!" : "Select Excel File"}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {excelFile ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{excelFile.name} ({(excelFile.size/1024).toFixed(1)} KB)</span>
                    ) : (
                      "Drag & drop your file here or click to browse"
                    )}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={closeModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleImportExcel}
                    disabled={!excelFile || isValidating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-10 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:translate-y-[-2px] disabled:opacity-50"
                  >
                    {isValidating ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                    ) : (
                      <><CheckCircle2 className="h-5 w-5" /> Analyze Data</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Excel Data Preview */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-950/20">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                      Total Records: {excelData.length}
                    </div>
                    {errorRows.length > 0 && (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        {errorRows.length} Errors Found
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {errorRows.length > 0 && (
                      <button
                        onClick={() => setIsErrorModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/30"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        View All Errors
                      </button>
                    )}
                    <button
                      onClick={() => setExcelData([])}
                      className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-4"
                    >
                      Re-upload File
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                  <div className="max-h-[400px] overflow-auto">
                    <Table className="w-full border-collapse">
                      <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 shadow-sm">
                        <TableRow>
                          <TableCell isHeader className="p-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 w-16">Row</TableCell>
                          {getColumns().map(header => (
                            <TableCell key={header} isHeader className="p-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 capitalize">
                              {header.replace(/_/g, ' ')}
                            </TableCell>
                          ))}
                          <TableCell isHeader className="p-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 w-24">Status</TableCell>
                          <TableCell isHeader className="p-3 w-10 text-center text-xs font-bold text-gray-600 dark:text-gray-400">Action</TableCell>
                          <TableCell isHeader className="p-3 w-10" children={undefined}></TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {excelData.map((row, index) => {
                          const isExpanded = expandedRows.has(index);
                          const hasFatalErrors = row.errors && row.errors.some((err: string) => 
                            !err.toLowerCase().includes("already exists") && !err.toLowerCase().includes("this will be skipped")
                          );
                          const isDuplicate = row.errors && row.errors.some((err: string) => 
                            err.toLowerCase().includes("already exists") || err.toLowerCase().includes("this will be skipped")
                          );
                          
                          return (
                            <React.Fragment key={index}>
                              <TableRow
                                onClick={() => toggleRowExpansion(index)}
                                className={`group cursor-pointer border-b border-gray-50 dark:border-gray-800 transition-colors ${
                                  hasFatalErrors 
                                    ? "bg-red-50/30 hover:bg-red-50/50 dark:bg-red-900/5 dark:hover:bg-red-900/10" 
                                    : isDuplicate
                                      ? "bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-900/5 dark:hover:bg-amber-900/10"
                                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                              >
                                <TableCell className="p-3 text-xs font-semibold text-gray-500">{index + 2}</TableCell>
                                {getColumns().map(col => (
                                  <TableCell key={col} className="p-3 text-xs text-gray-700 dark:text-gray-300">
                                    {col.toLowerCase().includes('name') ? (
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-800">
                                          {(String(row[col] || 'L')).charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`font-semibold ${isDuplicate ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
                                          {String(row[col] || 'N/A')}
                                        </span>
                                      </div>
                                    ) : (
                                      String(row[col] || 'N/A')
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell className="p-3">
                                  {hasFatalErrors ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                      <AlertTriangle className="h-3 w-3" />
                                      {row.errors.filter((e: string) => !e.includes("Already exists")).length} Error{row.errors.length > 1 ? 's' : ''}
                                    </span>
                                  ) : isDuplicate ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                      <AlertCircle className="h-3 w-3" />
                                      Skip
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Valid
                                    </span>
                                  )}
                                </TableCell>
                                  <TableCell className="p-3 w-10 text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveRow(index);
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Remove this row"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </TableCell>
                                  <TableCell className="p-3 w-10">
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                  </TableCell>
                              </TableRow>
                              
                              {isExpanded && (
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                  <TableCell colSpan={getColumns().length + 4} className="p-4">
                                    <div className="grid grid-cols-1 gap-4">
                                      {(hasFatalErrors || isDuplicate) && (
                                        <div className={`rounded-xl border p-4 ${
                                          hasFatalErrors ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30" : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                                        }`}>
                                          <div className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-400 mb-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Validation Errors
                                          </div>
                                          <ul className="list-inside list-disc space-y-1 text-xs text-red-700 dark:text-red-300">
                                            {row.errors.map((error: string, errIndex: number) => (
                                              <li key={errIndex}>{error}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      <div className="flex flex-wrap gap-8 text-xs">
                                        {Object.entries(row).map(([k, v]) => {
                                          if(['errors', 'status', 'is_error', 'is_old', 'Unnamed: 0', 'is_approved', 'is_rejected'].includes(k) || k.endsWith('_input')) return null;
                                          return (
                                            <div key={k}>
                                              <span className="font-bold text-gray-500 uppercase tracking-tight">{k.replace(/_/g, ' ')}:</span>
                                              <span className="ml-2 text-gray-900 dark:text-white font-medium">{String(v || 'N/A')}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Submit Action Block */}
                <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <button
                    onClick={handleBulkSubmit}
                    disabled={isUploading || errorRows.length > 0}
                    className="w-full relative group overflow-hidden rounded-2xl bg-emerald-600 px-8 py-4 text-md font-bold text-white shadow-xl shadow-emerald-200 dark:shadow-none transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 hover:translate-y-[-2px]"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isUploading ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> Finalizing Import...</>
                      ) : (
                        <><Upload className="h-6 w-6" /> Submit Bulk Upload</>
                      )}
                    </div>
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                    {errorRows.length > 0 
                      ? "❌ You cannot submit until all validation errors are fixed in your Excel file." 
                      : "✅ All records are valid. Click the button above to complete the import."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Details Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl bg-white shadow-3xl dark:bg-gray-800 border-4 border-red-50 dark:border-red-900/20">
            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Import Errors Summary
                </h2>
              </div>
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                  We found <span className="font-bold underline">{errorRows.length} rows</span> with validation issues. 
                  Please review the errors below, correct them in your source Excel file, and re-upload.
                </p>
              </div>
              
              <div className="space-y-4">
                {errorRows.map((row, index) => (
                  <div key={index} className="group rounded-2xl border border-red-100 bg-white p-6 shadow-sm transition-all hover:border-red-300 dark:border-red-900/40 dark:bg-gray-900/40">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-md font-bold text-gray-900 dark:text-red-300">
                        Row {excelData.indexOf(row) + 2}
                      </h3>
                      <span className="rounded-lg bg-red-100 px-3 py-1 text-[10px] font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                        {row.errors.length} ERROR{row.errors.length > 1 ? 'S' : ''}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {row.errors.map((error: string, errIndex: number) => (
                        <li key={errIndex} className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end border-t border-gray-100 px-8 py-6 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-black active:scale-95"
              >
                Got it, I'll fix it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadModal;
