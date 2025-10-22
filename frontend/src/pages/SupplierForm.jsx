import { ChevronLeft, MapPin, Truck, Edit2, Phone, Mail } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../api";

import {
  Buttons,
  InfoItem,
  InputItem,
  TextareaItem,
} from "../components/components";

const SupplierForm = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");
  const isCreateMode = location.pathname.includes("/add");

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    api
      .get("api/user/me/")
      .then((res) => setUser(res.data))
      .catch((error) => console.error("Failed to fetch user:", error));

    if (supplierId) {
      setLoading(true);
      api
        .get(`api/supplier/${supplierId}/`)
        .then((response) => {
          const sData = response.data;
          setSupplier(sData);
          setFormData({
            name: sData.name || "",
            email: sData.email || "",
            phone: sData.phone || "",
            address: sData.address || "",
          });
        })
        .catch(() => setPageError("Failed to load supplier details."))
        .finally(() => setLoading(false));
    }
  }, [supplierId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Supplier name is required.";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    setErrors(newErrors);
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
    setErrors({});

    // Filter out empty strings and send them as null if desired by the backend
    const payload = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value || null;
      return acc;
    }, {});

    try {
      if (isEditMode) {
        await api.patch(`api/supplier/${supplierId}/`, payload);
      } else {
        await api.post("api/supplier/", payload);
      }
      alert("Supplier saved successfully!");
      navigate("/suppliers");
    } catch (error) {
      const apiErrors = error.response?.data;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors);
        setPageError("Please correct the errors below.");
      } else {
        setPageError(apiErrors?.detail || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const canManage = user && user.role === "ADMIN";

  if (loading && !supplier) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a1a]">
        <div className="text-stone-400">Loading Supplier...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto text-star-dust-200 mb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card-main p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-lime-600 to-lime-800 shadow-lg rounded-lg p-2 mr-4 text-stone-200">
              <Truck size={35} />
            </div>
            <div>
              <h1 className="text-2xl font-medium">
                {isViewMode && "Supplier Details"}
                {isEditMode && "Edit Supplier"}
                {isCreateMode && "Add New Supplier"}
              </h1>
              <p className="text-stone-400 mt-1 text-1xl">
                {isViewMode
                  ? "View supplier information"
                  : "Manage supplier details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/supplier")}
              className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-1 px-3 hover:shadow-sm"
            >
              <ChevronLeft size={20} /> Suppliers
            </button>
            {isViewMode && canManage && (
              <button
                onClick={() => navigate(`/supplier/edit/${supplierId}`)}
                className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-2 px-3 hover:shadow-sm"
              >
                <Edit2 size={18} /> Edit
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
        <div className="bg-card-main rounded-xl shadow-md p-6 sm:p-8">
          {isViewMode ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InfoItem
                icon={<Truck />}
                label="Supplier Name"
                value={supplier?.name}
              />
              <InfoItem icon={<Mail />} label="Email" value={supplier?.email} />
              <InfoItem
                icon={<Phone />}
                label="Phone"
                value={supplier?.phone}
              />
              <div className="md:col-span-2">
                <InfoItem
                  icon={<MapPin />}
                  label="Address"
                  value={supplier?.address}
                />
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputItem
                  label="Supplier Name"
                  name="name"
                  icon={<Truck />}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Global Parts Inc."
                  error={errors.name}
                />
                <InputItem
                  label="Email"
                  name="email"
                  icon={<Mail />}
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., contact@globalparts.com"
                  error={errors.email}
                />
                <InputItem
                  label="Phone"
                  name="phone"
                  icon={<Phone />}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                  error={errors.phone}
                />
                <div className="md:col-span-2">
                  <TextareaItem
                    label="Address"
                    name="address"
                    icon={<MapPin />}
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter full address"
                    error={errors.address}
                  />
                </div>
              </div>

              <Buttons
                onCancel={() => navigate("/supplier")}
                text_01={isEditMode ? "Save Changes" : "Create Supplier"}
                disabled={loading || !canManage}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;
