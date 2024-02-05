const {NOT_DELETED} = require('../config/constants');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CouponsSchema = new Schema({  
  stripe_id: { type: String ,default:null},
  coupon_code: { type: String,unique: true },
  applies_to :{type:String,default:'once'}, //once, forevr
  valid_type:{type:Number,default:1}, //1=>no limit,2=>from-to,3=>day after registration,4=>daye after end or canceled subscriptions
  discount_type: {type:Number,default:1}, //1=>fixed,2=>percentage
  discount_value:{type:Number,default:0},
  days_value : {type:Number,default:0},
  from_date: { type: Date },
  to_date: { type: Date },
  coupon_object: { type: Object},
  redeem_by :{type:Date,default: null},
  max_redemptions:{type:Number,default: null},
  status: {type:Number,default:1},
  created: { type: Date, default: Date.now },
  lastModified: Date,
  is_deleted:{type:Number,default:NOT_DELETED}
});

module.exports = mongoose.model('Coupon', CouponsSchema);

	

