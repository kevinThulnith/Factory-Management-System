import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchUsersByRole from "../hooks/useFetchUsersByRole";
import { Star, UsersRound, Award } from "lucide-react";
import useFormSubmit from "../hooks/useFormSubmit";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  TextareaItem,
  SelectItem,
  InputItem,
  InfoItem,
  Buttons,
} from "../components/components";

// --- Constants ---
const SKILL_CATEGORIES_MAP = {
  OTHER: "Other",
  SAFETY: "Safety",
  DESIGN: "Design",
  SOFTWARE: "Software",
  LOGISTICS: "Logistics",
  TECHNICAL: "Technical",
  MECHANICAL: "Mechanical",
  ELECTRICAL: "Electrical",
  OPERATIONS: "Operations",
  MANAGEMENT: "Management",
  MAINTENANCE: "Maintenance",
  ADMINISTRATION: "Administration",
  QUALITY_CONTROL: "Quality Control",
};

const SKILL_LEVELS_MAP = {
  EXPERT: "Expert",
  BEGINNER: "Beginner",
  ADVANCED: "Advanced",
  INTERMEDIATE: "Intermediate",
};

const ALL_SKILL_CATEGORIES = Object.keys(SKILL_CATEGORIES_MAP);
const SKILL_LEVELS = Object.keys(SKILL_LEVELS_MAP);

const SkillForm = () => {
  const { skillMatrixId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode from route path
  const isMySkillsMode = location.pathname.includes("/my-skills");
  const isViewMode = location.pathname.includes("/view");

  const { user } = useAuth();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    employee: "",
    description: "",
    level: "BEGINNER",
    category: "TECHNICAL",
  });

  const {
    loading: submitLoading,
    errors: formErrors,
    pageError,
    setErrors: setFormErrors,
    setPageError,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Permission checks
  const canManageForm = ["ADMIN", "SUPERVISOR"].includes(user?.role);

  // Fetch employees (only for admin/supervisor mode)
  const fetchEmployees = useFetchUsersByRole([], setFetchLoading, setEmployees);

  useEffect(() => {
    if (!isMySkillsMode) fetchEmployees();

    if (skillMatrixId) {
      const endpoint = isMySkillsMode
        ? `api/skill/my-skills/${skillMatrixId}/`
        : `api/skill-matrix/${skillMatrixId}/`;
      setFetchLoading(true);
      api
        .get(endpoint)
        .then((res) => {
          const { name, description, category, level, employee } = res.data;
          setFormData({
            name,
            description,
            category,
            level,
            employee: String(employee || ""), // ensure string for select
          });
        })
        .catch(() => setPageError("Failed to load skill details."))
        .finally(() => setFetchLoading(false));
    }
  }, [skillMatrixId, isMySkillsMode, fetchEmployees, setPageError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Submit handler
  const method = skillMatrixId ? "patch" : "post";
  const message = `Skill matrix ${skillMatrixId ? "updated" : "created"} successfully !!!`;
  const endpoint = isMySkillsMode
    ? `api/skill-matrix/${skillMatrixId ? `${skillMatrixId}/` : ""}`
    : `api/skill-matrix/${skillMatrixId ? `${skillMatrixId}/` : ""}`;
  // (both use same endpoint, but kept separate for clarity)

  const payload = {
    name: formData.name,
    description: formData.description || null,
    category: formData.category,
    level: formData.level,
    employee: isMySkillsMode ? user.id : parseInt(formData.employee),
  };

  const validateForm = () => {
    const newErrors = {};
    if (!ALL_SKILL_CATEGORIES.includes(formData.category))
      newErrors.category = "Invalid category selected.";
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setPageError("Please correct the errors below.");
    }
    return Object.keys(newErrors).length === 0;
  };

  const HandleSubmit = (e) => {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    submit(e, {
      method,
      url: endpoint,
      payload,
      formData,
      message,
      onSuccess: () =>
        navigate(isMySkillsMode ? "/my-skills" : "/skill-matrix"),
    });
  };

  const backLink = isMySkillsMode ? "/my-skills" : "/skill-matrix";
  const pageTitle = skillMatrixId
    ? isViewMode
      ? "View Skill"
      : "Edit Skill"
    : "Add New Skill";

  const handleEdit = () => {
    if (isMySkillsMode) {
      navigate(`/my-skills/edit/${skillMatrixId}`);
    } else {
      navigate(`/skill-matrix/edit/${skillMatrixId}`);
    }
  };

  const getEmployeeName = () => {
    if (!formData.employee) return "N/A";
    const emp = employees.find((e) => e.id === parseInt(formData.employee));
    if (emp) {
      return `${emp.first_name || ""} ${emp.last_name || ""} (${
        emp.username
      }) - ${emp.role}`;
    }
    return "Unknown";
  };

  return (
    <Form
      icon={<Award />}
      heading={pageTitle}
      text_01={
        isMySkillsMode
          ? "Manage your personal skills"
          : "Manage employee skills"
      }
      text_02="Skill Matrix"
      onClick={() => navigate(backLink)}
      fnction={handleEdit}
      gradient="from-green-600 to-green-800"
      isViewMode={isViewMode}
      loading={loading}
      pageError={pageError}
    >
      {isViewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isMySkillsMode && (
            <InfoItem
              icon={<UsersRound />}
              label="Employee"
              value={getEmployeeName()}
            />
          )}
          <InfoItem icon={<Star />} label="Skill Name" value={formData.name} />
          <InfoItem
            icon={<Star />}
            label="Category"
            value={SKILL_CATEGORIES_MAP[formData.category]}
          />
          <InfoItem
            icon={<Star />}
            label="Proficiency Level"
            value={SKILL_LEVELS_MAP[formData.level]}
          />
          <div className="md:col-span-2">
            <InfoItem
              icon={<Star />}
              label="Description"
              value={formData.description || "No description provided"}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={HandleSubmit}>
          <div className="space-y-6">
            {!isMySkillsMode && (
              <SelectItem
                label="Employee"
                name="employee"
                icon={<UsersRound />}
                value={formData.employee}
                onChange={handleChange}
                options={employees.map((emp) => ({
                  value: String(emp.id), // ← fix type mismatch
                  label: `${emp.first_name || ""} ${emp.last_name || ""} (${
                    emp.username
                  }) - ${emp.role}`,
                }))}
                required={!skillMatrixId}
                disabled={skillMatrixId}
                error={formErrors.employee}
              />
            )}
            <InputItem
              label="Skill Name"
              name="name"
              icon={<Star />}
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., TIG Welding"
              error={formErrors.name}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectItem
                label="Category"
                name="category"
                icon={<Star />}
                value={formData.category}
                onChange={handleChange}
                options={ALL_SKILL_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: SKILL_CATEGORIES_MAP[cat],
                }))}
                required
                error={formErrors.category}
              />
              <SelectItem
                label="Proficiency Level"
                name="level"
                icon={<Star />}
                value={formData.level}
                onChange={handleChange}
                options={SKILL_LEVELS.map((lvl) => ({
                  value: lvl,
                  label: SKILL_LEVELS_MAP[lvl],
                }))}
                required
                error={formErrors.level}
              />
            </div>
            <TextareaItem
              label="Description"
              name="description"
              icon={<Star />}
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the skill, including any relevant experience or certifications."
              error={formErrors.description}
            />
          </div>

          <Buttons
            onCancel={() => navigate(backLink)}
            text_01={skillMatrixId ? "Save Changes" : "Add Skill"}
            disabled={loading || !canManageForm}
          />
        </form>
      )}
    </Form>
  );
};

export default SkillForm;
