import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchUsersByRole from "../hooks/useFetchUsersByRole";
import useEntityFormData from "../hooks/useEntityFormData";
import useFormSubmit from "../hooks/useFormSubmit";
import useWorkshops from "../hooks/useWorkshops";
import useFetchData from "../hooks/useFetchData";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";

import {
  TextareaItem,
  SelectItem,
  InputItem,
  InfoItem,
  Buttons,
} from "../components/components";

import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Calendar,
  Package,
  Factory,
  Wrench,
  User,
  Cog,
} from "lucide-react";

// !Default values for the form
const MACHINE_DEFAULTS = {
  name: "",
  model_number: "",
  serial_number: "",
  workshop: "",
  operator: "",
  status: "OPERATIONAL",
  purchase_date: "",
  last_maintenance_date: "",
  next_maintenance_date: "",
  specifications: "",
};

const MachineForm = () => {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");

  const { user } = useAuth();
  const [machine, setMachine] = useState(null);
  const [operators, setOperators] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { workshops, workshopsLoading } = useWorkshops();
  const [formData, setFormData] = useState(MACHINE_DEFAULTS);
  const [operatorsLoading, setOperatorsLoading] = useState(false);

  // !Form submission state + handler now come from the hook itself
  const {
    loading: submitLoading,
    errors,
    pageError,
    setErrors,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Fetch component data
  const handleMachineData = useEntityFormData(
    setMachine,
    setFormData,
    MACHINE_DEFAULTS,
  );

  // !Get all operators
  const fetchOperators = useFetchUsersByRole(
    ["OPERATOR"],
    setOperatorsLoading,
    setOperators,
  );

  // !Fetch machine data
  const fetchMachine = useFetchData(
    `machine/${machineId}`,
    setFetchLoading,
    handleMachineData,
  );

  useEffect(() => {
    if (!isViewMode) fetchOperators();
    if (machineId) fetchMachine();
  }, [fetchOperators, fetchMachine,isViewMode, machineId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // !Permission check
  const canEditAllFields = user?.role === "ADMIN";
  const canEditOperatorAndStatus =
    user && ["SUPERVISOR", "MANAGER"].includes(user.role);
  const canEditMaintenanceAndStatus = user?.role === "TECHNICIAN";

  // !Submit form data
  const method = isEditMode ? "patch" : "post";
  const url = isEditMode ? `api/machine/${machineId}/` : "api/machine/";
  const message = `Machine ${isEditMode ? "updated" : "created"} successfully !!!`;
  const payload = {
    ...formData,
    operator: formData.operator || null,
    purchase_date: formData.purchase_date || null,
    last_maintenance_date: formData.last_maintenance_date || null,
    next_maintenance_date: formData.next_maintenance_date || null,
  };

  let finalPayload = payload;
  if (isEditMode && !canEditAllFields) {
    // SUPERVISOR/MANAGER: only operator and status
    if (canEditOperatorAndStatus) {
      finalPayload = {
        operator: payload.operator,
        status: payload.status,
      };
      // TECHNICIAN: only status, last_maintenance_date, next_maintenance_date
    } else if (canEditMaintenanceAndStatus) {
      finalPayload = {
        status: payload.status,
        last_maintenance_date: payload.last_maintenance_date,
        next_maintenance_date: payload.next_maintenance_date,
      };
      // No recognized edit permission — send nothing, let backend reject
    } else finalPayload = {};
  }

  const HandleSubmit = (e) =>
    submit(e, {
      method,
      url,
      payload: finalPayload,
      formData,
      message,
      onSuccess: () => navigate("/machine"),
    });

  const getWorkshopOptions = () => {
    return workshops.map((ws) => ({
      value: ws.id,
      label: ws.name,
    }));
  };

  const getOperatorOptions = () => {
    return operators.map((op) => ({
      value: op.id,
      label:
        op.first_name && op.last_name
          ? `${op.first_name} ${op.last_name} (${op.username})`
          : op.username,
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      OPERATIONAL: {
        color: "bg-green-200 text-green-800",
        icon: <CheckCircle size={14} />,
      },
      IDLE: {
        color: "bg-yellow-200 text-yellow-800",
        icon: <Activity size={14} />,
      },
      MAINTENANCE: {
        color: "bg-blue-200 text-blue-800",
        icon: <Wrench size={14} />,
      },
      BROKEN: {
        color: "bg-red-200 text-red-800",
        icon: <AlertTriangle size={14} />,
      },
    };
    const config = statusConfig[status] || statusConfig.OPERATIONAL;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${config.color}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString + "T00:00:00Z").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Form
      icon={<Cog />}
      heading={
        isViewMode
          ? "Machine Details"
          : isEditMode
            ? "Edit Machine"
            : "Create New Machine"
      }
      text_01={
        isViewMode
          ? "View machine information"
          : isEditMode
            ? "Update machine information and settings"
            : "Add a new machine to your workshop"
      }
      text_02="Machines"
      onClick={() => navigate("/machine")}
      fnction={() => navigate(`/machine/edit/${machineId}`)}
      gradient="from-yellow-600 to-yellow-800"
      isViewMode={
        isViewMode &&
        (canEditAllFields ||
          canEditOperatorAndStatus ||
          canEditMaintenanceAndStatus)
      }
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={<Cog />} label="Machine Name" value={machine?.name} />
          <InfoItem
            icon={<Package />}
            label="Model Number"
            value={machine?.model_number}
          />
          <InfoItem
            icon={<Factory />}
            label="Workshop"
            value={machine?.workshop_name}
          />
          <InfoItem
            icon={<User />}
            label="Current Operator"
            value={machine?.operator_name}
          />

          <InfoItem
            icon={<Calendar />}
            label="Purchase Date"
            value={formatDate(machine?.purchase_date)}
          />
          <InfoItem
            icon={<Wrench />}
            label="Last Maintenance"
            value={formatDate(machine?.last_maintenance_date)}
          />
          <InfoItem
            icon={<Calendar />}
            label="Next Maintenance"
            value={formatDate(machine?.next_maintenance_date)}
          />
          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-sm text-stone-400 mb-2">
              <Activity size={16} />
              Status
            </label>
            {machine?.status && getStatusBadge(machine.status)}
          </div>
          <div className="md:col-span-2">
            <InfoItem
              icon={<FileText />}
              label="Specifications"
              value={machine?.specifications}
            />
          </div>
        </div>
      ) : (
        // !Edit/Create Mode
        <form onSubmit={HandleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputItem
                label="Machine Name"
                name="name"
                icon={<Cog />}
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter machine name"
                error={errors.name}
                disabled={isEditMode && !canEditAllFields}
              />
            </div>

            <InputItem
              label="Model Number"
              name="model_number"
              icon={<Package />}
              value={formData.model_number}
              onChange={handleChange}
              placeholder="e.g., XYZ-2000"
              error={errors.model_number}
              disabled={isEditMode && !canEditAllFields}
            />

            <SelectItem
              label="Workshop"
              name="workshop"
              icon={<Factory />}
              value={formData.workshop}
              onChange={handleChange}
              options={getWorkshopOptions()}
              loading={workshopsLoading}
              error={errors.workshop}
              required
              disabled={isEditMode && !canEditAllFields}
            />

            <SelectItem
              label="Operator"
              name="operator"
              icon={<User />}
              value={formData.operator}
              onChange={handleChange}
              options={getOperatorOptions()}
              loading={operatorsLoading}
              error={errors.operator}
              disabled={
                isEditMode && !canEditAllFields && !canEditOperatorAndStatus
              }
            />

            <SelectItem
              label="Status"
              name="status"
              icon={<Activity />}
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "OPERATIONAL", label: "Operational" },
                { value: "IDLE", label: "Idle" },
                { value: "MAINTENANCE", label: "Under Maintenance" },
                { value: "BROKEN", label: "Broken" },
              ]}
              error={errors.status}
              required
              disabled={
                isEditMode &&
                !canEditAllFields &&
                !canEditOperatorAndStatus &&
                !canEditMaintenanceAndStatus
              }
            />

            <InputItem
              label="Purchase Date"
              name="purchase_date"
              icon={<Calendar />}
              type="date"
              value={formData.purchase_date}
              onChange={handleChange}
              error={errors.purchase_date}
              disabled={isEditMode && !canEditAllFields}
            />

            <InputItem
              label="Last Maintenance Date"
              name="last_maintenance_date"
              icon={<Wrench />}
              type="date"
              value={formData.last_maintenance_date}
              onChange={handleChange}
              error={errors.last_maintenance_date}
              disabled={
                isEditMode && !canEditAllFields && !canEditMaintenanceAndStatus
              }
            />

            <InputItem
              label="Next Maintenance Date"
              name="next_maintenance_date"
              icon={<Calendar />}
              type="date"
              value={formData.next_maintenance_date}
              onChange={handleChange}
              error={errors.next_maintenance_date}
              disabled={
                isEditMode && !canEditAllFields && !canEditMaintenanceAndStatus
              }
            />

            <div className="md:col-span-2">
              <TextareaItem
                label="Specifications"
                name="specifications"
                icon={<FileText />}
                value={formData.specifications}
                onChange={handleChange}
                rows="4"
                placeholder="Enter machine specifications and technical details"
                error={errors.specifications}
                disabled={isEditMode && !canEditAllFields}
              />
            </div>
          </div>

          <Buttons
            onCancel={() => navigate("/machine")}
            text_01={isEditMode ? "Save Changes" : "Create Machine"}
            disabled={
              loading ||
              (isEditMode &&
                !canEditAllFields &&
                !canEditOperatorAndStatus &&
                !canEditMaintenanceAndStatus)
            }
          />
        </form>
      )}
    </Form>
  );
};

export default MachineForm;
