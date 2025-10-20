import React, { useEffect, useState, useMemo, useCallback } from "react";
import LoadingIndicator from "../components/LoadingIndicator";
import { Link } from "react-router-dom";
import api from "../api";

import {
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Building2,
  Activity,
  Settings,
  Factory,
  XCircle,
  Search,
  Filter,
  Trash2,
  Users,
  Edit3,
  Eye,
} from "lucide-react";

function Workshop() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allWorkshops, setAllWorkshops] = useState([]);

  const [filters, setFilters] = useState({
    status: "all",
    searchTerm: "",
    department: "all",
  });

  const fetchWorkshops = useCallback(() => {
    setLoading(true);
    api
      .get("api/workshop/")
      .then((res) => setAllWorkshops(res.data.results || res.data))
      .catch(() => alert("Failed to fetch workshops. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("api/user/me/")
      .then((res) => setUser(res.data))
      .catch((error) => console.error("Failed to fetch user:", error));
    fetchWorkshops();
  }, [fetchWorkshops]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWorkshops();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeleteWorkshop = (workshopId, workshopName) => {
    if (
      window.confirm(
        `Are you sure you want to delete workshop "${workshopName}"?`
      )
    ) {
      api
        .delete(`api/workshop/${workshopId}/`)
        .then(() => {
          setAllWorkshops((prevWorkshops) =>
            prevWorkshops.filter((workshop) => workshop.id !== workshopId)
          );
          alert(`Workshop "${workshopName}" has been deleted.`);
        })
        .catch(() => alert("Failed to delete workshop. Please try again."));
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFiltersHandler = () => {
    setFilters({ searchTerm: "", status: "all", department: "all" });
  };

  const applyFilters = () => fetchWorkshops();

  // Workshop statuses
  const workshopStatuses = ["ACTIVE", "MAINTENANCE", "INACTIVE"];

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Activity size={14} className="text-green-600" />;
      case "MAINTENANCE":
        return <Settings size={14} className="text-yellow-600" />;
      case "INACTIVE":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <AlertTriangle size={14} className="text-gray-600" />;
    }
  };

  const getStatusPill = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border border-green-200",
      MAINTENANCE: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      INACTIVE: "bg-red-100 text-red-800 border border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  // Get unique departments for filter
  const uniqueDepartments = useMemo(() => {
    const depts = new Set();
    allWorkshops.forEach((workshop) => {
      if (workshop.department_name) depts.add(workshop.department_name);
    });
    return Array.from(depts).sort();
  }, [allWorkshops]);

  const filteredWorkshops = useMemo(() => {
    return allWorkshops.filter((workshop) => {
      const matchesSearch =
        !filters.searchTerm ||
        workshop.name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        workshop.department_name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        workshop.manager_details?.name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" ||
        workshop.operational_status === filters.status;

      const matchesDepartment =
        filters.department === "all" ||
        workshop.department_name === filters.department;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [allWorkshops, filters]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: allWorkshops.length,
      active: allWorkshops.filter((w) => w.operational_status === "ACTIVE")
        .length,
      maintenance: allWorkshops.filter(
        (w) => w.operational_status === "MAINTENANCE"
      ).length,
      inactive: allWorkshops.filter((w) => w.operational_status === "INACTIVE")
        .length,
    };
  }, [allWorkshops]);

  // Check permissions
  const canCreate = user && (user.role === "ADMIN" || user.role === "MANAGER");
  const canDelete =
    user && (user.role === "ADMIN" || user.role === "SUPERVISOR");

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="rounded-2xl p-8 shadow-md mb-8 bg-card-main">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl mr-6 shadow-lg bg-gradient-to-r from-orange-600 to-orange-800 transform hover:scale-105 transition-all duration-300">
                  <Factory size={90} className="text-stone-200" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium mb-2 tracking-tight">
                    Workshop Management
                  </h1>
                  <p className="text-star-dust-400 text-1xl">
                    Manage and monitor your factory workshops with advanced
                    controls.
                  </p>
                  <div className="flex items-center mt-3 space-x-4">
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-orange-600">
                      Total Workshops:{" "}
                      <span className="font-medium">{stats.total}</span>
                    </span>
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-green-600">
                      Active:{" "}
                      <span className="font-medium">{stats.active}</span>
                    </span>
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-yellow-600">
                      Maintenance:{" "}
                      <span className="font-medium">{stats.maintenance}</span>
                    </span>
                    <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-red-600">
                      Inactive:{" "}
                      <span className="font-medium">{stats.inactive}</span>
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
                    to="/workshop/add"
                    className="px-3 py-2 text-stone-200 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600"
                  >
                    <PlusCircle size={20} className="mr-2" />
                    Add New Workshop
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-card-main rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-4 text-slate-300">
              <Filter size={15} className="mx-2" />
              <h3>Search & Filters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder="Search workshops..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border-none outline-none rounded-lg bg-card-sub"
                  style={{ height: "40px" }}
                />
              </div>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none"
                style={{ height: "40px" }}
              >
                <option value="all">All Status</option>
                {workshopStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none"
                style={{ height: "40px" }}
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <button
                onClick={resetFiltersHandler}
                className="flex-1 px-4 py-3 duration-200 font-medium bg-blue-600 rounded-lg hover:scale-105"
                style={{ height: "40px", lineHeight: "16px" }}
              >
                <RotateCcw size={16} className="mr-2 inline" />
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all bg-yellow-600 hover:scale-105 inline-flex items-center justify-center"
                style={{ height: "40px", lineHeight: "16px" }}
              >
                <Filter size={16} className="mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Workshops Table */}
          {allWorkshops.length === 0 && !loading ? (
            <div className="border rounded-xl p-12 text-center shadow-lg backdrop-blur-sm">
              <Factory size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Workshops Found
              </h3>
              <p className="text-gray-500">
                No workshops match your current filters or there are no
                workshops in the system.
              </p>
              <button
                onClick={resetFiltersHandler}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="shadow-xl rounded-2xl bg-[#2a2a2a] overflow-hidden">
              <div className="px-4 py-4 border-b border-stone-500">
                <h3 className="text-xl font-medium flex items-center">
                  <Factory size={20} className="mr-2" />
                  Workshops
                  <span className="text-slate-400 ml-4">
                    {filteredWorkshops.length}
                  </span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-500">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                        Workshop Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#2f2f2f] backdrop-blur-sm divide-y divide-gray-200">
                    {filteredWorkshops.map((workshop) => (
                      <tr
                        key={workshop.id}
                        className="hover:bg-slate-500 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold mr-3">
                              {(workshop.name || "W").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-200">
                                {workshop.name || "N/A"}
                              </div>
                              <div className="text-xs text-slate-400">
                                ID: {workshop.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2
                              size={16}
                              className="text-slate-400 mr-2"
                            />
                            <div className="text-sm text-slate-300">
                              {workshop.department_name || (
                                <span className="italic text-gray-400">
                                  No Department
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users size={16} className="text-slate-400 mr-2" />
                            <div className="text-sm text-slate-300">
                              {workshop?.manager_name || (
                                <span className="italic text-gray-400">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getStatusPill(workshop.operational_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/workshop/view/${workshop.id}`}
                              className="p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors duration-200"
                              title="View Workshop"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              to={`/workshop/edit/${workshop.id}`}
                              className="p-2 text-indigo-200 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                              title="Edit Workshop"
                            >
                              <Edit3 size={18} />
                            </Link>
                            {canDelete && (
                              <button
                                onClick={() =>
                                  handleDeleteWorkshop(
                                    workshop.id,
                                    workshop.name
                                  )
                                }
                                className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                title="Delete Workshop"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingIndicator />}
    </>
  );
}

export default Workshop;
