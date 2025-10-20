// src/pages/suppliers/SupplierListPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Truck,
  Search,
  Mail,
  Phone,
  MapPin,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  RefreshCw,
  Download,
  UserCircle,
  Globe,
  RotateCcw,
} from "lucide-react";

// --- Reusable Components (Styled like Workshop page) ---
const LoadingIndicator = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      <p className="text-stone-300 mt-4">Loading Suppliers...</p>
    </div>
  </div>
);

// --- Main Component ---
const Supplier = () => {
  const [user, setUser] = useState({});
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    sortBy: "name-asc",
  });

  const fetchSuppliers = useCallback(() => {
    setLoading(true);
    api
      .get("api/supplier/")
      .then((res) => setAllSuppliers(res.data.results || res.data))
      .catch(() => alert("Failed to fetch suppliers."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("api/user/me/")
      .then((res) => setUser(res.data))
      .catch((error) => console.error("Failed to fetch user:", error));
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSuppliers();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDelete = (id, supplierName) => {
    if (
      window.confirm(
        `Are you sure you want to delete supplier "${supplierName}"?`
      )
    ) {
      api
        .delete(`api/supplier/${id}/`)
        .then(() => {
          setAllSuppliers((prev) => prev.filter((sup) => sup.id !== id));
          alert(`Supplier "${supplierName}" has been deleted.`);
        })
        .catch(() =>
          alert("Failed to delete supplier. It may be linked to other records.")
        );
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFiltersHandler = () => {
    setFilters({ searchTerm: "", sortBy: "name-asc" });
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Supplier Name,Contact Person,Email,Phone,Address,Website\n" +
      filteredAndSortedSuppliers
        .map(
          (s) =>
            `"${s.name}","${s.contact_person || ""}","${s.email || ""}","${
              s.phone || ""
            }","${s.address || ""}","${s.website || ""}"`
        )
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `suppliers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filteredAndSortedSuppliers = useMemo(() => {
    const filtered = allSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (s.contact_person &&
          s.contact_person
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (s.email &&
          s.email.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    );

    const [field, direction] = filters.sortBy.split("-");
    return [...filtered].sort((a, b) => {
      const aVal = a[field] || "";
      const bVal = b[field] || "";
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [allSuppliers, filters]);

  const stats = useMemo(() => ({ total: allSuppliers.length }), [allSuppliers]);
  const canManage = user && user.role === "ADMIN";

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto text-star-dust-200">
        {/* Header Section */}
        <div className="rounded-2xl p-8 shadow-md mb-8 bg-card-main">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl mr-6 shadow-lg bg-gradient-to-r from-lime-600 to-lime-800 transform hover:scale-105 transition-all duration-300">
                <Truck size={90} className="text-stone-200" />
              </div>
              <div>
                <h1 className="text-2xl font-medium mb-2 tracking-tight">
                  Supplier Management
                </h1>
                <p className="text-star-dust-400 text-1xl">
                  Manage and monitor your vendor relationships and supply chain.
                </p>
                <div className="flex items-center mt-3">
                  <span className="text-sm text-gray-200 px-3 py-1 rounded-2xl bg-orange-600">
                    Total Suppliers:{" "}
                    <span className="font-medium">{stats.total}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 lg:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-2 rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl text-[14px] bg-yellow-500 hover:scale-105 text-stone-700"
              >
                <RefreshCw
                  size={18}
                  className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={handleExport}
                disabled={filteredAndSortedSuppliers.length === 0}
                className="px-3 py-2 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105 bg-blue-700 text-stone-200"
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </button>
              {canManage && (
                <Link
                  to="/suppliers/new"
                  className="px-3 py-2 text-stone-200 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600"
                >
                  <PlusCircle size={20} className="mr-2" />
                  Add Supplier
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card-main rounded-xl p-6 mb-8 shadow-md">
          <h3 className="flex items-center text-slate-300 mb-4">
            <Filter size={15} className="mr-2" /> Search & Sort
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="searchTerm"
                placeholder="Search suppliers..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border-none outline-none rounded-lg bg-card-sub"
              />
            </div>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none py-2"
            >
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
              <option value="contact_person-asc">Sort by Contact (A-Z)</option>
              <option value="contact_person-desc">Sort by Contact (Z-A)</option>
            </select>
            <button
              onClick={resetFiltersHandler}
              className="px-4 py-2 duration-200 font-medium bg-blue-600 rounded-lg hover:scale-105 inline-flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Content Area */}
        {filteredAndSortedSuppliers.length === 0 && !loading ? (
          <div className="bg-[#2a2a2a] rounded-xl p-12 text-center shadow-lg border border-stone-700">
            <Truck size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-stone-300 mb-2">
              No Suppliers Found
            </h3>
            <p className="text-stone-400">
              Try adjusting your filters or add your first supplier.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-card-main shadow-md rounded-xl flex flex-col transition-all duration-300  hover:-translate-y-1"
              >
                <div className="p-5 flex-grow">
                  <h2
                    className="text-lg font-bold text-orange-400 truncate mb-2"
                    title={supplier.name}
                  >
                    {supplier.name}
                  </h2>
                  {supplier.contact_person && (
                    <p className="flex items-center text-sm text-stone-300 mb-3">
                      <UserCircle size={16} className="mr-2 text-stone-400" />
                      {supplier.contact_person}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-stone-400">
                    {supplier.email && (
                      <p className="flex items-center">
                        <Mail size={15} className="mr-2 flex-shrink-0" />
                        <a
                          href={`mailto:${supplier.email}`}
                          className="truncate hover:text-orange-400"
                        >
                          {supplier.email}
                        </a>
                      </p>
                    )}
                    {supplier.phone && (
                      <p className="flex items-center">
                        <Phone size={15} className="mr-2 flex-shrink-0" />
                        <a
                          href={`tel:${supplier.phone}`}
                          className="truncate hover:text-orange-400"
                        >
                          {supplier.phone}
                        </a>
                      </p>
                    )}
                    {supplier.address && (
                      <p className="flex items-start">
                        <MapPin
                          size={15}
                          className="mr-2 mt-0.5 flex-shrink-0"
                        />
                        <span>{supplier.address}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-auto px-6 py-4 bg-card-sub rounded-b-xl">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/supplier/view/${supplier.id}`}
                      className="text-purple-200 hover:text-black transition duration-200 p-2 hover:bg-purple-200 rounded-full shadow-sm"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          to={`/supplier/edit/${supplier.id}`}
                          className="text-indigo-200 hover:text-indigo-800 transition duration-200 p-2 hover:bg-indigo-100 rounded-full shadow-sm"
                          title="Edit Supplier"
                        >
                          <Edit3 size={20} />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(supplier.id, supplier.name)
                          }
                          className="text-red-200 hover:text-red-800 transition duration-200 p-2 hover:bg-red-100 rounded-full shadow-sm"
                          title="Delete Supplier"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {loading && !refreshing && <LoadingIndicator />}
    </div>
  );
};

export default Supplier;
