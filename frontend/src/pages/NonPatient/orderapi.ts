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

export type DeliveryFeedbackType = "issue" | "rating";

export interface DeliveryFeedback {
  id: number;
  feedback_type: DeliveryFeedbackType;
  order: number | null;
  user_meal: number | null;
  rating: number | null;
  review: string | null;
  issue_type: string | null;
  description: string | null;
  created_at: string;
}

export interface UserMealLite {
  id: number;
  user_diet_plan: number;
  meal_date: string;
  status: string;
  meal_type_details?: { id: number; name: string } | null;
  food_details?: { id: number; name: string } | null;
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
  /** Reverse-geocoded / map label saved when the order was placed. */
  delivery_lat_lng_address?: string | null;
  /** Supply-chain user id assigned by the kitchen to deliver this order (`app_order.delivery_person_id`). */
  delivery_person?: number | null;
  delivery_person_details?: {
    id: number;
    first_name: string;
    last_name: string;
    mobile?: string;
  } | null;
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

export type PlaceOrderDelivery = {
  delivery_address?: string;
  delivery_lat_lng_address?: string | null;
};

export const placeOrder = async (cartId: number, delivery: string | PlaceOrderDelivery) => {
  const url = createApiUrl("api/order/place-order/");
  const body: Record<string, unknown> = { cart_id: cartId };
  if (typeof delivery === "string") {
    body.delivery_address = delivery;
  } else {
    if (delivery.delivery_address !== undefined) {
      body.delivery_address = delivery.delivery_address;
    }
    if (delivery.delivery_lat_lng_address !== undefined) {
      body.delivery_lat_lng_address = delivery.delivery_lat_lng_address ?? "";
    }
  }
  const response = await axios.post(url, body, { headers: await getAuthHeaders() });
  return response.data;
};

/** Period values match `get_period_range` in `backend/app/utils/date_utils.py`. */
export type OrderDatePeriod =
  | "all"
  | "today"
  | "tomorrow"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "next_month"
  | "this_quarter"
  | "this_year"
  | "custom_range";

export type PaginatedOrders = {
  results: Order[];
  count: number;
  totalPages?: number;
  currentPage?: number;
};

/** Lightweight row from `GET /api/supply-chain-assigned-orders/` (list only). */
export type SupplyChainOrderListRow = {
  id: number;
  customer_name: string;
  customer_mobile: string | null;
  kitchen_name: string | null;
  order_type: string;
  status: string;
  final_amount: string | number;
  created_at: string;
};

export type PaginatedSupplyChainOrderList = {
  results: SupplyChainOrderListRow[];
  count: number;
  totalPages?: number;
  currentPage?: number;
};

const buildSupplyChainAssignedOrdersQuery = (
  page: number,
  limit: number,
  status?: string,
  type?: string,
  search?: string,
  period?: OrderDatePeriod | string,
  customRangeStart?: string,
  customRangeEnd?: string
) => {
  let url = createApiUrl(`api/supply-chain-assigned-orders/?page=${page}&limit=${limit}`);
  if (status && status !== "all") url += `&status=${status}`;
  if (type && type !== "all") url += `&order_type=${type}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (period && period !== "all") {
    url += `&period=${encodeURIComponent(period)}`;
    if (period === "custom_range" && customRangeStart && customRangeEnd) {
      url += `&start_date=${encodeURIComponent(customRangeStart)}&end_date=${encodeURIComponent(customRangeEnd)}`;
    }
  }
  return url;
};

/** Supply-chain delivery person: paginated list with minimal columns (use detail endpoint for full order). */
export const getSupplyChainAssignedOrdersList = async (
  page = 1,
  limit = 10,
  status?: string,
  type?: string,
  search?: string,
  period?: OrderDatePeriod | string,
  customRangeStart?: string,
  customRangeEnd?: string
): Promise<PaginatedSupplyChainOrderList> => {
  const url = buildSupplyChainAssignedOrdersQuery(
    page,
    limit,
    status,
    type,
    search,
    period,
    customRangeStart,
    customRangeEnd
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const d = response.data;
  if (Array.isArray(d)) {
    return { results: d, count: d.length, totalPages: 1, currentPage: 1 };
  }
  return {
    results: d?.results ?? [],
    count: d?.count ?? 0,
    totalPages: d?.total_pages ?? 1,
    currentPage: d?.current_page ?? page,
  };
};

/** Full order for supply-chain user (same assignment scope as list). */
export const getSupplyChainAssignedOrderDetail = async (orderId: number): Promise<Order> => {
  const url = createApiUrl(`api/supply-chain-assigned-orders/${orderId}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

/** Lightweight row from `GET /api/micro-kitchen-orders/` (list only). */
export type MicroKitchenOrderListRow = {
  id: number;
  customer_name: string;
  customer_mobile: string | null;
  order_type: string;
  status: string;
  final_amount: string | number;
  created_at: string;
};

export type PaginatedMicroKitchenOrderList = {
  results: MicroKitchenOrderListRow[];
  count: number;
  totalPages?: number;
  currentPage?: number;
};

export const getMicroKitchenOrdersList = async (
  page = 1,
  limit = 10,
  status?: string,
  type?: string,
  search?: string,
  period?: OrderDatePeriod | string,
  customRangeStart?: string,
  customRangeEnd?: string
): Promise<PaginatedMicroKitchenOrderList> => {
  let url = createApiUrl(`api/micro-kitchen-orders/?page=${page}&limit=${limit}`);
  if (status && status !== "all") url += `&status=${status}`;
  if (type && type !== "all") url += `&order_type=${type}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (period && period !== "all") {
    url += `&period=${encodeURIComponent(period)}`;
    if (period === "custom_range" && customRangeStart && customRangeEnd) {
      url += `&start_date=${encodeURIComponent(customRangeStart)}&end_date=${encodeURIComponent(customRangeEnd)}`;
    }
  }
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const d = response.data;
  if (Array.isArray(d)) {
    return { results: d, count: d.length, totalPages: 1, currentPage: 1 };
  }
  return {
    results: d?.results ?? [],
    count: d?.count ?? 0,
    totalPages: d?.total_pages ?? 1,
    currentPage: d?.current_page ?? page,
  };
};

/** Full order for micro-kitchen user (same kitchen scope as list). */
export const getMicroKitchenOrderDetail = async (orderId: number): Promise<Order> => {
  const url = createApiUrl(`api/micro-kitchen-orders/${orderId}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export const getMyOrders = async (
  page = 1,
  limit = 10,
  status?: string,
  type?: string,
  search?: string,
  period?: OrderDatePeriod | string,
  customRangeStart?: string,
  customRangeEnd?: string
): Promise<PaginatedOrders> => {
  let url = createApiUrl(`api/order/?page=${page}&limit=${limit}`);
  if (status && status !== "all") url += `&status=${status}`;
  if (type && type !== "all") url += `&order_type=${type}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (period && period !== "all") {
    url += `&period=${encodeURIComponent(period)}`;
    if (period === "custom_range" && customRangeStart && customRangeEnd) {
      url += `&start_date=${encodeURIComponent(customRangeStart)}&end_date=${encodeURIComponent(customRangeEnd)}`;
    }
  }

  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const d = response.data;
  if (Array.isArray(d)) {
    return { results: d, count: d.length, totalPages: 1, currentPage: 1 };
  }
  return {
    results: d?.results ?? [],
    count: d?.count ?? 0,
    totalPages: d?.total_pages ?? 1,
    currentPage: d?.current_page ?? page,
  };
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const url = createApiUrl(`api/order/${orderId}/update-status/`);
  const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
  return response.data;
};

/** Persists assignment on the server (`Order.delivery_person`). Pass `null` to unassign. */
export const assignOrderDeliveryPerson = async (orderId: number, delivery_person: number | null) => {
  const url = createApiUrl(`api/order/${orderId}/assign-delivery-person/`);
  const response = await axios.patch(
    url,
    { delivery_person },
    { headers: await getAuthHeaders() }
  );
  return response.data as Order;
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

export type SubmitDeliveryFeedbackPayload = {
  order?: number;
  user_meal?: number;
  feedback_type: DeliveryFeedbackType;
  rating?: number;
  review?: string;
  issue_type?: string;
  description?: string;
};

export const submitDeliveryFeedback = async (
  payload: SubmitDeliveryFeedbackPayload
): Promise<DeliveryFeedback> => {
  const url = createApiUrl("api/delivery-feedback/");
  const response = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return response.data;
};

export const getOrderDeliveryFeedback = async (
  orderId: number
): Promise<DeliveryFeedback[]> => {
  const url = createApiUrl(`api/delivery-feedback/?order=${orderId}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return Array.isArray(response.data) ? response.data : [];
};

export const getUserMealDeliveryFeedback = async (
  userMealId: number
): Promise<DeliveryFeedback[]> => {
  const url = createApiUrl(`api/delivery-feedback/?user_meal=${userMealId}`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return Array.isArray(response.data) ? response.data : [];
};

export const getUserMealsForPlanDate = async (
  planId: number,
  mealDate: string
): Promise<UserMealLite[]> => {
  const url = createApiUrl(`api/usermeal/?user_diet_plan=${planId}&meal_date=${mealDate}&limit=200`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
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
