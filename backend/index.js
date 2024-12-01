const express = require('express');
const axios = require('axios');
const cors = require('cors');
const products = require('./products.json');
require('dotenv').config();

const app = express();
app.use(cors()); // Allow cross-origin requests

const GOLD_API_URL = 'https://api.metalpriceapi.com/v1/latest'; // Replace with real API
const GOLD_API_KEY = process.env.GOLD_API_KEY; // API Key stored in .env

app.get('/products', async (req, res) => {
  try {
    const { minPrice, maxPrice, minScore } = req.query;

    // Fetch gold price
    const goldResponse = await axios.get(GOLD_API_URL, {
      params: { api_key: GOLD_API_KEY, base: 'XAU' },
    });
    const goldPrice = goldResponse.data.rates.TRY;

    // Calculate price and prepare response
    let filteredProducts = products.map((product) => {
      const price = (product.popularityScore + 1) * product.weight * goldPrice;
      return {
        ...product,
        price: price.toFixed(2),
        popularityRating: (product.popularityScore / 20).toFixed(1), // Convert score out of 5
      };
    });

    // Apply filters
    if (minPrice)
      filteredProducts = filteredProducts.filter((p) => p.price >= minPrice);
    if (maxPrice)
      filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
    if (minScore)
      filteredProducts = filteredProducts.filter(
        (p) => p.popularityScore >= minScore
      );

    res.json(filteredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving product data');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
