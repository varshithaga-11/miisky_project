import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import FileUploadModal from "./FileUploadModal";
import Button from "../ui/button/Button";

interface ImportButtonProps {
  onSuccess?: () => void;
}

const ImportButton: React.FC<ImportButtonProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const context = useMemo(() => {
    const path = location.pathname;
    
    // Mapping current paths to module/submenu structure
    // Location Module
    if (path.includes("/country")) return { module: "location", submenu: "country" };
    if (path.includes("/state")) return { module: "location", submenu: "state" };
    if (path.includes("/city")) return { module: "location", submenu: "city" };
    
    // Food Module
    if (path.includes("/meal-type")) return { module: "food", submenu: "mealtype" };
    if (path.includes("/cuisine-type")) return { module: "food", submenu: "cuisinetype" };
    if (path.includes("/food")) return { module: "food", submenu: "food" };
    if (path.includes("/unit")) return { module: "food", submenu: "unit" };
    if (path.includes("/ingredient")) return { module: "food", submenu: "ingredient" };
    if (path.includes("/recipe-creator")) return { module: "food", submenu: "recipe" };
    
    // Health Module
    if (path.includes("/health-parameter")) return { module: "health", submenu: "healthparameter" };
    if (path.includes("/normal-range")) return { module: "health", submenu: "normalrange" };
    if (path.includes("/diet-plan")) return { module: "health", submenu: "dietplan" };

    return null;
  }, [location.pathname]);

  if (!context) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="inline-flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/20"
        onClick={() => setIsOpen(true)}
      >
        <FiDownload /> Import File
      </Button>

      <FileUploadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        module={context.module}
        submenu={context.submenu}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default ImportButton;
