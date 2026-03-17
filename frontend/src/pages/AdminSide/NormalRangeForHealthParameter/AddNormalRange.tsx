import React, { useState, useEffect } from "react";
import { createNormalRange, NormalRange } from "./normalrangeapi";
import { getHealthParameterList, HealthParameter } from "../HealthParameter/healthparameterapi";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast } from 'react-toastify';

interface AddNormalRangeProps {
  onClose: () => void;
  onAdd: (newRange: NormalRange) => void;
}

const AddNormalRange: React.FC<AddNormalRangeProps> = ({ onClose, onAdd }) => {
  const [hpList, setHpList] = useState<HealthParameter[]>([]);
  const [formData, setFormData] = useState<Partial<NormalRange>>({
    health_parameter: 0,
    raw_value: "",
    min_value: undefined,
    max_value: undefined,
    unit: "",
    reference_text: "",
    qualitative_value: "",
    interpretation_flag: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getHealthParameterList(1, "all").then((data) => setHpList(data.results));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === 'min_value' || id === 'max_value' ? (value === "" ? undefined : parseFloat(value)) : 
             id === 'health_parameter' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.health_parameter) {
        toast.warning("Please select a health parameter");
        return;
    }
    setLoading(true);
    try {
      const resp = await createNormalRange(formData);
      toast.success("Normal range added successfully!");
      onAdd(resp);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to add range");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2">
          Add Normal Range
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <Label htmlFor="health_parameter">Select Health Parameter*</Label>
            <select
                id="health_parameter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.health_parameter}
                onChange={handleChange}
                required
            >
                <option value="0">-- Select --</option>
                {hpList.map(hp => (
                    <option key={hp.id} value={hp.id}>{hp.name}</option>
                ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="raw_value">Raw Value / Description</Label>
            <Input id="raw_value" type="text" value={formData.raw_value || ""} onChange={handleChange} placeholder="e.g. 4.3 - 5.6 mg/dL" />
          </div>

          <div>
            <Label htmlFor="min_value">Min Numeric Value</Label>
            <Input id="min_value" type="number" step="any" value={formData.min_value ?? ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="max_value">Max Numeric Value</Label>
            <Input id="max_value" type="number" step="any" value={formData.max_value ?? ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" type="text" value={formData.unit || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="interpretation_flag">Flag (H/L/*)</Label>
            <Input id="interpretation_flag" type="text" value={formData.interpretation_flag || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="qualitative_value">Qualitative Value</Label>
            <Input id="qualitative_value" type="text" value={formData.qualitative_value || ""} onChange={handleChange} placeholder="e.g. Negative, Normal" />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <textarea
              id="remarks"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.remarks || ""}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Range"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNormalRange;
