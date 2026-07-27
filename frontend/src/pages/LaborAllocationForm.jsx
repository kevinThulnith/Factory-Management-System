import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchUsersByRole from "../hooks/useFetchUsersByRole";
import useProductionLines from "../hooks/useProductionLines";
import useFormSubmit from "../hooks/useFormSubmit";
import useFetchData from "../hooks/useFetchData";
import useProjects from "../hooks/useProjects";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  createElement,
} from "react";

import {
  Buttons,
  InfoItem,
  InputItem,
  SelectItem,
} from "../components/components";

import {
  Info,
  Clock,
  Factory,
  Briefcase,
  UserRound,
  ListChecks,
  UsersRound,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

const LaborAllocationForm = () => {
  const { allocationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/add");

  const { user } = useAuth();
  const { projects } = useProjects();
  const [allTasks, setAllTasks] = useState([]);
  const { productionLines } = useProductionLines();
  const [allEmployees, setEmployees] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState({
    task: "",
    project: "",
    employee: "",
    production_line: "",
    hours_allocated: "1.00",
    allocation_type: "project",
    date: new Date().toISOString().split("T")[0],
  });

  // !Form submission state + handler now come from the hook itself
  const {
    loading: submitLoading,
    pageError,
    setPageError,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Permission Checks
  const canManage =
    user && ["ADMIN", "SUPERVISOR", "MANAGER"].includes(user.role);

  // !Fetch component data
  const fetchEmployees = useFetchUsersByRole(
    ["OPERATOR"],
    setFetchLoading,
    setEmployees,
  );

  // Fetch tasks for selected project
  const fetchTasksForProject = useCallback(async (projectId) => {
    if (!projectId) {
      setAllTasks([]);
      return;
    }

    api
      .get("api/task/", { params: { project: projectId } })
      .then((response) => {
        const tasks = response.data.results || response.data;
        const filtered = tasks.filter((t) => {
          const taskProjectId =
            t.project && typeof t.project === "object"
              ? t.project.id
              : t.project;
          return String(taskProjectId) === String(projectId);
        });
        setAllTasks(filtered);
      })
      .catch((err) => {
        console.error(`Error fetching tasks for project ${projectId}:`, err);
        setAllTasks([]);
      });
  }, []);

  // !Fetch allocation details if editing or viewing
  const HandleAllocationData = useCallback(
    (data) => {
      setAllocation(data);
      const allocationType = data.task
        ? "task"
        : data.production_line
          ? "production_line"
          : "project";

      setFormData({
        employee: data.employee || "",
        allocation_type: allocationType,
        project: data.project || "",
        task: data.task || "",
        production_line: data.production_line || "",
        hours_allocated: parseFloat(data.hours_allocated || 1).toFixed(2),
        date: data.date || new Date().toISOString().split("T")[0],
      });

      if (allocationType === "task" && data.project) {
        fetchTasksForProject(data.project);
      }
    },
    [fetchTasksForProject],
  );

  const fetchAllocationData = useFetchData(
    `allocation/${allocationId}`,
    setFetchLoading,
    HandleAllocationData,
  );

  useEffect(() => {
    fetchEmployees();
    fetchAllocationData();
  }, [fetchAllocationData, fetchEmployees]);

  // Fetch tasks when project changes for task allocation
  useEffect(() => {
    if (formData.allocation_type === "task" && formData.project) {
      fetchTasksForProject(formData.project);
    } else setAllTasks([]);
  }, [formData.project, formData.allocation_type, fetchTasksForProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      // Reset target fields when allocation type changes
      if (name === "allocation_type") {
        if (value === "project") {
          newState.task = "";
          newState.production_line = "";
        } else if (value === "task") {
          newState.production_line = "";
        } else if (value === "production_line") {
          newState.project = "";
          newState.task = "";
        }
      }

      // Reset task when project changes
      if (name === "project" && newState.allocation_type === "task") {
        newState.task = "";
      }

      return newState;
    });
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const HandleSubmit = (e) => {
    // Validation
    if (!canManage) {
      e.preventDefault();
      setPageError("You do not have permission to save this allocation.");
      return;
    }

    // ?Validate based on allocation type

    // Validate project allocation
    if (formData.allocation_type === "project" && !formData.project) {
      e.preventDefault();
      setPageError("Project is required for this allocation type.");
      return;
    }

    // Validate task allocation
    if (formData.allocation_type === "task") {
      if (!formData.project) {
        e.preventDefault();
        setPageError("Project is required to select a task.");
        return;
      }
      if (!formData.task) {
        e.preventDefault();
        setPageError("Task is required for this allocation type.");
        return;
      }
    }

    // Validate production line allocation
    if (
      formData.allocation_type === "production_line" &&
      !formData.production_line
    ) {
      e.preventDefault();
      setPageError("Production Line is required for this allocation type.");
      return;
    }

    const payload = {
      employee: parseInt(formData.employee),
      hours_allocated: parseFloat(formData.hours_allocated).toFixed(2),
      date: formData.date,
    };

    // Add target fields based on allocation type
    if (
      formData.allocation_type === "project" ||
      formData.allocation_type === "task"
    ) {
      if (formData.project) {
        payload.project = parseInt(formData.project);
      }
    }

    if (formData.allocation_type === "task" && formData.task) {
      payload.task = parseInt(formData.task);
    }

    if (
      formData.allocation_type === "production_line" &&
      formData.production_line
    ) {
      payload.production_line = parseInt(formData.production_line);
    }

    const isEditing = allocationId && !isCreateMode;
    const method = isEditing ? "patch" : "post";
    const url = isEditing
      ? `api/allocation/${allocationId}/`
      : "api/allocation/";
    const message = `Labor Allocation ${isEditing ? "updated" : "created"} successfully!`;

    submit(e, {
      method,
      url,
      payload,
      formData,
      message,
      onSuccess: () => navigate("/labor-allocation"),
    });
  };

  // Generate employee options
  const employeeOptions = useMemo(
    () =>
      allEmployees.map((emp) => ({
        value: emp.id,
        label:
          emp.first_name && emp.last_name
            ? `${emp.first_name} ${emp.last_name} (${emp.username}) - ${emp.role}`
            : `${emp.username} - ${emp.role}`,
      })),
    [allEmployees],
  );

  // Generate project options
  const projectOptions = useMemo(
    () =>
      projects.map((proj) => ({
        value: proj.id,
        label: proj.name,
      })),
    [projects],
  );

  // Generate task options
  const taskOptions = useMemo(
    () =>
      allTasks.map((task) => ({
        value: task.id,
        label: task.name,
      })),
    [allTasks],
  );

  // Generate production line options
  const productionLineOptions = useMemo(
    () =>
      productionLines.map((line) => ({
        value: line.id,
        label: line.name,
      })),
    [productionLines],
  );

  const allocationTypeOptions = [
    { value: "task", label: "Task" },
    { value: "project", label: "Project" },
    { value: "production_line", label: "Production Line" },
  ];

  const getTypeIconComponent = (type) => {
    switch (type) {
      case "task":
        return ListChecks;
      case "project":
        return Briefcase;
      case "production_line":
        return Factory;
      default:
        return AlertTriangle;
    }
  };

  const getTargetName = () => {
    if (allocation) {
      if (allocation.task_name) return allocation.task_name;
      if (allocation.project_name) return allocation.project_name;
      if (allocation.production_line_name)
        return allocation.production_line_name;
    }
    return "N/A";
  };

  return (
    <Form
      icon={<UsersRound />}
      heading={
        isViewMode
          ? "Labor Allocation Details"
          : allocationId
            ? "Edit Labor Allocation"
            : "Create New Labor Allocation"
      }
      text_01={
        isViewMode
          ? "View allocation details"
          : allocationId
            ? "Update allocation information"
            : "Assign employee to project, task, or production line"
      }
      text_02="Allocations"
      onClick={() => navigate("/labor-allocation")}
      fnction={() => navigate(`/labor-allocation/edit/${allocationId}`)}
      gradient="from-orange-600 to-amber-800"
      isViewMode={isViewMode}
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee */}
          <InfoItem
            icon={<UserRound />}
            label="Employee"
            value={
              allocation?.employee_name ||
              allocation?.employee_username ||
              "N/A"
            }
          />
          {/* Allocation Date */}
          <InfoItem
            icon={<CalendarDays />}
            label="Date"
            value={
              allocation?.date
                ? new Date(allocation.date + "T00:00:00Z").toLocaleDateString()
                : "N/A"
            }
          />

          {/* Hours Allocated */}
          <InfoItem
            icon={<Clock />}
            label="Hours Allocated"
            value={
              allocation?.hours_allocated
                ? `${parseFloat(allocation.hours_allocated).toFixed(2)} hours`
                : "N/A"
            }
          />

          {/* Allocation Type */}
          <InfoItem
            icon={<Info />}
            label="Allocation Type"
            value={
              allocation?.task
                ? "Task"
                : allocation?.production_line
                  ? "Production Line"
                  : "Project"
            }
          />

          {/* Target */}
          <InfoItem
            icon={createElement(
              getTypeIconComponent(
                allocation?.task
                  ? "task"
                  : allocation?.production_line
                    ? "production_line"
                    : "project",
              ),
            )}
            label="Target"
            value={getTargetName()}
          />

          {/* Show project separately if task allocation */}
          {allocation?.project_name && allocation?.task_name && (
            <InfoItem
              icon={<Briefcase />}
              label="Project"
              value={allocation.project_name}
            />
          )}

          <InfoItem
            icon={<Clock />}
            label="Last Updated"
            value={
              allocation?.updated_at
                ? new Date(allocation.updated_at).toLocaleString()
                : "N/A"
            }
          />
        </div>
      ) : (
        <form onSubmit={HandleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <SelectItem
              icon={<UserRound />}
              label="Employee"
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              options={employeeOptions}
              required
            />

            {/* Allocation Date */}
            <InputItem
              icon={<CalendarDays />}
              label="Allocation Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            {/* Hours Allocated */}
            <InputItem
              icon={<Clock />}
              label="Hours Allocated"
              type="text"
              name="hours_allocated"
              value={formData.hours_allocated}
              onChange={handleDecimalChange}
              required
              placeholder="1.00"
              inputMode="decimal"
            />

            {/* Allocation Type */}
            <SelectItem
              icon={<Info />}
              label="Allocate To"
              name="allocation_type"
              value={formData.allocation_type}
              onChange={handleChange}
              options={allocationTypeOptions}
              required
            />

            {/* Project Allocation */}
            {formData.allocation_type === "project" && (
              <SelectItem
                icon={<Briefcase />}
                label="Project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                options={projectOptions}
                required
              />
            )}

            {/* Task Allocation */}
            {formData.allocation_type === "task" && (
              <>
                <SelectItem
                  icon={<Briefcase />}
                  label="Project (for Task)"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  options={projectOptions}
                  required
                />
                {formData.project && (
                  <SelectItem
                    icon={<ListChecks />}
                    label="Task"
                    name="task"
                    value={formData.task}
                    onChange={handleChange}
                    options={taskOptions}
                    required
                    disabled={allTasks.length === 0}
                  />
                )}
              </>
            )}

            {/* Production Line Allocation */}
            {formData.allocation_type === "production_line" && (
              <SelectItem
                icon={<Factory />}
                label="Production Line"
                name="production_line"
                value={formData.production_line}
                onChange={handleChange}
                options={productionLineOptions}
                required
              />
            )}
          </div>

          <Buttons
            onCancel={() => navigate("/labor-allocation")}
            text_01={allocationId ? "Save Changes" : "Create Allocation"}
          />
        </form>
      )}
    </Form>
  );
};

export default LaborAllocationForm;
