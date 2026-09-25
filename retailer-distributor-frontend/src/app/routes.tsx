import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthHeader } from "../features/auth/components/AuthHeader";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import Login from "../features/auth/pages/Login";
import Distributor from "../features/retailer/catalog/pages/Distributor";

import Products from "../features/retailer/catalog/pages/Products";
import DistributorProductDetails from "../features/retailer/catalog/pages/DistributorProductDetails";

const AuthenticatedLayout = () => (
  <>
    <AuthHeader />
    <Outlet />
  </>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute roles={["RETAILER"]} />}>
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<Products />} />
        <Route
          path="/distributor-products/:id"
          element={<DistributorProductDetails />}
        />
        <Route
          path="/distributors/:distributorId/products"
          element={<Distributor />}
        />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
