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

    const pathMapping: Record<string, { module: string; submenu: string }> = {
      '/food-management/food-group': { module: 'food', submenu: 'foodgroup' },
      '/food-management/food-name': { module: 'food', submenu: 'foodname' },
      '/food-management/meal-type': { module: 'food', submenu: 'meal-type' },
      '/food-management/cuisine-type': { module: 'food', submenu: 'cuisine-type' },
      '/food-management/food': { module: 'food', submenu: 'food' },
      '/food-management/ingredient': { module: 'food', submenu: 'ingredient' },
      '/food-management/unit': { module: 'food', submenu: 'unit' },
      '/food-management/recipe': { module: 'food', submenu: 'recipe' },
      '/food-management/food-step': { module: 'food', submenu: 'food-step' },
      '/food-management/proximate': { module: 'food', submenu: 'foodproximate' },
      '/food-management/water-soluble-vitamins': { module: 'food', submenu: 'foodwatersolublevitamins' },
      '/food-management/fat-soluble-vitamins': { module: 'food', submenu: 'foodfatsolublevitamins' },
      '/food-management/carotenoids': { module: 'food', submenu: 'foodcarotenoids' },
      '/food-management/minerals': { module: 'food', submenu: 'foodminerals' },
      '/food-management/sugars': { module: 'food', submenu: 'foodsugars' },
      '/food-management/amino-acids': { module: 'food', submenu: 'foodaminoacids' },
      '/food-management/organic-acids': { module: 'food', submenu: 'foodorganicacids' },
      '/food-management/polyphenols': { module: 'food', submenu: 'foodpolyphenols' },
      '/food-management/phytochemicals': { module: 'food', submenu: 'foodphytochemicals' },
      '/food-management/fatty-acid-profile': { module: 'food', submenu: 'foodfattyacidprofile' },
      
      '/location-management/country': { module: 'location', submenu: 'country' },
      '/location-management/state': { module: 'location', submenu: 'state' },
      '/location-management/city': { module: 'location', submenu: 'city' },

      '/health-monitoring/parameter': { module: 'health', submenu: 'healthparameter' },
      '/health-monitoring/normal-range': { module: 'health', submenu: 'normalrange' },
      '/health-monitoring/diet-plan': { module: 'health', submenu: 'dietplan' },

      '/master/usermanagement': { module: 'auth', submenu: 'usermanagement' },
    };

    // Find a matching path
    const match = Object.entries(pathMapping).find(([key]) => path.endsWith(key));
    return match ? match[1] : null;
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
