// src/pages/materials/MaterialForm.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../api"; // Assuming a shared API service

import {
  InfoItem,
  InputItem,
  TextareaItem,
} from "../components/components"; // Reusing your custom components

import {
  Box,
  Save,
  XCircle,
  ChevronLeft,
  Edit2,
  FileText,
  Package,
  Ruler, // Using Ruler for unit of measurement
  Warehouse, // A more fitting icon for stock
} from "lucide-react";

const MaterialForm = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");
  const isCreateMode = location.pathname.includes("/add");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit_of_measurement: "",
    quantity: "0.00",
    reorder_level: "0.00",
  });

  const [material, setMaterial] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  // Fetch material data if editing or viewing
  useEffect(() => {
    if (materialId) {
      setLoading(true);
      api
        .get(`api/material/${materialId}/`)
        .then((response) => {
          const mData = response.data;
          setMaterial(mData);
          setFormData({
            name: mData.name || "",
            description: mData.description || "",
            unit_of_measurement: mData.unit_of_measurement || "",
            quantity: parseFloat(mData.quantity || 0).toFixed(2),
            reorder_level: parseFloat(mData.reorder_level || 0).toFixed(2),
          });
        })
        .catch((error) => {
          setPageError("Failed to load material details.");
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [materialId]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Material name is required.";
    if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = "Quantity must be a non-negative number.";
    }
    if ( isisNaN(parseFloat(formData.reorder_level))|| parseFloat(formData.reorder_level) < 0) {
      newErrors.reorder_level = "Reorder level must be a non-negative number.";
    }
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
      quantity: parseFloat(formData.quantity).toFixed(2),
      reorder_level: parseFloat(formData.reorder_level).toFixed(2),
    };

    try {
      if (isEditMode) {
        await api.patch(`api/material/${materialId}/`, payload);
      } else {
        await api.post("api/material/", payload);
      }
      alert("Material saved successfully!");
      navigate("/materials");
    } catch (error) {
      console.error("Form submission error:", error.response);
      const apiErrors = error.response?.data;

      if (apiErrors && typeof apiErrors === "object") {
        const newFormErrors = {};
        for (const key in apiErrors) {
          if (
            Object.prototype.hasOwnProperty.call(formData, key) &&
            Array.isArray(apiErrors[key])
          ) {
            newFormErrors[key] = apiErrors[key].join(" ");
          }
        }
        setErrors(newFormErrors);

        if (Object.keys(newFormErrors).length === 0) {
          setPageError(
            apiErrors.detail || "An error occurred. Please try again."
          );
        } else {
          setPageError("Please correct the errors below.");
        }
      } else {
        setPageError(
          error.response?.data?.detail || "An error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/material/edit/${materialId}`);
  };

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a1a]">
        <div className="text-stone-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto text-star-dust-200 mb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card-main p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-lg p-2 mr-4 text-stone-200">
              <Box size={35} />
            </div>
            <div>
              <h1 className="text-2xl font-medium">
                {isViewMode && "Material Details"}
                {isEditMode && "Edit Material"}
                {isCreateMode && "Create New Material"}
              </h1>
              <p className="text-stone-400 mt-1 text-1xl">
                {isViewMode && "View material information"}
                {isEditMode && "Update material information"}
                {isCreateMode && "Add a new material to your inventory"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/material")}
              className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-md gap-2 px-3 hover:shadow-sm"
            >
              <ChevronLeft size={20} />
              Materials
            </button>
            {isViewMode && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-md gap-2 px-3 hover:shadow-sm"
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
              <InfoItem icon={<Package />} label="Material Name" value={material?.name} />
              <InfoItem icon={<Ruler />} label="Unit of Measurement" value={material?.unit_of_measurement} />
              <InfoItem icon={<Warehouse />} label="Quantity in Stock" value={material?.quantity} />
              <InfoItem icon={<Warehouse />} label="Reorder Level" value={material?.reorder_level} />
              <div className="md:col-span-2">
                <InfoItem icon={<FileText />} label="Description" value={material?.description} />
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputItem
                    label="Material Name" name="name" icon={<Package />}
                    value={formData.name} onChange={handleChange} required
                    placeholder="e.g., Steel Plate 5mm" error={errors.name}
                  />
                </div>

                <InputItem
                  label="Unit of Measurement" name="unit_of_measurement" icon={<Ruler />}
                  value={formData.unit_of_measurement} onChange={handleChange}
                  placeholder="e.g., kg, meters, units" error={errors.unit_of_measurement}
                />
                
                <InputItem
                  label="Quantity" name="quantity" icon={<Warehouse />}
                  value={formData.quantity} onChange={handleDecimalChange} required
                  inputMode="decimal" error={errors.quantity}
                />

                <InputItem
                  label="Reorder Level" name="reorder_level" icon={<Warehouse />}
                  value={formData.reorder_level} onChange={handleDecimalChange} required
                  inputMode="decimal" error={errors.reorder_level}
                />

                <div className="md:col-span-2">
                  <TextareaItem
                    label="Description" name="description" icon={<FileText />}
                    value={formData.description} onChange={handleChange} rows="4"
                    placeholder="Enter details about the material" error={errors.description}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-stone-500">
                <button
                  type="button" onClick={() => navigate("/material")} disabled={loading}
                  className="bg-stone-600 hover:bg-stone-700 text-stone-200 font-medium py-2 px-3 rounded-md transition text-[14px]"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-stone-900 font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? ( "Saving..." ) : (
                    <>
                      <Save size={18} />
                      {isEditMode ? "Save Changes" : "Create Material"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialForm;