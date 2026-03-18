import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodFatSolubleVitamins,
  deleteFoodFatSolubleVitamins,
  FoodFatSolubleVitamins,
  getFoodFatSolubleVitaminsById,
  getFoodFatSolubleVitaminsList,
  updateFoodFatSolubleVitamins,
} from "./foodfatsolublevitaminsapi";

const FoodFatSolubleVitaminsManagementPage: React.FC = () => {
  return (
    <>
      <FoodNameBasedCrud<FoodFatSolubleVitamins>
        title="Food Fat Soluble Vitamins"
        description="Manage fat soluble vitamins for food names"
        breadcrumb="Food Fat Soluble Vitamins"
        addLabel="Add Fat Soluble Vitamins"
        editLabel="Edit Fat Soluble Vitamins"
        api={{
          getList: getFoodFatSolubleVitaminsList,
          getById: getFoodFatSolubleVitaminsById,
          create: createFoodFatSolubleVitamins,
          update: updateFoodFatSolubleVitamins,
          remove: async (id) => {
            await deleteFoodFatSolubleVitamins(id);
          },
        }}
        fields={[
          { key: "retinol", label: "Retinol (Vitamin A)", type: "number" },
          { key: "alpha_tocopherol", label: "Alpha Tocopherol", type: "number" },
          { key: "beta_tocopherol", label: "Beta Tocopherol", type: "number" },
          { key: "gamma_tocopherol", label: "Gamma Tocopherol", type: "number" },
          { key: "delta_tocopherol", label: "Delta Tocopherol", type: "number" },
          { key: "alpha_tocotrienol", label: "Alpha Tocotrienol", type: "number" },
          { key: "beta_tocotrienol", label: "Beta Tocotrienol", type: "number" },
          { key: "gamma_tocotrienol", label: "Gamma Tocotrienol", type: "number" },
          { key: "delta_tocotrienol", label: "Delta Tocotrienol", type: "number" },
          { key: "total_vitamin_e", label: "Total Vitamin E", type: "number" },
        ]}
      />
    </>
  );
};

export default FoodFatSolubleVitaminsManagementPage;

