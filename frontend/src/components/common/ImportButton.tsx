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
      '/master/food-group': { module: 'food', submenu: 'foodgroup' },
      '/master/food-name': { module: 'food', submenu: 'foodname' },
      '/master/meal-type': { module: 'food', submenu: 'meal-type' },
      '/master/cuisine-type': { module: 'food', submenu: 'cuisine-type' },
      '/master/food': { module: 'food', submenu: 'food' },
      '/master/ingredient': { module: 'food', submenu: 'ingredient' },
      '/master/unit': { module: 'food', submenu: 'unit' },
      '/master/recipe-creator': { module: 'food', submenu: 'recipe' },
      '/master/food-step': { module: 'food', submenu: 'food-step' },
      '/master/food-proximate': { module: 'food', submenu: 'foodproximate' },
      '/master/food-water-soluble-vitamins': { module: 'food', submenu: 'foodwatersolublevitamins' },
      '/master/food-fat-soluble-vitamins': { module: 'food', submenu: 'foodfatsolublevitamins' },
      '/master/food-carotenoids': { module: 'food', submenu: 'foodcarotenoids' },
      '/master/food-minerals': { module: 'food', submenu: 'foodminerals' },
      '/master/food-sugars': { module: 'food', submenu: 'foodsugars' },
      '/master/food-amino-acids': { module: 'food', submenu: 'foodaminoacids' },
      '/master/food-organic-acids': { module: 'food', submenu: 'foodorganicacids' },
      '/master/food-polyphenols': { module: 'food', submenu: 'foodpolyphenols' },
      '/master/food-phytochemicals': { module: 'food', submenu: 'foodphytochemicals' },
      '/master/food-fatty-acid-profile': { module: 'food', submenu: 'foodfattyacidprofile' },
      
      '/master/country': { module: 'location', submenu: 'country' },
      '/master/state': { module: 'location', submenu: 'state' },
      '/master/city': { module: 'location', submenu: 'city' },

      '/master/health-parameter': { module: 'health', submenu: 'healthparameter' },
      '/master/normal-range': { module: 'health', submenu: 'normalrange' },
      '/master/diet-plan': { module: 'health', submenu: 'dietplan' },

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
