import React, { useEffect, useState, useCallback, useRef } from "react";
import Slider from "react-slick";
import { FaStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minScore: "",
  });
  const [selectedColors, setSelectedColors] = useState({});
  const sliderRef = useRef(null);

  // Backend fetch
  const fetchProducts = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minScore) params.append("minScore", filters.minScore);

    fetch(`https://case-study-2-dv4z.onrender.com/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error("API Hatası:", err));
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Slider resize fix
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) sliderRef.current.innerSlider.onWindowResized();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: false,
    infinite: false,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const renderStars = (score) => {
    const stars = [];
    const rating = Math.round(score * 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} color={i <= rating ? "#ffc107" : "#e4e5e9"} />
      );
    }
    return stars;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="app-container">
      <h1>Product List</h1>

      <div className="filter-form">
        <input
          type="number"
          placeholder="Min Fiyat"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Max Fiyat"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          placeholder="Min Popülerlik (0-1)"
          name="minScore"
          step="0.1"
          value={filters.minScore}
          onChange={handleFilterChange}
        />
      </div>

      {Array.isArray(products) && products.length > 0 ? (
        <Slider ref={sliderRef} {...settings}>
          {products.map((product, idx) => {
            const score = (product.popularityScore * 5).toFixed(1);
            const currentColor = selectedColors[idx] || "yellow";
            return (
              <div key={idx} className="product-card">
                <img
                  src={product.images?.[currentColor] || product.image}
                  alt={product.name}
                  className="product-image"
                />
                <h3 className="name">{product.name}</h3>
                <p className="price">${product.price}</p>

                <div className="stars">
                  {renderStars(product.popularityScore)}
                  <span className="score">{score}/5</span>
                </div>

                <div className="color-options">
                  {["yellow", "white", "rose"].map(
                    (color) =>
                      product.images[color] && (
                        <div key={color} className="color-choice">
                          <button
                            className={`color-btn ${color} ${
                              selectedColors[idx] === color ? "active" : ""
                            }`}
                            onClick={() =>
                              setSelectedColors((prev) => ({
                                ...prev,
                                [idx]: color,
                              }))
                            }
                          ></button>
                          <span className="color-label">
                            {color === "yellow" && "Yellow Gold"}
                            {color === "white" && "White Gold"}
                            {color === "rose" && "Rose Gold"}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <p>Ürün bulunamadı.</p>
      )}
    </div>
  );
}

export default App;




