import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import { FaStar } from "react-icons/fa";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minScore: "",
  });
  const [selectedColors, setSelectedColors] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Pencere boyutu değişikliğini dinle
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProducts = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minScore) params.append("minScore", filters.minScore);

    fetch(`https://case-study-2-dv4z.onrender.com/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => console.error("API Hatası:", err));
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: windowWidth > 600, // Mobilde okları gizle
    swipeToSlide: true,
    responsive: [
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: 3,
          arrows: windowWidth > 600
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 2,
          arrows: false
        } 
      },
      { 
        breakpoint: 480, 
        settings: { 
          slidesToShow: 1,
          arrows: false,
          dots: true // Mobilde dots göster
        } 
      },
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
      <h1 className="main-title">Product List</h1>

      {/* Filtreler - Responsive düzen */}
      <div className={`filter-container ${windowWidth < 600 ? 'filter-mobile' : ''}`}>
        <input
          type="number"
          placeholder="Min Fiyat"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Max Fiyat"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Min Popülerlik (0-1)"
          name="minScore"
          step="0.1"
          value={filters.minScore}
          onChange={handleFilterChange}
          className="filter-input"
        />
      </div>

      {/* Slider */}
      <div className="slider-container">
        <Slider {...settings}>
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product, idx) => {
              const score = (product.popularityScore * 5).toFixed(1);
              const currentColor = selectedColors[idx] || "yellow";
              return (
                <div key={idx} className="product-card">
                  <img
                    src={product.images?.[currentColor] || product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price}</p>

                  <div className="stars-container">
                    {renderStars(product.popularityScore)}
                    <span className="score-text">{score}/5</span>
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
            })
          ) : (
            <p className="no-products">Ürün bulunamadı.</p>
          )}
        </Slider> 
      </div>
    </div>
  );
}

export default App;




