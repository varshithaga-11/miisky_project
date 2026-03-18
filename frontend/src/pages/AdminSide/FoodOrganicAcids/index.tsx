import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodOrganicAcids,
  deleteFoodOrganicAcids,
  FoodOrganicAcids,
  getFoodOrganicAcidsById,
  getFoodOrganicAcidsList,
  updateFoodOrganicAcids,
} from "./foodorganicacidsapi";

const FoodOrganicAcidsManagementPage: React.FC = () => {
  return (
    <>
      <FoodNameBasedCrud<FoodOrganicAcids>
        title="Food Organic Acids"
        description="Manage organic acid profiles"
        breadcrumb="Food Organic Acids"
        addLabel="Add Organic Acids"
        editLabel="Edit Organic Acids"
        api={{
          getList: getFoodOrganicAcidsList,
          getById: getFoodOrganicAcidsById,
          create: createFoodOrganicAcids,
          update: updateFoodOrganicAcids,
          remove: async (id) => {
            await deleteFoodOrganicAcids(id);
          },
        }}
        fields={[
          { key: "oxalate_total", label: "Oxalate Total", type: "number" },
          { key: "oxalate_soluble", label: "Oxalate Soluble", type: "number" },
          { key: "oxalate_insoluble", label: "Oxalate Insoluble", type: "number" },
          { key: "citric_acid", label: "Citric Acid", type: "number" },
          { key: "fumaric_acid", label: "Fumaric Acid", type: "number" },
          { key: "malic_acid", label: "Malic Acid", type: "number" },
          { key: "quinic_acid", label: "Quinic Acid", type: "number" },
          { key: "succinic_acid", label: "Succinic Acid", type: "number" },
          { key: "tartaric_acid", label: "Tartaric Acid", type: "number" },
        ]}
      />
    </>
  );
};

export default FoodOrganicAcidsManagementPage;

