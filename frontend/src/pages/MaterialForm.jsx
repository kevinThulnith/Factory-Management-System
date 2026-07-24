import { Warehouse, FileText, Package, Ruler, Box } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useEntityFormData from "../hooks/useEntityFormData";
import useFormSubmit from "../hooks/useFormSubmit";
import useFetchData from "../hooks/useFetchData";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import Form from "../components/Form";

import {
  Buttons,
  InfoItem,
  InputItem,
  TextareaItem,
} from "../components/components";

// !Default values for form
const MATERIAL_DEFAULTS = {
  name: "",
  description: "",
  quantity: "0.00",
  reorder_level: "0.00",
  unit_of_measurement: "",
};

const MaterialForm = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");

  const { user } = useAuth();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [material, setMaterial] = useState(null);
  const [formData, setFormData] = useState(MATERIAL_DEFAULTS);

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
  const handleMaterialData = useEntityFormData(
    setMaterial,
    setFormData,
    MATERIAL_DEFAULTS,
  );

  const fetchMaterial = useFetchData(
    `material/${materialId}`,
    setFetchLoading,
    handleMaterialData,
  );

  useEffect(() => {
    if (materialId) fetchMaterial();
  }, [materialId, fetchMaterial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDecimalChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // !Submit form data
  const method = isEditMode ? "patch" : "post";
  const url = isEditMode ? `api/material/${materialId}/` : "api/material/";
  const message = `Material ${isEditMode ? "updated" : "created"} successfully !!!`;
  const payload = {
    ...formData,
    quantity: parseFloat(formData.quantity).toFixed(2),
    reorder_level: parseFloat(formData.reorder_level).toFixed(2),
  };

  const HandleSubmit = (e) =>
    submit(e, {
      method,
      url,
      payload,
      formData,
      message,
      onSuccess: () => navigate("/material"),
    });

  return (
    <Form
      icon={<Box />}
      heading={
        isViewMode
          ? "Material Details"
          : isEditMode
            ? "Edit Material"
            : "Create New Material"
      }
      text_01={
        isViewMode
          ? "View material information"
          : isEditMode
            ? "Update material information"
            : "Add a new material to your inventory"
      }
      text_02="Materials"
      onClick={() => navigate("/material")}
      fnction={() => navigate(`/material/edit/${materialId}`)}
      gradient="from-sky-600 to-sky-800"
      isViewMode={
        isViewMode && user?.role !== "PURCHASING" && user?.role === "ADMIN"
      }
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            icon={<Package />}
            label="Material Name"
            value={material?.name}
          />
          <InfoItem
            icon={<Ruler />}
            label="Unit of Measurement"
            value={material?.unit_of_measurement}
          />
          <InfoItem
            icon={<Warehouse />}
            label="Quantity in Stock"
            value={material?.quantity}
          />
          <InfoItem
            icon={<Warehouse />}
            label="Reorder Level"
            value={material?.reorder_level}
          />
          <div className="md:col-span-2">
            <InfoItem
              icon={<FileText />}
              label="Description"
              value={material?.description}
            />
          </div>
        </div>
      ) : (
        // !Edit/Create Mode
        <form onSubmit={HandleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputItem
                label="Material Name"
                name="name"
                icon={<Package />}
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Steel Plate 5mm"
                error={errors.name}
              />
            </div>

            <InputItem
              label="Unit of Measurement"
              name="unit_of_measurement"
              icon={<Ruler />}
              value={formData.unit_of_measurement}
              onChange={handleChange}
              placeholder="e.g., kg, meters, units"
              error={errors.unit_of_measurement}
              required
            />

            <InputItem
              label="Quantity"
              name="quantity"
              icon={<Warehouse />}
              value={formData.quantity}
              onChange={handleDecimalChange}
              required
              type="text"
              pattern="^(0*[1-9]\d*(\.\d+)?|0*\.\d*[1-9]\d*)$"
              inputMode="decimal"
              placeholder="e.g. 12.5"
              error={errors.quantity}
            />

            <InputItem
              label="Reorder Level"
              name="reorder_level"
              icon={<Warehouse />}
              value={formData.reorder_level}
              onChange={handleDecimalChange}
              required
              type="text"
              pattern="^(0*[1-9]\d*(\.\d+)?|0*\.\d*[1-9]\d*)$"
              inputMode="decimal"
              placeholder="e.g. 12.5"
              error={errors.reorder_level}
            />

            <div className="md:col-span-2">
              <TextareaItem
                label="Description"
                name="description"
                icon={<FileText />}
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter details about the material"
                error={errors.description}
              />
            </div>
          </div>

          <Buttons
            onCancel={() => navigate("/material")}
            text_01={isEditMode ? "Save Changes" : "Create Material"}
          />
        </form>
      )}
    </Form>
  );
};

export default MaterialForm;
