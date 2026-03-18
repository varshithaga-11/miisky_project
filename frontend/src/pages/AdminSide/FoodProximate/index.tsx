import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodProximate,
  deleteFoodProximate,
  FoodProximate,
  getFoodProximateById,
  getFoodProximateList,
  updateFoodProximate,
} from "./foodproximateapi";

const FoodProximateManagementPage: React.FC = () => {
  return (
    <>
      <FoodNameBasedCrud<FoodProximate>
        title="Food Proximate Management"
        description="Manage proximate composition records"
        breadcrumb="Food Proximate Management"
        addLabel="Add Proximate"
        editLabel="Edit Proximate"
        api={{
          getList: getFoodProximateList,
          getById: getFoodProximateById,
          create: createFoodProximate,
          update: updateFoodProximate,
          remove: async (id) => {
            await deleteFoodProximate(id);
          },
        }}
        fields={[
          { key: "proximate", label: "Proximate", type: "number" },
          { key: "water", label: "Water", type: "number" },
          { key: "protein", label: "Protein", type: "number" },
          { key: "fat", label: "Fat", type: "number" },
          { key: "ash", label: "Ash", type: "number" },
          { key: "fat_crude_extract", label: "Fat Crude Extract", type: "number" },
          { key: "fiber_total", label: "Fiber Total", type: "number" },
          { key: "fiber_insoluble", label: "Fiber Insoluble", type: "number" },
          { key: "fiber_soluble", label: "Fiber Soluble", type: "number" },
          { key: "carbohydrates", label: "Carbohydrates", type: "number" },
          { key: "energy", label: "Energy", type: "number" },
        ]}
      />
    </>
  );
};

export default FoodProximateManagementPage;

