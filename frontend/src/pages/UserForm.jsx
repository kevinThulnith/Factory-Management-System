import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Buttons } from "../components/components";
import api from "../api";

import {
  Users as UsersIcon,
  CogIcon as Tool,
  AlertTriangle,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Package,
  EyeOff,
  Crown,
  Eye,
} from "lucide-react";

const ErrorMessage = ({ message }) => (
  <span className="text-sm text-white font-medium">{message}</span>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

function UserForm() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    dob: "",
    nic: "",
    mobile_no: "",
    role: "OPERATOR",
    is_active: true,
    department: "",
    password: "",
  });
  const [departments, setDepartments] = useState([]);
  const [originalUsername, setOriginalUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [initialPageLoading, setInitialPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [user, setUser] = useState({});

  useEffect(() => {
    api
      .get("api/user/me/")
      .then((res) => setUser(res.data))
      .catch((error) => alert(error));
  }, []);

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  // Memoized role configuration
  const roleConfig = useMemo(
    () => ({
      ADMIN: {
        icon: <Crown size={16} />,
        color: "purple-600",
        label: "Administrator",
      },
      MANAGER: {
        icon: <ShieldCheck size={16} />,
        color: "blue-600",
        label: "Manager",
      },
      SUPERVISOR: {
        icon: <Eye size={16} />,
        color: "green-600",
        label: "Supervisor",
      },
      OPERATOR: {
        icon: <Tool size={16} />,
        color: "orange-600",
        label: "Operator",
      },
      TECHNICIAN: {
        icon: <Activity size={16} />,
        color: "red-600",
        label: "Technician",
      },
      PURCHASING: {
        icon: <Package size={16} />,
        color: "indigo-600",
        label: "Purchasing",
      },
    }),
    []
  );

  const fetchUserData = useCallback(() => {
    if (userId) {
      setInitialPageLoading(true);
      api
        .get(`api/user/${userId}/`)
        .then((res) =>
          setFormData({
            first_name: res.data.first_name || "",
            last_name: res.data.last_name || "",
            email: res.data.email || "",
            username: res.data.username || "",
            dob: res.data.dob || "",
            nic: res.data.nic || "",
            mobile_no: res.data.mobile_no || "",
            role: res.data.role || "OPERATOR",
            is_active: res.data.is_active ?? true,
            department: res.data.department || "",
            password: "",
          })
        )
        .catch((error) => setPageError("Failed to load user data.", error))
        .finally(() => setInitialPageLoading(false));
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();

    api
      .get("api/department/")
      .then((res) => setDepartments(res.data))
      .catch((error) => setPageError("Failed to load departments.", error))
      .finally(() => setInitialPageLoading(false));
  }, [fetchUserData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
    setPageError("");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim())
      errors.first_name = "First name is required.";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    // Username is read-only, no validation needed here for it
    if (formData.password && formData.password.length < 8)
      errors.password = "New password must be at least 8 characters.";
    // Other validations (NIC, mobile, DOB) as in RegisterPage if needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormSubmitLoading(true);
    const submitData = { ...formData };
    if (!submitData.password) delete submitData.password;
    api
      .put(`api/user/${userId}/`, submitData)
      .then(() => {
        alert("User updated Succesfully !!!");
        navigate("/user");
      })
      .catch((error) => {
        if (error.response?.data) {
          setFormErrors(error.response.data);
        } else {
          setPageError("Failed to submit form. Please try again.");
        }
      })
      .finally(() => setFormSubmitLoading(false));
  };

  const userRoles = [
    "ADMIN",
    "MANAGER",
    "SUPERVISOR",
    "OPERATOR",
    "TECHNICIAN",
    "PURCHASING",
  ];

  return (
    <div>
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header Section with Modern Design */}
          <div className="rounded-2xl p-4 shadow-md mb-8 bg-card-main">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 mr-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                  <UsersIcon size={40} />
                </div>
                <div>
                  <h1 className="text-2xl font-medium mb-2 tracking-tight">
                    Edit User
                  </h1>
                  <p className="text-stone-400 text-sm">
                    Modify user details and permissions:{" "}
                    {originalUsername || `ID ${userId}`}
                  </p>
                </div>
              </div>
              <Link
                to="/user"
                className="px-3 pl-2 py-2 rounded-xl font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl bg-card-sub"
              >
                <ChevronLeft size={18} className="mr-1" />
                Users
              </Link>
            </div>
          </div>

          {/* Form Section with Modern Design */}
          <div className="rounded-2xl shadow-md bg-card-main overflow-hidden mb-10 text-star-dust-200 p-1">
            <form onSubmit={handleSubmit}>
              <div className="p-8 space-y-8">
                {pageError && (
                  <div className="bg-red-500 rounded-xl p-4 flex items-center">
                    <AlertTriangle
                      size={20}
                      className="text-red-500 mr-3 flex-shrink-0"
                    />
                    <ErrorMessage message={pageError} />
                  </div>
                )}

                {/* Personal Information Section */}
                <div className="space-y-6 ">
                  <div className="flex items-center border-b border-star-dust-500 pb-3 mb-6">
                    <div className="p-2 bg-purple-700 rounded-lg mr-3">
                      <UsersIcon size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-medium">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium ml-1"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-sub ${
                          formErrors.first_name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter first name"
                      />
                      {formErrors.first_name && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.first_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium ml-1"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-sub ${
                          formErrors.first_name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter last name"
                      />
                      {formErrors.last_name && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.last_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="dob"
                        className="block text-sm font-medium ml-1"
                      >
                        Birthday
                      </label>
                      <input
                        type="date"
                        name="dob"
                        id="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.dob
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter last name"
                      />
                      {formErrors.dob && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.dob}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-300"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.first_name
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter email address"
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium ml-1"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={userId}
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.username
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        } ${userId ? "opacity-60 cursor-not-allowed" : ""}`}
                        placeholder="Enter username"
                      />
                      {formErrors.username && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.username}
                        </p>
                      )}
                      {userId && (
                        <p className="text-xs text-star-dust-500 mt-1">
                          Username cannot be changed after creation
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="nic"
                        className="block text-sm font-medium ml-1"
                      >
                        NIC
                      </label>
                      <input
                        type="text"
                        name="nic"
                        id="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        required
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.nic
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter NIC number"
                      />
                      {formErrors.nic && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.nic}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="mobile_no"
                        className="block text-sm font-medium ml-1"
                      >
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobile_no"
                        id="mobile_no"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        required
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.mobile_no
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter mobile number"
                      />
                      {formErrors.mobile_no && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.mobile_no}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role & Access Section */}
                <div className="space-y-6">
                  <div className="flex items-center border-b border-star-dust-500 pb-3 mb-6">
                    <div className="p-2 bg-blue-500 rounded-lg mr-3">
                      <ShieldCheck size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-medium">
                      Role & Access Management
                    </h3>
                  </div>
                  {/* Role & Department Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium ml-1"
                      >
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={!isAdmin}
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.role
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        } ${!isAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {userRoles.map((role) => (
                          <option key={role} value={role}>
                            {roleConfig[role].label}
                          </option>
                        ))}
                      </select>
                      {!isAdmin && (
                        <p className="text-xs text-amber-500 mt-1">
                          Only administrators can change user roles.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium ml-1"
                      >
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.department
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.department && (
                        <p className="text-sm text-red-600 font-medium">
                          {formErrors.department}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="is_active"
                          className="ml-2 block text-sm font-medium"
                        >
                          Active Account
                        </label>
                      </div>
                      <p className="text-xs text-stone-400">
                        Inactive accounts cannot login to the system.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Reset Section */}
                <div className="space-y-6">
                  <div className="flex items-center border-b border-star-dust-500 pb-3 mb-6">
                    <div className="p-2 bg-orange-500 rounded-lg mr-3">
                      <ShieldAlert size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-medium">Password Reset</h3>
                  </div>
                  {/* Password input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium ml-1"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-[#3a3a3a] ${
                          formErrors.password
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="Enter new password (leave empty to keep current)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff size={16} className="text-gray-400" />
                        ) : (
                          <Eye size={16} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-red-600 font-medium">
                        {formErrors.password}
                      </p>
                    )}
                    <p className="text-xs text-star-dust-400 pb-2">
                      Leave blank to keep the current password. New password
                      must be at least 8 characters.
                    </p>

                    <Buttons onCancel={() => navigate("/user")} />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
