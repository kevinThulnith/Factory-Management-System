import { UserRoundPlus, FileText, KeyRound, UserCog } from "lucide-react";
import DepartmentDropdown from "../components/DepartmentDropDown";
import RoleDropdown from "../components/RoleDropDown";
import { InputItem } from "../components/components";
import useDepartments from "../hooks/useDepartments";
import useFormSubmit from "../hooks/useFormSubmit";
import { USER_ROLES } from "../constants";
import { useState } from "react";

function Register() {
  const { departments } = useDepartments();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    nic: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
    role: USER_ROLES.OPERATOR,
    department: "",
  });

  // !Form submission state + handler now come from the hook itself
  const { loading, errors, pageError, setPageError, setErrors, submit } =
    useFormSubmit();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    // !Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      e.preventDefault();
      setPageError("Passwords don't match");
      return;
    }

    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dob: formData.dob || null,
      nic: formData.nic || null,
      mobile_no: formData.mobile_no || null,
      role: formData.role,
      department: formData.department ? parseInt(formData.department) : null,
      is_active: true, // Set user as active by default
    };

    submit(e, {
      method: "post",
      url: "api/user/",
      payload: submitData,
      formData,
      message: "New user created successfully !!!",
      onSuccess: () => {
        window.location.href = "/user";
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 flex justify-center text-star-dust-200">
      <div className="w-full max-w-4xl bg-card-main rounded-xl shadow-md p-9 sm:p-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center mb-3 pb-4 border-b border-stone-500">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-md mr-3 mb-2 sm:mb-0">
            <UserRoundPlus size={34} />
          </div>
          <h1 className="text-4xl font-medium">Register User</h1>
        </div>
        {/* Error message */}
        {pageError && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg">
            {pageError}
          </div>
        )}
        {/* form body */}
        <form onSubmit={handleSubmit}>
          {/* Initial data */}
          <div className="border-b border-stone-500 pb-5 mb-3">
            <h3 className="font-medeium flex items-center gap-2">
              <FileText size={18} /> User initial data
            </h3>
            <p className="text-secondary-text text-sm mt-1 text-star-dust-400">
              Fill initial user data fields.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <InputItem
                label="First Name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                error={errors.first_name}
                required
              />
              <InputItem
                label="Last Name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.last_name}
                required
              />
              <InputItem
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="user0000"
                error={errors.username}
                required
              />
              <InputItem
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cat@example.com"
                error={errors.email}
                required
              />
              <InputItem
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
              />
              <InputItem
                label="NIC"
                name="nic"
                type="text"
                value={formData.nic}
                onChange={handleChange}
                placeholder="123456789V"
                error={errors.nic}
              />
              <InputItem
                label="Mobile Number"
                name="mobile_no"
                type="tel"
                value={formData.mobile_no}
                onChange={handleChange}
                placeholder="0771234567"
                error={errors.mobile_no}
              />
            </div>
          </div>
          {/* User position */}
          <div className="border-b border-stone-500 pb-5 mb-3">
            <h3 className="font-medeium flex items-center gap-2">
              <UserCog size={18} /> User Role
            </h3>
            <p className="text-secondary-text text-sm mt-1 text-stone-400">
              Set user role and department.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <RoleDropdown
                value={formData.role}
                onChange={(role) => setFormData((prev) => ({ ...prev, role }))}
                labelClassName="text-sm text-burning-orange-300 ml-1"
              />
              <DepartmentDropdown
                departments={departments}
                value={formData.department}
                onChange={(department) =>
                  setFormData((prev) => ({ ...prev, department }))
                }
                labelClassName="text-sm text-burning-orange-300 ml-1"
                placeholder="Select Department (Optional)"
              />
            </div>
          </div>
          {/* Set user password */}
          <div className="mb-3">
            <h3 className="font-medeium flex items-center gap-2">
              <KeyRound size={18} /> User Password
            </h3>
            <p className="text-secondary-text text-sm mt-1 text-stone-400">
              Set user password.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <InputItem
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                error={errors.password}
                required
              />
              <InputItem
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                error={errors.confirmPassword}
                required
              />
            </div>
          </div>

          {/* Submit button spanning both columns */}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-4 mt-6 border-t border-star-dust-600 ">
            <button
              type="button"
              className="px-3 py-2 bg-gray-600 text-stone-200 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-orange-600 text-stone-700 rounded-lg hover:bg-orange-500 transition-colors text-sm font-medium"
            >
              {loading ? "Registering..." : "Register"}
              <UserRoundPlus className="inline ml-2" size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
