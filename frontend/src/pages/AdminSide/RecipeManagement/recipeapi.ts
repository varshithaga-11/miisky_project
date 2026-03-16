import { createFoodIngredient, getFoodIngredientList, deleteFoodIngredient } from "../FoodIngredient/foodingredientapi";
import { createFoodStep, getFoodStepList, deleteFoodStep } from "../FoodStep/foodstepapi";

export interface FullRecipeRow {
    food: number;
    ingredients: {
        ingredient: number;
        quantity: number;
        unit: number;
        notes?: string;
    }[];
    steps: {
        step_number: number;
        instruction: string;
    }[];
}

/**
 * Saves all ingredients and steps for a specific food.
 * This runs multiple API calls in sequence.
 */
export const saveFullRecipe = async (data: FullRecipeRow) => {
    const ingredientPromises = data.ingredients.map(ing => 
        createFoodIngredient({
            food: data.food,
            ingredient: ing.ingredient,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes
        })
    );

    const stepPromises = data.steps.map(step => 
        createFoodStep({
            food: data.food,
            step_number: step.step_number,
            instruction: step.instruction
        })
    );

    // Run all creations
    const results = await Promise.all([...ingredientPromises, ...stepPromises]);
    return results;
};

/**
 * Deletes all ingredients and steps for a specific food.
 */
export const deleteFullRecipe = async (foodId: number) => {
    const ingredients = await getFoodIngredientList(foodId);
    const steps = await getFoodStepList(foodId);

    const deleteIngPromises = ingredients.map(ing => deleteFoodIngredient(ing.id!));
    const deleteStepPromises = steps.map(step => deleteFoodStep(step.id!));

    await Promise.all([...deleteIngPromises, ...deleteStepPromises]);
};

/**
 * Updates a full recipe by clearing old data and saving new data.
 */
export const updateFullRecipe = async (data: FullRecipeRow) => {
    await deleteFullRecipe(data.food);
    return await saveFullRecipe(data);
};
