import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DepartmentForm from "./pages/DepartmentForm";
import WorkshopForm from "./pages/WorkshopForm";
import ProfilePage from "./pages/ProfilePage";
import { useEffect, useState } from "react";
import Department from "./pages/Department";
import Navbar from "./components/Navbar";
import Workshop from "./pages/Workshop";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import UserForm from "./pages/UserForm";
import Logout from "./pages/Logout";
import Login from "./pages/Login";
import User from "./pages/User";
import Home from "./pages/Home";
import api from "./api";
import Machine from "./pages/Machine";
import MachineForm from "./pages/MachineForm";
import Material from "./pages/Material";
import MaterialFormPage from "./pages/MaterialForm";
import SkillMatrix from "./pages/Skillmatrix";
import MySkillsPage from "./pages/SkillMatrixMe";
import Supplier from "./pages/Supplier";
import SupplierForm from "./pages/SupplierForm";
import Product from "./pages/Product";
import ProductForm from "./pages/ProductForm";

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
    { path: "/profile", element: <ProfilePage /> },
    { path: "/register", element: <Register /> },
    { path: "/department", element: <Department /> },
    { path: "/user", element: <User /> },
    { path: "/user/edit/:userId", element: <UserForm /> },
    { path: "/department/edit/:departmentId", element: <DepartmentForm /> },
    { path: "/department/view/:departmentId", element: <DepartmentForm /> },
    { path: "/department/add", element: <DepartmentForm /> },
    { path: "/workshop", element: <Workshop /> },
    { path: "/workshop/edit/:workshopId", element: <WorkshopForm /> },
    { path: "/workshop/view/:workshopId", element: <WorkshopForm /> },
    { path: "/workshop/add", element: <WorkshopForm /> },
    { path: "/machine", element: <Machine /> },
    { path: "/machine/add", element: <MachineForm /> },
    { path: "/machine/edit/:machineId", element: <MachineForm /> },
    { path: "/machine/view/:machineId", element: <MachineForm /> },
    { path: "/material", element: <Material /> },
    { path: "/material/add", element: <MaterialFormPage /> },
    { path: "/material/edit/:materialId", element: <MaterialFormPage /> },
    { path: "/material/view/:materialId", element: <MaterialFormPage /> },
    { path: "/skill-matrix", element: <SkillMatrix /> },
    { path: "/my-skills", element: <MySkillsPage /> },
    { path: "/supplier", element: <Supplier /> },
    { path: "/supplier/add", element: <SupplierForm /> },
    { path: "/supplier/edit/:supplierId", element: <SupplierForm /> },
    { path: "/supplier/view/:supplierId", element: <SupplierForm /> },
    { path: "/product", element: <Product /> },
    { path: "/product/add", element: <ProductForm /> },
    { path: "/product/edit/:productId", element: <ProductForm /> },
    { path: "/product/view/:productId", element: <ProductForm /> },
  ];

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar />}
      <div
        className={`${
          isAuthenticated ? "lg:mr-[450px] mt-24 lg:ml-[50px] mx-10" : ""
        }`}
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
