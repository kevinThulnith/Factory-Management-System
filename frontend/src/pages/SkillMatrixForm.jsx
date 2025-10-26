import { Save, Star, ChevronLeft, Users, Briefcase, Edit2 } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import api from "../api";

import {
  TextareaItem,
  SelectItem,
  FormHeader,
  InputItem,
  InfoItem,
  Buttons,
} from "../components/components";

// --- Constants (as in the original) ---
const SKILL_CATEGORIES_MAP = {
  TECHNICAL: "Technical",
  MECHANICAL: "Mechanical",
  ELECTRICAL: "Electrical",
  SOFTWARE: "Software",
  MANAGEMENT: "Management",
  ADMINISTRATION: "Administration",
  QUALITY_CONTROL: "Quality Control",
  SAFETY: "Safety",
  LOGISTICS: "Logistics",
  MAINTENANCE: "Maintenance",
  OPERATIONS: "Operations",
  DESIGN: "Design",
  OTHER: "Other",
};

const SKILL_LEVELS_MAP = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

const ALL_SKILL_CATEGORIES = Object.keys(SKILL_CATEGORIES_MAP);
const SKILL_LEVELS = Object.keys(SKILL_LEVELS_MAP);

const ROLE_CATEGORY_MAP = {
  ADMIN: ALL_SKILL_CATEGORIES,
  SUPERVISOR: ALL_SKILL_CATEGORIES,
  MANAGER: [
    "MANAGEMENT",
    "OPERATIONS",
    "TECHNICAL",
    "SOFTWARE",
    "ADMINISTRATION",
    "OTHER",
  ],
  TECHNICIAN: [
    "TECHNICAL",
    "MECHANICAL",
    "ELECTRICAL",
    "MAINTENANCE",
    "SAFETY",
    "OPERATIONS",
    "SOFTWARE",
    "OTHER",
  ],
  OPERATOR: [
    "OPERATIONS",
    "MECHANICAL",
    "MAINTENANCE",
    "SAFETY",
    "QUALITY_CONTROL",
    "TECHNICAL",
    "OTHER",
  ],
};

const SkillForm = () => {
  const { skillMatrixId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const isMySkillsMode = useMemo(
    () => location.pathname.includes("/my-skills"),
    [location.pathname]
  );
  const isViewMode = useMemo(
    () => location.pathname.includes("/view"),
    [location.pathname]
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "TECHNICAL",
    level: "BEGINNER",
    employee: "",
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const canManageForm = useMemo(
    () =>
      isMySkillsMode ||
      (user && (user.role === "ADMIN" || user.role === "SUPERVISOR")),
    [isMySkillsMode, user]
  );

  // Fetch initial data
  useEffect(() => {
    api.get("api/user/me/").then((res) => setUser(res.data));
    if (!isMySkillsMode) {
      api
        .get("api/user/")
        .then((res) => setEmployees(res.data.results || res.data));
    }

    if (skillMatrixId) {
      const endpoint = isMySkillsMode
        ? `api/skill/my-skills/${skillMatrixId}/`
        : `api/skill-matrix/${skillMatrixId}/`;
      api
        .get(endpoint)
        .then((res) => {
          const { name, description, category, level, employee } = res.data;
          setFormData({
            name,
            description,
            category,
            level,
            employee: String(employee || ""),
          });
        })
        .catch(() => setPageError("Failed to load skill details."));
    }
  }, [skillMatrixId, isMySkillsMode]);

  const getAllowedCategories = useMemo(() => {
    if (isMySkillsMode && user.role)
      return ROLE_CATEGORY_MAP[user.role] || ALL_SKILL_CATEGORIES;
    if (!isMySkillsMode && formData.employee) {
      const selectedEmp = employees.find(
        (e) => e.id === parseInt(formData.employee)
      );
      return (
        (selectedEmp && ROLE_CATEGORY_MAP[selectedEmp.role]) ||
        ALL_SKILL_CATEGORIES
      );
    }
    return ALL_SKILL_CATEGORIES;
  }, [isMySkillsMode, user, formData.employee, employees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Skill name is required.";
    if (!isMySkillsMode && !skillMatrixId && !formData.employee)
      newErrors.employee = "An employee must be selected.";
    if (!getAllowedCategories.includes(formData.category))
      newErrors.category =
        "This category is not applicable for the selected user role.";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setPageError("Please correct the errors below.");
      return;
    }
    setLoading(true);
    setPageError("");
    setFormErrors({});

    const payload = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      level: formData.level,
      employee: isMySkillsMode ? user.id : parseInt(formData.employee),
    };

    const mySkillsEndpoint = skillMatrixId
      ? `api/skill/my-skills/${skillMatrixId}/`
      : `api/skill/my-skills/`;
    const adminEndpoint = skillMatrixId
      ? `api/skill/${skillMatrixId}/`
      : `api/skill/`;
    const endpoint = isMySkillsMode ? mySkillsEndpoint : adminEndpoint;
    const method = skillMatrixId ? "patch" : "post";

    try {
      await api[method](endpoint, payload);
      alert("Skill saved successfully!");
      navigate(isMySkillsMode ? "/my-skills" : "/skill-matrix");
    } catch (error) {
      const apiErrors = error.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        setFormErrors(apiErrors);
        setPageError("Please correct the errors below.");
      } else {
        setPageError(apiErrors?.detail || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
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
      navigate(`/skills/edit/${skillMatrixId}`);
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
    <div className="container mx-auto text-star-dust-200 mb-10">
      <div className="max-w-4xl mx-auto">
        <FormHeader
          icon={<Briefcase />}
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
        />

        {pageError && (
          <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg">
            {pageError}
          </div>
        )}

        <div className="bg-card-main rounded-xl shadow-md p-6 sm:p-8">
          {isViewMode ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isMySkillsMode && (
                <InfoItem
                  icon={<Users />}
                  label="Employee"
                  value={getEmployeeName()}
                />
              )}
              <InfoItem
                icon={<Star />}
                label="Skill Name"
                value={formData.name}
              />
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
            // Edit/Create Mode
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {!isMySkillsMode && (
                  <SelectItem
                    label="Employee"
                    name="employee"
                    icon={<Users />}
                    value={formData.employee}
                    onChange={handleChange}
                    options={employees.map((emp) => ({
                      value: emp.id,
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
                    options={getAllowedCategories.map((cat) => ({
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
        </div>
      </div>
    </div>
  );
};

export default SkillForm;
