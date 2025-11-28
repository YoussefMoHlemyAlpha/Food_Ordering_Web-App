import { Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/Menu/Menu";
import Login from "./pages/Login/Login";
import Register from "./pages/Login/Register";
import Cart from "./pages/Cart/Cart";
import OrderHistory from "./pages/Orders/OrderHistory";
import OrderTracking from "./pages/Orders/OrderTracking";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import DeliveryDashboard from "./pages/Delivery/DeliveryDashboard";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
