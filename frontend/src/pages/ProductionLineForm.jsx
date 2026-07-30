import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import useFormSubmit from "../hooks/useFormSubmit";
import useWorkshops from "../hooks/useWorkshops";
import useFetchData from "../hooks/useFetchData";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";
import api from "../api";

import {
  Status,
  Buttons,
  InfoItem,
  InputItem,
  SelectItem,
  TextareaItem,
} from "../components/components";

import {
  Cog,
  Wrench,
  Factory,
  XCircle,
  FileText,
  Activity,
  ListChecks,
  CheckCircle,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";

const ProductionLineForm = () => {
  const { productionLineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewMode = location.pathname.includes("/view/");
  const isCreateMode = location.pathname.includes("/add");

  const { user } = useAuth();
  const { workshops } = useWorkshops();
  const [line, setLine] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [allMachines, setAllMachines] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    workshop: "",
    description: "",
    production_capacity: "0.00",
    operational_status: "ACTIVE",
    machines: [],
  });

  // !Form submission state + handler now come from the hook itself
  const {
    loading: submitLoading,
    pageError,
    setPageError,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Permissions
  const canSubmitFullForm = user && ["ADMIN", "SUPERVISOR"].includes(user.role);
  const canEditStatusOnly =
    user && user.role === "MANAGER" && !canSubmitFullForm;

  // !Fetch components data
  const fetchMachines = useFetchData("machine", setFetchLoading, setAllMachines);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const fetchLineData = useCallback(() => {
    setFetchLoading(true);
    api
      .get(`api/production-line/${productionLineId}/`)
      .then((res) => {
        setLine(res.data);
        // Extract machine IDs from the machines array for form data
        const machineIds = Array.isArray(res.data.machines)
          ? res.data.machines.map((m) => (typeof m === "object" ? m.id : m))
          : [];

        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          workshop: res.data.workshop || "",
          operational_status: res.data.operational_status || "ACTIVE",
          production_capacity: parseFloat(
            res.data.production_capacity || 0,
          ).toFixed(2),
          machines: machineIds,
        });
      })
      .catch((error) => {
        console.error("Failed to load production line details:", error);
        setPageError("Failed to load production line details.");
      })
      .finally(() => setFetchLoading(false));
  }, [productionLineId, setPageError]);

  useEffect(() => {
    if (productionLineId) fetchLineData();
  }, [productionLineId, fetchLineData]);

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

  // !Submit form data
  const method = isCreateMode ? "post" : "patch";
  const url = isCreateMode
    ? "api/production-line/"
    : `api/production-line/${productionLineId}/`;
  const message = `Production Line ${isCreateMode ? "created" : "updated"} successfully !!!`;
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
      machine_ids: formData.machines,
    };
  }

  const HandleSubmit = (e) =>
    submit(e, {
      method,
      url,
      payload,
      formData,
      message,
      onSuccess: () => navigate("/production-line"),
    });

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: {
        color: "bg-green-200 text-green-800",
        icon: <CheckCircle size={14} />,
      },
      INACTIVE: {
        color: "bg-red-200 text-red-800",
        icon: <XCircle size={14} />,
      },
      MAINTENANCE: {
        color: "bg-yellow-200 text-yellow-800",
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPERATIONAL":
        return (
          <CheckCircle
            size={19}
            className="text-green-800 bg-green-200 rounded-full p-[2.5px]"
          />
        );
      case "IDLE":
        return (
          <Activity
            size={19}
            className="text-yellow-800 bg-yellow-200 rounded-full p-[2.5px]"
          />
        );
      case "MAINTENANCE":
        return (
          <Wrench
            size={19}
            className="text-blue-800 bg-blue-200 rounded-full p-[2.5px]"
          />
        );
      case "BROKEN":
        return (
          <AlertTriangle
            size={19}
            className="text-red-800 bg-red-200 rounded-full p-[2.5px]"
          />
        );
      default:
        return (
          <XCircle
            size={19}
            className="text-gray-800 bg-gray-200 rounded-full p-1"
          />
        );
    }
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
      fnction={() => navigate("/production-line/edit/" + productionLineId)}
      gradient={"from-amber-600 to-amber-800"}
      isViewMode={isViewMode && (canEditStatusOnly || canSubmitFullForm)}
      pageError={pageError}
      loading={loading}
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
            <InfoItem
              icon={<SlidersHorizontal />}
              label="Production Capacity"
              value={`${line?.production_capacity || "N/A"} units/hr`}
            />
            <Status
              label="Status"
              value={line?.operational_status && getStatusBadge(line.operational_status)}
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
            {line?.machines && line.machines.length > 0 ? (
              <ul className="space-y-4 mt-4">
                {line.machines.map((machine) => (
                  <li
                    key={machine.id}
                    className="p-4 bg-card-sub rounded-xl shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-stone-200">
                          {machine.name}
                        </h4>
                        <p className="text-sm text-stone-400 mt-1">
                          Model: {machine.model_number}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-stone-400">
                          {machine.status === "OPERATIONAL" ? (
                            machine.operator_name ? (
                              <span className="flex items-center gap-1.5">
                                {getStatusIcon(machine.status)}
                                Operator: {machine.operator_name}
                              </span>
                            ) : (
                              <span className="text-stone-500 italic flex items-center gap-1.5">
                                {getStatusIcon(machine.status)}
                                No operator assigned
                              </span>
                            )
                          ) : (
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(machine.status)}
                              {machine.status}
                            </span>
                          )}
                        </div>
                        {machine.operator_assignments > 0 && (
                          <p className="text-xs text-stone-500 mt-1">
                            Assignments: {machine.operator_assignments}
                          </p>
                        )}
                      </div>
                    </div>
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
        <form onSubmit={HandleSubmit}>
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
              options={workshops.map((w) => ({
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

          <Buttons
            onCancel={() => navigate("/production-line")}
            text_01={isCreateMode ? "Create Line" : "Save Changes"}
            disabled={loading || (!canSubmitFullForm && !canEditStatusOnly)}
          />
        </form>
      )}
    </Form>
  );
};

export default ProductionLineForm;
