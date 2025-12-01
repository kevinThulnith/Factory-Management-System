import LoadingIndicator from "../components/LoadingIndicator";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "../constants";
import useFetchData from "../hooks/useFetchData";
import useWebSocket from "../hooks/useWebSocket";
import useDelete from "../hooks/useDelete";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import {
  PlusCircle,
  TrendingUp,
  Briefcase,
  RefreshCw,
  RotateCcw,
  BarChart2,
  SortDesc,
  SortAsc,
  Search,
  Trash2,
  Filter,
  Target,
  Edit3,
  Award,
  Users,
  Star,
  Eye,
  Zap,
} from "lucide-react";

const INITIAL_FILTERS = {
  searchTerm: "",
  employee: "",
  category: "",
  level: "",
};

const INITIAL_SORT = { key: "employee_name", direction: "asc" };

const TABLE_HEADERS = [
  { key: "employee_name", title: "Employee" },
  { key: "name", title: "Skill Name" },
  { key: "category_display", title: "Category" },
  { key: "level", title: "Level" },
];

const SkillMatrix = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortConfig, setSortConfig] = useState(INITIAL_SORT);

  const fetchData = useFetchData("skill-matrix", setLoading, setAllSkills);

  // useEffect(() => fetchData(), [fetchData]);
  useWebSocket("skill-matrix", setAllSkills, fetchData);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDelete = useDelete(
    "skill entry",
    setLoading,
    "skill-matrix",
    fetchData
  );

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFiltersHandler = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Memoized processed skills - employee_name comes from API
  const processedSkills = useMemo(() => {
    return allSkills.map((skill) => ({
      ...skill,
      employee_name: skill.employee_name || "Unknown User",
      category_display: skill.category?.replace(/_/g, " ") || "N/A",
    }));
  }, [allSkills]);

  // Get unique employees from skills data for filter dropdown
  const uniqueEmployees = useMemo(() => {
    const employeeMap = new Map();
    allSkills.forEach((skill) => {
      if (skill.employee && !employeeMap.has(skill.employee)) {
        employeeMap.set(skill.employee, skill.employee_name || "Unknown User");
      }
    });
    return Array.from(employeeMap, ([id, name]) => ({ id, name }));
  }, [allSkills]);

  // Client-side filtering and sorting
  const filteredAndSortedSkills = useMemo(() => {
    const filtered = processedSkills.filter((skill) => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        skill.name.toLowerCase().includes(searchTermLower) ||
        skill.employee_name.toLowerCase().includes(searchTermLower);

      const matchesEmployee =
        !filters.employee || skill.employee == filters.employee;
      const matchesCategory =
        !filters.category || skill.category === filters.category;
      const matchesLevel = !filters.level || skill.level === filters.level;

      return (
        matchesSearch && matchesEmployee && matchesCategory && matchesLevel
      );
    });

    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [processedSkills, filters, sortConfig]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: allSkills.length,
      employees: new Set(allSkills.map((s) => s.employee)).size,
      experts: allSkills.filter((s) => s.level === "EXPERT").length,
      uniqueSkills: new Set(allSkills.map((s) => s.name.toLowerCase())).size,
    }),
    [allSkills]
  );

  // Permissions
  const canManage =
    user && (user.role === "ADMIN" || user.role === "SUPERVISOR");

  const getLevelPill = (level) => {
    const config = {
      EXPERT: {
        style: "bg-green-100 text-green-800 border-green-200",
        icon: <Award size={12} />,
      },
      ADVANCED: {
        style: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <TrendingUp size={12} />,
      },
      INTERMEDIATE: {
        style: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Target size={12} />,
      },
      BEGINNER: {
        style: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <Zap size={12} />,
      },
    };

    const levelConfig = config[level] || {
      style: "bg-gray-100 text-gray-800",
      icon: <Star size={12} />,
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 border ${levelConfig.style}`}
      >
        {levelConfig.icon}{" "}
        {level ? level.charAt(0) + level.slice(1).toLowerCase() : "N/A"}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-6">
      <div className="w-full">
        {/* Header Section */}
        <div className="rounded-2xl p-8 shadow-md mb-8 bg-card-main">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="p-3 rounded-2xl mb-4 sm:mb-0 sm:mr-6 shadow-lg bg-gradient-to-r from-green-600 to-green-800 transform hover:scale-105 transition-all duration-300">
                <Briefcase size={90} className="text-stone-200" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-medium mb-2 tracking-tight">
                  Skill Matrix Management
                </h1>
                <p className="text-star-dust-400 text-1xl">
                  Analyze and manage employee skills across the organization.
                </p>
                <div className="flex items-center flex-wrap justify-center sm:justify-start mt-3 gap-2">
                  <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-orange-600">
                    Total Entries:{" "}
                    <span className="font-medium">{stats.total}</span>
                  </span>
                  <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-blue-600">
                    Skilled Employees:{" "}
                    <span className="font-medium">{stats.employees}</span>
                  </span>
                  <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-green-600">
                    Expert Level:{" "}
                    <span className="font-medium">{stats.experts}</span>
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
              {canManage && (
                <Link
                  to="/skill-matrix/add"
                  className="px-3 py-2 text-stone-200 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600"
                >
                  <PlusCircle size={20} className="mr-2" />
                  Add Skill Entry
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card-main rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="flex items-center text-slate-300 mb-4">
            <Filter size={15} className="mr-2" /> Search & Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="searchTerm"
                placeholder="Search by skill or employee..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                style={{ height: "40px" }}
                className="w-full pl-10 pr-4 py-2 border-none outline-none rounded-lg bg-card-sub"
              />
            </div>
            <select
              name="employee"
              value={filters.employee}
              onChange={handleFilterChange}
              style={{ height: "40px" }}
              className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none"
            >
              <option value="">All Employees</option>
              {uniqueEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={{ height: "40px" }}
              className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none"
            >
              <option value="">All Categories</option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
              style={{ height: "40px" }}
              className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none"
            >
              <option value="">All Levels</option>
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <button
              onClick={resetFiltersHandler}
              className="px-4 py-2 duration-200 font-medium bg-blue-600 rounded-lg hover:scale-105 inline-flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredAndSortedSkills.length === 0 && !loading ? (
          <div className="bg-[#2a2a2a] rounded-xl p-12 text-center shadow-lg border border-stone-700">
            <Briefcase size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-stone-300 mb-2">
              No Skill Entries Found
            </h3>
            <p className="text-stone-400">
              Try adjusting your filters or add a new skill entry.
            </p>
          </div>
        ) : (
          <div className="shadow-lg rounded-2xl bg-card-main overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-500">
              <h3 className="text-xl font-medium flex items-center">
                <BarChart2 size={20} className="mr-3" /> Skill Entries
                <span className="text-slate-400 ml-3 bg-stone-700 px-2.5 py-1 rounded-full text-sm font-semibold">
                  {filteredAndSortedSkills.length}
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-500">
                <thead>
                  <tr>
                    {TABLE_HEADERS.map(({ key, title }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-stone-700"
                      >
                        <div className="flex items-center">
                          {title}
                          {sortConfig.key === key &&
                            (sortConfig.direction === "asc" ? (
                              <SortAsc size={14} className="ml-2" />
                            ) : (
                              <SortDesc size={14} className="ml-2" />
                            ))}
                        </div>
                      </th>
                    ))}
                    {canManage && (
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-[#2f2f2f] divide-y divide-star-dust-700">
                  {filteredAndSortedSkills.map((skill) => (
                    <tr
                      key={skill.id}
                      className="hover:bg-slate-600 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users size={16} className="mr-2 text-slate-400" />
                          <div>{skill.employee_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-orange-400">
                        {skill.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {skill.category_display}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getLevelPill(skill.level)}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/skills/view/${skill.id}`}
                              className="p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              to={`/skills/edit/${skill.id}`}
                              className="p-2 text-indigo-200 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                              title="Edit Skill"
                            >
                              <Edit3 size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(skill.id)}
                              className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors duration-200"
                              title="Delete Skill"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {loading && !refreshing && <LoadingIndicator />}
    </div>
  );
};

export default SkillMatrix;
