import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodPhytochemicals,
  deleteFoodPhytochemicals,
  FoodPhytochemicals,
  getFoodPhytochemicalsById,
  getFoodPhytochemicalsList,
  updateFoodPhytochemicals,
} from "./foodphytochemicalsapi";

const FoodPhytochemicalsManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodPhytochemicals>
      title="Food Phytochemicals"
      description="Manage oligosaccharides, phytosterols, phytates and saponin"
      breadcrumb="Food Phytochemicals"
      addLabel="Add Phytochemicals"
      editLabel="Edit Phytochemicals"
      api={{
        getList: getFoodPhytochemicalsList,
        getById: getFoodPhytochemicalsById,
        create: createFoodPhytochemicals,
        update: updateFoodPhytochemicals,
        remove: async (id) => {
          await deleteFoodPhytochemicals(id);
        },
      }}
      fields={[
        { key: "raffinose", label: "Raffinose", type: "number" },
        { key: "stachyose", label: "Stachyose", type: "number" },
        { key: "verbascose", label: "Verbascose", type: "number" },
        { key: "ajugose", label: "Ajugose", type: "number" },
        { key: "campesterol", label: "Campesterol", type: "number" },
        { key: "stigmasterol", label: "Stigmasterol", type: "number" },
        { key: "beta_sitosterol", label: "Beta Sitosterol", type: "number" },
        { key: "phytate", label: "Phytate", type: "number" },
        { key: "saponin", label: "Saponin", type: "number" },
      ]}
    />
  );
};

export default FoodPhytochemicalsManagementPage;

