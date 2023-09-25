const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const docs = await Product.find().select('name price _id');
    const responce = {
      count: docs.length,
      products: docs.map(doc => {
        return {
          name: doc.name,
          price: doc.price,
          _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + doc._id
          }
        }
      })
    }
    // if(docs.length >= 0){
    res.status(200).json(responce);
    // }else{
    //   res.status(404).json({
    //     message: "No entries found"
    //   })
    // }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: error,
    });
  }
});

router.post("/", (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "created product successfully",
        createdProduct: {
          name: product.name,
          price: product.price,
          _id: product._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + product._id
          }
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:productId", async (req, res, next) => {
  try {
    const id = req.params.productId;
    const doc = await Product.findById(id).select('name price _id');
    console.log(doc);
    if (doc) {
      res.status(200).json({
        product: doc,
        request: {
          type: 'GET',
          description: 'Get all products',
          url: 'http://localhost:3000/products'
        }
      });
    } else {
      res.status(404).json({ message: "No valid entry found for provided ID" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:productId", async (req, res, next) => {
  try {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
    const result = await Product.updateOne(
      { _id: id },
      {
        $set: updateOps,
      }
    );
    console.log(result);
    res.status(200).json({
      message: 'Product updated',
      request: {
        type: 'GET',
        url: 'http://localhost:3000/products/' + id
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:error
    })
  }
});

router.delete("/:productId", async (req, res, next) => {
  try {
    const id = req.params.productId;
    console.log(id);
    const result = await Product.deleteOne({ _id: id });
    res.status(200).json({
      message: 'Product deleted',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/products',
        body: { name: 'String', price: 'Number'}
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
