// src/pages/products/ProductListPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Package,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  Tag,
  ClipboardList,
} from "lucide-react";

// --- Reusable Components (Styled like Workshop page) ---
const LoadingIndicator = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      <p className="text-stone-300 mt-4">Loading Products...</p>
    </div>
  </div>
);

// --- Main Component ---
const Product = () => {
  const [user, setUser] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ searchTerm: "", status: "all" });

  // Fetch current user for permissions
  useEffect(() => {
    api
      .get("api/user/me/")
      .then((res) => setUser(res.data))
      .catch((error) => console.error("Failed to fetch user:", error));
  }, []);

  // Fetch products
  const fetchProducts = useCallback(() => {
    setLoading(true);
    api
      .get("api/product/")
      .then((res) => setAllProducts(res.data.results || res.data))
      .catch(() => alert("Failed to fetch products."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDelete = (id, productName) => {
    if (
      window.confirm(
        `Are you sure you want to delete product "${productName}"?`
      )
    ) {
      api
        .delete(`api/product/${id}/`)
        .then(() => {
          setAllProducts((prev) => prev.filter((p) => p.id !== id));
          alert(`Product "${productName}" has been deleted.`);
        })
        .catch(() => alert("Failed to delete product. It may be in use."));
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFiltersHandler = () => {
    setFilters({ searchTerm: "", status: "all" });
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        p.name.toLowerCase().includes(searchTermLower) ||
        p.code.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        filters.status === "all" || p.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [allProducts, filters]);

  const stats = useMemo(
    () => ({
      total: allProducts.length,
      active: allProducts.filter((p) => p.status === "ACTIVE").length,
      inactive: allProducts.filter((p) => p.status === "INACTIVE").length,
      discontinued: allProducts.filter((p) => p.status === "DISCONTINUED")
        .length,
    }),
    [allProducts]
  );

  const getStatusPill = (status) => {
    const styles = {
      ACTIVE: "bg-green-900/50 text-green-300 border-green-500/50",
      INACTIVE: "bg-yellow-900/50 text-yellow-300 border-yellow-500/50",
      DISCONTINUED: "bg-red-900/50 text-red-300 border-red-500/50",
    };
    return (
      <span
        className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 border ${
          styles[status] || "bg-stone-700 text-stone-300 border-stone-600"
        }`}
      >
        {status === "ACTIVE" && <CheckCircle size={12} />}
        {status === "INACTIVE" && <Activity size={12} />}
        {status === "DISCONTINUED" && <XCircle size={12} />}
        {status}
      </span>
    );
  };

  const canManage = user && user.role === "ADMIN";

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="rounded-2xl p-8 shadow-md mb-8 bg-card-main">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl mr-6 shadow-lg bg-star-dust-700 transform hover:scale-105 transition-all duration-300">
                <Package size={90} className="text-stone-200" />
              </div>
              <div>
                <h1 className="text-2xl font-medium mb-2 tracking-tight">
                  Product Catalog
                </h1>
                <p className="text-star-dust-400 text-1xl">
                  Manage and organize your company's products.
                </p>
                <div className="flex items-center flex-wrap mt-3 gap-2">
                  <span className="text-sm px-3 py-1 rounded-2xl bg-orange-600">
                    Total: <span className="font-medium">{stats.total}</span>
                  </span>
                  <span className="text-sm px-3 py-1 rounded-2xl bg-green-600">
                    Active: <span className="font-medium">{stats.active}</span>
                  </span>
                  <span className="text-sm px-3 py-1 rounded-2xl bg-yellow-600">
                    Inactive:{" "}
                    <span className="font-medium">{stats.inactive}</span>
                  </span>
                  <span className="text-sm px-3 py-1 rounded-2xl bg-red-600">
                    Discontinued:{" "}
                    <span className="font-medium">{stats.discontinued}</span>
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
              {canManage && (
                <Link
                  to="/product/add"
                  className="px-3 py-2 text-stone-200 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600"
                >
                  <PlusCircle size={20} className="mr-2" />
                  Add Product
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card-main rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="flex items-center text-slate-300 mb-4">
            <Filter size={15} className="mr-2" /> Search & Filter
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
                placeholder="Search by name or code..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border-none outline-none rounded-lg bg-card-sub"
              />
            </div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONTINUED">Discontinued</option>
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
        {filteredProducts.length === 0 && !loading ? (
          <div className="bg-[#2a2a2a] rounded-xl p-12 text-center shadow-lg border border-stone-700">
            <Package size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-stone-300 mb-2">
              No Products Found
            </h3>
            <p className="text-stone-400">
              Try adjusting your filters or add your first product.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="relative bg-[#2a2a2a] shadow-lg rounded-xl border border-stone-700/50 flex flex-col transition-all duration-300 hover:border-orange-500/50 hover:-translate-y-1"
              >
                <div className="p-5 flex-grow">
                  {getStatusPill(product.status)}
                  <h2
                    className="text-lg font-bold text-orange-400 truncate mt-8 mb-2"
                    title={product.name}
                  >
                    {product.name}
                  </h2>
                  <div className="space-y-2 text-sm text-stone-400">
                    <p className="flex items-center">
                      <Tag size={15} className="mr-2 flex-shrink-0" /> Code:{" "}
                      <span className="font-medium text-stone-300 ml-1">
                        {product.code}
                      </span>
                    </p>
                    <p className="flex items-center">
                      <ClipboardList size={15} className="mr-2 flex-shrink-0" />{" "}
                      Unit:{" "}
                      <span className="font-medium text-stone-300 ml-1">
                        {product.unit_of_measurement || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-stone-900/40 px-5 py-3 border-t border-stone-700/50 mt-auto rounded-b-xl">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/product/view/${product.id}`}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          to={`/product/edit/${product.id}`}
                          className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg"
                          title="Edit Product"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
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

export default Product;
