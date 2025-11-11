import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  InfoItem,
  InputItem,
  SelectItem,
  TextareaItem,
} from "../components/components";

import {
  Cog,
  Save,
  Users,
  Factory,
  XCircle,
  FileText,
  Activity,
  ListChecks,
  CheckCircle,
  SlidersHorizontal,
} from "lucide-react";

const ProductionLineForm = () => {
  const { lineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/add");

  const { user } = useAuth();
  const [line, setLine] = useState(null);
  const [allMachines, setAllMachines] = useState([]);
  const [allWorkshops, setAllWorkshops] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workshop: "",
    operational_status: "ACTIVE",
    production_capacity: "0.00",
    machines: [],
  });
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState({ page: true, action: false });

  // Permissions
  const canSubmitFullForm = useMemo(
    () => user && (user.role === "ADMIN" || user.role === "SUPERVISOR"),
    [user]
  );
  const canEditStatusOnly = useMemo(
    () => user && user.role === "MANAGER" && !canSubmitFullForm,
    [user]
  );

  // Data Fetching
  useEffect(() => {
    api
      .get("api/workshop/")
      .then((res) => setAllWorkshops(res.data.results || res.data));
    api
      .get("api/machine/")
      .then((res) => setAllMachines(res.data.results || res.data));
  }, []);

  const fetchLineData = useCallback(() => {
    if (!lineId) {
      setLoading((prev) => ({ ...prev, page: false }));
      return;
    }
    setLoading((prev) => ({ ...prev, page: true }));
    api
      .get(`api/production-line/${lineId}/`)
      .then((res) => {
        setLine(res.data);
        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          workshop: res.data.workshop || "",
          operational_status: res.data.operational_status || "ACTIVE",
          production_capacity: parseFloat(
            res.data.production_capacity || 0
          ).toFixed(2),
          machines: res.data.machines || [],
        });
      })
      .catch(() => setPageError("Failed to load production line details."))
      .finally(() => setLoading((prev) => ({ ...prev, page: false })));
  }, [lineId]);

  useEffect(() => {
    fetchLineData();
  }, [fetchLineData]);

  // Event Handlers
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMachineCheckboxChange = (machineId) => {
    setFormData((prev) => ({
      ...prev,
      machines: prev.machines.includes(machineId)
        ? prev.machines.filter((id) => id !== machineId)
        : [...prev.machines, machineId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, action: true }));
    setPageError("");

    let payload;
    if (canEditStatusOnly) {
      payload = { operational_status: formData.operational_status };
    } else {
      payload = {
        name: formData.name,
        description: formData.description,
        workshop: formData.workshop,
        operational_status: formData.operational_status,
        production_capacity: formData.production_capacity,
        machines: formData.machines,
      };
    }

    try {
      if (isCreateMode) {
        await api.post("api/production-line/", payload);
      } else {
        await api.patch(`api/production-line/${lineId}/`, payload);
      }
      alert("Production Line saved successfully!");
      navigate("/production-lines");
    } catch (err) {
      setPageError(
        err.response?.data?.detail || "Failed to save production line."
      );
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={14} />,
      },
      INACTIVE: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle size={14} />,
      },
      MAINTENANCE: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Cog size={14} />,
      },
    }[status];
    if (!config) return null;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${config.color}`}
      >
        {config.icon} {status}
      </span>
    );
  };

  const isFieldDisabled = (fieldName) =>
    canEditStatusOnly && fieldName !== "operational_status";

  return (
    <Form
      icon={<Factory />}
      heading={
        isViewMode
          ? "View Production Line"
          : isCreateMode
          ? "Add Production Line"
          : "Edit Production Line"
      }
      text_01={
        isViewMode
          ? "View details of the production line."
          : isCreateMode
          ? "Fill in the details to add a new production line."
          : "Modify the details of the production line."
      }
      text_02={"Production Lines"}
      onClick={() => navigate("/production-line")}
      fnction={() => navigate("/production-line/edit/" + lineId)}
      gradient={"from-amber-600 to-amber-800"}
      isViewMode={isViewMode}
      pageError={pageError}
      loading={loading.page}
    >
      {isViewMode ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem icon={<Factory />} label="Line Name" value={line?.name} />
            <InfoItem
              icon={<Factory />}
              label="Workshop"
              value={line?.workshop_name}
            />
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm text-stone-400 mb-2">
                Status
              </label>
              {line?.operational_status &&
                getStatusBadge(line.operational_status)}
            </div>
            <InfoItem
              icon={<Activity />}
              label="Efficiency"
              value={`${line?.efficiency || "N/A"}%`}
            />
            <InfoItem
              icon={<SlidersHorizontal />}
              label="Capacity"
              value={`${line?.capacity || "N/A"} units/hr`}
            />
            <InfoItem
              icon={<Users />}
              label="Supervisor"
              value={line?.supervisor_name || "N/A"}
            />
          </div>
          <InfoItem
            icon={<FileText />}
            label="Description"
            value={line?.description}
          />
          <div>
            <h3 className="text-lg font-medium text-stone-300 mb-3 border-b border-stone-700 pb-2 flex items-center gap-2">
              <ListChecks /> Assigned Machines
            </h3>
            {line?.machines_details?.length > 0 ? (
              <ul className="space-y-2 mt-4">
                {line.machines_details.map((machine) => (
                  <li
                    key={machine.id}
                    className="p-3 bg-stone-900/50 rounded-md"
                  >
                    {machine.name} ({machine.model_number})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-400 italic">
                No machines assigned to this line.
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputItem
              label="Line Name"
              name="name"
              icon={<Factory />}
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isFieldDisabled("name")}
            />
            <SelectItem
              label="Workshop"
              name="workshop"
              icon={<Factory />}
              value={formData.workshop}
              onChange={handleChange}
              options={allWorkshops.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
              required
              disabled={isFieldDisabled("workshop")}
            />
            <InputItem
              label="Production Capacity (units/hr)"
              name="production_capacity"
              icon={<SlidersHorizontal />}
              value={formData.production_capacity}
              onChange={handleChange}
              required
              disabled={isFieldDisabled("production_capacity")}
            />
            <SelectItem
              label="Operational Status"
              name="operational_status"
              icon={<Activity />}
              value={formData.operational_status}
              onChange={handleChange}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "MAINTENANCE", label: "Maintenance" },
              ]}
              required
              disabled={isFieldDisabled("operational_status")}
            />
            <div className="md:col-span-2">
              <TextareaItem
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                disabled={isFieldDisabled("description")}
              />
            </div>
          </div>

          {!canEditStatusOnly && (
            <div className="mt-8 pt-6 border-t border-stone-700">
              <h3 className="text-lg font-medium text-stone-300 mb-4 flex items-center gap-2">
                <ListChecks /> Assign Machines
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-stone-900/50 border border-stone-700 rounded-lg">
                {allMachines.map((machine) => (
                  <label
                    key={machine.id}
                    className="flex items-center p-2 hover:bg-stone-800 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={machine.id}
                      checked={formData.machines.includes(machine.id)}
                      onChange={() => handleMachineCheckboxChange(machine.id)}
                      className="h-4 w-4 rounded bg-stone-700 border-stone-600 text-orange-500 focus:ring-orange-600"
                    />
                    <span className="ml-3 text-stone-300">{machine.name}</span>
                    <span className="ml-auto text-xs text-stone-400 bg-stone-700 px-2 py-0.5 rounded-full">
                      {machine.workshop_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-stone-500">
            <button
              type="button"
              onClick={() => navigate("/production-lines")}
              disabled={loading.action}
              className="bg-stone-600 hover:bg-stone-700 text-stone-200 font-medium py-2 px-3 rounded-md transition text-[14px] inline-flex items-center gap-2"
            >
              <XCircle size={18} /> Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading.action || (!canSubmitFullForm && !canEditStatusOnly)
              }
              className="bg-orange-500 hover:bg-orange-600 text-stone-900 font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.action ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default ProductionLineForm;
