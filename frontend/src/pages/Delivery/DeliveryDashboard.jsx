import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/axios";
import "./DeliveryDashboard.css";

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.role !== "deliveryMan") {
                navigate("/menu");
            } else {
                fetchPendingOrders();
                fetchActiveDelivery();
            }
        }
    }, [user, navigate]);

    const fetchPendingOrders = async () => {
        try {
            const res = await apiClient.get("/delivery/pending-orders");
            setPendingOrders(res.data);
        } catch (err) {
            console.error("Error fetching pending orders:", err);
        }
    };

    const fetchActiveDelivery = async () => {
        try {
            const res = await apiClient.get("/delivery/my-active-order");
            setActiveDelivery(res.data);
        } catch (err) {
            console.error("Error fetching active delivery:", err);
            setActiveDelivery(null);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        if (activeDelivery) {
            alert("You already have an active delivery!");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post(`/delivery/accept/${orderId}`);
            alert("Order accepted successfully!");
            fetchPendingOrders();
            fetchActiveDelivery();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to accept order");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDelivered = async (orderId) => {
        setLoading(true);
        try {
            await apiClient.post(`/delivery/mark-delivered/${orderId}`);
            alert("Order marked as delivered!");
            setActiveDelivery(null);
            fetchPendingOrders();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to mark as delivered");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="delivery-container">
            <h1>Delivery Dashboard</h1>
            <p className="welcome-text">Welcome, {user?.name}!</p>

            {/* Active Delivery Section */}
            {activeDelivery && (
                <div className="active-delivery-section">
                    <h2>🚚 Active Delivery</h2>
                    <div className="order-card active">
                        <div className="order-header">
                            <span className="order-id">Order #{activeDelivery._id.substring(0, 8)}</span>
                            <span className="order-status status-ontheway">On The Way</span>
                        </div>
                        <div className="order-details">
                            <p><strong>Customer:</strong> {activeDelivery.userId?.firstName} {activeDelivery.userId?.lastName}</p>
                            <p><strong>Phone:</strong> {activeDelivery.userId?.phone}</p>
                            <p><strong>Address:</strong> {activeDelivery.deliveryAddress}</p>
                            <p><strong>Total:</strong> ${activeDelivery.totalAmount}</p>
                            <div className="order-items">
                                <strong>Items:</strong>
                                <ul>
                                    {activeDelivery.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.name} x{item.quantity} - ${item.price * item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button
                            className="btn-delivered"
                            onClick={() => handleMarkDelivered(activeDelivery._id)}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "✓ Mark as Delivered"}
                        </button>
                    </div>
                </div>
            )}

            {/* Pending Orders Section */}
            <div className="pending-orders-section">
                <h2>📦 Orders Ready for Delivery</h2>
                {pendingOrders.length === 0 ? (
                    <p className="no-orders">No pending orders at the moment.</p>
                ) : (
                    <div className="orders-grid">
                        {pendingOrders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <span className="order-id">Order #{order._id.substring(0, 8)}</span>
                                    <span className="order-status status-preparing">Preparing</span>
                                </div>
                                <div className="order-details">
                                    <p><strong>Customer:</strong> {order.userId?.firstName} {order.userId?.lastName}</p>
                                    <p><strong>Phone:</strong> {order.userId?.phone}</p>
                                    <p><strong>Address:</strong> {order.deliveryAddress}</p>
                                    <p><strong>Total:</strong> ${order.totalAmount}</p>
                                    <div className="order-items">
                                        <strong>Items:</strong>
                                        <ul>
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.name} x{item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <button
                                    className="btn-accept"
                                    onClick={() => handleAcceptOrder(order._id)}
                                    disabled={loading || activeDelivery !== null}
                                >
                                    {loading ? "Processing..." : "Accept Order"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
