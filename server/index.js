const express = require("express");
const cors = require("cors");
// const dotenv = require("dotenv");
const paymentRoutes = require("./Routes/payment");
const mongoose = require('mongoose');
const app = express();

// dotenv.config();

app.use(express.json());
app.use(cors());

app.use("/api/payment/", paymentRoutes);

// const dotenv = require('dotenv').config();


    try {
         mongoose.connect("mongodb://0.0.0.0:27017/razorpay");
         console.log("connected to mongodb");
      } catch (error) {
        console.error("error connecting")
      }

const port =  8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
