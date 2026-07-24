import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import useFetchUsersByRole from "../hooks/useFetchUsersByRole";
import Consumption from "../components/Consumption";
import useMaterials from "../hooks/useMaterials";
import useProjects from "../hooks/useProjects";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  Buttons,
  InfoItem,
  InputItem,
  SelectItem,
  TextareaItem,
} from "../components/components";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  PlayCircle,
  ListChecks,
  Briefcase,
  Activity,
  XCircle,
  Target,
  Users,
  Info,
} from "lucide-react";

const TasksForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/add");

  const { user } = useAuth();
  const { projects } = useProjects();
  const { materials } = useMaterials();
  const [task, setTask] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [consumptions, setConsumptions] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [associatedProject, setAssociatedProject] = useState(null);
  const [showAddConsumption, setShowAddConsumption] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    project: "",
    end_date: "",
    start_date: "",
    description: "",
    assigned_to: "",
    status: "PENDING",
  });

  // !Fetch components data
  const fetchUsers = useFetchUsersByRole(["OPERATOR"], setLoading, setAllUsers);

  useEffect(() => fetchUsers(), [fetchUsers]);

  const fetchTaskData = useCallback(() => {
    const queryParams = new URLSearchParams(location.search);
    const projectIdFromQuery = queryParams.get("project_id");

    if (!taskId) {
      // New task
      if (projectIdFromQuery) {
        setFormData((prev) => ({
          ...prev,
          project: projectIdFromQuery,
          start_date: new Date().toISOString().split("T")[0],
        }));
        // Fetch project details
        api
          .get(`api/project/${projectIdFromQuery}/`)
          .then((res) => setAssociatedProject(res.data))
          .catch((err) =>
            console.error("Error fetching project details:", err),
          );
      } else {
        setFormData((prev) => ({
          ...prev,
          start_date: new Date().toISOString().split("T")[0],
        }));
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`api/task/${taskId}/`)
      .then((res) => {
        setTask(res.data);
        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          project: res.data.project || "",
          assigned_to: res.data.assigned_to || "",
          start_date: res.data.start_date || "",
          end_date: res.data.end_date || "",
          status: res.data.status || "PENDING",
        });
        // Load consumptions from nested serializer data
        setConsumptions(res.data.consumed_materials || []);

        // Fetch project details
        if (res.data.project) {
          api
            .get(`api/project/${res.data.project}/`)
            .then((projRes) => setAssociatedProject(projRes.data))
            .catch((err) =>
              console.error("Error fetching project details:", err),
            );
        }
      })
      .catch((error) => {
        console.error("Failed to load task details:", error);
        setPageError("Failed to load task details.");
      })
      .finally(() => setLoading(false));
  }, [taskId, location.search]);

  useEffect(() => {
    fetchTaskData();
  }, [fetchTaskData]);

  // --- Material Consumption ---
  const fetchConsumptions = useCallback(() => {
    if (!taskId) return;
    api
      .get(`api/task/${taskId}/`)
      .then((res) => setConsumptions(res.data.consumed_materials || []))
      .catch((err) => console.error("Error refreshing consumptions:", err));
  }, [taskId]);

  // Permissions
  const canAlwaysManage = user && ["ADMIN", "SUPERVISOR"].includes(user.role);

  const isProjectManager = useMemo(() => {
    if (!user || !formData.project) return false;
    return (
      projects.find((p) => p.id === parseInt(formData.project))
        ?.project_manager === user.id
    );
  }, [user, formData.project, projects]);

  const canCreate =
    user && ["ADMIN", "SUPERVISOR", "MANAGER"].includes(user.role);

  const canSubmitForm =
    (isCreateMode && canCreate) ||
    (!isCreateMode && (canAlwaysManage || isProjectManager));

  const canAddConsumption = canSubmitForm || user?.role === "OPERATOR";

  const handleAddConsumption = async (payload) => {
    setActionLoading(true);
    try {
      await api.post("api/material-consumption/", {
        ...payload,
        task: parseInt(taskId),
      });
      setShowAddConsumption(false);
      fetchConsumptions();
      // Refresh materials to update stock quantities
      window.location.reload();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        Object.values(err.response?.data || {})
          .flat()
          .join(", ") ||
        "Failed to add consumption.";
      setPageError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConsumption = async (consumptionId) => {
    if (
      !window.confirm("Delete this consumption record? Stock will be restored.")
    )
      return;
    setActionLoading(true);
    try {
      await api.delete(`api/material-consumption/${consumptionId}/`);
      fetchConsumptions();
      window.location.reload();
    } catch {
      setPageError("Failed to delete consumption record.");
    } finally {
      setActionLoading(false);
    }
  };

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If project changes, fetch new project details
    if (name === "project" && value) {
      api
        .get(`api/project/${value}/`)
        .then((res) => setAssociatedProject(res.data))
        .catch((err) => console.error("Error fetching project details:", err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmitForm) {
      setPageError(
        isCreateMode
          ? "You do not have permission to create tasks for this project."
          : "You can only edit tasks in projects you manage.",
      );
      return;
    }

    // Validation
    if (
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      setPageError("End date cannot be before start date.");
      return;
    }

    setLoading(true);
    setPageError("");

    const payload = {
      name: formData.name,
      description: formData.description || null,
      project: parseInt(formData.project),
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
    };

    const url = isCreateMode ? "api/task/" : `api/task/${taskId}/`;
    const method = isCreateMode ? "post" : "patch";

    api[method](url, payload)
      .then(() => {
        alert(`Task ${isCreateMode ? "created" : "saved"} successfully !!!`);
        navigate("/task");
      })
      .catch((err) => {
        console.error("Error saving task:", err);
        setPageError(
          err.response?.data?.detail ||
            Object.values(err.response?.data || {})
              .flat()
              .join(", ") ||
            "Failed to save task.",
        );
      })
      .finally(() => setLoading(false));
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        color: "bg-yellow-200 text-yellow-800",
        icon: <Target size={14} />,
      },
      IN_PROGRESS: {
        color: "bg-blue-200 text-blue-800",
        icon: <PlayCircle size={14} />,
      },
      COMPLETED: {
        color: "bg-green-200 text-green-800",
        icon: <CheckCircle size={14} />,
      },
      BLOCKED: {
        color: "bg-red-200 text-red-800",
        icon: <AlertTriangle size={14} />,
      },
      CANCELLED: {
        color: "bg-gray-200 text-gray-800",
        icon: <XCircle size={14} />,
      },
    }[status];
    if (!config) return null;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${config.color}`}
      >
        {config.icon} {status}
      </span>
    );
  };

  const isFieldDisabled = (fieldName) => {
    const formDisabled = !isCreateMode && !canSubmitForm;
    if (formDisabled) return true;

    // Project field disabled if editing or if project_id in query params
    if (
      fieldName === "project" &&
      (!isCreateMode || new URLSearchParams(location.search).get("project_id"))
    ) {
      return true;
    }

    // Start date disabled in edit mode
    return fieldName === "start_date" && !isCreateMode;
  };

  return (
    <Form
      icon={<ListChecks />}
      heading={
        isViewMode ? "View Task" : isCreateMode ? "Add New Task" : "Edit Task"
      }
      text_01={
        isViewMode
          ? "View details of the task."
          : isCreateMode
            ? "Fill in the details to add a new task."
            : "Modify the details of the task."
      }
      text_02={"Tasks"}
      onClick={() => navigate("/task")}
      fnction={() => navigate("/task/edit/" + taskId)}
      gradient={"from-emerald-600 to-emerald-800"}
      isViewMode={isViewMode}
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem
              icon={<ListChecks />}
              label="Task Name"
              value={task?.name}
            />
            <InfoItem
              icon={<Briefcase />}
              label="Project"
              value={task?.project_name || "N/A"}
            />
            <InfoItem
              icon={<Users />}
              label="Assigned To"
              value={task?.assigned_to_name || "Unassigned"}
            />
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm text-stone-400 mb-2">
                <Activity size={16} /> Status
              </label>
              {task?.status && getStatusBadge(task.status)}
            </div>
            <InfoItem
              icon={<CalendarDays />}
              label="Start Date"
              value={
                task?.start_date
                  ? new Date(
                      task.start_date + "T00:00:00Z",
                    ).toLocaleDateString()
                  : "N/A"
              }
            />
            <InfoItem
              icon={<CalendarDays />}
              label="Due Date"
              value={
                task?.end_date
                  ? new Date(task.end_date + "T00:00:00Z").toLocaleDateString()
                  : "Not set"
              }
            />
          </div>
          <InfoItem
            icon={<Info />}
            label="Description"
            value={task?.description || "No description provided."}
          />

          {/* Material Consumption Section - View Mode */}
          <Consumption
            materials={materials}
            consumptions={consumptions}
            canAdd={canAddConsumption}
            canDelete={canSubmitForm}
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
            <div className="md:col-span-2">
              <InputItem
                label="Task Name"
                name="name"
                icon={<ListChecks />}
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isFieldDisabled("name")}
              />
            </div>
            <SelectItem
              label="Project"
              name="project"
              icon={<Briefcase />}
              value={formData.project}
              onChange={handleChange}
              options={projects.map((proj) => ({
                value: proj.id,
                label: proj.name,
              }))}
              required
              disabled={isFieldDisabled("project")}
            />
            <SelectItem
              label="Assigned To"
              name="assigned_to"
              icon={<Users />}
              value={formData.assigned_to}
              onChange={handleChange}
              options={[
                { value: "", label: "Unassigned" },
                ...allUsers.map((usr) => ({
                  value: usr.id,
                  label: `${usr.first_name || usr.username} ${
                    usr.last_name || ""
                  } (${usr.role})`,
                })),
              ]}
              disabled={isFieldDisabled("assigned_to")}
            />
            <SelectItem
              label="Status"
              name="status"
              icon={<Activity />}
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "BLOCKED", label: "Blocked" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              required
              disabled={isFieldDisabled("status")}
            />
            {formData.start_date && (
              <InputItem
                label={
                  isCreateMode ? "Start Date" : "Start Date (Set on creation)"
                }
                name="start_date"
                icon={<CalendarDays />}
                value={formData.start_date}
                onChange={handleChange}
                type="date"
                disabled={isFieldDisabled("start_date")}
              />
            )}
            <InputItem
              label="Due Date"
              name="end_date"
              icon={<CalendarDays />}
              value={formData.end_date}
              onChange={handleChange}
              type="date"
              disabled={isFieldDisabled("end_date")}
            />
            <div className="md:col-span-2">
              <TextareaItem
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                disabled={isFieldDisabled("description")}
              />
            </div>
          </div>

          {!canSubmitForm && !loading && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-300 flex items-center gap-2">
                <AlertTriangle size={14} />
                You are viewing this task in read-only mode.
              </p>
            </div>
          )}

          {associatedProject && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-xs text-blue-300 flex items-center gap-2">
                <Info size={14} />
                Task belongs to project:{" "}
                <strong>{associatedProject.name}</strong>
              </p>
            </div>
          )}

          {/* Material Consumption Section - Edit Mode */}
          {!isCreateMode && (
            <Consumption
              materials={materials}
              consumptions={consumptions}
              canAdd={canAddConsumption}
              canDelete={canSubmitForm}
              showAddConsumption={showAddConsumption}
              setShowAddConsumption={setShowAddConsumption}
              onSave={handleAddConsumption}
              onDelete={handleDeleteConsumption}
              loading={actionLoading}
            />
          )}

          <Buttons
            onCancel={() =>
              navigate(
                formData.project
                  ? `/project/view/${formData.project}`
                  : "/task",
              )
            }
            text_01={isCreateMode ? "Create Task" : "Save Changes"}
            disabled={loading || !canSubmitForm}
          />
        </form>
      )}
    </Form>
  );
};

export default TasksForm;
