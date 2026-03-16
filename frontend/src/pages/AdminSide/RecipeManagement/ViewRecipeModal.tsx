import React, { useState, useEffect } from "react";
import { getFoodIngredientList, FoodIngredient } from "../FoodIngredient/foodingredientapi";
import { getFoodStepList, FoodStep } from "../FoodStep/foodstepapi";
import { Food } from "../Food/foodapi";
import { FiX, FiList, FiInfo } from "react-icons/fi";

interface ViewRecipeModalProps {
    food: Food;
    isOpen: boolean;
    onClose: () => void;
}

const ViewRecipeModal: React.FC<ViewRecipeModalProps> = ({ food, isOpen, onClose }) => {
    const [ingredients, setIngredients] = useState<FoodIngredient[]>([]);
    const [steps, setSteps] = useState<FoodStep[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && food.id) {
            setLoading(true);
            Promise.all([
                getFoodIngredientList(food.id),
                getFoodStepList(food.id)
            ]).then(([ingList, stepList]) => {
                setIngredients(ingList);
                setSteps(stepList.sort((a, b) => a.step_number - b.step_number));
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [isOpen, food]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-gray-100 dark:border-gray-800">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <FiX size={28} />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-6 mb-10 pb-6 border-b dark:border-gray-800">
                        {food.image && (
                            <img 
                                src={food.image as string} 
                                alt={food.name} 
                                className="w-24 h-24 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-gray-800" 
                            />
                        )}
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{food.name}</h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">Recipe Details</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                             <p className="text-gray-500 font-medium">Loading recipe details...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Ingredients List */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FiList /></div>
                                    Ingredients
                                </h3>
                                {ingredients.length === 0 ? (
                                    <p className="text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">No ingredients listed for this food item.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {ingredients.map((ing, idx) => (
                                            <li key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">{ing.ingredient_name}</span>
                                                    {ing.notes && <span className="text-xs text-gray-500 italic">{ing.notes}</span>}
                                                </div>
                                                <div className="flex items-center gap-1 font-mono text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                                                    <span className="font-bold">{ing.quantity}</span>
                                                    <span>{ing.unit_name}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            {/* Preparation Steps */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FiInfo /></div>
                                    Steps
                                </h3>
                                {steps.length === 0 ? (
                                    <p className="text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">No preparation steps listed yet.</p>
                                ) : (
                                    <div className="space-y-6 relative">
                                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                                        {steps.map((step, idx) => (
                                            <div key={idx} className="flex gap-4 relative z-10">
                                                <div className="w-12 h-12 flex-shrink-0 bg-white dark:bg-gray-900 border-2 border-orange-400 rounded-full flex items-center justify-center font-bold text-orange-600 shadow-sm">
                                                    {step.step_number}
                                                </div>
                                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step.instruction}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewRecipeModal;
