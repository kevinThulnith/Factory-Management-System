import { useState, useEffect, useCallback, useMemo } from "react";
import DepartmentDropdown from "../components/DepartmentDropDown";
import { useParams, useNavigate, Link } from "react-router-dom";
import RoleDropdown from "../components/RoleDropDown";
import useDepartments from "../hooks/useDepartments";
import { Buttons } from "../components/components";
import useFormSubmit from "../hooks/useFormSubmit";
import useFetchData from "../hooks/useFetchData";
import useAuth from "../hooks/useAuth";

import {
  AlertTriangle,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
  EyeOff,
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
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

function UserForm() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { departments } = useDepartments();
  const [showPassword, setShowPassword] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [initialPageLoading, setInitialPageLoading] = useState(true);
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

  // !Form submission state + handler now come from the hook itself
  const {
    loading: formSubmitLoading,
    errors: formErrors,
    pageError,
    setPageError,
    setErrors: setFormErrors,
    submit,
  } = useFormSubmit();

  // !Permission check
  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  const handleUserData = useCallback((res) => {
    setFormData({
      first_name: res.first_name || "",
      last_name: res.last_name || "",
      email: res.email || "",
      username: res.username || "",
      dob: res.dob || "",
      nic: res.nic || "",
      mobile_no: res.mobile_no || "",
      role: res.role || "OPERATOR",
      is_active: res.is_active ?? true,
      department: res.department || "",
      password: "",
    });
    setOriginalUsername(res.username || "");
  }, []);

  const fetchUserData = useFetchData(
    `user/${userId}`,
    setInitialPageLoading,
    handleUserData,
  );

  useEffect(() => fetchUserData(), [fetchUserData]);

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
    if (formData.password && formData.password.length < 8)
      errors.password = "New password must be at least 8 characters.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const HandleSubmit = (e) => {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    const submitData = { ...formData };
    if (!submitData.password) delete submitData.password;

    submit(e, {
      method: "put",
      url: `api/user/${userId}/`,
      payload: submitData,
      formData,
      message: "User updated Successfully !!!",
      onSuccess: () => navigate("/user"),
    });
  };

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Modern Design */}
        <div className="rounded-2xl p-4 shadow-md mb-8 bg-card-main">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 mr-6 shadow-lg transform hover:scale-105 transition-all duration-300">
                <UsersRound size={46} />
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

        {/* Loading State */}
        {initialPageLoading ? (
          <div className="rounded-2xl shadow-md bg-card-main overflow-hidden mb-10 p-8">
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="text-stone-400 ml-3">Loading user data...</span>
            </div>
          </div>
        ) : (
          /* Form Section with Modern Design */
          <div className="rounded-2xl shadow-md bg-card-main overflow-hidden mb-10 text-star-dust-200 p-1">
            <form onSubmit={HandleSubmit}>
              <div className="sm:p-8 p-4 space-y-8">
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
                      <UsersRound size={20} className="text-white" />
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
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent ${
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
                        className={`w-full px-4 py-2 border-none outline-none rounded-xl bg-card-accent ${
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
                        disabled={!!userId}
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent ${
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
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent ${
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
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent ${
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
                      <RoleDropdown
                        value={formData.role}
                        onChange={(role) => {
                          setFormData((prev) => ({ ...prev, role }));
                          if (formErrors.role)
                            setFormErrors((prev) => ({
                              ...prev,
                              role: null,
                            }));
                          setPageError("");
                        }}
                        disabled={!isAdmin}
                        error={!!formErrors.role}
                        helperText={
                          !isAdmin
                            ? "Only administrators can change user roles."
                            : undefined
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <DepartmentDropdown
                        departments={departments}
                        value={formData.department}
                        onChange={(department) => {
                          setFormData((prev) => ({
                            ...prev,
                            department,
                          }));
                          if (formErrors.department)
                            setFormErrors((prev) => ({
                              ...prev,
                              department: null,
                            }));
                          setPageError("");
                        }}
                        error={!!formErrors.department}
                      />
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
                        className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent ${
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

                    <Buttons
                      onCancel={() => navigate("/user")}
                      disabled={formSubmitLoading}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserForm;
