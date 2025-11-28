import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return navigate("/login");
    if (cart.length === 0) return alert("Cart is empty!");
    if (!address) return alert("Please provide a delivery address.");

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: getCartTotal(),
        deliveryAddress: address,
        paymentMethod: "Cash",
      };

      await apiClient.post("/orders", orderData);
      alert("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return (
      <div className="empty-cart-container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <button onClick={() => navigate("/menu")}>Go to Menu</button>
        </div>
      </div>
    );

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="item-price">${item.price}</p>
              </div>
              <div className="item-controls">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item._id, -1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${getCartTotal()}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${getCartTotal()}</span>
          </div>

          <div className="address-input">
            <label>Delivery Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address..."
            />
          </div>
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order (Cash)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
