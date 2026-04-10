import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { toast, ToastContainer } from "react-toastify";
import { FiLoader, FiTrash2, FiTruck, FiEdit2 } from "react-icons/fi";
import Button from "../../../components/ui/button/Button";
import InputField from "../../../components/form/input/InputField";
import {
  listMyDeliverySlabs,
  createDeliverySlab,
  updateDeliverySlab,
  deleteDeliverySlab,
  DeliveryChargeSlab,
} from "./api";

const DeliveryChargesPage: React.FC = () => {
  const [slabs, setSlabs] = useState<DeliveryChargeSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ min_km: "", max_km: "", charge: "" });

  const load = async () => {
    setLoading(true);
    try {
      const data = await listMyDeliverySlabs();
      setSlabs(data.sort((a, b) => Number(a.min_km) - Number(b.min_km)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load delivery slabs");
      setSlabs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ min_km: "", max_km: "", charge: "" });
    setEditingId(null);
  };

  const startEdit = (s: DeliveryChargeSlab) => {
    setEditingId(s.id);
    setForm({
      min_km: String(s.min_km),
      max_km: String(s.max_km),
      charge: String(s.charge),
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minKm = parseFloat(form.min_km);
    const maxKm = parseFloat(form.max_km);
    const charge = parseFloat(form.charge);
    if (!Number.isFinite(minKm) || !Number.isFinite(maxKm) || !Number.isFinite(charge)) {
      toast.error("Enter valid numbers for min km, max km, and charge");
      return;
    }
    if (minKm > maxKm) {
      toast.error("Min km must be ≤ max km");
      return;
    }
    setSaving(true);
    try {
      if (editingId != null) {
        await updateDeliverySlab(editingId, { min_km: minKm, max_km: maxKm, charge });
        toast.success("Slab updated");
      } else {
        await createDeliverySlab({ min_km: minKm, max_km: maxKm, charge });
        toast.success("Slab added");
      }
      resetForm();
      await load();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Could not save slab");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this distance slab?")) return;
    try {
      await deleteDeliverySlab(id);
      toast.success("Distance slab removed successfully");
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Could not delete distance slab");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Delivery charges" description="Distance-based delivery fees for your kitchen" />
      <PageBreadcrumb pageTitle="Delivery charges" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="px-4 md:px-8 pb-24 max-w-4xl">
        <div className="mb-8 flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <FiTruck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Delivery slabs</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              Set charge by straight-line distance (km) from your kitchen to the customer. Customer and kitchen accounts need
              latitude/longitude saved for distance to apply at checkout.
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="mb-10 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/50 p-6 shadow-sm space-y-4"
        >
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {editingId != null ? "Edit slab" : "Add slab"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Min km</label>
              <InputField
                type="number"
                step="0.01"
                placeholder="0"
                value={form.min_km}
                onChange={(e) => setForm((f) => ({ ...f, min_km: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Max km</label>
              <InputField
                type="number"
                step="0.01"
                placeholder="5"
                value={form.max_km}
                onChange={(e) => setForm((f) => ({ ...f, max_km: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Charge (₹)</label>
              <InputField
                type="number"
                step="0.01"
                placeholder="50"
                value={form.charge}
                onChange={(e) => setForm((f) => ({ ...f, charge: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? <FiLoader className="animate-spin inline" /> : editingId != null ? "Update" : "Add slab"}
            </Button>
            {editingId != null && (
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 font-black text-sm text-gray-900 dark:text-white">
            Your slabs
          </div>
          {loading ? (
            <div className="py-16 flex justify-center text-gray-400">
              <FiLoader className="animate-spin" size={32} />
            </div>
          ) : slabs.length === 0 ? (
            <p className="py-12 text-center text-gray-500 text-sm">No slabs yet. Add ranges that cover expected delivery distances.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/10">
              {slabs.map((s) => (
                <li key={s.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {s.min_km} – {s.max_km} km
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-black">₹{Number(s.charge).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryChargesPage;
