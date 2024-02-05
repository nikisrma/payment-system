const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseSubscriptionSchema = new Schema({ 
  title:String, 
  price:Number,
  total:Number,
  validity: Number,
  stripe_id:String, 
  product:String,
  apple_product_id: String,
  google_product_id:String,
  trial_period_days:Number,
  public_status: { type: Number},
  status: Number,
  subscription_saving: Number,
  status: { type: Number, default: 1 },
  type: String,
  created: { type: Date, default: Date.now },   
});

module.exports = mongoose.model('BaseSubscription', BaseSubscriptionSchema);