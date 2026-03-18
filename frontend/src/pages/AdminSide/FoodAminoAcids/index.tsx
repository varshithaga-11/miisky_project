import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodAminoAcids,
  deleteFoodAminoAcids,
  FoodAminoAcids,
  getFoodAminoAcidsById,
  getFoodAminoAcidsList,
  updateFoodAminoAcids,
} from "./foodaminoacidsapi";

const FoodAminoAcidsManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodAminoAcids>
      title="Food Amino Acids"
      description="Manage amino acid profiles"
      breadcrumb="Food Amino Acids"
      addLabel="Add Amino Acids"
      editLabel="Edit Amino Acids"
      api={{
        getList: getFoodAminoAcidsList,
        getById: getFoodAminoAcidsById,
        create: createFoodAminoAcids,
        update: updateFoodAminoAcids,
        remove: async (id) => {
          await deleteFoodAminoAcids(id);
        },
      }}
      fields={[
        { key: "histidine", label: "Histidine", type: "number" },
        { key: "isoleucine", label: "Isoleucine", type: "number" },
        { key: "leucine", label: "Leucine", type: "number" },
        { key: "lysine", label: "Lysine", type: "number" },
        { key: "methionine", label: "Methionine", type: "number" },
        { key: "cystine", label: "Cystine", type: "number" },
        { key: "phenylalanine", label: "Phenylalanine", type: "number" },
        { key: "threonine", label: "Threonine", type: "number" },
        { key: "tryptophan", label: "Tryptophan", type: "number" },
        { key: "valine", label: "Valine", type: "number" },
      ]}
    />
  );
};

export default FoodAminoAcidsManagementPage;

