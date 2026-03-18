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
    // Food Groups and Food Names
    if (path.includes("/food-group")) return { module: "food", submenu: "foodgroup" };
    if (path.includes("/food-name")) return { module: "food", submenu: "foodname" };
    // Location Module
    if (path.includes("/country")) return { module: "location", submenu: "country" };
    if (path.includes("/state")) return { module: "location", submenu: "state" };
    if (path.includes("/city")) return { module: "location", submenu: "city" };

    // Food Composition Submenus
    if (path.includes("/food-proximate")) return { module: "food", submenu: "foodproximate" };
    if (path.includes("/food-water-soluble-vitamins")) return { module: "food", submenu: "foodwatersolublevitamins" };
    if (path.includes("/food-fat-soluble-vitamins")) return { module: "food", submenu: "foodfatsolublevitamins" };
    if (path.includes("/food-carotenoids")) return { module: "food", submenu: "foodcarotenoids" };
    if (path.includes("/food-minerals")) return { module: "food", submenu: "foodminerals" };
    if (path.includes("/food-sugars")) return { module: "food", submenu: "foodsugars" };
    if (path.includes("/food-amino-acids")) return { module: "food", submenu: "foodaminoacids" };
    if (path.includes("/food-organic-acids")) return { module: "food", submenu: "foodorganicacids" };
    if (path.includes("/food-polyphenols")) return { module: "food", submenu: "foodpolyphenols" };
    if (path.includes("/food-phytochemicals")) return { module: "food", submenu: "foodphytochemicals" };
    if (path.includes("/food-fatty-acid-profile")) return { module: "food", submenu: "foodfattyacidprofile" };

    // Other Food Module
    if (path.includes("/meal-type")) return { module: "food", submenu: "meal-type" };
    if (path.includes("/cuisine-type")) return { module: "food", submenu: "cuisine-type" };
    if (path.includes("/food")) return { module: "food", submenu: "food" };
    if (path.includes("/unit")) return { module: "food", submenu: "unit" };
    if (path.includes("/ingredient")) return { module: "food", submenu: "ingredient" };
    if (path.includes("/recipe-creator")) return { module: "food", submenu: "recipe" };
    if (path.includes("/food-step")) return { module: "food", submenu: "food-step" };

    // Health Module
    if (path.includes("/health-parameter")) return { module: "health", submenu: "health-parameter" };
    if (path.includes("/normal-range")) return { module: "health", submenu: "normal-range" };
    if (path.includes("/diet-plan")) return { module: "health", submenu: "diet-plan" };

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
