require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());

// products.json dosyasını oku
const productsPath = path.join(__dirname, 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// GOLD_PRICE alma fonksiyonu
async function getGoldPrice() {
  const envPrice = process.env.GOLD_PRICE;
  if (envPrice) return Number(envPrice);
  return 70; // fallback
}

// fiyat hesaplama
function computePrice(product, goldPrice) {
  const price = (product.popularityScore + 1) * product.weight * goldPrice;
  return Number(price.toFixed(2));
} 
// /products endpoint
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