import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../api";

import {
  TextareaItem,
  SelectItem,
  InputItem,
  InfoItem,
  Buttons,
} from "../components/components";

import {
  ChevronLeft,
  Building2,
  FileText,
  MapPin,
  House,
  Edit2,
  User,
} from "lucide-react";

const DepartmentForm = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");
  const isCreateMode = location.pathname.includes("/add");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    supervisor: "",
    description: "",
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [department, setDepartment] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    setUsersLoading(true);
    api
      .get("api/user/")
      .then((response) =>
        setUsers(response.data.results || response.data || [])
      )
      .catch((error) => console.error("Failed to fetch users:", error))
      .finally(() => setUsersLoading(false));

    if (departmentId) {
      setLoading(true);
      api
        .get(`api/department/${departmentId}/`)
        .then((response) => {
          const dept = response.data;
          setDepartment(dept);
          setFormData({
            name: dept.name || "",
            location: dept.location || "",
            supervisor: dept.supervisor || "",
            description: dept.description || "",
          });
        })
        .catch((error) => {
          setPageError("Failed to load department details.");
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [departmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Department name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setPageError("");
    setErrors({});

    const payload = {
      ...formData,
      supervisor: formData.supervisor || null,
    };

    try {
      if (isEditMode) await api.put(`api/department/${departmentId}/`, payload);
      else await api.post("api/department/", payload);
      alert("Department updated successfully !!!");
      navigate("/department");
    } catch (error) {
      console.error("Form submission error:", error.response);
      const apiErrors = error.response?.data;

      if (apiErrors && typeof apiErrors === "object") {
        const newFormErrors = {};
        for (const key in apiErrors) {
          if (formData.hasOwnProperty(key) && Array.isArray(apiErrors[key])) {
            newFormErrors[key] = apiErrors[key].join(" ");
          }
        }
        setErrors(newFormErrors);

        if (Object.keys(newFormErrors).length === 0) {
          setPageError(
            apiErrors.detail || "An error occurred. Please try again."
          );
        } else setPageError("Please correct the errors below.");
      } else {
        setPageError(
          error.response?.data?.detail || "An error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserOptions = () => {
    return users.map((user) => ({
      value: user.id,
      label:
        user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name} (${user.username})`
          : user.username,
    }));
  };

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a1a]">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto text-star-dust-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card-main p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-2 mr-4 text-stone-200">
                <Building2 size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-medium">
                  {isViewMode && "Department Details"}
                  {isEditMode && "Edit Department"}
                  {isCreateMode && "Create New Department"}
                </h1>
                <p className="text-stone-400 mt-1 text-1xl">
                  {isViewMode && "View department information"}
                  {isEditMode && "Update department information and settings"}
                  {isCreateMode && "Add a new department to your organization"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/department")}
              className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-2 px-3 hover:shadow-sm"
            >
              <ChevronLeft size={20} />
              Departments
            </button>
            {isViewMode && (
              <button
                onClick={() => navigate(`/department/edit/${departmentId}`)}
                className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-2 px-3 hover:shadow-sm"
              >
                <Edit2 size={18} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {pageError && (
          <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg">
            {pageError}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 sm:p-8">
          {isViewMode ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Building2 />}
                label="Department Name"
                value={department?.name}
              />
              <InfoItem
                icon={<MapPin />}
                label="Location"
                value={department?.location}
              />
              <InfoItem
                icon={<User />}
                label="Supervisor"
                value={department?.supervisor_name}
              />
              <InfoItem
                icon={<House />}
                label="Workshops"
                value={department?.workshops}
              />
              <div className="md:col-span-2">
                <InfoItem
                  icon={<FileText />}
                  label="Description"
                  value={department?.description}
                />
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputItem
                    label="Department Name"
                    name="name"
                    icon={<Building2 />}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter department name"
                    error={errors.name}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextareaItem
                    label="Description"
                    name="description"
                    icon={<FileText />}
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the department's purpose and responsibilities"
                    error={errors.description}
                  />
                </div>

                <InputItem
                  label="Location"
                  name="location"
                  icon={<MapPin />}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Building, floor, or area"
                  error={errors.location}
                />

                <SelectItem
                  label="Supervisor"
                  name="supervisor"
                  icon={<User />}
                  value={formData.supervisor}
                  onChange={handleChange}
                  options={getUserOptions()}
                  loading={usersLoading}
                  error={errors.supervisor}
                />
              </div>

              <Buttons
                onCancel={() => navigate("/department")}
                text_01={isEditMode ? "Save Changes" : "Create Department"}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
