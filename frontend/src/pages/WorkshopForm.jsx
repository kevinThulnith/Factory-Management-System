import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchUsersByRole from "../hooks/useFetchUsersByRole";
import useEntityFormData from "../hooks/useEntityFormData";
import useDepartments from "../hooks/useDepartments";
import useFormSubmit from "../hooks/useFormSubmit";
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
  Status,
} from "../components/components";

import {
  Building2,
  FileText,
  Activity,
  Settings,
  XCircle,
  Factory,
  User,
} from "lucide-react";

// !Default values for the form
const WORKSHOP_DEFAULTS = {
  name: "",
  description: "",
  department: "",
  manager: "",
  location: "",
  operational_status: "ACTIVE",
};

const WorkshopForm = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");

  const { user } = useAuth();
  const [managers, setManagers] = useState([]);
  const [workshop, setWorkshop] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState(WORKSHOP_DEFAULTS);
  const { departments, departmentsLoading } = useDepartments();
  const [managersLoading, setManagersLoading] = useState(false);

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
  const handleWorkshopData = useEntityFormData(
    setWorkshop,
    setFormData,
    WORKSHOP_DEFAULTS,
  );

  const fetchManagers = useFetchUsersByRole(
    ["SUPERVISOR", "MANAGER", "ADMIN"],
    setManagersLoading,
    setManagers,
  );

  // !Workshop — only relevant in edit/view mode, shapes formData too
  const fetchWorkshop = useFetchData(
    `workshop/${workshopId}`,
    setFetchLoading,
    handleWorkshopData,
  );

  useEffect(() => {
    if (isEditMode) fetchManagers();
    if (workshopId) fetchWorkshop();
  }, [fetchManagers, fetchWorkshop, isEditMode, workshopId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // !Submit form data
  const method = isEditMode ? "patch" : "post";
  const payload = { ...formData, manager: formData.manager || null };
  const url = isEditMode ? `api/workshop/${workshopId}/` : "api/workshop/";
  const message = `Workshop ${isEditMode ? "updated" : "created"} successfully !!!`;
  const restrictedPayload =
    isEditMode && user?.role === "MANAGER"
      ? { operational_status: payload.operational_status }
      : isEditMode && user?.role === "SUPERVISOR"
        ? Object.fromEntries(
            Object.entries(payload).filter(
              ([k]) =>
                !["name", "description", "department", "location"].includes(k),
            ),
          )
        : payload;

  const HandleSubmit = (e) =>
    submit(e, {
      method,
      url,
      payload: restrictedPayload,
      formData,
      message,
      onSuccess: () => navigate("/workshop"),
    });

  const getDepartmentOptions = () => {
    return departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    }));
  };

  const getManagerOptions = () => {
    return managers.map((mgr) => ({
      value: mgr.id,
      label:
        mgr.first_name && mgr.last_name
          ? `${mgr.first_name} ${mgr.last_name} (${mgr.username})`
          : mgr.username,
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: {
        color: "bg-green-200 text-green-800",
        icon: <Activity size={14} />,
      },
      MAINTENANCE: {
        color: "bg-yellow-200 text-yellow-800",
        icon: <Settings size={14} />,
      },
      INACTIVE: {
        color: "bg-red-200 text-red-800",
        icon: <XCircle size={14} />,
      },
    };
    const config = statusConfig[status] || statusConfig.ACTIVE;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${config.color}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  // !Determine field edit-ability
  const canEditAllFields = user?.role === "ADMIN";
  const canEditLimitedFields = user?.role === "SUPERVISOR";
  const canEditOperationalStatus = user?.role === "MANAGER";

  return (
    <Form
      icon={<Factory />}
      heading={
        isViewMode
          ? "Workshop Details"
          : isEditMode
            ? "Edit Workshop"
            : "Create New Workshop"
      }
      text_01={
        isViewMode
          ? "View workshop information"
          : isEditMode
            ? "Update workshop information and settings"
            : "Add a new workshop to your organization"
      }
      text_02="Workshops"
      onClick={() => navigate("/workshop")}
      fnction={() => navigate(`/workshop/edit/${workshopId}`)}
      gradient="from-orange-600 to-orange-800"
      isViewMode={
        isViewMode &&
        (canEditLimitedFields || canEditOperationalStatus || canEditAllFields)
      }
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            icon={<Factory />}
            label="Workshop Name"
            value={workshop?.name}
          />
          <InfoItem
            icon={<Building2 />}
            label="Department"
            value={workshop?.department_name}
          />
          <InfoItem
            icon={<User />}
            label="Manager"
            value={workshop?.manager_name}
          />
          <Status
            label="Operational Status"
            value={
              workshop?.operational_status &&
              getStatusBadge(workshop.operational_status)
            }
          />
          <div className="md:col-span-2">
            <InfoItem
              icon={<FileText />}
              label="Description"
              value={workshop?.description}
            />
          </div>
        </div>
      ) : (
        // !Edit/Create Mode
        <form onSubmit={HandleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputItem
              label="Workshop Name"
              name="name"
              icon={<Factory />}
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter workshop name"
              error={errors.name}
              disabled={isEditMode && !canEditAllFields}
            />

            <SelectItem
              label="Department"
              name="department"
              icon={<Building2 />}
              value={formData.department}
              onChange={handleChange}
              options={getDepartmentOptions()}
              loading={departmentsLoading}
              error={errors.department}
              required
              disabled={isEditMode && !canEditAllFields}
            />

            <SelectItem
              label="Manager"
              name="manager"
              icon={<User />}
              value={formData.manager}
              onChange={handleChange}
              options={getManagerOptions()}
              loading={managersLoading}
              error={errors.manager}
              disabled={
                isEditMode && !canEditAllFields && !canEditLimitedFields
              }
            />

            <SelectItem
              label="Operational Status"
              name="operational_status"
              icon={<Activity />}
              value={formData.operational_status}
              onChange={handleChange}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "MAINTENANCE", label: "Under Maintenance" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
              error={errors.operational_status}
              required
              disabled={
                isEditMode &&
                !canEditAllFields &&
                !canEditLimitedFields &&
                !canEditOperationalStatus
              }
            />

            <div className="md:col-span-2">
              <TextareaItem
                label="Description"
                name="description"
                icon={<FileText />}
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the workshop's purpose and capabilities"
                error={errors.description}
                disabled={isEditMode && !canEditAllFields}
              />
            </div>
          </div>

          <Buttons
            onCancel={() => navigate("/workshop")}
            text_01={isEditMode ? "Save Changes" : "Create Workshop"}
            disabled={
              loading ||
              (isEditMode &&
                !canEditAllFields &&
                !canEditLimitedFields &&
                !canEditOperationalStatus)
            }
          />
        </form>
      )}
    </Form>
  );
};

export default WorkshopForm;
