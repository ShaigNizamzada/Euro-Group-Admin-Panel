import { Route, Routes, BrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../utils/ProtectedRoute";
import Dashboard from "../pages/Dashboard/Dashboard";
import Partners from "../pages/Partners/Partners";
import Categories from "../pages/Categories/Categories";
import Brands from "../pages/Brands/Brands";
import Products from "../pages/Products/Products";
import Orders from "../pages/Orders/Orders";
import Contacts from "../pages/Contacts/Contacts";
import Users from "../pages/Users/Users";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";
// Wrap component with MainLayout
const WithLayout = ({ component: Component }) => {
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
};

const AppContent = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WithLayout component={Dashboard} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <WithLayout component={Users} />
            </ProtectedRoute>
          }
        />{" "}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <WithLayout component={Products} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <WithLayout component={Categories} />
            </ProtectedRoute>
          }
        />{" "}

        <Route
          path="/brands"
          element={
            <ProtectedRoute>
              <WithLayout component={Brands} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <WithLayout component={Partners} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <WithLayout component={Orders} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <WithLayout component={Contacts} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <WithLayout component={Profile} />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <WithLayout component={Settings} />
            </ProtectedRoute>
          }
        />{" "}
      </Routes>
    </>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default AppRouter;
