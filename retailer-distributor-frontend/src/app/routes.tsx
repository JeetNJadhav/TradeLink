import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthHeader } from "../features/auth/components/AuthHeader";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import Login from "../features/auth/pages/Login";
import WorkspaceUnavailable from "../features/auth/pages/WorkspaceUnavailable";
import { ROLE_HOME } from "../features/auth/roleRoutes";
import Distributor from "../features/retailer/catalog/pages/Distributor";

import Products from "../features/retailer/catalog/pages/Products";
import DistributorProductDetailsPage from "../features/retailer/catalog/pages/DistributorProductDetails";

const AuthenticatedLayout = () => (
  <>
    <AuthHeader />
    <Outlet />
  </>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route element={<AuthenticatedLayout />}>
      <Route element={<ProtectedRoute roles={["RETAILER"]} />}>
        <Route path={ROLE_HOME.RETAILER} element={<Products />} />
        <Route
          path="/distributor-products/:id"
          element={<DistributorProductDetailsPage />}
        />
        <Route
          path="/distributors/:distributorId/products"
          element={<Distributor />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={["DISTRIBUTOR"]} />}>
        <Route path={ROLE_HOME.DISTRIBUTOR} element={<WorkspaceUnavailable />} />
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route path={ROLE_HOME.ADMIN} element={<WorkspaceUnavailable />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to={ROLE_HOME.RETAILER} replace />} />
  </Routes>
);
