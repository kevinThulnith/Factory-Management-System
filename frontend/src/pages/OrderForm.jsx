import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { InfoItem, SelectItem, InputItem } from "../components/components";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";

import {
  ShoppingCart,
  CalendarDays,
  ListOrdered,
  CheckCircle,
  ChevronLeft,
  DollarSign,
  PlusCircle,
  UserCircle,
  Building,
  XOctagon,
  Trash2,
  Edit2,
  Save,
  Hash,
  Send,
} from "lucide-react";

// --- Reusable Line Item Form Sub-Component ---
const LineItemForm = ({ itemToEdit, materials, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    material: "",
    quantity: "1.00",
    unit_price: "0.00",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        material: itemToEdit.material || "",
        quantity: parseFloat(itemToEdit.quantity || 1).toFixed(2),
        unit_price: parseFloat(itemToEdit.unit_price || 0).toFixed(2),
      });
    } else {
      setFormData({ material: "", quantity: "1.00", unit_price: "0.00" });
    }
  }, [itemToEdit]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (
      !formData.material ||
      parseFloat(formData.quantity) <= 0 ||
      parseFloat(formData.unit_price) < 0
    ) {
      setFormErrors({ general: "Please fill all fields correctly." });
      return;
    }
    setFormErrors({});

    // Note: 'order' field is NOT needed - it's automatically set from the URL
    const payload = {
      material: formData.material,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
    };
    onSave(payload, itemToEdit?.id);
  };

  return (
    <div className="bg-stone-900/50 rounded-lg p-4 my-6 border border-stone-700">
      <h4 className="text-md font-semibold text-stone-200 mb-4">
        {itemToEdit ? "Edit Item" : "Add New Item"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectItem
            label="Material"
            name="material"
            value={formData.material}
            onChange={handleChange}
            options={materials.map((m) => ({ value: m.id, label: m.name }))}
            required
            disabled={!!itemToEdit}
          />
          <InputItem
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
          <InputItem
            label="Unit Price"
            name="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-stone-600 hover:bg-stone-700 text-stone-200 py-2 px-3 rounded-md text-[14px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-[14px]"
          >
            {loading ? "Saving..." : itemToEdit ? "Save Item" : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Main Order Form/Detail Component ---
const OrderForm = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});

  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/add");
  const isEditMode = !isCreateMode && !isViewMode;

  const [order, setOrder] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState({ supplier: "", status: "DRAFT" });
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState({ page: true, action: false });

  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const canManage = useMemo(
    () => user && (user.role === "ADMIN" || user.role === "SUPERVISOR"),
    [user]
  );
  const isEditable = useMemo(
    () => isCreateMode || (order?.status === "DRAFT" && canManage),
    [isCreateMode, order, canManage]
  );

  const fetchOrderData = useCallback(() => {
    if (!orderId) {
      setLoading((prev) => ({ ...prev, page: false }));
      return;
    }
    setLoading((prev) => ({ ...prev, page: true }));

    // Fetch order details
    Promise.all([
      api.get(`api/order/${orderId}/`),
      api.get(`api/order/${orderId}/material/`),
    ])
      .then(([orderRes, materialsRes]) => {
        setOrder(orderRes.data);
        setLineItems(materialsRes.data.results || materialsRes.data || []);
        setFormData({
          supplier: orderRes.data.supplier,
          status: orderRes.data.status,
        });
      })
      .catch(() => setPageError("Failed to load order details."))
      .finally(() => setLoading((prev) => ({ ...prev, page: false })));
  }, [orderId]);

  useEffect(() => {
    api.get("api/user/me/").then((res) => setUser(res.data));
    api
      .get("api/supplier/")
      .then((res) => setSuppliers(res.data.results || res.data));
    api
      .get("api/material/")
      .then((res) => setMaterials(res.data.results || res.data));
    fetchOrderData();
  }, [fetchOrderData]);

  const handleHeaderSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, action: true }));
    try {
      if (isCreateMode) {
        const res = await api.post("api/order/", {
          supplier: formData.supplier,
          status: "DRAFT",
        });
        alert("Order created! Now you can add items.");
        navigate(`/order/view/${res.data.id}`);
      } else {
        await api.patch(`api/order/${orderId}/`, {
          supplier: formData.supplier,
        });
        alert("Order header updated!");
        fetchOrderData(); // Refetch to confirm changes
      }
    } catch (err) {
      setPageError("Failed to save order header.", err);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleSaveLineItem = async (payload, itemId) => {
    setLoading((prev) => ({ ...prev, action: true }));

    try {
      if (itemId) {
        // Update existing item - use nested endpoint with PATCH
        await api.patch(`api/order/${orderId}/material/${itemId}/`, {
          quantity: payload.quantity,
          unit_price: payload.unit_price,
        });
      } else {
        // Create new item - use nested endpoint with POST
        await api.post(`api/order/${orderId}/material/`, payload);
      }

      setShowAddItemForm(false);
      setEditingItem(null);
      fetchOrderData(); // Refetch all data
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
      setPageError("Failed to save line item.");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleDeleteLineItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading((prev) => ({ ...prev, action: true }));
    try {
      // Use nested endpoint for deletion
      await api.delete(`api/order/${orderId}/material/${itemId}/`);
      fetchOrderData();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setPageError(err.response?.data?.detail || "Failed to delete line item.");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const handleOrderStatusUpdate = async (newStatus) => {
    if (
      !window.confirm(`Are you sure you want to change status to ${newStatus}?`)
    )
      return;
    setLoading((prev) => ({ ...prev, action: true }));
    try {
      await api.patch(`api/order/${orderId}/`, { status: newStatus });
      fetchOrderData();
    } catch (err) {
      setPageError(err.response?.data?.detail || "Failed to update status.");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const orderSummary = useMemo(() => {
    const total = lineItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price || 0),
      0
    );
    return { total: total.toFixed(2), itemCount: lineItems.length };
  }, [lineItems]);

  if (loading.page)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a1a]">
        <div className="text-stone-400">Loading...</div>
      </div>
    );

  return (
    <div className="container mx-auto text-star-dust-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card-main p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-violet-600 to-violet-800 rounded-lg p-2 mr-4 text-stone-200 shadow-lg">
              <ShoppingCart size={35} />
            </div>
            <div>
              <h1 className="text-2xl font-medium">
                {isCreateMode ? "Create New Order" : `Order #${orderId}`}
              </h1>
              <p className="text-stone-400 mt-1 text-1xl">
                Manage order details and line items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Link
              to="/order"
              className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-1 px-3 hover:shadow-sm"
            >
              <ChevronLeft size={20} />
              Orders
            </Link>
            {isViewMode && isEditable && (
              <button
                onClick={() => navigate(`/order/edit/${orderId}`)}
                className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-2 px-3 hover:shadow-sm"
              >
                <Edit2 size={18} /> Edit
              </button>
            )}
          </div>
        </div>

        {pageError && (
          <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg">
            {pageError}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-card-main rounded-xl shadow-md p-6 sm:p-8">
          {/* Order Header Form/Info */}
          <form
            onSubmit={handleHeaderSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pb-6 mb-6 border-b border-stone-700"
          >
            <InfoItem
              icon={<CalendarDays />}
              label="Order Date"
              value={
                order?.order_date
                  ? new Date(
                      order.order_date + "T00:00:00Z"
                    ).toLocaleDateString()
                  : "Pending"
              }
            />
            {!isCreateMode && (
              <InfoItem
                icon={<UserCircle />}
                label="Created By"
                value={
                  order?.created_by_username || user?.username || "Pending"
                }
              />
            )}
            <SelectItem
              label="Supplier"
              name="supplier"
              icon={<Building />}
              value={formData.supplier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, supplier: e.target.value }))
              }
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              required
              disabled={!isCreateMode}
            />

            {isCreateMode && canManage && (
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading.action}
                  className="bg-orange-500 hover:bg-orange-600 text-stone-900 font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px]"
                >
                  <Save size={18} /> Create Order to Add Items
                </button>
              </div>
            )}
          </form>

          {!isCreateMode && (
            <>
              {/* Order Status & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <InfoItem
                  icon={<DollarSign />}
                  label="Order Total"
                  value={`$${orderSummary.total}`}
                />
                <InfoItem
                  icon={<Hash />}
                  label="Item Count"
                  value={`${orderSummary.itemCount} items`}
                />
                <InfoItem
                  icon={<CheckCircle />}
                  label="Status"
                  value={order?.status}
                />
              </div>

              {/* Order Actions */}
              {isViewMode && canManage && (
                <div className="mt-6 pt-6 border-t border-stone-700 flex flex-wrap gap-3 items-center">
                  <span className="text-sm text-stone-400 mr-2">
                    Quick Actions:
                  </span>
                  {order?.status === "DRAFT" && lineItems.length > 0 && (
                    <button
                      onClick={() => handleOrderStatusUpdate("ORDERED")}
                      disabled={loading.action}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px]"
                    >
                      <Send size={16} /> Mark as Ordered
                    </button>
                  )}
                  {order?.status === "ORDERED" && (
                    <button
                      onClick={() => handleOrderStatusUpdate("RECEIVED")}
                      disabled={loading.action}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px]"
                    >
                      <CheckCircle size={16} /> Mark as Received
                    </button>
                  )}
                  {(order?.status === "DRAFT" ||
                    order?.status === "ORDERED") && (
                    <button
                      onClick={() => handleOrderStatusUpdate("CANCELLED")}
                      disabled={loading.action}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px]"
                    >
                      <XOctagon size={16} /> Cancel Order
                    </button>
                  )}
                </div>
              )}

              {/* Line Items Section */}
              <div className="mt-8 pt-6 border-t border-stone-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-stone-200 flex items-center gap-3">
                    <ListOrdered /> Order Items
                  </h3>
                  {isEditable && !showAddItemForm && !editingItem && (
                    <button
                      onClick={() => setShowAddItemForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px]"
                    >
                      <PlusCircle size={18} /> Add Item
                    </button>
                  )}
                </div>

                {isEditable && (showAddItemForm || editingItem) && (
                  <LineItemForm
                    itemToEdit={editingItem}
                    materials={materials}
                    onSave={handleSaveLineItem}
                    onCancel={() => {
                      setShowAddItemForm(false);
                      setEditingItem(null);
                    }}
                    loading={loading.action}
                  />
                )}

                {lineItems.length > 0 ? (
                  <div className="space-y-2">
                    {lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-stone-900/50 rounded-md flex flex-col md:flex-row justify-between md:items-center gap-2"
                      >
                        <div>
                          <p className="font-semibold text-stone-300">
                            {item.material_name}
                          </p>
                          <p className="text-sm text-stone-400">
                            {item.quantity} x $
                            {parseFloat(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-orange-400">
                            ${parseFloat(item.total_price).toFixed(2)}
                          </p>
                          {isEditable && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteLineItem(item.id)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-center py-4">
                    No items have been added to this order yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
