const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");
const crypto = require("crypto");
const validator = require("validator");
const userSubscription = require("./userSubs");

const UserSchema = new Schema({
  email: {
    type: String,
  },
  password: String,
  facebook_id: { type: Number, default: 0 },
  google_id: { type: Number, default: 0 },
  full_name: String,
  name: String,
  surname: String,
  address: String,
  phone: String,
  website: String,
  version: String,
  photo: String,
  photo_authorised: { type: Number, default: 3 }, 
  dob: { type: Date, default: null },
  otp: Number,
  first_time: { type: Number, default: 1 },
  device_token: String,
  device_type: String,
  token: String,
  role_id: Number,
  customer_id: { type: String, default: null },
  gender: { type: Number, default: 0 },
  personal_website: String,
  base_location: String,
  login_with_social: Number, // 1 => yes, 2 => No, 
  status: { type: Number, default: 0 },
  block: { type: Number, default: 0 },
  last_confirm_terms: { type: Date },
  user_version_warn: { type: Date, default: Date.now }, // 1 => need to show the warning, 2 => Already shown warning to this user  
  lead_id: { type: Number, default: 0 },
  isUnsubscribed: { type: Number, default: 0 },
  firstsubscriptionstartdate: { type: Number, default: null },
  subscriptionname: { type: String, default: null },
  lastpayment: { type: Date, default: null },
  lastemailreceived: { type: Date, default: null },
  termination_date: { type: Date },
  extension_date: { type: Date },
  created: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  username: String,
  isWeclomeProceed: { type: Number },
  isFreeAccess: { type: Number, default: 0 },
  country: { type: Object,default:{} },
  platform: String,
  last_active: { type: Date, default: Date.now },
  new_email:{ type: String, default: null },
  is_deleted: { type: Number, default: 0 },
});


UserSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, null, null, function (err, hash) {
    if (err) return next(err);

    user.password = hash;
    user.oldpassword = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.oldcomparePassword = function (oldpassword) {
  console.log(oldpassword);
  return bcrypt.compareSync(oldpassword, this.oldpassword);
};

UserSchema.methods.gravatar = function (size) {
  if (!this.size) size = 200;
  if (!this.email) {
    return "https://gravatar.com/avatar/?s" + size + "&d=retro";
  } else {
    var md5 = crypto
      .createHash("md5")
      .update(this.email)
      .digest("hex");
    return "https://gravatar.com/avatar/" + md5 + "?s" + size + "&d=retro";
  }
};

UserSchema.methods.getUserByUsername = function (username, callback) {
  var query = { email: username };
  this.findOne(query, callback);
}



UserSchema.methods.getUserById = function (id, callback) {
  var query = { _id: id };
  this.findOne(query, callback);
}


UserSchema.pre('remove', async function (next) {
  try {
    await userSubscription.remove({ "user_id": this._id });
    await lessionHistory.remove({ "user_id": this._id });
    await Ratings.remove({ "user_id": this._id });

    next();
  }
  catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", UserSchema);






