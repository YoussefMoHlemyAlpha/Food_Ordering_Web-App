import { useEffect, useState, useContext } from "react";
import apiClient from "../../api/axios";
import { CartContext } from "../../context/CartContext";
import "./Menu.css";

const Menu = () => {
  const [items, setItems] = useState([]);
  const { addToCart } = useContext(CartContext);
  const [filteredItems, setFilteredItems] = useState([]); // New State
  const [categories, setCategories] = useState([]); // New State
  const [activeCategory, setActiveCategory] = useState("All"); // New State

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          apiClient.get("/menu"),
          apiClient.get("/categories"),
        ]);
        setItems(menuRes.data);
        setFilteredItems(menuRes.data); // Initially show all
        setCategories(catRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const filterItems = (categoryName) => {
    setActiveCategory(categoryName);
    if (categoryName === "All") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(
        (item) => item.categoryId.name === categoryName
      );
      setFilteredItems(filtered);
    }
  };

  return (
    <div className="menu-container">
      <h1>Our Menu</h1>
      {/* Category Filter Bar */}
      <div className="category-filter">
        <button
          className={activeCategory === "All" ? "active" : ""}
          onClick={() => filterItems("All")}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={activeCategory === cat.name ? "active" : ""}
            onClick={() => filterItems(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item._id} className="menu-card">
            <div className="card-image">
              <img
                src={
                  item.image
                    ? `http://localhost:5000${item.image}`
                    : "https://via.placeholder.com/300"
                }
                alt={item.name}
              />
            </div>
            <div className="card-content">
              <div className="card-header">
                <h3>{item.name}</h3>
                <span className="price">${item.price}</span>
              </div>
              <p className="description">{item.description}</p>
              <button className="add-btn" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
            </div>

            <div className="menu-info">
              <div className="header-row">
                <h3>{item.name}</h3>
                <span className="rating-display">
                  ★ {item.averageRating} ({item.reviewCount})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
