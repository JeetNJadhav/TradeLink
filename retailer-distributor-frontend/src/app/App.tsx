import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../features/products/pages/Products";

// import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
