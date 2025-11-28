import { useState } from "react";
import apiClient from "../../api/axios";
import "./ReviewModal.css";

const ReviewModal = ({ orderId, menuItem, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/reviews", {
        orderId,
        menuItemId: menuItem.menuItemId._id, // Depends on how populated
        rating,
        comment,
      });
      alert("Review submitted!");
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Rate {menuItem.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? "filled" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Leave a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
