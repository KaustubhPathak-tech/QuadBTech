// app.js
const express = require("express");
const axios = require("axios");
const pool = require("./db");
const cors = require("cors");

const app = express();

app.use(cors());
const PORT = 7000;

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ticker_data");
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const fetchWazirxData = async () => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const name = Object.keys(response.data).slice(0, 10);
    const values = Object.values(response.data).slice(0, 10);
    return [name, values] || [];
  } catch (error) {
    console.error("Error fetching data from Wazirx API:", error.message);
    throw error;
  }
};

// Save data to the database
const saveToDatabase = async (data) => {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO ticker_data (name, last, buy, sell, volume, base_unit)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (name) DO UPDATE
      SET last = EXCLUDED.last, buy = EXCLUDED.buy, sell = EXCLUDED.sell, volume = EXCLUDED.volume, base_unit = EXCLUDED.base_unit;
    `;

    for (let i = 0; i < data[1].length; i++) {
      const values = [
        data[0][i],
        data[1][i].last,
        data[1][i].buy,
        data[1][i].sell,
        data[1][i].volume,
        data[1][i].base_unit,
      ];
      await client.query(query, values);
    }

    console.log("Data saved to the database");
  } catch (error) {
    console.error("Error saving data to the database:", error.message);
  } finally {
    client.release();
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    const data = await fetchWazirxData();
    await saveToDatabase(data);
  } catch (error) {
    console.error("Failed to fetch or save data on startup:", error.message);
  }
});
