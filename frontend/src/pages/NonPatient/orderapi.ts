import { createApiUrl, getAuthHeaders } from "../../access/access";
import axios from "axios";

export interface CartItem {
  id: number;
  cart: number;
  food: number;
  food_details?: {
    id: number;
    name: string;
    image: string | null;
    price: number | null;
  };
  quantity: number;
}

export interface Cart {
  id: number;
  user: number;
  micro_kitchen: number;
  kitchen_details?: {
    id: number;
    brand_name: string;
  };
  items: CartItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  order: number;
  food: number;
  food_details?: {
    id: number;
    name: string;
    image: string | null;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user: number;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
  };
  micro_kitchen: number;
  kitchen_details?: {
    id: number;
    brand_name: string;
  };
  order_type: 'patient' | 'non_patient';
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  items: OrderItem[];
  created_at: string;
}

// Cart APIs
export const getMyCarts = async (): Promise<Cart[]> => {
  const url = createApiUrl("api/cart/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const addToCart = async (kitchenId: number, foodId: number, quantity: number = 1) => {
  const url = createApiUrl("api/cart/add-item/");
  const response = await axios.post(url, {
    kitchen_id: kitchenId,
    food_id: foodId,
    quantity: quantity
  }, { headers: await getAuthHeaders() });
  return response.data;
};

export const deleteCartItem = async (itemId: number) => {
  const url = createApiUrl(`api/cart-item/${itemId}/`);
  const response = await axios.delete(url, { headers: await getAuthHeaders() });
  return response.data;
};

// Order APIs
export const placeOrder = async (cartId: number, deliveryAddress?: string) => {
  const url = createApiUrl("api/order/place-order/");
  const response = await axios.post(url, {
    cart_id: cartId,
    delivery_address: deliveryAddress
  }, { headers: await getAuthHeaders() });
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const url = createApiUrl("api/order/");
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const url = createApiUrl(`api/order/${orderId}/update-status/`);
  const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
  return response.data;
};
