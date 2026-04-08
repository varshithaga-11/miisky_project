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
      '/admin/food-group': { module: 'food', submenu: 'foodgroup' },
      '/admin/food-name': { module: 'food', submenu: 'foodname' },
      '/admin/meal-type': { module: 'food', submenu: 'meal-type' },
      '/admin/cuisine-type': { module: 'food', submenu: 'cuisine-type' },
      '/admin/food': { module: 'food', submenu: 'food' },
      '/admin/ingredient': { module: 'food', submenu: 'ingredient' },
      '/admin/unit': { module: 'food', submenu: 'unit' },
      '/admin/recipe-creator': { module: 'food', submenu: 'recipe' },
      '/admin/food-step': { module: 'food', submenu: 'food-step' },
      '/admin/food-proximate': { module: 'food', submenu: 'foodproximate' },
      '/admin/food-water-soluble-vitamins': { module: 'food', submenu: 'foodwatersolublevitamins' },
      '/admin/food-fat-soluble-vitamins': { module: 'food', submenu: 'foodfatsolublevitamins' },
      '/admin/food-carotenoids': { module: 'food', submenu: 'foodcarotenoids' },
      '/admin/food-minerals': { module: 'food', submenu: 'foodminerals' },
      '/admin/food-sugars': { module: 'food', submenu: 'foodsugars' },
      '/admin/food-amino-acids': { module: 'food', submenu: 'foodaminoacids' },
      '/admin/food-organic-acids': { module: 'food', submenu: 'foodorganicacids' },
      '/admin/food-polyphenols': { module: 'food', submenu: 'foodpolyphenols' },
      '/admin/food-phytochemicals': { module: 'food', submenu: 'foodphytochemicals' },
      '/admin/food-fatty-acid-profile': { module: 'food', submenu: 'foodfattyacidprofile' },

      '/admin/country': { module: 'location', submenu: 'country' },
      '/admin/state': { module: 'location', submenu: 'state' },
      '/admin/city': { module: 'location', submenu: 'city' },

      '/admin/health-parameter': { module: 'health', submenu: 'healthparameter' },
      '/admin/normal-range': { module: 'health', submenu: 'normalrange' },
      '/admin/diet-plan': { module: 'health', submenu: 'dietplan' },

      '/admin/usermanagement': { module: 'auth', submenu: 'usermanagement' },
      '/admin/health-condition-master': { module: 'questionnaire', submenu: 'health-condition' },
      '/admin/symptom-master': { module: 'questionnaire', submenu: 'symptom' },
      '/admin/autoimmune-master': { module: 'questionnaire', submenu: 'autoimmune' },
      '/admin/deficiency-master': { module: 'questionnaire', submenu: 'deficiency' },
      '/admin/digestive-issue-master': { module: 'questionnaire', submenu: 'digestive-issue' },
      '/admin/skin-issue-master': { module: 'questionnaire', submenu: 'skin-issue' },
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
