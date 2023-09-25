const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/',async(req, res, next) => {
  try {
    const docs = await Order.find().select('product quantity _id').populate('product','name');
    res.status(200).json({
      count: docs.length,
      orders: docs.map(doc => {
        return {
          _id: doc._id,
          product: doc.product,
          quantity: doc.quantity,
          request:{
            type: 'GET',
            url: 'http://localhost:3000/orders/' + doc._id
          }
        }
      })
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:error.message
    });
  }
});

router.post('/',async(req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId);
    if(product){
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      })
      const result = await order.save();
      console.log(result);
      res.status(201).json({
        message: 'Order stored',
        createdOrder:{
          _id:result._id,
          product: result.product,
          quantity: result.quantity
        },
        request:{
          type: 'GET',
          url: 'http://localhost:3000/orders/' + result._id
        }
      });
    }else{
      res.status(500).json({
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:error.message
    })
  }
});

router.get('/:orderId',async (req, res, next) => {
  try {
    const order = await Order.findById({_id:req.params.orderId}).select('product quantity _id').populate('product','name price');
    console.log(order);
    if(!order){
      return res.status(404).json({
        message:"Order not found"
      });
    }
    res.status(200).json({
      order: order,
      request: {
        type: 'GET',
        url: 'http://localhost:3000/orders'
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:error.message
    })
  }
});

router.delete('/:orderId',async (req, res, next) => {
  try {
    const result = await Order.deleteOne({_id:req.params.orderId});
    res.status(200).json({
      message: 'Order deleted',
      request: {
        type: "POST",
        url: 'http://localhost:3000/orders',
        body:{ productId: 'ID' , quantity: 'Number'}
      }
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:error.message
    })
  }
});

module.exports = router;