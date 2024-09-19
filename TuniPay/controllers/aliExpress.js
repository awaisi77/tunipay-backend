const express = require("express");
const asyncHandler = require("express-async-handler");
const sendResponse = require("../utils/responseHandler");
const dotenv = require("dotenv")
dotenv.config()



const headers = {
  "X-RapidAPI-Key": process.env.XRapidAPIKey,
  "X-RapidAPI-Host": process.env.XRapidAPIHost,
}

const getProductsByName = asyncHandler(async (req, res) => {
  console.log("Getting Products");
  const axios = require("axios");

  const keyword = req.params.productName;

  console.log("Keyword------------->", keyword);
  const options = {
    method: "GET",
    url: "https://aliexpress-datahub.p.rapidapi.com/item_search_2",
    params: {
      q: keyword,
    },
    headers: headers
  };

  try {
    const response = await axios.request(options);
    console.log(response.data.result.resultList);
    res.send(response.data)
  } catch (error) {
    console.error(error);
  }
});


function restructureProductData(data) {
  if (!data || !data.payload || !data.payload.product || !data.payload.product.result) {
      throw new Error("Invalid data structure");
  }

  const product = data.payload.product.result;
  const skuProps = product.item.sku.props;
  const skuImages = product.item.sku.skuImages;

  const variations = product.item.sku.base.map(sku => {
      const attributes = {};
      let imageUrl = null;

      // Split the propMap and dynamically map the attributes
      sku.propMap.split(';').forEach(attr => {
          const [pid, vid] = attr.split(':');

          const prop = skuProps.find(p => p.pid.toString() === pid);
          const value = prop ? prop.values.find(v => v.vid.toString() === vid) : null;

          if (prop && value) {
              attributes[prop.name] = value.name;
              if (skuImages[`${pid}:${vid}`]) {
                  imageUrl = skuImages[`${pid}:${vid}`];
              }
          }
      });

      return {
          skuId: sku.skuId,
          attributes,
          price: sku.price,
          promotionPrice: sku.promotionPrice,
          quantity: sku.quantity,
          imageUrl,
          ext: sku.ext
      };
  });

  
    // Collect all attribute values
    // Collect all attribute values in a simplified format
    const attributeValues = [];
    const attributeNames = {};

    skuProps.forEach(prop => {
        const values = prop.values.map(value => value.name);
        attributeNames[prop.name] = values;
        
        prop.values.forEach(value => {
            attributeValues.push(value.name);
        });
    });

    product.item.sku.variations = variations;
    product.item.sku.attributeNames = attributeNames;



  // Remove the old base array and props as we have moved them to variations
  delete product.item.sku.base;
  delete product.item.sku.props;

  return data;
}


const getProductsById = asyncHandler(async (req, res) => {
  console.log("Getting Products");
  const axios = require("axios");

  const productId = req.params.productId;

  console.log("Id------------->", productId);

  const productOptions = {
    method: "GET",
    url: "https://aliexpress-datahub.p.rapidapi.com/item_detail",
    params: {
      itemId: productId,
    },
    headers: headers
  };
  const descOptions = {
    method: 'GET',
    url: 'https://aliexpress-datahub.p.rapidapi.com/item_desc',
    params: {
      itemId: productId
    },
    headers: headers
  };
  // const reviewsOptions = {
  //   method: 'GET',
  //   url: 'https://aliexpress-datahub.p.rapidapi.com/item_review',
  //   params: {
  //     itemId: '3256802834764491',
  //     page: '1',
  //     filter: 'allReviews'
  //   },
  //   headers: headers
  // };

  try {
    const productResponse = await axios.request(productOptions);
    console.log(productResponse)
    const descResponse = await axios.request(descOptions);
    // const reviewsResponse = await axios.request(reviewsOptions);


    var payload = {

      product: productResponse.data,
      description: descResponse.data.result.item.description,
      features: descResponse.data.result.item.properties.list,
      //reviews: ""
    }

    const data = {
      payload: payload
    }

    payload = await restructureProductData(data)

    return sendResponse(
      res,
      200,
      true,
      "Data fetched successfully!",
      payload.payload

    );

  } catch (error) {
      return sendResponse(
        res,
        401,
        false,
        error
      );
  }
});

// const getProductsShippingDetails = asyncHandler(async (req, res) => {
//   console.log("Getting Products");
//   const axios = require("axios");

//   const productsShippingDetilId = req.params.productId;

//   console.log("Id------------->", productsShippingDetilId);

//   const options = {
//     method: "GET",
//     url: "https://aliexpress-datahub.p.rapidapi.com/shipping_detail_2",
//     params: {
//       itemId: productsShippingDetilId,
//     },
//     headers: {
//       "X-RapidAPI-Key": "d631f46731mshfd6fc7fb9f2cd9fp178ac3jsn13eb73ad9dca",
//       "X-RapidAPI-Host": "aliexpress-datahub.p.rapidapi.com",
//     },
//   };

//   try {
//     const response = await axios.request(options);
//     console.log("Message------->", response.data.result.status.msg);
//     console.log("Data------------->", response.data.result.resultList);
//   } catch (error) {
//     console.error(error);
//   }
// });

module.exports = {
  getProductsByName,
  getProductsById,
  // getProductsShippingDetails,
};
