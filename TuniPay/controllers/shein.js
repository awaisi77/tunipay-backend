const express = require("express");
const asyncHandler = require("express-async-handler");

const searchSheinProduct = asyncHandler(async (req, res) => {
  console.log("Getting Products");
  const axios = require("axios");

  const keyword = req.params.productName;

  console.log("Keyword------------->", keyword);
  const options = {
    method: "GET",
    url: "https://unofficial-shein.p.rapidapi.com/products/search",
    params: {
      keywords: keyword,
      limit: "20",
      page: "1",
    },
    headers: {
      "X-RapidAPI-Key": "5c49d3b421mshcc5012f9889ce1bp1d090fjsn0ed127d871e8",
      "X-RapidAPI-Host": "unofficial-shein.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data)
  } catch (error) {
    console.error(error);
  }
});

const searchSheinProductById = asyncHandler(async (req, res) => {
  console.log("Getting Products");
  const axios = require("axios");

  const keyword = req.params.productId;

  console.log("Keyword------------->", keyword);
  const options = {
    method: "GET",
    
    url: "https://unofficial-shein.p.rapidapi.com/products/detail",
    params: {
      goods_id: keyword,
    },
    headers: {
      "X-RapidAPI-Key": "5c49d3b421mshcc5012f9889ce1bp1d090fjsn0ed127d871e8",
      "X-RapidAPI-Host": "unofficial-shein.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data)
  } catch (error) {
    console.error(error);
  }
});

module.exports = {
  searchSheinProduct,
  searchSheinProductById,
};
