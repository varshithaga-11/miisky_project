import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodWaterSolubleVitamins,
  deleteFoodWaterSolubleVitamins,
  FoodWaterSolubleVitamins,
  getFoodWaterSolubleVitaminsById,
  getFoodWaterSolubleVitaminsList,
  updateFoodWaterSolubleVitamins,
} from "./foodwatersolublevitaminsapi";

const FoodWaterSolubleVitaminsManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodWaterSolubleVitamins>
      title="Food Water Soluble Vitamins"
      description="Manage water soluble vitamins for food names"
      breadcrumb="Food Water Soluble Vitamins"
      addLabel="Add Water Soluble Vitamins"
      editLabel="Edit Water Soluble Vitamins"
      api={{
        getList: getFoodWaterSolubleVitaminsList,
        getById: getFoodWaterSolubleVitaminsById,
        create: createFoodWaterSolubleVitamins,
        update: updateFoodWaterSolubleVitamins,
        remove: async (id) => {
          await deleteFoodWaterSolubleVitamins(id);
        },
      }}
      fields={[
        { key: "water_soluble_index", label: "Index", type: "number" },
        { key: "thiamine_b1", label: "Thiamine (B1)", type: "number" },
        { key: "riboflavin_b2", label: "Riboflavin (B2)", type: "number" },
        { key: "niacin_b3", label: "Niacin (B3)", type: "number" },
        { key: "pantothenic_acid_b5", label: "Pantothenic Acid (B5)", type: "number" },
        { key: "biotin_b7", label: "Biotin (B7)", type: "number" },
        { key: "folate_b9", label: "Folate (B9)", type: "number" },
        { key: "vitamin_b6", label: "Vitamin B6", type: "number" },
        { key: "vitamin_c", label: "Vitamin C", type: "number" },
      ]}
    />
  );
};

export default FoodWaterSolubleVitaminsManagementPage;

