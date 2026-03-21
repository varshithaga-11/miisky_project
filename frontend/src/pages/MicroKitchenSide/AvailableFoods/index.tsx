import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getMyKitchenFoods, updateKitchenFood, createKitchenFood, MicroKitchenFoodItem } from "./api";
import { getFoodList } from "../../AdminSide/Food/foodapi";
import type { Food } from "../../AdminSide/Food/foodapi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiLayers, FiEdit2, FiCheck, FiX, FiPlus, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createApiUrl } from "../../../access/access";

const AvailableFoodsPage: React.FC = () => {
  const [items, setItems] = useState<MicroKitchenFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [foodCatalog, setFoodCatalog] = useState<Food[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [addPrice, setAddPrice] = useState("");
  const [addAvailable, setAddAvailable] = useState(true);
  const [addSubmitting, setAddSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getMyKitchenFoods();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load foods");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const startEdit = (item: MicroKitchenFoodItem) => {
    setEditingId(item.id);
    setEditPrice(String(item.price ?? ""));
    setEditAvailable(item.is_available);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      await updateKitchenFood(editingId, {
        is_available: editAvailable,
        price,
      });
      toast.success("Saved — changes apply only to your kitchen menu");
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    }
  };

  const toggleAvailable = async (item: MicroKitchenFoodItem) => {
    try {
      await updateKitchenFood(item.id, {
        is_available: !item.is_available,
      });
      toast.success(item.is_available ? "Marked unavailable" : "Marked available");
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    }
  };

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return createApiUrl(path.startsWith("/") ? path.slice(1) : path);
  };

  const openAddModal = async () => {
    setAddModalOpen(true);
    setSelectedFood(null);
    setAddPrice("");
    setAddAvailable(true);
    setAddSearch("");
    setCatalogLoading(true);
    try {
      const res = await getFoodList(1, "all", "", "", "");
      setFoodCatalog(res.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load food catalog");
      setFoodCatalog([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  const addedFoodIds = new Set(items.map((i) => i.food));
  const availableToAdd = foodCatalog.filter((f) => !addedFoodIds.has(f.id!));
  const filteredToAdd = addSearch
    ? availableToAdd.filter((f) => f.name?.toLowerCase().includes(addSearch.toLowerCase()))
    : availableToAdd;

  const submitAdd = async () => {
    if (!selectedFood?.id) {
      toast.error("Please select a food");
      return;
    }
    const price = parseFloat(addPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    setAddSubmitting(true);
    try {
      await createKitchenFood({
        food: selectedFood.id,
        price,
        is_available: addAvailable,
      });
      toast.success("Food added to your menu");
      setAddModalOpen(false);
      fetchItems();
    } catch (err: any) {
      const msg = err?.response?.data?.micro_kitchen || err?.response?.data?.food || err?.response?.data?.detail || "Failed to add";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <PageMeta title="Available Foods" description="Manage your kitchen menu availability and pricing" />
      <PageBreadcrumb pageTitle="Available Foods" />
      <ToastContainer position="bottom-right" />

      <div className="px-4 md:px-8 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Available Foods
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">
              Add foods to your menu, set price and availability. Micro kitchen manages this — not admin.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg"
          >
            <FiPlus size={18} /> Add Food
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-[50px] p-20 flex flex-col items-center justify-center text-center border shadow-sm border-gray-100 dark:border-white/5">
            <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8">
              <FiLayers size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              No Foods Yet
            </h3>
            <p className="text-gray-400 mt-2 font-medium">
              Add foods from the catalog. Set your price and whether it’s available.
            </p>
            <button
              onClick={openAddModal}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase"
            >
              <FiPlus size={18} /> Add Food
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Food</th>
                    <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Price (₹)</th>
                    <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Available</th>
                    <th className="text-right py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`border-b border-gray-100 dark:border-white/5 last:border-0 ${!item.is_available ? "opacity-60" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                            {item.food_details?.image ? (
                              <img src={getImageUrl(item.food_details.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiLayers className="text-gray-400" size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.food_details?.name || `Food #${item.food}`}</p>
                            {item.food_details?.meal_type_names?.length ? (
                              <p className="text-xs text-gray-500">{item.food_details.meal_type_names.join(", ")}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-28 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-sm"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{item.price}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editAvailable}
                              onChange={(e) => setEditAvailable(e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm font-bold">{editAvailable ? "Available" : "Unavailable"}</span>
                          </label>
                        ) : (
                          <button
                            onClick={() => toggleAvailable(item)}
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${item.is_available ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}
                          >
                            {item.is_available ? "Available" : "Unavailable"}
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={saveEdit} className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                              <FiCheck size={18} />
                            </button>
                            <button onClick={cancelEdit} className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <FiX size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-xs font-black uppercase tracking-wider"
                          >
                            <FiEdit2 size={14} /> Edit Details
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Food Modal */}
        <AnimatePresence>
          {addModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => !addSubmitting && setAddModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 dark:border-white/5">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Add Food to Your Menu
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Select a food, set your price and availability.
                  </p>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Search food</label>
                    <div className="relative mt-1">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search food catalog..."
                        value={addSearch}
                        onChange={(e) => setAddSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Select food</label>
                    <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
                      {catalogLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                      ) : filteredToAdd.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          {availableToAdd.length === 0 ? "All foods already added." : "No matching foods."}
                        </div>
                      ) : (
                        filteredToAdd.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSelectedFood(f)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                              selectedFood?.id === f.id
                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <span className="font-bold text-gray-900 dark:text-white">{f.name}</span>
                            {f.meal_type_names?.length ? (
                              <span className="text-xs text-gray-500">({f.meal_type_names.join(", ")})</span>
                            ) : null}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  {selectedFood && (
                    <>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Your price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={addPrice}
                          onChange={(e) => setAddPrice(e.target.value)}
                          className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addAvailable}
                          onChange={(e) => setAddAvailable(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Available</span>
                      </label>
                    </>
                  )}
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                  <button
                    onClick={() => !addSubmitting && setAddModalOpen(false)}
                    disabled={addSubmitting}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAdd}
                    disabled={addSubmitting || !selectedFood}
                    className="flex-1 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase disabled:opacity-50"
                  >
                    {addSubmitting ? "Adding..." : "Add to Menu"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AvailableFoodsPage;
