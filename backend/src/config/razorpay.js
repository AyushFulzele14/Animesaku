const Razorpay = require("razorpay");
const env = require("./env");

let razorpay = null;
if (env.razorpay.keyId && env.razorpay.keySecret) {
  razorpay = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
}

module.exports = razorpay;
