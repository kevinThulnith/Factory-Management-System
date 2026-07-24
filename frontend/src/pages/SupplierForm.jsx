import { useParams, useNavigate, useLocation } from "react-router-dom";
import useEntityFormData from "../hooks/useEntityFormData";
import { MapPin, Truck, Phone, Mail } from "lucide-react";
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

// !Default values for the form
const SUPPLIER_DEFAULT = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  contact_person: "",
};

const SupplierForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supplierId } = useParams();

  // Determine mode from route path
  const isViewMode = location.pathname.includes("/view/");
  const isEditMode = location.pathname.includes("/edit/");

  const { user } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [formData, setFormData] = useState(SUPPLIER_DEFAULT);
  const [fetchLoading, setFetchLoading] = useState(false);

  // !Form submission state + handler now come from the hook itself
  const {
    loading: submitLoading,
    errors,
    pageError,
    setErrors,
    submit,
  } = useFormSubmit();
  const loading = fetchLoading || submitLoading;

  // !Check user permissions
  const canManage = user?.role === "ADMIN";

  // !Fetch component data
  const handleSupplierData = useEntityFormData(
    setSupplier,
    setFormData,
    SUPPLIER_DEFAULT,
  );

  const fetchSupplier = useFetchData(
    `supplier/${supplierId}`,
    setFetchLoading,
    handleSupplierData,
  );

  useEffect(() => {
    if (supplierId) fetchSupplier();
  }, [supplierId, fetchSupplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // !Submit form data
  const method = isEditMode ? "patch" : "post";
  const url = isEditMode ? `api/supplier/${supplierId}/` : "api/supplier/";
  const message = `Supplier ${isEditMode ? "updated" : "created"} successfully !!!`;
  const payload = Object.entries(formData).reduce((acc, [key, value]) => {
    acc[key] = value || null;
    return acc;
  }, {});

  const HandleSubmit = (e) => {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    submit(e, {
      method,
      url,
      payload,
      formData,
      message,
      onSuccess: () => navigate("/supplier"),
    });
  };

  return (
    <Form
      icon={<Truck />}
      heading={
        isViewMode
          ? "Supplier Details"
          : isEditMode
            ? "Edit Supplier"
            : "Add New Supplier"
      }
      text_01={
        isViewMode ? "View supplier information" : "Manage supplier details"
      }
      text_02="Suppliers"
      onClick={() => navigate("/supplier")}
      fnction={() => navigate(`/supplier/edit/${supplierId}`)}
      gradient="from-lime-600 to-lime-800"
      isViewMode={isViewMode && canManage}
      pageError={pageError}
      loading={loading}
    >
      {isViewMode ? (
        // View Mode
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <InfoItem
            icon={<Truck />}
            label="Supplier Name"
            value={supplier?.name}
          />
          <InfoItem icon={<Mail />} label="Email" value={supplier?.email} />
          <InfoItem icon={<Phone />} label="Phone" value={supplier?.phone} />
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
        <form onSubmit={HandleSubmit}>
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
              required
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
    </Form>
  );
};

export default SupplierForm;
