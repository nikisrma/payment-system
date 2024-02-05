module.exports={
    status:{
        PENDING:0,
        ACTIVE:1,
        CANCELED:2,
        EXPIRED:3,/**NEW ADDED */
    },
    payment_status:{
        PAY_PENDING:"pending",
        PAY_NOT_STARTED:"not_started",
        PAY_PROCESSING:"processing",
        PAY_FAILED:"failed",
        PAY_TRIALING:"trialing",
        PAY_ACTIVE:"active",
        PAY_CANCELED:"canceled",
        PAY_REFUNDED:"refunded",
        PAY_PARTIALLY_REFUNDED:"partially-refunded"
    },
    payment_type:{
        OFFLINE:"offline",
        ONLINE:"online"
    },
    unlimited_validity_check:240,
    SUBS_FILTER:{
        status: 1
    },
    DELETED:1,
    NOT_DELETED:0,
    subscription_source:{
        ANDROID:"android",
        WEBSITE:"website",
        IOS:"ios"
    },
    INVOICE_NUMBER_START_FROM:1000,
    ANDROID_PACKAGE_NAME:"com.birlingo"
}

// 2022-12-09T12:32:32.000Z