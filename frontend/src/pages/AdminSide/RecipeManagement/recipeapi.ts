import { createFoodIngredient } from "../FoodIngredient/foodingredientapi";
import { createFoodStep } from "../FoodStep/foodstepapi";

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
