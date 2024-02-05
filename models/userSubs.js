const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSubscriptionSchema = new Schema({
  subscription_id:{	type: Schema.Types.ObjectId, ref: 'BaseSubscription'},  // Subscription Plan mongo Id 
  user_id: {	type: Schema.Types.ObjectId, ref: 'User'},
  validity:{ type: Number,default:0},
  is_cancel:{ type: Number,default:0},
  payment_intent_client_secret:{ type: String,default:null},
  trial_end :{ type: Array,default:null},//{2 element first-trial-start,second-trial-end}
  start :{ type: Date,default: Date.now}, //subscription start date 
  plan_ended :{ type: Date,default:null}, // Trial end date 
  expire :{ type: Date}, // after active plan end date of plan 
  status: { type: Number, default: 1 }, //2 Expired //3 = Cancelled
  payment_status: { type: String, default: null },
  subscription_name: { type: String, default: null },  // After Subscription Id from Stripe 
  subscription_schedule_name: { type: String, default: null },  
  created: { type: Date, default: Date.now },
  apple_product_id: { type: String, default: "" },
  cancel_scheduled:{type: Boolean, default: false},
  subs_source:{type:String},
  coupon_applied:{type:Boolean,default:false},
  coupon_id:{type:String,default:""},
  coupon_code:{type:String,default:""},
  percent_off:{type:Number,default:null},
  amount_off:{type:Number,default:null},
  metadata_updated:{type:Boolean,default:false},
  transaction_id:{type:String},
  google_pay_token:{type:String,default:null},
  google_product_id:{type:String,default:null},
  cancelled_date:{type:Date,default:null},
  paid_by:{type:String,default:null},
  paypal_capture_id:{type:String,default:null}
});


module.exports = mongoose.model('UserSubscriptions', UserSubscriptionSchema);