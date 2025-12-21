import LoadingIndicator from "../components/LoadingIndicator";
import useWebSocket from "../hooks/useWebSocket";
import useFetchData from "../hooks/useFetchData";
import useDelete from "../hooks/useDelete";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import {
  Briefcase,
  CheckCircle,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Activity,
  XCircle,
  Target,
  Trash2,
  Search,
  Filter,
  Edit3,
  Clock,
  Eye,
  Users,
  CalendarDays,
  PlayCircle,
  AlertTriangle,
  TrendingUp,
  ListChecks,
} from "lucide-react";
import api from "../api";

const Projects = () => {
  const { user } = useAuth();
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
    managerId: "",
  });

  const fetchProjects = useFetchData("project", setLoading, setAllProjects);

  useWebSocket("projects", setAllProjects, fetchProjects);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDelete = useDelete(
    "project",
    setLoading,
    "project",
    fetchProjects
  );

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFiltersHandler = () => {
    setFilters({ searchTerm: "", status: "all", managerId: "" });
  };

  const handleStatusUpdate = async (projectId, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to update this project to "${newStatus}"?`
      )
    )
      return;

    setLoading(true);
    try {
      await api.patch(`api/project/${projectId}/`, {
        project_status: newStatus,
      });
      await fetchProjects();
      alert("Project status updated successfully!");
    } catch (error) {
      console.error("Error updating project status:", error);
      alert(
        `Failed to update project status: ${
          error.response?.data?.detail ||
          error.response?.data?.project_status?.join(" ") ||
          "Server error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return allProjects
      .filter((project) => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          !filters.searchTerm ||
          project.name?.toLowerCase().includes(searchTermLower) ||
          project.description?.toLowerCase().includes(searchTermLower) ||
          project.project_manager_name
            ?.toLowerCase()
            .includes(searchTermLower) ||
          project.id?.toString().includes(searchTermLower);

        const matchesStatus =
          filters.status === "all" || project.project_status === filters.status;

        const matchesManager =
          !filters.managerId ||
          project.project_manager?.toString() === filters.managerId;

        return matchesSearch && matchesStatus && matchesManager;
      })
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }, [allProjects, filters]);

  const stats = useMemo(
    () => ({
      total: allProjects.length,
      planning: allProjects.filter((p) => p.project_status === "PLANNING")
        .length,
      inProgress: allProjects.filter((p) => p.project_status === "IN_PROGRESS")
        .length,
      completed: allProjects.filter((p) => p.project_status === "COMPLETED")
        .length,
      onHold: allProjects.filter((p) => p.project_status === "ON_HOLD").length,
      cancelled: allProjects.filter((p) => p.project_status === "CANCELLED")
        .length,
    }),
    [allProjects]
  );

  const canCreate =
    user &&
    (user.role === "ADMIN" ||
      user.role === "SUPERVISOR" ||
      user.role === "MANAGER");
  const canEdit =
    user &&
    (user.role === "ADMIN" ||
      user.role === "SUPERVISOR" ||
      user.role === "MANAGER");
  const canDelete = user && user.role === "ADMIN";
  const canUpdateStatus =
    user &&
    (user.role === "ADMIN" ||
      user.role === "SUPERVISOR" ||
      user.role === "MANAGER");

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANNING: {
        color: "bg-gray-200 text-gray-800",
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
      ON_HOLD: {
        color: "bg-yellow-200 text-yellow-800",
        icon: <Clock size={14} />,
      },
      CANCELLED: {
        color: "bg-red-200 text-red-800",
        icon: <XCircle size={14} />,
      },
    };
    const config = statusConfig[status] || statusConfig.PLANNING;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${config.color}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen py-6">
        <div className="w-full">
          {/* Header Section */}
          <div className="rounded-2xl p-8 shadow-md mb-8 bg-card-main">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start">
                <div className="p-3 rounded-2xl mb-4 sm:mb-0 sm:mr-6 shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-800 transform hover:scale-105 transition-all duration-300">
                  <Briefcase size={90} className="text-stone-200" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-medium mb-2 tracking-tight">
                    Projects Overview
                  </h1>
                  <p className="text-star-dust-400 text-1xl">
                    Track and manage all ongoing and completed projects.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-2">
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-indigo-600">
                      Total: <span className="font-medium">{stats.total}</span>
                    </span>
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-gray-600">
                      Planning:{" "}
                      <span className="font-medium">{stats.planning}</span>
                    </span>
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-blue-600">
                      In Progress:{" "}
                      <span className="font-medium">{stats.inProgress}</span>
                    </span>
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-green-600">
                      Completed:{" "}
                      <span className="font-medium">{stats.completed}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 lg:mt-0">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-3 py-2 rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl text-[14px] bg-yellow-500 hover:scale-105 text-stone-700"
                >
                  <RefreshCw
                    size={18}
                    className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                {canCreate && (
                  <Link
                    to="/project/add"
                    className="px-3 py-2 text-stone-200 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600"
                  >
                    <PlusCircle size={20} className="mr-2" />
                    New Project
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card-main rounded-xl p-6 mb-8 shadow-md">
            <h3 className="flex items-center text-slate-300 mb-4">
              <Filter size={15} className="mr-2" /> Search & Filters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Search by name, description, manager..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border-none outline-none rounded-lg bg-card-sub"
                />
              </div>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none py-2"
              >
                <option value="all">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                onClick={resetFiltersHandler}
                className="px-4 py-2 duration-200 font-medium bg-blue-600 rounded-lg hover:scale-105 inline-flex items-center justify-center"
              >
                <RotateCcw size={16} className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Content Area */}
          {allProjects.length === 0 && !loading ? (
            <div className="bg-[#2a2a2a] rounded-xl p-12 text-center shadow-lg border border-stone-700">
              <Briefcase size={64} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-stone-300 mb-2">
                No Projects Found
              </h3>
              <p className="text-stone-400">
                Try adjusting your filters or create your first project.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-card-main shadow-md rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Main Info */}
                    <div className="flex-grow space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-medium text-stone-200 flex items-center gap-2 mb-4">
                            <Briefcase size={28} className="text-indigo-400" />
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(project.project_status)}
                          </div>
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-sm text-stone-400 mt-2">
                          {project.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-stone-400">
                          <Users size={16} className="mr-2 text-indigo-400" />
                          <span className="mr-2">Manager:</span>
                          <span className="text-stone-300 font-medium">
                            {project.project_manager_name || (
                              <span className="italic text-gray-500">
                                Unassigned
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-stone-400">
                          <ListChecks
                            size={16}
                            className="mr-2 text-green-400"
                          />
                          <span className="mr-2">Tasks:</span>
                          <span className="text-stone-300 font-medium">
                            {project.tasks_count || 0} total
                          </span>
                        </div>
                        <div className="flex items-center text-stone-400">
                          <CalendarDays
                            size={16}
                            className="mr-2 text-blue-400"
                          />
                          <span className="mr-2">Start:</span>
                          <span className="text-stone-300 font-medium">
                            {new Date(
                              project.start_date + "T00:00:00Z"
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {project.end_date && (
                          <div className="flex items-center text-stone-400">
                            <CalendarDays
                              size={16}
                              className="mr-2 text-red-400"
                            />
                            <span className="mr-2">End:</span>
                            <span className="text-stone-300 font-medium">
                              {new Date(
                                project.end_date + "T00:00:00Z"
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Recent Tasks */}
                      {project.recent_tasks &&
                        project.recent_tasks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-stone-700">
                            <h4 className="text-sm font-medium text-stone-300 mb-2">
                              Recent Tasks:
                            </h4>
                            <div className="space-y-1">
                              {project.recent_tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="text-xs text-stone-400 flex items-center gap-2"
                                >
                                  <Activity size={12} />
                                  {task.name} -{" "}
                                  <span
                                    className={`${
                                      task.status === "COMPLETED"
                                        ? "text-green-400"
                                        : task.status === "IN_PROGRESS"
                                        ? "text-blue-400"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {task.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex lg:flex-col items-center gap-2 lg:border-l lg:border-stone-700 lg:pl-6">
                      <Link
                        to={`/project/view/${project.id}`}
                        className="text-cyan-200 hover:text-black transition duration-200 p-2 hover:bg-cyan-200 rounded-full shadow-sm"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </Link>

                      {canEdit &&
                        (user.role === "ADMIN" ||
                          project.project_manager === user.id) && (
                          <Link
                            to={`/project/edit/${project.id}`}
                            className="text-indigo-200 hover:text-indigo-800 transition duration-200 p-2 hover:bg-indigo-100 rounded-full shadow-sm"
                            title="Edit Project"
                          >
                            <Edit3 size={20} />
                          </Link>
                        )}

                      {canUpdateStatus &&
                        project.project_status === "PLANNING" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(project.id, "IN_PROGRESS")
                            }
                            className="text-blue-200 hover:text-blue-800 transition duration-200 p-2 hover:bg-blue-100 rounded-full shadow-sm"
                            title="Start Project"
                          >
                            <PlayCircle size={20} />
                          </button>
                        )}

                      {canUpdateStatus &&
                        project.project_status === "IN_PROGRESS" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(project.id, "COMPLETED")
                              }
                              className="text-green-200 hover:text-green-800 transition duration-200 p-2 hover:bg-green-100 rounded-full shadow-sm"
                              title="Mark Completed"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(project.id, "ON_HOLD")
                              }
                              className="text-yellow-200 hover:text-yellow-800 transition duration-200 p-2 hover:bg-yellow-100 rounded-full shadow-sm"
                              title="Put On Hold"
                            >
                              <Clock size={20} />
                            </button>
                          </>
                        )}

                      {canUpdateStatus &&
                        project.project_status === "ON_HOLD" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(project.id, "IN_PROGRESS")
                            }
                            className="text-blue-200 hover:text-blue-800 transition duration-200 p-2 hover:bg-blue-100 rounded-full shadow-sm"
                            title="Resume Project"
                          >
                            <PlayCircle size={20} />
                          </button>
                        )}

                      {canUpdateStatus &&
                        (project.project_status === "PLANNING" ||
                          project.project_status === "IN_PROGRESS" ||
                          project.project_status === "ON_HOLD") && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(project.id, "CANCELLED")
                            }
                            className="text-orange-200 hover:text-orange-800 transition duration-200 p-2 hover:bg-orange-100 rounded-full shadow-sm"
                            title="Cancel Project"
                          >
                            <XCircle size={20} />
                          </button>
                        )}

                      {canDelete &&
                        (project.project_status === "PLANNING" ||
                          project.project_status === "CANCELLED") && (
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-200 hover:text-red-800 transition duration-200 p-2 hover:bg-red-100 rounded-full shadow-sm"
                            title="Delete Project"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingIndicator />}
    </>
  );
};

export default Projects;
