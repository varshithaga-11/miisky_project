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

export interface MicroKitchenRating {
  id: number;
  user: number;
  micro_kitchen: number;
  rating: number;
  review: string | null;
  order: number;
  created_at: string;
}

export interface Order {
  id: number;
  user: number;
  user_details?: {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  micro_kitchen: number;
  kitchen_details?: {
    id: number;
    brand_name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  order_type: 'patient' | 'non_patient';
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_distance_km?: number | string | null;
  delivery_charge?: number | string | null;
  delivery_slab?: number | null;
  delivery_slab_details?: { id?: number; min_km: string; max_km: string; charge: string } | null;
  final_amount?: number | string | null;
  delivery_address: string;
  items: OrderItem[];
  ratings?: MicroKitchenRating[];
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
export type CheckoutPreview = {
  food_subtotal: string;
  delivery_distance_km: string | null;
  delivery_charge: string;
  delivery_slab: { id: number; min_km: string; max_km: string; charge: string } | null;
  final_amount: string;
  warnings: string[];
};

export const getCartCheckoutPreview = async (cartId: number): Promise<CheckoutPreview> => {
  const url = createApiUrl(`api/cart/${cartId}/checkout-preview/`);
  const response = await axios.get<CheckoutPreview>(url, { headers: await getAuthHeaders() });
  return response.data;
};

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
  const d = response.data;
  return Array.isArray(d) ? d : d?.results ?? [];
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const url = createApiUrl(`api/order/${orderId}/update-status/`);
  const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
  return response.data;
};

export const rateMicroKitchen = async (kitchenId: number, orderId: number, rating: number, review: string) => {
  const url = createApiUrl("api/microkitchenrating/rate/");
  const response = await axios.post(url, {
    micro_kitchen_id: kitchenId,
    order: orderId,
    rating: rating,
    review: review
  }, { headers: await getAuthHeaders() });
  return response.data;
};

export const getLoggedProfile = async () => {
    const url = createApiUrl("api/profile/");
    // Note: The ProfileViewSet uses get_queryset to filter to the current user.
    // So api/profile/ usually returns a list with 1 item, or we can use a specific ID if we have it.
    // However, our ProfileViewSet in views.py 1352:
    // def get_queryset(self): return UserRegister.objects.filter(id=self.request.user.id)
    // So GET api/profile/ returns [ { ... } ]
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data[0]; // Return the first (and only) item
};
