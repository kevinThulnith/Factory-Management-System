import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductionLineForm from "./pages/ProductionLineForm";
import ProtectedRoute from "./components/ProtectedRoute";
import SkillMatrixForm from "./pages/SkillMatrixForm";
import DepartmentForm from "./pages/DepartmentForm";
import MaterialFormPage from "./pages/MaterialForm";
import ProductionLine from "./pages/ProductionLine";
import MySkillsPage from "./pages/SkillMatrixMe";
import WorkshopForm from "./pages/WorkshopForm";
import SupplierForm from "./pages/SupplierForm";
import ProfilePage from "./pages/ProfilePage";
import MachineForm from "./pages/MachineForm";
import SkillMatrix from "./pages/Skillmatrix";
import ProductForm from "./pages/ProductForm";
import { useEffect, useState } from "react";
import Department from "./pages/Department";
import OrderForm from "./pages/OrderForm";
import Navbar from "./components/Navbar";
import Workshop from "./pages/Workshop";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import UserForm from "./pages/UserForm";
import Material from "./pages/Material";
import Supplier from "./pages/Supplier";
import Machine from "./pages/Machine";
import Product from "./pages/Product";
import Logout from "./pages/Logout";
import Login from "./pages/Login";
import Order from "./pages/Order";
import User from "./pages/User";
import Home from "./pages/Home";
import api from "./api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    api
      .get("api/user/me/")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => console.log("Checked authentication status"));
  }, []);

  // Define routes as a configuration array
  const protectedRoutes = [
    { path: "/", element: <Home /> },

    // User Management
    { path: "/profile", element: <ProfilePage /> },
    { path: "/register", element: <Register /> },
    { path: "/user", element: <User /> },
    { path: "/user/edit/:userId", element: <UserForm /> },

    // Department
    { path: "/department", element: <Department /> },
    { path: "/department/add", element: <DepartmentForm /> },
    { path: "/department/edit/:departmentId", element: <DepartmentForm /> },
    { path: "/department/view/:departmentId", element: <DepartmentForm /> },

    // Workshop
    { path: "/workshop", element: <Workshop /> },
    { path: "/workshop/add", element: <WorkshopForm /> },
    { path: "/workshop/edit/:workshopId", element: <WorkshopForm /> },
    { path: "/workshop/view/:workshopId", element: <WorkshopForm /> },

    // Machine
    { path: "/machine", element: <Machine /> },
    { path: "/machine/add", element: <MachineForm /> },
    { path: "/machine/edit/:machineId", element: <MachineForm /> },
    { path: "/machine/view/:machineId", element: <MachineForm /> },

    // Material
    { path: "/material", element: <Material /> },
    { path: "/material/add", element: <MaterialFormPage /> },
    { path: "/material/edit/:materialId", element: <MaterialFormPage /> },
    { path: "/material/view/:materialId", element: <MaterialFormPage /> },

    // Skill Matrix
    { path: "/my-skills", element: <MySkillsPage /> },
    { path: "/skill-matrix", element: <SkillMatrix /> },
    { path: "/skill-matrix/add", element: <SkillMatrixForm /> },
    { path: "/skills/edit/:skillMatrixId", element: <SkillMatrixForm /> },
    { path: "/skills/view/:skillMatrixId", element: <SkillMatrixForm /> },

    // Supplier
    { path: "/supplier", element: <Supplier /> },
    { path: "/supplier/add", element: <SupplierForm /> },
    { path: "/supplier/edit/:supplierId", element: <SupplierForm /> },
    { path: "/supplier/view/:supplierId", element: <SupplierForm /> },

    // Product
    { path: "/product", element: <Product /> },
    { path: "/product/add", element: <ProductForm /> },
    { path: "/product/edit/:productId", element: <ProductForm /> },
    { path: "/product/view/:productId", element: <ProductForm /> },

    // Order
    { path: "/order", element: <Order /> },
    { path: "/order/add", element: <OrderForm /> },
    { path: "/order/edit/:orderId", element: <OrderForm /> },
    { path: "/order/view/:orderId", element: <OrderForm /> },
    { path: "/production-line", element: <ProductionLine /> },

    // Production Line
    { path: "/production-line/add", element: <ProductionLineForm /> },
    {
      path: "/production-line/edit/:productionLineId",
      element: <ProductionLineForm />,
    },
    {
      path: "/production-line/view/:productionLineId",
      element: <ProductionLineForm />,
    },
  ];

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <div
        className={`${
          isAuthenticated ? "lg:mr-[450px] mt-24 lg:ml-[50px] mx-10" : ""
        } mb-10`}
      >
        <Routes>
          {/* Map through protected routes */}
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<ProtectedRoute>{route.element}</ProtectedRoute>}
            />
          ))}

          {/* Special routes that don't follow the pattern */}
          <Route
            path="/logout"
            element={<Logout setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
