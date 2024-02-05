const User = require("../../models/user");
const terms = require("../../models/terms");
const Subscription = require("../../models/subscription");
const BaseSubs = require("../../models/basesubscription");
const settings = require("../../models/settings");
const UserSubs = require("../../models/user_subscription")
const Transaction = require("../../models/transactions");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const config = require('./db');
const ObjectId = mongoose.Types.ObjectId;
const fs = require("fs");
// const { catchError } = require("../../middlewares/errorhandler");
const Coupon = require("../../models/coupon");
const { DELETED } = require("./constants");
const { PENDING, ACTIVE, CANCELED } = require('./constants').status;
const { PAY_PENDING, PAY_NOT_STARTED, PAY_PROCESSING, PAY_FAILED, PAY_TRIALING, PAY_ACTIVE, PAY_CANCELED } = require('./constants').payment_status;
const { INVOICE_NUMBER_START_FROM } = require('./constants');


function getStripeInstance() {
  let stripe = "";
  return new Promise((resolve, reject) => {
    settings.findOne().exec((err, result) => {
      if (err) {
        reject(err);
      }
      if (result.payment_mode === 1) {
        stripe = require('stripe')(result.private_key_live);
      } else {
        stripe = require('stripe')(result.private_key_test);
      }
      resolve(stripe);
    });
  });

}


class Appfunctions {
  static getStripe() {
    let stripe = "";
    return new Promise((resolve, reject) => {
      settings.findOne().exec((err, result) => {
        if (err) {
          reject(err);
        }
        if (result.payment_mode === 1) {
          stripe = require('stripe')(result.private_key_live);
        } else {
          stripe = require('stripe')(result.private_key_test);
        }
        resolve(stripe);
      });
    });

  }

 
  /*For success response*/
  static successResponse(message, data = null, user = null, statuscode = 200) {
    let response = {};
    response.success = true;
    response.message = message;
    response.statuscode = statuscode;
    if (user != null) {
      response.version = user && user.version ? user.version : "";
      response.last_updated_date = user && user.language_id ? user.language_id.last_updated_date : "";
      response.last_active = user && user.last_active ? user.last_active : "";
    }
    response.data = data;

    return response;
  }

  /*
   For failure response
  */
  static failResponse(message, data = null, statuscode = 400) {
    let response = {};
    console.log(data + 'failResponse');
    return (response = {
      success: false,
      message: message,
      statuscode: statuscode,
      version_status_msg: '0 - Message ',
      version_status: 0,
      data: data
    });
  }

  /* For sending mail */
  static sendEmail(subject, toEmail, fromEmail, content) {
    var mailOptions = {
      // from: '"Gigglemusic" <'+fromEmail+'>',
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: content
    };

    console.log(mailOptions)
    const transporter = nodemailer.createTransport({
      // service: config.service, //"gmail",
      host: config.host, // hostname
      auth: {
        user: config.smtpEmail, //"testingbydev@gmail.com",
        pass: config.smtpPassword  //"****** "
      }
    });

    transporter.sendMail(mailOptions, function (error, info) {
      console.log(error, info)
      if (error) {
        return false;
      } else {
        return true;
      }
    });
  }


