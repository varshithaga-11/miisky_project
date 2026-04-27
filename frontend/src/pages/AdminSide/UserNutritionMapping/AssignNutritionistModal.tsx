import React, { useState } from "react";
import Button from "../../../components/ui/button/Button";
import SearchableSelect from "../../../components/form/SearchableSelect";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import { createUserNutritionMapping, getAllNutritionists, SimpleUser, UserNutritionMapping } from "./api";

interface Props {
  onClose: () => void;
  onAssign: (mapping: UserNutritionMapping) => void;
  unmappedPatients: SimpleUser[];
}

const AssignNutritionistModal: React.FC<Props> = ({
  onClose,
  onAssign,
  unmappedPatients,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingNuts, setFetchingNuts] = useState(false);
  const [nutritionists, setNutritionists] = useState<SimpleUser[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);
  const [selectedNutritionistId, setSelectedNutritionistId] = useState<number | undefined>(undefined);

  React.useEffect(() => {
    const fetchNuts = async () => {
      setFetchingNuts(true);
      try {
        const data = await getAllNutritionists();
        setNutritionists(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load nutritionists");
      } finally {
        setFetchingNuts(false);
      }
    };
    fetchNuts();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedNutritionistId) {
      toast.error("Please select both patient and nutritionist");
      return;
    }
    setLoading(true);
    try {
      const patientId = Number(selectedPatientId);
      const nutritionistId = Number(selectedNutritionistId);
      const created = await createUserNutritionMapping(patientId, nutritionistId);
      toast.success("Nutritionist assigned successfully");
      setTimeout(() => onAssign(created), 1000);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data || err.message || "Failed to assign";
      toast.error(typeof msg === "string" ? msg : "Failed to assign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative shadow-xl">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl">
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Assign Nutritionist</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Patient (unmapped)</Label>
            <SearchableSelect
              value={selectedPatientId}
              onChange={(val) => setSelectedPatientId(val as number)}
              options={unmappedPatients.map((p) => {
                const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim();
                return {
                  value: p.id,
                  label: fullName || p.username,
                };
              })}
              placeholder="Select Patient"
              className="w-full"
            />
          </div>
          <div>
            <Label>Nutritionist</Label>
            <SearchableSelect
              value={selectedNutritionistId}
              onChange={(val) => setSelectedNutritionistId(val as number)}
              options={nutritionists.map((n) => {
                const fullName = `${n.first_name || ""} ${n.last_name || ""}`.trim();
                return {
                  value: n.id,
                  label: fullName || n.username,
                };
              })}
              placeholder={fetchingNuts ? "Loading nutritionists..." : "Select Nutritionist"}
              className="w-full"
              disabled={fetchingNuts}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AssignNutritionistModal;
