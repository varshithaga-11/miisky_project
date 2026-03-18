import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import { createFoodSugars, deleteFoodSugars, FoodSugars, getFoodSugarsById, getFoodSugarsList, updateFoodSugars } from "./foodsugarsapi";

const FoodSugarsManagementPage: React.FC = () => {
  return (
    <>
      <FoodNameBasedCrud<FoodSugars>
        title="Food Sugars"
        description="Manage starch and individual sugars"
        breadcrumb="Food Sugars"
        addLabel="Add Sugars"
        editLabel="Edit Sugars"
        api={{
          getList: getFoodSugarsList,
          getById: getFoodSugarsById,
          create: createFoodSugars,
          update: updateFoodSugars,
          remove: async (id) => {
            await deleteFoodSugars(id);
          },
        }}
        fields={[
          { key: "total_carbohydrates", label: "Total Carbohydrates", type: "number" },
          { key: "starch", label: "Starch", type: "number" },
          { key: "fructose", label: "Fructose", type: "number" },
          { key: "glucose", label: "Glucose", type: "number" },
          { key: "sucrose", label: "Sucrose", type: "number" },
          { key: "maltose", label: "Maltose", type: "number" },
          { key: "total_sugars", label: "Total Sugars", type: "number" },
        ]}
      />
    </>
  );
};

export default FoodSugarsManagementPage;