  static sendEmailAttachment(subject, toEmail, fromEmail, content, filename, path) {
    var mailOptions = {
      //from: '"Gigglemusic" <'+fromEmail+'>',
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: content,
      attachments: [{
        filename: filename,
        path: path,
        contentType: 'application/pdf'
      }]
    };

    const transporter = nodemailer.createTransport({
      service: config.service, //"gmail",
      auth: {
        user: config.smtpEmail, //"testingbydev@gmail.com",
        pass: config.smtpPassword  //"****** "
      }
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return false;
      } else {
        return true;
      }
    });
  }

  /* Function To get User details by User id */
  static async getUserDetailsById(userId) {
    let loginUserId = userId;
    return User.findOne({ _id: ObjectId(loginUserId) });
  }



  /* To get Current location first and if there is not current location saved then use baselocation */
  static async getCurrentOrBaseLocCordinates(user_id) {
    let promise = new Promise((resolve, reject) => {
      User.findOne({ _id: ObjectId(user_id) })
        .select(["currentloc", "baseloc"])
        .exec(function (err, location) {
          if (err) {
            reject({ status: false, error: err });
          } else {
            let currentCordinate = [0, 0];
            if (location && location.currentloc.coordinates != undefined) {
              currentCordinate = location.currentloc.coordinates;
            } else {
              currentCordinate = location.baseloc.coordinates;
            }

            resolve({
              status: true,
              long: parseFloat(currentCordinate[0]),
              lat: parseFloat(currentCordinate[1])
            });
          }
        });
    });
    let getResponse = await promise;
    if (getResponse.status) {
      let long = getResponse.long;
      let lat = getResponse.lat;
      return { status: 1, long: long, lat: lat };
    } else {
      return { status: 0, long: 0, lat: 0 };
    }
  }

  static async getBaseLocCordinates(user_id) {
    let promise = new Promise((resolve, reject) => {
      User.findOne({ _id: ObjectId(user_id) })
        .select(["currentloc", "baseloc"])
        .exec(function (err, location) {
          if (err) {
            reject({ status: false, error: err });
          } else {
            let baseCordinate = [0, 0];
            baseCordinate = location.baseloc.coordinates;

            resolve({
              status: true,
              long: parseFloat(baseCordinate[0]),
              lat: parseFloat(baseCordinate[1])
            });
          }
        });
    });
    let getResponse = await promise;
    if (getResponse.status) {
      let long = getResponse.long;
      let lat = getResponse.lat;
      return { status: 1, long: long, lat: lat };
    } else {
      return { status: 0, long: 0, lat: 0 };
    }
  }

  static async fileRename(path, uploadPath) {
    return new Promise((resolve, error) => {
      fs.rename(path, uploadPath, function (err) {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  //Update user subsvription
  static async updateSubsciptions(findparams, updateparams) {
    return new Promise((resolve, reject) => {
      UserSubs.updateOne(
        findparams,
        {
          $set: updateparams
        },
        function (err, result) {
          if (err) {
            reject({ status: false });
          } else {
            resolve({ status: result });
          }
        }
      );
    });
  }

  //update userid
  static async updateCustomer(user_id, customer_id) {
    return new Promise((resolve, reject) => {
      User.updateOne(
        {
          _id: ObjectId(user_id)
        },
        {
          $set: { customer_id: customer_id }
        }, function (err, user) {
          if (err) {
            reject({ status: 404, error: err })
          } else {
            resolve({ status: 200, data: user });
          }
        }
      )
    })
  }


  /*Get Subscription Name By ID*/
  static async getSubscription(id) {
    return BaseSubs.findOne({ _id: ObjectId(id) });
  }
  static async getSubscriptionByCondition(condition) {
    return new Promise((resolve) => {
      BaseSubs.findOne(condition, (err, result) => {
        resolve(result);
      })
    });
  }
  static async getSubscriptionPromise(id) {
    return new Promise((resolve) => {
      BaseSubs.findOne({ _id: ObjectId(id) }, (err, result) => {
        resolve(result);
      })
    });
  }


  static saveUserSubscription(data) {
    return new Promise((resolve, reject) => {
      let userSubs = new UserSubs(data);
      userSubs.save(async (err, schedule) => {
        if (err) {
          reject(err);
        } else {
          resolve(schedule);
        }
      })
    })
  }

  static getUserSubscriptionByClientSecret(client_secret) {
    return new Promise((resolve, reject) => {
      UserSubs.findOne({ payment_intent_client_secret: client_secret })
        .exec(function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
  }

  static getUserSubscriptionById(id) {
    return new Promise((resolve, reject) => {
      console.log("Objecid**", id)
      UserSubs.findOne({ _id: ObjectId(id) })
        .exec(function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
  }
  static getUserSubscriptionByCondition(condition) {
    return new Promise((resolve, reject) => {
      UserSubs.findOne(condition)
        .exec(function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
  }

  static getCustomerById(user_id) {
    return new Promise((resolve, reject) => {
      User.findOne({ _id: ObjectId(user_id) })
        .exec(function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
  }



  static findIfUserHasSubscription(user_id) {
    return new Promise(async (resolve, reject) => {
      await UserSubs.findOne({
        $and: [
          { user_id: ObjectId(user_id) },
          { status: ACTIVE },
          { expire: { $gte: new Date() } },
          { is_cancel: { $ne: 1 } }
        ]
      }).sort({ "expire": -1 }).exec(
        async function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result)
          }

        });
    });
  }



  static findIfUserHasShceduledSubscription(user_id) {

    return new Promise(async (resolve, reject) => {
      await UserSubs.findOne({
        $and: [
          { user_id: ObjectId(user_id) },
          { status: ACTIVE },
          { payment_status: PAY_NOT_STARTED },
          { is_cancel: { $ne: 1 } }
        ]
      }).sort({ "expire": -1 }).exec(
        async function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result)
          }

        });
    });
  }

  static async updateOrDeleteSubscription(susb_name, data, is_delete = false) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      if (is_delete == true) {
        stripe.subscriptions.del(susb_name, function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result)
          }
        });
      }
      else {
        stripe.subscriptions.update(susb_name, data, function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result)
          }
        });
      }

    });
  }


  static createPaymentTransaction(data) {
    return new Promise(async (resolve, reject) => {
      let transaction = new Transaction({
        invoice_number: await Appfunctions.getInvoiceNumber(),
        ...data
      });
      transaction.save(async (err, transaction) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("transaction created")
          resolve(transaction);
        }
      })
    })
  }


  static updateUserSubscriptionBySubsId(updateData, SubsId) {
    return new Promise((resolve, reject) => {
      var stringifyData = JSON.stringify(updateData);
      let parseData = JSON.parse(stringifyData);

      UserSubs.updateOne(
        { subscription_name: SubsId },
        { $set: parseData },
        async (err, responseData) => {
          if (err) {
            reject(err);
          } else {
            resolve(responseData);
          }
        })
    })
  }

  static async createSubscriptionSchedules(startTimestamp, customerid, stripe_id, quantity, metadata) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.subscriptionSchedules.create(
        {
          customer: customerid,
          start_date: startTimestamp,
          end_behavior: 'release',
          metadata: metadata,
          phases: [
            {
              plans: [
                { plan: stripe_id, quantity: quantity },
              ],
              iterations: 12,
            },
          ],
        }, function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result)
          }
        });
    });
  }

  static async createCustomer(email, currentDate, username, user_id) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      var data = {};
      data = {
        description: 'New account created on stripe on this ' + currentDate.format() + " date.",
        name: username,
        email: email,
        metadata: {
          user_id: user_id,
        }
      }
      console.log(data, 'asdasdasdasd')
      stripe.customers.create(data, function (err, result) {
        if (err) {
          reject(err);
        }
        else if (result) {
          resolve(result)
        }
      });
    });
  }


  static async retriveCustomer(customer) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.customers.retrieve(customer, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }

  static async retriveCoupon(couponId) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.coupons.retrieve(couponId, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }

  static async deleteSource(customer, default_card) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.customers.deleteSource(customer, default_card, async function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }

  static async updateStripeCustomer(customerId, updateData = {}) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.customers.update(customerId, updateData, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  static async createSource(customer, token) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.customers.createSource(customer, { source: token }, async function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }

  /* 
    Remove Default Card and Add New card 
  */

  static async OldandNewCard(customer_id, token) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      // this.retriveCustomer()
      this.retriveCustomer(customer_id)
        .then(customerInfo => {
          let default_card = customerInfo.default_source
          if (default_card) {
            this.deleteSource(customer_id, default_card)
              .then(confirmation => {
                this.createSource(customer_id, token)
                  .then(card => {
                    resolve(card);
                  })
                  .catch(err => {
                    reject(err);
                  })
              })
              .catch(err => {
                reject(err);
              })
          } else {
            this.createSource(customer_id, token)
              .then(card => {
                resolve(card);
              })
              .catch(err => {
                reject(err);
              })
          }
        })
        .catch(err => {
          reject(err);
        })
    })
  }


  static async createSubscription(coupon, customer_id, stripe_id, quantityNew, diff, metadata) {
    let stripe = await getStripeInstance();
    console.log(diff, 'diffdiffdiffdiff')
    return new Promise((resolve, reject) => {
      var subscreate = {
        customer: customer_id,
        items: [{ plan: stripe_id, quantity: quantityNew }],
      }
      if (coupon && coupon != "" && coupon != undefined && diff > 0) {
        subscreate.coupon = coupon;
        subscreate.trial_period_days = diff;
      }
      else if (coupon && coupon != "" && coupon != undefined && diff <= 0) {
        subscreate.coupon = coupon;
      }
      else if (coupon == "" || coupon == undefined && diff >= 0) {
        subscreate.trial_period_days = diff;
      }
      subscreate.metadata = metadata;
      stripe.subscriptions.create(subscreate, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }


  static async createCharge(customerid, token, price, metadata) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.charges.create({
        //source: token,
        currency: 'EUR',
        amount: parseInt(price * 100),
        customer: customerid,
        metadata: metadata
      }, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }


  static async createIntent(price, customer_id, metadata) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      var data = {};
      data = {
        amount: Math.round(price * 100),
        currency: 'eur',
        payment_method_types: [
          'card',
          'sofort'
        ],
        metadata: metadata,
        customer: customer_id
      }

      stripe.paymentIntents.create(data, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }




  static async deleteSubscription(subscription_name) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.subscriptions.del(subscription_name, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }



  static async updateSubscription(susb_name, data) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {

      stripe.subscriptions.update('sub_1LD7Y0IbY40IKAUgPNwCdBJd', {
        metadata: { 'order_id': '6735' }
      }, function (err, result) {
        if (err) {
          reject(err);
        }
        else if (result) {
          resolve(result)
        }
      });
    });
  }

  static async cancelSchedules(subscription_schedule_name) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {

      stripe.subscriptionSchedules.cancel(subscription_schedule_name, function (err, result) {
        if (err) {
          reject(err);
        }
        else {
          resolve(result)
        }
      });
    });
  }


  static updateUserSubscription1(data, usersubs_id) {
    console.log(usersubs_id, 'usersubs_id')
    return new Promise((resolve, reject) => {
      var stringifyData = JSON.stringify(data);
      let parseData = JSON.parse(stringifyData);

      UserSubs.updateOne(
        { subscription_name: usersubs_id },
        { $set: parseData },
        async (err, schedule) => {
          if (err) {
            reject(err);
          } else {
            resolve(schedule);
          }
        })
    })
  }

  static createTransactionHistory1(data) {
    return new Promise(async (resolve, reject) => {
      let transaction = new Transaction({
        invoice_number: await Appfunctions.getInvoiceNumber(),
        ...data
      });
      transaction.save(async (err, schedule) => {
        if (err) {
          console.log(err);
          reject(appfunctions.failResponse('msg_something_wrong', JSON.stringify(err)));
        } else {
          resolve(schedule);
        }
      })
    })
  }







  static checkAuth(req, res, next) {
    const token = req.headers.authorization ? (req.headers.authorization.split(" "))[1] : "";
    if (token) {
      // User.findOne({token:token}).exec((err, result) => {
      //   if(result){
      //     if(result.block == 1){
      //       res.send(401);
      //     }
      //     if(result.status == 0){
      //       res.send(401);
      //     }
      //     if(result.block == 0 && result.status == 1){
      //       next();
      //     }
      //   }else{
      //     res.send(401);
      //   }
      // });
      next();
    } else {
      res.send(401);
    }
  }

  static saveCoupon(data) {
    return new Promise((resolve, reject) => {
      const couponCode = data.coupon_code;
      if (!couponCode) {
        reject("coupon_code not found.");
      }
      Coupon.findOne({ coupon_code: couponCode }).exec((err, result) => {
        if (!result) {
          let coupon = new Coupon(data);
          coupon.save(function (err, resp) {
            if (!err && resp) {
              resolve(true);
            } else {
              reject(err);
            }
          })
        } else {
          resolve(true);
        }
      })
    })
  }

  static async retriveSubscription(subscription_id) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.subscriptions.retrieve(subscription_id, function (err, result) {
        if (err) {
          reject(err);
        }
        else if (result) {
          resolve(result)
        }
      });
    });
  }

  static getExpireDate(product_id, date, is_trial_period, trialPeriodDays) {
    let expiry = '';
    if (product_id == "Birlingo_Subs1" || product_id == "birlingo_subs1") {
      expiry = new Date(date.setMonth(date.getMonth() + 1));
    } else if (product_id == "Birlingo_Subs3" || product_id == "birlingo_subs3") {
      expiry = new Date(date.setMonth(date.getMonth() + 3));
    } else if (product_id == "Birlingo_Subs6" || product_id == "birlingo_subs6") {
      expiry = new Date(date.setMonth(date.getMonth() + 6));
    } else if (product_id == "Birlingo_Subs12" || product_id == "birlingo_subs12") {
      expiry = new Date(date.setMonth(date.getMonth() + 12));
    } else if (product_id == "Birlingo_SubsUn1" || product_id == "birlingo_subsun1") {
      expiry = new Date(date.setMonth(date.getMonth() + 240));
    }
    else {
      console.log('no conditions')
    }

    if (is_trial_period == "true" || is_trial_period == 2) {
      expiry = expiry.setDate(expiry.getDate() + trialPeriodDays)
    }
    expiry = new Date(expiry);


    return expiry
  }

  /** This function is used to create coupon on stripe only */
  static async createCouponOnStripe(data) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.coupons.create(data,
        function (errs, coupon) {
          if (errs) {
            reject(errs);
          } else if (coupon) {
            resolve(coupon);
          }
        });
    })
  }/** Ends createCouponOnStripe() */

  /** This function is used to confirm that coupon does not exists already */
  // static async isCouponAlreadyExists(couponName){
  //   return new Promise((resolve,reject)=>{
  //     Coupon.findOne({coupon_code:couponName},(err,result)=>{
  //       if(err){
  //         reject(err);
  //       }
  //       if(result){
  //         resolve(true);/**This Coupon Is Already Exists */
  //       }else{
  //         resolve(false);/**This Is A New Coupon */
  //       }
  //     })
  //   });
  // }

  static isCouponAlreadyExists(couponName) {
    console.log("isCouponAlreadyExists", couponName);
    return new Promise((resolve, reject) => {
      Coupon.findOne({ coupon_code: couponName })
        .then((coupon) => {
          if (!coupon) {
            // console.log(`Coupon ${couponName} not found in MongoDB`);
            resolve(false);
          } else {
            stripe.coupons.retrieve(coupon.stripe_id)
              .then((stripeCoupon) => {
                if (!stripeCoupon) {
                  // console.log(`Coupon ${couponName} not found in Stripe, cleaning up MongoDB...`);
                  Coupon.deleteOne({ coupon_code: couponName })
                    .then(() => {
                      // console.log(`Coupon ${couponName} cleaned up in MongoDB`);
                      resolve(false);
                    })
                    .catch((err) => reject(err));
                } else {
                  // console.log(`Coupon ${couponName} exists in both MongoDB and Stripe`);
                  resolve(true);
                }
              })
              .catch((err) =>{
                // console.log("*************8888888*******",err);
                resolve(false);
              });
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  /** This function is used to delete coupon from stripe only */
  static async deleteCouponStripe(stripeId) {
    let stripe = await getStripeInstance();
    return new Promise((resolve, reject) => {
      stripe.coupons.del(stripeId, function (err, coupons) {
        if (err) {
          reject(err);
        } else {
          resolve(coupons);
        }
      })
    });
  }

  /** This function is used to delete coupon */
  static deleteCoupon(stripeId) {
    return new Promise((resolve, reject) => {
      Coupon.deleteOne({ stripe_id: stripeId }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(); 
        }
      });
    });
  }

  /** This function is used to find coupon */
  static findCoupon(condition) {
    return new Promise((resolve, reject) => {
      Coupon.findOne(condition, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      })
    });
  }



  /** This function is used to updateSubsMetadata */
  static async updateSubsMetadata(stripeId, data) {
    let stripe = await getStripeInstance();
    console.log(stripeId, 'stripeId');
    return new Promise((resolve, reject) => {
      stripe.subscriptions.update(stripeId, data, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    });
  }

  /** This function is used to check apple exists subs */
  static findIfUserHasAlreadySubscription(condition) {
    return new Promise((resolve, reject) => {
      UserSubs.find(
        condition
      ).exec((err, result) => {
        if (err) {
          reject(err);
        }
        else {
          console.log("findIfUserHasAppleSubscription", result);
          if (result.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      })
    });
  }

  /** This function is used to cancel subs */
  static cancelSubscription(find, update) {
    return new Promise((resolve, reject) => {
      UserSubs.updateOne(find, { $set: update }).exec(
        function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        });
    });
  }

  /** This function is used to check apple exists subs */
  static cancelAppleSubscription(find, update) {
    return new Promise((resolve, reject) => {
      UserSubs.findOneAndUpdate(find, { $set: update }).exec(
        function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(true);
          }

        });
    });
  }

  /** This function is used to check apple exists subs for sharpspring */
  static isFirstSubs(userId) {
    return new Promise((resolve, reject) => {
      UserSubs.findOne({ user_id: ObjectId(userId) }).exec(
        function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            if (result) {
              resolve(false);
            } else {
              resolve(true);
            }
          }

        });
    });
  }
  static getRandomString(length = 4) {
    let str = "";
    const txt = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '@', '#', '$', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const Txtlength = txt.length - 1;
    for (let i = 0; i < length; i++) {
      const ind = Math.floor(Math.random() * Txtlength);
      if (ind < Txtlength) {
        str += txt[ind];
      }
    }
    return str;
  }

  static saveUserSubscriptionUpsert(findCondition, updateExpr, upsert = false) {
    return new Promise((resolve, reject) => {
      UserSubs.updateOne(
        findCondition,
        updateExpr,
        { "upsert": upsert },
        async (err, responseData) => {
          if (err) {
            reject(err);
          } else {
            resolve(responseData);
          }
        })
    })
  }

  static refundFromStripe(chargeId) {
    return new Promise(async (resolve, reject) => {
      let stripe = await getStripeInstance();
      stripe.refunds.create({
        charge: chargeId,
      }).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      })
    })
  }

  static getInvoiceNumber(format = "YYYY-MM-DD") {
    return new Promise(async (resolve) => {
      let newStrDate = "";
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());
      newStrDate = format.replace('DD', day);
      newStrDate = newStrDate.replace('MM', month);
      newStrDate = newStrDate.replace('YYYY', year);
      const count = await Transaction.count({ invoice_number: { $exists: true } });
      const invoiceNumber = newStrDate + "-" + (count + INVOICE_NUMBER_START_FROM + 1);
      resolve(invoiceNumber);
    });
  }


/****************************************Strie partial refund **************** */

static partialRefundFromStripe(chargeId,amount) {
  return new Promise(async (resolve, reject) => {
    let stripe = await getStripeInstance();
    stripe.refunds.create({
      charge: chargeId,
      amount:amount*100
    }).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    })
  })
}


static async getCoupon(id) {
  return Coupon.findOne({ _id: ObjectId(id) });
}

static async getInvoiceUrl(charge_id) {
  return new Promise(async (resolve, reject) => {
    let stripe = await getStripeInstance();
    stripe.charges.retrieve(charge_id).then((result) => {
    let charge = result
    let receipt_url = charge.receipt_url
    resolve(receipt_url);
  }).catch((err) => {
      reject(err);
    })
  })
}

}


module.exports = Appfunctions;