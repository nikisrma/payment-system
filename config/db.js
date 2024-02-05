module.exports = {
    // mongodburl:'mongodb://localhost:27017/birlingostaging3',
    mongodburl: 'mongodb://127.0.0.1:27017/payment-system',
    
    apiport: 3000,
    smtpEmail: '',
    smtpPassword: '',
    sessionTimeOut: 6000000,
    emailFrom: '',
    service: '',
    host: '',
    secret: 'secretkey',
    base_url: "http://172.16.11.201:3000",
    file_base_url: "http://172.16.11.201:3000",
    website_base_url: 'http://localhost:4200',
    website_url: 'http://localhost:4200',
    PRODUCTION:false, 
    HTTPS:false,
    PAYPAL:{
      STAGING:{
        // CLIENT_ID:"AckJmDcVrcvC9PhUsFJ4ObSgbXYSab4jUYrffEVs16kR6Bmm8ze9znzVzlyU824Jtrct24_2iXLUiW-E",
        // CLIENT_SECRET:"EBYbbrIo1B6P5Ho9OIs8bvAzguZUT0AjDKV0K33pofRE4easgrr3ELBOqa_AzhGm_74EMj-nZqpYzuEa",
        // BASE_URL:"https://api.sandbox.paypal.com/v2/",
      },
      LIVE:{
        // CLIENT_ID:"ASOKHErefjIdrIxE0fj7h7U9Q48Rzc53_VLQ3FWGoXSSv-BN8Pg6Acc2h_6y6QPi1iQLzZgiPLx8Fo6q",
        // CLIENT_SECRET:"EBqkSPa7ROhmUe2cHNFK2pS-Mo5i-UWdMwW2I8nww1OfXqHmNgiNdn3hUnKuEYGpqV6zxoQDnozRc8Ky",
        // BASE_URL:"https://api-m.paypal.com/v2/",
      }
    }
};