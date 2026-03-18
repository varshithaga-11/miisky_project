import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodCarotenoids,
  deleteFoodCarotenoids,
  FoodCarotenoids,
  getFoodCarotenoidsById,
  getFoodCarotenoidsList,
  updateFoodCarotenoids,
} from "./foodcarotenoidsapi";

const FoodCarotenoidsManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodCarotenoids>
      title="Food Carotenoids"
      description="Manage carotenoid profiles"
      breadcrumb="Food Carotenoids"
      addLabel="Add Carotenoids"
      editLabel="Edit Carotenoids"
      api={{
        getList: getFoodCarotenoidsList,
        getById: getFoodCarotenoidsById,
        create: createFoodCarotenoids,
        update: updateFoodCarotenoids,
        remove: async (id) => {
          await deleteFoodCarotenoids(id);
        },
      }}
      fields={[
        { key: "lutein", label: "Lutein", type: "number" },
        { key: "zeaxanthin", label: "Zeaxanthin", type: "number" },
        { key: "lycopene", label: "Lycopene", type: "number" },
        { key: "beta_cryptoxanthin", label: "Beta Cryptoxanthin", type: "number" },
        { key: "beta_carotene", label: "Beta Carotene", type: "number" },
        { key: "total_carotenoids", label: "Total Carotenoids", type: "number" },
        { key: "retinol_activity_equivalent", label: "Retinol Activity Eq.", type: "number" },
        { key: "carotenoid_activity", label: "Carotenoid Activity", type: "number" },
      ]}
    />
  );
};

export default FoodCarotenoidsManagementPage;

