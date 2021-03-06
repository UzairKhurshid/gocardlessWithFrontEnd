const express=require('express')
const router=new express.Router()
const gocardless = require('gocardless-nodejs');
const constants = require('gocardless-nodejs/constants');

//api docs link
//https://developer.gocardless.com/getting-started/api/making-your-first-request/

//errors and more functions provided by the api 
//https://developer.gocardless.com/api-reference/#invalid_filters



//(i)
//first go to sandbox and create your account .
//click on create access token and give token a name and give read and write access
//create gocardless access token  (e:g)  
//sandbox_iGI0R5ZlRf9fLMc-iRnJ8eVkolJd-1YqRwqqN0Yp
const sessionToken='testToken'  //your application generated token 
const GoCardlessAccessToken='sandbox_jn3O2cXuAs-2KQj8hBhLOMYo7bs29AukhWXAtEKm' //generated by gocardless for you application using your account.
const client = gocardless(
    // We recommend storing your access token in an environment
    // variable for security like given below
    //process.env.GoCardlessAccessToken,
    //but for now we are storing in a variable for testing
    GoCardlessAccessToken,
    // Change this to constants.Environments.Live when you're ready to go live
    constants.Environments.Sandbox
);

//(ii) making a request

router.get('/',(req,res)=>{
  res.render('dashboard/dashboard')
})

router.get('/successPage',(req,res)=>{
  res.render('dashboard/goCardless')
})

router.get('/gocardlessCreateUser',async(req,res)=>{
    try {
        
        const redirectFlow = await client.redirectFlows.create({
            description: "Cider Barrels",
            session_token: sessionToken,
            success_redirect_url:
              "http://localhost:3000/successPage",  // in real integeration this will be the link to a success page of your website 
            // Optionally, prefill customer details on the payment page
            prefilled_customer: {
              given_name: "abc",
              family_name: "abc",
              email: "abc12@gmail.com",
              address_line1: "338-346 Goswell Road",
              city: "London",
              postal_code: "EC1V 7LQ"
            }
          });
          
          
          console.log(redirectFlow.id);
          console.log(redirectFlow.redirect_url);
          res.send({ 
            redirectFlowID:redirectFlow.id,
            redirectFlowURL:redirectFlow.redirect_url
          })
          

    } catch (e) {
        console.log(e)
    }
})



router.get('/listAllUsers',async(req,res)=>{
  try {
    const listResponse = await client.customers.list();
    const customers = listResponse.customers;
    res.send({
      allCustomers:customers
    })
  } catch (e) {    
    console.log(e)
  }
})

router.get('/listSingleUser',async(req,res)=>{
  try {
    const id = 'CU000DH53FAGXN'
    const singleCustomer=await client.customers.find(id);
    res.send({
      singleCustomer:singleCustomer
    })
  } catch (e) {    
    console.log(e)
  }
})


router.get('/gocardlessCompleteMandate/:id',async(req,res)=>{
    const mandateID=req.params.id
    try {
        const redirectFlow = await client.redirectFlows.complete(
            mandateID, //this is redirectFlow.id and in query parameter also we get in redirectFlow in above route.
            {
              session_token: sessionToken
            }
          );
          
          // Store the mandate and customer against the customer's database record so you can charge
          // them in future
          console.log(`Mandate: ${redirectFlow.links.mandate}`); //save in db with Customer id
          console.log(`Customer: ${redirectFlow.links.customer}`);
          
          // Display a confirmation page to the customer, telling them their Direct Debit has been
          // set up. You could build your own, or use ours, which shows all the relevant
          // information and is translated into all the languages we support.
          console.log(`Confirmation URL: ${redirectFlow.confirmation_url}`);
          res.send({
            Mandate:redirectFlow.links.mandate,
            Customer:redirectFlow.links.customer,
            ConfirmationURL:redirectFlow.confirmation_url
          })
    } catch (e) {
        console.log(e.message)
    }
})


//(iv) taking payment from customer
router.get('/gocardlessPayment',async(req,res)=>{
    try {
        const payment = await client.payments.create(
            {
              amount: 10000,
              currency: "GBP",  // UK currency
              links: {
                mandate: "MD000D4WC136MB"  // get from database  
              },
              metadata: {
                invoice_number: "10" // generate according to your invoices in your database
              }
            },
            "random_payment_specific_string2sdaasd3" // a string should be unique for every payment
          );

          //to generate a random string

        //   function generateRandomStr(length) {
        //     var result           = '';
        //     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        //     var charactersLength = characters.length;
        //     for ( var i = 0; i < length; i++ ) {
        //        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        //     }
        //     return result;
        //  }
         
        //  console.log(generateRandomStr(5));
          
          // Keep hold of this payment ID - we'll use it in a minute
          // It should look like "PM000260X9VKF4"
          console.log(payment.id);
          res.send('Payment ID :'+payment.id)
    } catch (e) {
        console.log(e)
    }
})

router.get('/gocardlessPaymentDetails',async(req,res)=>{
    try {
        
        const paymentId = "PM001V0G33Z1GP";

        const paymentDetails = await client.payments.find(paymentId);

        console.log(`Amount: ${paymentDetails.amount}`);
        console.log(`Status: ${paymentDetails.status}`);
        res.send({
          Amount:paymentDetails.amount,
          Status: paymentDetails.status
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/gocardlessCancelPayment',async(req,res)=>{
  try {
      
      const paymentId = "PM001V0G33Z1GP";
      console.log("Cancelling...");

      const cancelPayment = await client.payments.cancel(paymentId);
      console.log(`Status: ${cancelPayment.status}`);
      res.send('Payment :'+paymentId+' cancelled')
  } catch (e) {
      console.log(e)
  }
})




router.get('/gocardlessSubscription',async(req,res)=>{
    try {
        const subscription = await client.subscriptions.create(
            {
              amount: 500000,
              currency: "GBP",
              name: "Monthly subscription",
              interval: 1,
              interval_unit: "monthly",
              day_of_month: 5,
              links: {
                mandate: "MD000D4VRBXAJC"
              }
            },
            "unique_subscription_specific_stringas2"
          );

           //to generate a random string

            //   function generateRandomStr(length) {
            //     var result           = '';
            //     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            //     var charactersLength = characters.length;
            //     for ( var i = 0; i < length; i++ ) {
            //        result += characters.charAt(Math.floor(Math.random() * charactersLength));
            //     }
            //     return result;
            //  }
            
            //  console.log(generateRandomStr(5));
              
          console.log(subscription.id);
          res.send({
            subscriptionID:subscription.id
          })
    } catch (e) {
        console.log(e)
    }
})

router.get('/gocardlessSubscriptionDetails',async(req,res)=>{
  try {
      // Subscription ID from above
      const subscriptionId = "SB00042GAYR62J";

      const subscription = await client.subscriptions.find(subscriptionId);

      console.log(`Amount: ${subscription.amount}`);
      res.send({
        subscriptionAmount:subscription.amount
      })
  } catch (e) {
      console.log(e)
  }
})

router.get('/gocardlessCancelSubscription',async(req,res)=>{
    try {
        // Subscription ID from above
        const subscriptionId = "SB00042GAYR62J";
        console.log("Cancelling...");

        const cancelSubscription = await client.subscriptions.cancel(subscriptionId);

        console.log(`Status: ${cancelSubscription.status}`);

        res.send(`Subscription Status: ${cancelSubscription.status}`)
    } catch (e) {
        console.log(e)
    }
})








//Note:
//mandate will be created for an account only once.you cannot create mandate for an account twice , will through an error
//you cannot take payments with same payment string twice will through an error. same goes for subscription


module.exports=router