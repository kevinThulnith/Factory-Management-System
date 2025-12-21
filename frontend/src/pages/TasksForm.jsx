import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  InfoItem,
  InputItem,
  SelectItem,
  TextareaItem,
} from "../components/components";

import {
  ListChecks,
  Save,
  XCircle,
  Info,
  CalendarDays,
  Users,
  Activity,
  Target,
  CheckCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

const TasksForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/add");

  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project: "",
    assigned_to: "",
    start_date: "",
    end_date: "",
    status: "PENDING",
  });
  const [associatedProject, setAssociatedProject] = useState(null);

  // Permissions
  const canAlwaysManage = useMemo(
    () => user && (user.role === "ADMIN" || user.role === "SUPERVISOR"),
    [user]
  );

  const isProjectManager = useMemo(
    () =>
      user &&
      associatedProject &&
      associatedProject.project_manager === user.id,
    [user, associatedProject]
  );

  const canCreate = useMemo(
    () =>
      user &&
      (user.role === "ADMIN" ||
        user.role === "SUPERVISOR" ||
        user.role === "MANAGER"),
    [user]
  );

  const canSubmitForm = useMemo(
    () =>
      (isCreateMode && canCreate) ||
      (!isCreateMode && (canAlwaysManage || isProjectManager)),
    [isCreateMode, canCreate, canAlwaysManage, isProjectManager]
  );

  // Data Fetching
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api
        .get("api/project/")
        .then((res) => setAllProjects(res.data.results || res.data)),
      api
        .get("api/user/")
        .then((res) => setAllUsers(res.data.results || res.data)),
    ])
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

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
            console.error("Error fetching project details:", err)
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

        // Fetch project details
        if (res.data.project) {
          api
            .get(`api/project/${res.data.project}/`)
            .then((projRes) => setAssociatedProject(projRes.data))
            .catch((err) =>
              console.error("Error fetching project details:", err)
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

    // Check permissions for managers creating tasks
    if (
      !isCreateMode &&
      user?.role === "MANAGER" &&
      !canAlwaysManage &&
      !isProjectManager
    ) {
      setPageError("You can only edit tasks in projects you manage.");
      return;
    }

    if (isCreateMode && user?.role === "MANAGER" && formData.project) {
      const selectedProject = allProjects.find(
        (p) => p.id === parseInt(formData.project)
      );
      if (
        selectedProject &&
        selectedProject.project_manager !== user.id &&
        !canAlwaysManage
      ) {
        setPageError(
          "Managers can only create tasks for projects they manage."
        );
        return;
      }
    }

    if (!canSubmitForm) {
      setPageError("You do not have permission to save this task.");
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setPageError("Task name is required.");
      return;
    }
    if (!formData.project) {
      setPageError("Project is required.");
      return;
    }
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
      end_date: formData.end_date || null,
      status: formData.status,
    };

    // Only include start_date for edit mode
    if (!isCreateMode && formData.start_date) {
      payload.start_date = formData.start_date;
    }

    try {
      if (isCreateMode) {
        await api.post("api/task/", payload);
      } else {
        await api.patch(`api/task/${taskId}/`, payload);
      }
      alert("Task saved successfully!");
      navigate(
        formData.project ? `/project/view/${formData.project}` : "/task"
      );
    } catch (err) {
      console.error("Error saving task:", err);
      setPageError(
        err.response?.data?.detail ||
          err.response?.data?.name?.[0] ||
          "Failed to save task."
      );
    } finally {
      setLoading(false);
    }
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
    if (fieldName === "start_date" && !isCreateMode) {
      return true;
    }

    return false;
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
                      task.start_date + "T00:00:00Z"
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
              options={allProjects.map((proj) => ({
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

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-stone-500">
            <button
              type="button"
              onClick={() =>
                navigate(
                  formData.project
                    ? `/project/view/${formData.project}`
                    : "/task"
                )
              }
              disabled={loading}
              className="bg-stone-600 hover:bg-stone-700 text-stone-200 font-medium py-2 px-3 rounded-md transition text-[14px] inline-flex items-center gap-2"
            >
              <XCircle size={18} /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmitForm}
              className="bg-emerald-600 hover:bg-emerald-700 text-stone-100 font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} />{" "}
                  {isCreateMode ? "Create Task" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default TasksForm;
