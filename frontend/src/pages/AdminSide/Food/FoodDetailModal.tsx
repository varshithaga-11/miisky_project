import React from "react";
import { FiX, FiLayers } from "react-icons/fi";
import { Food } from "./foodapi";

interface FoodDetailModalProps {
  food: Food;
  onClose: () => void;
}

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-transparent dark:border-white/[0.05]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-6">
            {food.image ? (
              <img 
                src={food.image} 
                className="w-20 h-20 rounded-[28px] object-cover shadow-lg border-2 border-white dark:border-gray-700" 
                alt={food.name} 
              />
            ) : (
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[28px] flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
                <FiLayers size={32} />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{food.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {food.meal_type_names?.map((m, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {m}
                  </span>
                ))}
                {food.cuisine_type_names?.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm text-gray-400 hover:text-red-500 transition-all border border-gray-100 dark:border-transparent"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          
          {/* Description */}
          {food.description && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-8 h-[2px] bg-indigo-500"></div> Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed bg-gray-50/50 dark:bg-white/[0.01] p-6 rounded-[32px] border border-gray-100 dark:border-white/[0.03]">
                {food.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Ingredients */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-8 h-[2px] bg-emerald-500"></div> Ingredients
              </h3>
              <div className="space-y-3">
                {food.ingredients && food.ingredients.length > 0 ? (
                  food.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="font-bold text-gray-700 dark:text-gray-200">{ing.ingredient_name}</span>
                      </div>
                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-black text-emerald-600 dark:text-emerald-400 shadow-sm">
                        {ing.quantity} {ing.unit_name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic px-4">No ingredients listed.</p>
                )}
              </div>
            </div>

            {/* Preparation Steps */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-8 h-[2px] bg-amber-500"></div> Preparation Steps
              </h3>
              <div className="space-y-4">
                {food.steps && food.steps.length > 0 ? (
                  food.steps.sort((a,b) => a.step_number - b.step_number).map((step, i) => (
                    <div key={i} className="relative pl-10 border-l-2 border-amber-100 dark:border-amber-900/30 space-y-1">
                      <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-amber-500 border-4 border-white dark:border-gray-800 ring-2 ring-amber-100 dark:ring-amber-900/20 shadow-sm"></div>
                      <span className="text-[10px] font-black text-amber-500 uppercase">Step {step.step_number}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{step.instruction}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic px-4">No steps provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-8 h-[2px] bg-red-500"></div> Nutrition Facts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {food.nutrition ? (
                Object.entries(food.nutrition).map(([key, value]) => {
                  if (['id', 'food', 'serving_size'].includes(key) || value === null || value === undefined) return null;
                  
                  let unit = 'g';
                  if (['calories', 'glycemic_index'].includes(key)) unit = '';
                  else if (['sodium', 'potassium', 'calcium', 'iron', 'cholesterol', 'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b5', 'vitamin_b6', 'vitamin_c', 'vitamin_e'].includes(key)) unit = 'mg';
                  else if (['vitamin_a', 'vitamin_b7', 'vitamin_b9', 'vitamin_b12', 'vitamin_d', 'vitamin_k'].includes(key)) unit = 'µg';

                  const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                  return (
                    <div key={key} className="p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-[24px] border border-gray-100 dark:border-white/[0.05] transition-all hover:border-red-500/30">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
                        {value} <span className="text-xs text-gray-400 font-bold ml-1">{unit}</span>
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-white/[0.01] rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-gray-400 italic">No nutrition data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05] flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 dark:shadow-none hover:scale-105 transition-all"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
