import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodPolyphenols,
  deleteFoodPolyphenols,
  FoodPolyphenols,
  getFoodPolyphenolsById,
  getFoodPolyphenolsList,
  updateFoodPolyphenols,
} from "./foodpolyphenolsapi";

const FoodPolyphenolsManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodPolyphenols>
      title="Food Polyphenols"
      description="Manage polyphenol profiles"
      breadcrumb="Food Polyphenols"
      addLabel="Add Polyphenols"
      editLabel="Edit Polyphenols"
      api={{
        getList: getFoodPolyphenolsList,
        getById: getFoodPolyphenolsById,
        create: createFoodPolyphenols,
        update: updateFoodPolyphenols,
        remove: async (id) => {
          await deleteFoodPolyphenols(id);
        },
      }}
      fields={[
        { key: "benzoic_acid", label: "Benzoic Acid", type: "number" },
        { key: "benzaldehyde", label: "Benzaldehyde", type: "number" },
        { key: "protocatechuic_acid", label: "Protocatechuic Acid", type: "number" },
        { key: "vanillic_acid", label: "Vanillic Acid", type: "number" },
        { key: "gallic_acid", label: "Gallic Acid", type: "number" },
        { key: "cinnamic_acid", label: "Cinnamic Acid", type: "number" },
        { key: "o_coumaric_acid", label: "O-Coumaric Acid", type: "number" },
        { key: "p_coumaric_acid", label: "P-Coumaric Acid", type: "number" },
        { key: "caffeic_acid", label: "Caffeic Acid", type: "number" },
      ]}
    />
  );
};

export default FoodPolyphenolsManagementPage;

