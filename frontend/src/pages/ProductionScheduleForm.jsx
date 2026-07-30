import { useParams, useNavigate, useLocation } from "react-router-dom";
import useProductionLines from "../hooks/useProductionLines";
import { useState, useEffect, useCallback } from "react";
import Consumption from "../components/Consumption";
import useFormSubmit from "../hooks/useFormSubmit";
import useFetchData from "../hooks/useFetchData";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  Status,
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
  const [schedule, setSchedule] = useState(null);
  const { productionLines } = useProductionLines();
  const [allProducts, setAllProducts] = useState([]);
  const [consumptions, setConsumptions] = useState([]);
  const [fetchLoading, setLoading] = useState(false);
  const [showAddConsumption, setShowAddConsumption] = useState(false);
  const [formData, setFormData] = useState({
    production_line: "",
    product: "",
    quantity: "1.00",
    start_time: "",
    end_time: "",
    status: "SCHEDULED",
  });

  // !Form submission state + handler now come from the hook itself
  const {
    loading: submitLoading,
    errors,
    pageError,
    setErrors,
    setPageError,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Permissions checks
  const canManage =
    user && ["ADMIN", "SUPERVISOR", "MANAGER"].includes(user.role);

  const canAddConsumption = canManage || (user && user.role === "OPERATOR");

  // !Fetching component data
  const fetchProducts = useFetchData("product", setLoading, setAllProducts);

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
        setConsumptions(res.data.consumed_materials || []);
      })
      .catch((error) => {
        console.error("Failed to load schedule details:", error);
        setPageError("Failed to load production schedule details.");
      })
      .finally(() => setLoading(false));
  }, [scheduleId, setPageError]);

  const fetchConsumptions = useCallback(() => {
    if (!scheduleId) return;
    api
      .get(`api/production-schedule/${scheduleId}/`)
      .then((res) => setConsumptions(res.data.consumed_materials || []))
      .catch((err) => console.error("Error refreshing consumptions:", err));
  }, [scheduleId]);

  useEffect(() => {
    fetchProducts();
    fetchScheduleData();
    fetchConsumptions();
  }, [fetchConsumptions, fetchProducts, fetchScheduleData]);

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    // !Pre-flight checks that must short-circuit before the hook takes over.
    const quantityVal = parseFloat(formData.quantity);
    if (isNaN(quantityVal) || quantityVal <= 0) {
      e.preventDefault();
      setPageError("Quantity must be a positive number greater than 0.");
      return;
    }

    if (!formData.start_time) {
      e.preventDefault();
      setPageError("Start time is required.");
      return;
    }

    if (
      formData.end_time &&
      formData.start_time &&
      new Date(formData.end_time) < new Date(formData.start_time)
    ) {
      e.preventDefault();
      setPageError("End time cannot be before start time.");
      return;
    }

    const basePayload = {
      quantity: parseFloat(formData.quantity).toFixed(2),
      start_time: formData.start_time
        ? new Date(formData.start_time).toISOString()
        : null,
      end_time: formData.end_time
        ? new Date(formData.end_time).toISOString()
        : null,
      status: formData.status,
    };

    if (!basePayload.end_time) delete basePayload.end_time;

    let payload = basePayload;
    if (isCreateMode || schedule?.status === "SCHEDULED") {
      payload = {
        ...basePayload,
        production_line: parseInt(formData.production_line),
        product: parseInt(formData.product),
      };
    }

    const url = isCreateMode
      ? "api/production-schedule/"
      : `api/production-schedule/${scheduleId}/`;
    const method = isCreateMode ? "post" : "patch";
    const message = `Production Schedule ${isCreateMode ? "created" : "updated"} successfully !!!`;

    return submit(e, {
      method,
      url,
      payload,
      formData,
      message,
      onSuccess: () => navigate("/production-schedule"),
    });
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
            <Status
              label="Status"
              value={schedule?.status && getStatusBadge(schedule.status)}
            />
          </div>

          {/* Material Consumption Section - View Mode */}
          <Consumption
            consumptions={consumptions}
            canAdd={canAddConsumption}
            canDelete={canManage}
            showAddConsumption={showAddConsumption}
            setShowAddConsumption={setShowAddConsumption}
            entityField="production_schedule"
            entityId={scheduleId}
            onAdded={fetchConsumptions}
            onDeleted={fetchConsumptions}
            onError={setPageError}
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
              options={productionLines.map((line) => ({
                value: line.id,
                label: `${line.name} (${line.workshop_name})`,
              }))}
              required
              error={errors.production_line}
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
              error={errors.product}
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
              error={errors.quantity}
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
              error={errors.status}
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
              error={errors.start_time}
              disabled={!isCreateMode && schedule?.status !== "SCHEDULED"}
            />
            <InputItem
              label="Scheduled End Time (Optional)"
              name="end_time"
              icon={<CheckCircle />}
              value={formData.end_time}
              onChange={handleChange}
              type="datetime-local"
              error={errors.end_time}
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
              consumptions={consumptions}
              canAdd={canAddConsumption}
              canDelete={canManage}
              showAddConsumption={showAddConsumption}
              setShowAddConsumption={setShowAddConsumption}
              entityField="production_schedule"
              entityId={scheduleId}
              onAdded={fetchConsumptions}
              onDeleted={fetchConsumptions}
              onError={setPageError}
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
