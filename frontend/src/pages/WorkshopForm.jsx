import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchData from "../hooks/useFetchData";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  TextareaItem,
  SelectItem,
  InputItem,
  InfoItem,
  Buttons,
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

const WorkshopForm = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");

  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [workshop, setWorkshop] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    manager: "",
    department: "",
    description: "",
    operational_status: "ACTIVE",
  });

  const fetchDepartments = useFetchData(
    "department",
    setDepartmentsLoading,
    setDepartments,
  );

  // !Managers — needs post-fetch filtering, so shape it in the setter
  const fetchManagers = useFetchData("user", setManagersLoading, (data) => {
    const managerUsers = data.filter((u) =>
      ["SUPERVISOR", "MANAGER", "ADMIN"].includes(u.role),
    );
    setManagers(managerUsers);
  });

  // !Workshop — only relevant in edit/view mode, shapes formData too
  const fetchWorkshop = useFetchData(
    `workshop/${workshopId}`,
    setLoading,
    (data) => {
      setWorkshop(data);
      setFormData({
        name: data.name || "",
        description: data.description || "",
        department: data.department || "",
        manager: data.manager || "",
        operational_status: data.operational_status || "ACTIVE",
        location: data.location || "",
      });
    },
  );

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
    if (workshopId) fetchWorkshop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setPageError("");
    setErrors({});

    const payload = {
      ...formData,
      manager: formData.manager || null,
    };

    try {
      let finalPayload = payload;

      if (user.role === "SUPERVISOR" && isEditMode) {
        const {
          name: _name,
          description: _description,
          department: _department,
          location: _location,
          ...supervisorPayload
        } = payload;
        finalPayload = supervisorPayload;
      }
      if (user.role === "MANAGER" && isEditMode) {
        // Managers can only edit operational_status
        finalPayload = {
          operational_status: payload.operational_status,
        };
      }
      if (isEditMode)
        await api.patch(`api/workshop/${workshopId}/`, finalPayload);
      else await api.post("api/workshop/", finalPayload);
      alert("Workshop saved successfully!");
      navigate("/workshop");
    } catch (error) {
      console.error("Form submission error:", error.response);
      const apiErrors = error.response?.data;

      if (apiErrors && typeof apiErrors === "object") {
        const newFormErrors = {};
        for (const key in apiErrors) {
          if (
            Object.prototype.hasOwnProperty.call(formData, key) &&
            Array.isArray(apiErrors[key])
          ) {
            newFormErrors[key] = apiErrors[key].join(" ");
          }
        }
        setErrors(newFormErrors);

        if (Object.keys(newFormErrors).length === 0) {
          setPageError(
            apiErrors.detail || "An error occurred. Please try again.",
          );
        } else setPageError("Please correct the errors below.");
      } else {
        setPageError(
          error.response?.data?.detail ||
            "An error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-sm text-stone-400 mb-2">
              <Activity size={16} />
              Operational Status
            </label>
            {workshop?.operational_status &&
              getStatusBadge(workshop.operational_status)}
          </div>
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
        <form onSubmit={handleSubmit}>
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
