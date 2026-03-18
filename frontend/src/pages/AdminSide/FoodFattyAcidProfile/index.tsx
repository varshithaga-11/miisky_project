import FoodNameBasedCrud from "../_shared/FoodNameBasedCrud";
import {
  createFoodFattyAcidProfile,
  deleteFoodFattyAcidProfile,
  FoodFattyAcidProfile,
  getFoodFattyAcidProfileById,
  getFoodFattyAcidProfileList,
  updateFoodFattyAcidProfile,
} from "./foodfattyacidprofileapi";

const FoodFattyAcidProfileManagementPage: React.FC = () => {
  return (
    <FoodNameBasedCrud<FoodFattyAcidProfile>
      title="Food Fatty Acid Profile"
      description="Manage fatty acid profiles"
      breadcrumb="Food Fatty Acid Profile"
      addLabel="Add Fatty Acid Profile"
      editLabel="Edit Fatty Acid Profile"
      api={{
        getList: getFoodFattyAcidProfileList,
        getById: getFoodFattyAcidProfileById,
        create: createFoodFattyAcidProfile,
        update: updateFoodFattyAcidProfile,
        remove: async (id) => {
          await deleteFoodFattyAcidProfile(id);
        },
      }}
      fields={[
        { key: "butyric", label: "Butyric", type: "number" },
        { key: "caproic", label: "Caproic", type: "number" },
        { key: "caprylic", label: "Caprylic", type: "number" },
        { key: "capric", label: "Capric", type: "number" },
        { key: "lauric", label: "Lauric", type: "number" },
        { key: "myristic", label: "Myristic", type: "number" },
        { key: "palmitic", label: "Palmitic", type: "number" },
        { key: "stearic", label: "Stearic", type: "number" },
        { key: "arachidic", label: "Arachidic", type: "number" },
        { key: "behenic", label: "Behenic", type: "number" },
        { key: "lignoceric", label: "Lignoceric", type: "number" },
        { key: "myristoleic", label: "Myristoleic", type: "number" },
        { key: "palmitoleic", label: "Palmitoleic", type: "number" },
        { key: "oleic", label: "Oleic", type: "number" },
        { key: "elaidic", label: "Elaidic", type: "number" },
        { key: "eicosenoic", label: "Eicosenoic", type: "number" },
        { key: "erucic", label: "Erucic", type: "number" },
        { key: "linoleic", label: "Linoleic", type: "number" },
        { key: "alpha_linolenic", label: "Alpha Linolenic", type: "number" },
        { key: "total_sfa", label: "Total SFA", type: "number" },
        { key: "total_mufa", label: "Total MUFA", type: "number" },
        { key: "total_pufa", label: "Total PUFA", type: "number" },
      ]}
    />
  );
};

export default FoodFattyAcidProfileManagementPage;

