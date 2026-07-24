import { Building2, FileText, MapPin, House, User } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchUsersByRole from "../hooks/useFetchUsersByRole";
import useEntityFormData from "../hooks/useEntityFormData";
import useFormSubmit from "../hooks/useFormSubmit";
import useFetchData from "../hooks/useFetchData";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";

import {
  TextareaItem,
  SelectItem,
  InputItem,
  InfoItem,
  Buttons,
} from "../components/components";

// !Default values for the form
const DEPARTMENT_DEFAULTS = {
  name: "",
  location: "",
  supervisor: "",
  description: "",
};

const DepartmentForm = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // !Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");

  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [department, setDepartment] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState(DEPARTMENT_DEFAULTS);

  // !Form submission state + handler now come from the hook itself
  const {
    loading: submitLoading,
    errors,
    pageError,
    setErrors,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Fetch component data
  const fetchUsers = useFetchUsersByRole([], setUsersLoading, setUsers);

  const handleDepartmentData = useEntityFormData(
    setDepartment,
    setFormData,
    DEPARTMENT_DEFAULTS,
  );

  const fetchDepartment = useFetchData(
    `department/${departmentId}`,
    setFetchLoading,
    handleDepartmentData,
  );

  useEffect(() => {
    if (!isViewMode) fetchUsers();
    if (departmentId) fetchDepartment();
  }, [fetchUsers, fetchDepartment, isViewMode, departmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // !Submit form data
  const method = isEditMode ? "put" : "post";
  const payload = { ...formData, supervisor: formData.supervisor || null };
  const message = `Department ${isEditMode ? "updated" : "created"} successfully !!!`;
  const url = isEditMode
    ? `api/department/${departmentId}/`
    : "api/department/";

  const HandleSubmit = (e) =>
    submit(e, {
      method,
      url,
      payload,
      formData,
      message,
      onSuccess: () => navigate("/department"),
    });

  const getUserOptions = () => {
    return users.map((user) => ({
      value: user.id,
      label:
        user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name} (${user.username})`
          : user.username,
    }));
  };

  return (
    <Form
      icon={<Building2 />}
      heading={
        isViewMode
          ? "Department Details"
          : isEditMode
            ? "Edit Department"
            : "Create New Department"
      }
      text_01={
        isViewMode
          ? "View department information"
          : isEditMode
            ? "Update department information and settings"
            : "Add a new department to your organization"
      }
      text_02="Departments"
      onClick={() => navigate("/department")}
      fnction={() => navigate(`/department/edit/${departmentId}`)}
      gradient="from-red-600 to-red-800"
      isViewMode={isViewMode && user?.role === "ADMIN"}
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
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
        // !Edit/Create Mode
        <form onSubmit={HandleSubmit}>
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
    </Form>
  );
};

export default DepartmentForm;
