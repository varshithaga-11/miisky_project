import React from "react";
import { Modal } from "../../../components/ui/modal";
import { FiPackage, FiUser, FiHome, FiMapPin, FiTruck, FiClock, FiCornerDownRight, FiDownload } from "react-icons/fi";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;
  const resolvedOrderId = order.order_id || `ORD-${String(order.id).padStart(5, "0")}`;
  const deliveryPersonName = order.delivery_person_details
    ? `${order.delivery_person_details.first_name} ${order.delivery_person_details.last_name}`.trim()
    : "";

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 'text-amber-600 bg-amber-50';
      case 'accepted': return 'text-blue-600 bg-blue-50';
      case 'preparing': return 'text-indigo-600 bg-indigo-50';
      case 'ready': return 'text-purple-600 bg-purple-50';
      case 'shipped': return 'text-cyan-600 bg-cyan-50';
      case 'delivered': return 'text-emerald-600 bg-emerald-50';
      case 'cancelled': return 'text-rose-600 bg-rose-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="max-h-[90vh] flex flex-col">
        <div className="p-6 pr-16 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Order Details <span className="text-brand-600 dark:text-brand-400 font-mono text-lg">{resolvedOrderId}</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Customer & Kitchen Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FiUser className="w-4 h-4" /> Customer Information
              </h3>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white">{order.user_details?.first_name} {order.user_details?.last_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.user_details?.mobile || "No Mobile Provided"}</p>
                <div className="mt-4 flex gap-2 items-start text-sm text-gray-600 dark:text-gray-300">
                  <FiMapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>{order.delivery_address || "No address specified"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FiHome className="w-4 h-4" /> Micro-Kitchen
              </h3>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white uppercase">{order.kitchen_details?.brand_name || "N/A"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Providing Kitchen</p>

                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Partner</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600">
                      <FiTruck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {deliveryPersonName || (order.delivery_person ? `Delivery User #${order.delivery_person}` : "Not assigned")}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {order.delivery_person_details?.mobile || "No contact available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <FiPackage className="w-4 h-4" /> Order Items
            </h3>
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm text-right">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Price</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {order.items?.map((item: any) => (
                    <tr key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.food_details?.image ? (
                            <img src={item.food_details.image} alt={item.food_details.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                              <FiPackage className="w-5 h-5" />
                            </div>
                          )}
                          <span className="font-medium">{item.food_details?.name || "Unknown Item"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">x{item.quantity}</td>
                      <td className="px-6 py-4 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white italic">₹{parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 underline decoration-gray-200 underline-offset-4">Items Subtotal</span>
                  <span className="font-medium">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 underline decoration-gray-200 underline-offset-4 flex items-center gap-1">
                    Delivery Fee <span className="text-[10px] text-brand-600 bg-brand-50 px-1 rounded">({order.delivery_distance_km} km)</span>
                  </span>
                  <span className="font-medium">₹{parseFloat(order.delivery_charge).toFixed(2)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900 dark:text-white">Amount Paid</span>
                  <span className="font-black text-brand-600 dark:text-brand-400">₹{parseFloat(order.final_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 space-y-3">
              <h4 className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-widest flex items-center gap-1.5">
                <FiCornerDownRight /> Logistics Notes
              </h4>
              <div className="space-y-3">
                {order.delivery_slab_details && (
                  <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400">
                    <FiCornerDownRight className="w-3 h-3" />
                    <span>Slab: {order.delivery_slab_details.min_km}-{order.delivery_slab_details.max_km} km (₹{order.delivery_slab_details.charge})</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-brand-500">
                      <FiClock className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      All deliveries are handled by the micro-kitchen's assigned supply chain partner. Delivery distance is calculated based on aerial coordinates between kitchen and patient location.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            Close View
          </button>
          <button
            className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
            onClick={() => window.print()}
          >
            <FiDownload /> Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailModal;
