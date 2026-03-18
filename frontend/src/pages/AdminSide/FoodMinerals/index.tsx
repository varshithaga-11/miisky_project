import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodMinerals,
  deleteFoodMinerals,
  FoodMinerals,
  getFoodMineralsById,
  getFoodMineralsList,
  updateFoodMinerals,
} from "./foodmineralsapi";

const FoodMineralsManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodMinerals>
      title="Food Minerals"
      description="Manage mineral profiles"
      breadcrumb="Food Minerals"
      addLabel="Add Minerals"
      editLabel="Edit Minerals"
      api={{
        getList: getFoodMineralsList,
        getById: getFoodMineralsById,
        create: createFoodMinerals,
        update: updateFoodMinerals,
        remove: async (id) => {
          await deleteFoodMinerals(id);
        },
      }}
      fields={[
        { key: "calcium", label: "Calcium", type: "number" },
        { key: "phosphorus", label: "Phosphorus", type: "number" },
        { key: "magnesium", label: "Magnesium", type: "number" },
        { key: "sodium", label: "Sodium", type: "number" },
        { key: "potassium", label: "Potassium", type: "number" },
        { key: "iron", label: "Iron", type: "number" },
        { key: "zinc", label: "Zinc", type: "number" },
        { key: "copper", label: "Copper", type: "number" },
        { key: "manganese", label: "Manganese", type: "number" },
        { key: "selenium", label: "Selenium", type: "number" },
        { key: "chromium", label: "Chromium", type: "number" },
        { key: "molybdenum", label: "Molybdenum", type: "number" },
        { key: "cobalt", label: "Cobalt", type: "number" },
        { key: "aluminium", label: "Aluminium", type: "number" },
        { key: "arsenic", label: "Arsenic", type: "number" },
        { key: "cadmium", label: "Cadmium", type: "number" },
        { key: "mercury", label: "Mercury", type: "number" },
        { key: "lead", label: "Lead", type: "number" },
        { key: "nickel", label: "Nickel", type: "number" },
        { key: "lithium", label: "Lithium", type: "number" },
      ]}
    />
  );
};

export default FoodMineralsManagementPage;

