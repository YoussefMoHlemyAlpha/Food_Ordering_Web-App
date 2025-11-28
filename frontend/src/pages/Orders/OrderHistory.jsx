import { useEffect, useState } from "react";
import apiClient from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get("/orders");
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );

  return (
    <div className="history-container">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/menu")}>Start Ordering</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id-group">
                  <span className="order-label">Order ID</span>
                  <span className="order-id">#{order._id.substring(0, 8)}</span>
                </div>
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-body">
                <div className="order-info">
                  <p className="date">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="item-count">{order.items.length} Items</p>
                </div>
                <div className="order-total">
                  <span>Total Amount</span>
                  <span className="amount">${order.totalAmount}</span>
                </div>
              </div>
              <div className="order-footer">
                <button
                  className="track-btn"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
