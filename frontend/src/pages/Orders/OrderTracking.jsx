import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import "./OrderTracking.css";
import ReviewModal from "../../components/ReviewModal/ReviewModal";

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  // Define the logical flow of status
  const statusSteps = ["pending", "Preparing", "onTheWay", "delivered"];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await apiClient.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrder();

    // Polling: Refresh status every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order)
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="tracking-container">
      <button className="back-btn" onClick={() => navigate("/orders")}>
        &larr; Back to Orders
      </button>
      <div className="tracking-header">
        <h2>Order Tracking</h2>
        <p className="order-id">Order #{order._id}</p>
      </div>

      {/* Progress Bar UI */}
      <div className="progress-track">
        {statusSteps.map((step, index) => (
          <div
            key={step}
            className={`step ${index <= currentStepIndex ? "active" : ""}`}
          >
            <div className="step-icon">
              {index < currentStepIndex ? "✔" : index + 1}
            </div>
            <p>{step.replace(/([A-Z])/g, " $1").trim()}</p>
          </div>
        ))}
      </div>

      {/* Order Items Summary */}
      <div className="order-summary">
        <h3>Items</h3>
        {order &&
          order.items.map((item, idx) => (
            <div key={idx} className="summary-item">
              <span>
                {item.quantity}x {item.name}
              </span>
              <div className="item-right">
                <span>${item.price * item.quantity}</span>
                {/* Show Rate button only if delivered */}
                {order.status === "delivered" && (
                  <button
                    className="rate-btn"
                    onClick={() => setSelectedItem(item)}
                  >
                    Rate
                  </button>
                )}
              </div>
            </div>
          ))}
        {/* ... totals ... */}
      </div>

      <div className="delivery-info">
        <h3>Delivery Address</h3>
        <p>{order.deliveryAddress}</p>
      </div>

      {selectedItem && (
        <ReviewModal
          orderId={order._id}
          menuItem={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default OrderTracking;
