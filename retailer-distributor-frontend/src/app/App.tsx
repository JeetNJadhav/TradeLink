import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../features/products/pages/Products";
import DistributorProductDetails from "../features/distributors/pages/DistributorProductDetails";
import Distributor from "../features/distributors/pages/Distributor";

// import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route
          path="/distributor-products/:id"
          element={<DistributorProductDetails />}
        />
        <Route
          path="/distributors/:distributorId/products"
          element={<Distributor />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
