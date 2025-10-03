require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());


const productsPath = path.join(__dirname, 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));


async function getGoldPrice() {
  const envPrice = process.env.GOLD_PRICE;
  if (envPrice) return Number(envPrice);
  return 70; // fallback
}


function computePrice(product, goldPrice) {
  const price = (product.popularityScore + 1) * product.weight * goldPrice;
  return Number(price.toFixed(2));
} 

app.get('/products', async (req, res) => {
  try {
    const goldPrice = await getGoldPrice();

    // products.json'daki her ürünü price hesaplayarak düzenle
    let result = products.map((p, idx) => ({
      id: idx + 1,
      name: p.name,
      popularityScore: p.popularityScore,
      weight: p.weight,
      images: p.images,
      price: computePrice(p, goldPrice)
    })); 
      // Query filtreleri
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
    const minScore = parseFloat(req.query.minScore) || 0;
    const color = req.query.color;

    // filtre uygula
    result = result.filter(r => 
      r.price >= minPrice &&
      r.price <= maxPrice &&
      r.popularityScore >= minScore
    );

    if (color) {
      result = result.map(r => ({
        ...r,
        image: (r.images && r.images[color]) ? r.images[color] : r.images.yellow
      }));
    }

    return res.json({ goldPrice, products: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));