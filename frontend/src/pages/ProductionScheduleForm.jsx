import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Consumption from "../components/Consumption";
import useFetchData from "../hooks/useFetchData";
import useMaterials from "../hooks/useMaterials";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  Buttons,
  InfoItem,
  InputItem,
  SelectItem,
} from "../components/components";

import {
  CalendarClock,
  AlertCircle,
  CheckCircle,
  Activity,
  Package,
  Factory,
  XCircle,
  Clock,
} from "lucide-react";

const ProductionScheduleListForm = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/new");

  const { user } = useAuth();
  const { materials } = useMaterials();
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [consumptions, setConsumptions] = useState([]);
  const [allProductionLines, setAllProductionLines] = useState([]);
  const [showAddConsumption, setShowAddConsumption] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    production_line: "",
    product: "",
    quantity: "1.00",
    start_time: "",
    end_time: "",
    status: "SCHEDULED",
  });

  // !Permissions checks
  const canManage =
    user && ["ADMIN", "SUPERVISOR", "MANAGER"].includes(user.role);

  const canAddConsumption = canManage || (user && user.role === "OPERATOR");

  // !Fetching component data
  const fetchProducts = useFetchData("product", setLoading, setAllProducts);
  const fetchProductionLines = useFetchData(
    "production-line",
    setLoading,
    setAllProductionLines,
  );

  useEffect(() => {
    fetchProductionLines();
    fetchProducts();
  }, [fetchProducts, fetchProductionLines]);

  const fetchScheduleData = useCallback(() => {
    if (!scheduleId) {
      // Set default start time to 5 minutes in the future
      const nowPlus5Min = new Date(new Date().getTime() + 5 * 60000);
      const localTime = new Date(
        nowPlus5Min.getTime() - nowPlus5Min.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      setFormData((prev) => ({ ...prev, start_time: localTime }));
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`api/production-schedule/${scheduleId}/`)
      .then((res) => {
        setSchedule(res.data);
        setFormData({
          production_line: res.data.production_line || "",
          product: res.data.product || "",
          quantity: parseFloat(res.data.quantity || 1).toFixed(2),
          start_time: res.data.start_time
            ? new Date(
                new Date(res.data.start_time).getTime() -
                  new Date().getTimezoneOffset() * 60000,
              )
                .toISOString()
                .slice(0, 16)
            : "",
          end_time: res.data.end_time
            ? new Date(
                new Date(res.data.end_time).getTime() -
                  new Date().getTimezoneOffset() * 60000,
              )
                .toISOString()
                .slice(0, 16)
            : "",
          status: res.data.status || "SCHEDULED",
        });
        // Load consumptions from nested serializer data
        setConsumptions(res.data.comsumed_materials || []);
      })
      .catch((error) => {
        console.error("Failed to load schedule details:", error);
        setPageError("Failed to load production schedule details.");
      })
      .finally(() => setLoading(false));
  }, [scheduleId]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const fetchConsumptions = useCallback(() => {
    if (!scheduleId) return;
    api
      .get(`api/production-schedule/${scheduleId}/`)
      .then((res) => setConsumptions(res.data.comsumed_materials || []))
      .catch((err) => console.error("Error refreshing consumptions:", err));
  }, [scheduleId]);

  useEffect(() => {
    fetchConsumptions();
  }, [fetchConsumptions]);

  // Material consumption handlers
  const handleAddConsumption = async (payload) => {
    setActionLoading(true);
    api
      .post("api/material-consumption/", {
        ...payload,
        production_schedule: parseInt(scheduleId),
      })
      .then(() => {
        setShowAddConsumption(false);
        fetchConsumptions();
        window.location.reload();
      })
      .catch((err) => {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          Object.values(err.response?.data || {})
            .flat()
            .join(", ") ||
          "Failed to add consumption.";
        setPageError(msg);
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const handleDeleteConsumption = async (id) => {
    if (!window.confirm("Delete this material consumption record?")) return;
    setActionLoading(true);
    api
      .delete(`api/material-consumption/${id}/`)
      .then(() => {
        fetchConsumptions();
        window.location.reload();
      })
      .catch(() => {
        setPageError("Failed to delete consumption record.");
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPageError("");

    // Validate quantity
    const quantityVal = parseFloat(formData.quantity);
    if (isNaN(quantityVal) || quantityVal <= 0) {
      setPageError("Quantity must be a positive number greater than 0.");
      setLoading(false);
      return;
    }

    // Validate start time
    if (!formData.start_time) {
      setPageError("Start time is required.");
      setLoading(false);
      return;
    }

    // Validate end time if provided
    if (
      formData.end_time &&
      formData.start_time &&
      new Date(formData.end_time) < new Date(formData.start_time)
    ) {
      setPageError("End time cannot be before start time.");
      setLoading(false);
      return;
    }

    const payload = {
      production_line: parseInt(formData.production_line),
      product: parseInt(formData.product),
      quantity: parseFloat(formData.quantity).toFixed(2),
      start_time: formData.start_time
        ? new Date(formData.start_time).toISOString()
        : null,
      end_time: formData.end_time
        ? new Date(formData.end_time).toISOString()
        : null,
      status: formData.status,
    };

    if (!payload.end_time) delete payload.end_time;

    try {
      if (isCreateMode) {
        await api.post("api/production-schedule/", payload);
      } else {
        // For edit, only send updatable fields
        const updatePayload = {
          quantity: payload.quantity,
          start_time: payload.start_time,
          end_time: payload.end_time,
          status: payload.status,
        };
        // Allow changing production_line and product when schedule is still SCHEDULED
        if (schedule?.status === "SCHEDULED") {
          updatePayload.production_line = payload.production_line;
          updatePayload.product = payload.product;
        }
        await api.patch(
          `api/production-schedule/${scheduleId}/`,
          updatePayload,
        );
      }
      alert(
        `Production Schedule ${isCreateMode ? "created" : "updated"} successfully!`,
      );
      navigate("/production-schedule");
    } catch (err) {
      console.error("Form submission error:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Failed to save production schedule.";
      setPageError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: {
        color: "bg-blue-200 text-blue-800",
        icon: <Clock size={14} />,
      },
      IN_PROGRESS: {
        color: "bg-yellow-200 text-yellow-800",
        icon: <Activity size={14} />,
      },
      COMPLETED: {
        color: "bg-green-200 text-green-800",
        icon: <CheckCircle size={14} />,
      },
      CANCELLED: {
        color: "bg-red-200 text-red-800",
        icon: <XCircle size={14} />,
      },
    };
    const config = statusConfig[status] || statusConfig.SCHEDULED;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${config.color}`}
      >
        {config.icon} {status}
      </span>
    );
  };

  const isFieldDisabled = (fieldName) => {
    // In edit mode, prevent changes to production_line and product if not SCHEDULED
    if (!isCreateMode && schedule?.status !== "SCHEDULED") {
      if (fieldName === "production_line" || fieldName === "product") {
        return true;
      }
    }
    return false;
  };

  return (
    <Form
      icon={<CalendarClock />}
      heading={
        isViewMode
          ? "View Production Schedule"
          : isCreateMode
            ? "Create Production Schedule"
            : "Edit Production Schedule"
      }
      text_01={
        isViewMode
          ? "View details of the production schedule."
          : isCreateMode
            ? "Fill in the details to create a new production schedule."
            : "Modify the details of the production schedule."
      }
      text_02={"Production Schedules"}
      onClick={() => navigate("/production-schedule")}
      fnction={() => navigate("/production-schedule/edit/" + scheduleId)}
      gradient={"from-cyan-600 to-cyan-800"}
      isViewMode={isViewMode}
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem
              icon={<Package />}
              label="Product"
              value={schedule?.product_name || "N/A"}
            />
            <InfoItem
              icon={<Factory />}
              label="Production Line"
              value={schedule?.production_line_name || "N/A"}
            />
            <InfoItem
              icon={<Factory />}
              label="Workshop"
              value={schedule?.workshop_name || "N/A"}
            />
            <InfoItem
              icon={<Activity />}
              label="Quantity"
              value={
                schedule?.quantity
                  ? `${parseFloat(schedule.quantity).toFixed(2)} units`
                  : "N/A"
              }
            />
            <InfoItem
              icon={<Clock />}
              label="Start Time"
              value={
                schedule?.start_time
                  ? new Date(schedule.start_time).toLocaleString()
                  : "N/A"
              }
            />
            <InfoItem
              icon={<CheckCircle />}
              label="End Time"
              value={
                schedule?.end_time
                  ? new Date(schedule.end_time).toLocaleString()
                  : "Not set"
              }
            />
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm text-stone-400 mb-2">
                <Activity size={16} /> Status
              </label>
              {schedule?.status && getStatusBadge(schedule.status)}
            </div>
          </div>

          {/* Material Consumption Section - View Mode */}
          <Consumption
            materials={materials}
            consumptions={consumptions}
            canAdd={canAddConsumption}
            canDelete={canManage}
            showAddConsumption={showAddConsumption}
            setShowAddConsumption={setShowAddConsumption}
            onSave={handleAddConsumption}
            onDelete={handleDeleteConsumption}
            loading={actionLoading}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectItem
              label="Production Line"
              name="production_line"
              icon={<Factory />}
              value={formData.production_line}
              onChange={handleChange}
              options={allProductionLines.map((line) => ({
                value: line.id,
                label: `${line.name} (${line.workshop_name})`,
              }))}
              required
              disabled={isFieldDisabled("production_line")}
            />
            <SelectItem
              label="Product"
              name="product"
              icon={<Package />}
              value={formData.product}
              onChange={handleChange}
              options={allProducts.map((prod) => ({
                value: prod.id,
                label: `${prod.name} (${prod.code})`,
              }))}
              required
              disabled={isFieldDisabled("product")}
            />
            <InputItem
              label="Quantity to Produce"
              name="quantity"
              icon={<Activity />}
              value={formData.quantity}
              onChange={handleDecimalChange}
              type="text"
              inputMode="decimal"
              required
              disabled={!isCreateMode && schedule?.status !== "SCHEDULED"}
            />
            <SelectItem
              label="Status"
              name="status"
              icon={<Activity />}
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              required
              disabled={
                !isCreateMode &&
                (schedule?.status === "COMPLETED" ||
                  schedule?.status === "CANCELLED")
              }
            />
            <InputItem
              label="Scheduled Start Time"
              name="start_time"
              icon={<Clock />}
              value={formData.start_time}
              onChange={handleChange}
              type="datetime-local"
              required
              disabled={!isCreateMode && schedule?.status !== "SCHEDULED"}
            />
            <InputItem
              label="Scheduled End Time (Optional)"
              name="end_time"
              icon={<CheckCircle />}
              value={formData.end_time}
              onChange={handleChange}
              type="datetime-local"
              disabled={!isCreateMode && schedule?.status !== "SCHEDULED"}
            />
          </div>

          {!isCreateMode && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-xs text-blue-300 flex items-center gap-2">
                <AlertCircle size={14} />
                Major status changes are typically done via actions on the list
                page.
              </p>
            </div>
          )}

          {/* Material Consumption Section - Edit Mode */}
          {!isCreateMode && (
            <Consumption
              materials={materials}
              consumptions={consumptions}
              canAdd={canAddConsumption}
              canDelete={canManage}
              showAddConsumption={showAddConsumption}
              setShowAddConsumption={setShowAddConsumption}
              onSave={handleAddConsumption}
              onDelete={handleDeleteConsumption}
              loading={actionLoading}
            />
          )}

          <Buttons
            onCancel={() => navigate("/production-schedule")}
            text_01={isCreateMode ? "Create Schedule" : "Save Changes"}
            disabled={loading || !canManage}
          />
        </form>
      )}
    </Form>
  );
};

export default ProductionScheduleListForm;
