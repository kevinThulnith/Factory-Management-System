import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { lazy, Suspense } from "react";

const ProductionLineForm = lazy(() => import("./pages/ProductionLineForm"));
const SkillMatrixForm = lazy(() => import("./pages/SkillMatrixForm"));
const DepartmentForm = lazy(() => import("./pages/DepartmentForm"));
const MaterialFormPage = lazy(() => import("./pages/MaterialForm"));
const ProductionLine = lazy(() => import("./pages/ProductionLine"));
const MySkillsPage = lazy(() => import("./pages/SkillMatrixMe"));
const WorkshopForm = lazy(() => import("./pages/WorkshopForm"));
const SupplierForm = lazy(() => import("./pages/SupplierForm"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MachineForm = lazy(() => import("./pages/MachineForm"));
const SkillMatrix = lazy(() => import("./pages/Skillmatrix"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const Department = lazy(() => import("./pages/Department"));
const OrderForm = lazy(() => import("./pages/OrderForm"));
const Navbar = lazy(() => import("./components/Navbar"));
const Workshop = lazy(() => import("./pages/Workshop"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Register = lazy(() => import("./pages/Register"));
const UserForm = lazy(() => import("./pages/UserForm"));
const Material = lazy(() => import("./pages/Material"));
const Supplier = lazy(() => import("./pages/Supplier"));
const Machine = lazy(() => import("./pages/Machine"));
const Product = lazy(() => import("./pages/Product"));
const Logout = lazy(() => import("./pages/Logout"));
const Login = lazy(() => import("./pages/Login"));
const Order = lazy(() => import("./pages/Order"));
const Home = lazy(() => import("./pages/Home"));
const User = lazy(() => import("./pages/User"));

const ManufacturingProcess = lazy(() => import("./pages/ManufacturingProcess"));

const ManufacturingProcessForm = lazy(() =>
  import("./pages/ManufacturingProcessForm")
);

const ProductionScheduleList = lazy(() => import("./pages/ProductionSchedule"));

const ProductionScheduleListForm = lazy(() =>
  import("./pages/ProductionScheduleListForm")
);

const Projects = lazy(() => import("./pages/Projects"));
const ProjectsForm = lazy(() => import("./pages/ProjectsForm"));
const Tasks = lazy(() => import("./pages/Tasks"));
const TasksForm = lazy(() => import("./pages/TasksForm"));
const LaborAllocations = lazy(() => import("./pages/LaborAllocations"));
const LaborAllocationForm = lazy(() => import("./pages/LaborAllocationForm"));

function App() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // TODO:Define routes as a configuration array
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

    // Production Line
    { path: "/production-line", element: <ProductionLine /> },
    { path: "/production-line/add", element: <ProductionLineForm /> },
    {
      path: "/production-line/edit/:productionLineId",
      element: <ProductionLineForm />,
    },
    {
      path: "/production-line/view/:productionLineId",
      element: <ProductionLineForm />,
    },

    // Manufacturing Process
    { path: "/manufacturing-process", element: <ManufacturingProcess /> },
    {
      path: "/manufacturing-process/add",
      element: <ManufacturingProcessForm />,
    },
    {
      path: "/manufacturing-process/edit/:processId",
      element: <ManufacturingProcessForm />,
    },
    {
      path: "/manufacturing-process/view/:processId",
      element: <ManufacturingProcessForm />,
    },

    // Production Schedule
    {
      path: "/production-schedule",
      element: <ProductionScheduleList />,
    },
    {
      path: "/production-schedule/new",
      element: <ProductionScheduleListForm />,
    },
    {
      path: "/production-schedule/edit/:scheduleId",
      element: <ProductionScheduleListForm />,
    },
    {
      path: "/production-schedule/view/:scheduleId",
      element: <ProductionScheduleListForm />,
    },

    // Projects
    {
      path: "/project",
      element: <Projects />,
    },
    {
      path: "/project/add",
      element: <ProjectsForm />,
    },
    {
      path: "/project/edit/:projectId",
      element: <ProjectsForm />,
    },
    {
      path: "/project/view/:projectId",
      element: <ProjectsForm />,
    },

    // Tasks
    {
      path: "/task",
      element: <Tasks />,
    },
    {
      path: "/task/add",
      element: <TasksForm />,
    },
    {
      path: "/task/edit/:taskId",
      element: <TasksForm />,
    },
    {
      path: "/task/view/:taskId",
      element: <TasksForm />,
    },

    // Labor Allocations
    {
      path: "/labor-allocation",
      element: <LaborAllocations />,
    },
    {
      path: "/labor-allocation/add",
      element: <LaborAllocationForm />,
    },
    {
      path: "/labor-allocation/edit/:allocationId",
      element: <LaborAllocationForm />,
    },
    {
      path: "/labor-allocation/view/:allocationId",
      element: <LaborAllocationForm />,
    },
  ];

  return (
    <BrowserRouter>
      <Suspense fallback={null}>{isAuthenticated && <Navbar />}</Suspense>

      <div
        className={`${
          isAuthenticated ? "lg:mr-[340px] mt-20 lg:ml-4 mx-4 md:mx-6" : ""
        } mb-10 sm:px-6 sm:pt-4`}
      >
        <Suspense>
          <Routes>
            {protectedRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<ProtectedRoute>{route.element}</ProtectedRoute>}
              />
            ))}

            <Route path="/logout" element={<Logout />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
