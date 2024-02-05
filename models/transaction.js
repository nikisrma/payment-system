const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  subscription_id:{	type: Schema.Types.ObjectId, ref: 'BaseSubscription'},
  user_id: {type: Schema.Types.ObjectId, ref: 'User'},
  usersubscription_id: {type: Schema.Types.ObjectId, ref: 'UserSubscriptions'},
  transaction_id:  { type: String, default: null },
  original_transaction_id:  { type: String, default: null },
  invoice_id: String,
  payment_intent_id: { type: String, default: null },
  type:String ,            //"subscription"  
  payment_type:String ,    //"stripe,applepay,googlepay"
  payment_status:String ,    //"paid"
  amount :Number,  
  status: Number,
  created: { type: Date, default: Date.now },
  coupon_applied:{type:Boolean,default:false},
  coupon_id:{type:String,default:""},
  coupon_code:{type:String,default:""},
  percent_off:{type:Number,default:null},
  amount_off:{type:Number,default:null},
  hosted_invoice_url:{type: String, default:null},
  invoice_pdf:{type: String, default:null},
  refund_date:{type: Date, default:null},
  paid_by:{type:String,default:null},
  invoice_number:{type:String,default:null},
  paypal_refund_id:{type:String,default:null},
  amount_refunded:{type:Number,default:null},
  paypal_capture_id:{type:String,default:null}
});

module.exports = mongoose.model('Transactions', TransactionSchema);
