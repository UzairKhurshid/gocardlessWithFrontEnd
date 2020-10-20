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
const sessionToken='testToken'
const GoCardlessAccessToken='sandbox_jn3O2cXuAs-2KQj8hBhLOMYo7bs29AukhWXAtEKm'
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
router.get('/gocardlessCreateUser',async(req,res)=>{
    try {
        
        //Now, let’s check that the client is working by making our first request to the API: 
        //listing our customers (there won’t be any at the moment). Just run the following:
        // const listResponse = await client.customers.list();
        // const customers = listResponse.customers;
        //console.log(customers);
        //run untill this you will get [] . means working till now.
        //Let’s add our first customer, and set them up with a Direct Debit mandate.
        console.log(sessionToken)
        const redirectFlow = await client.redirectFlows.create({
            description: "Cider Barrels",
            session_token: sessionToken,
            success_redirect_url:
              "https://developer.gocardless.com/example-redirect-uri/",  // in real integeration this will be the link to a success page of your website 
            // Optionally, prefill customer details on the payment page
            prefilled_customer: {
              given_name: "uzair",
              family_name: "khurshid",
              email: "uzair@gmail.com",
              address_line1: "338-346 Goswell Road",
              city: "London",
              postal_code: "EC1V 7LQ"
            }
          });
          
          // Hold on to this ID - you'll need it when you
          // "confirm" the redirect flow later
          console.log(redirectFlow.id);
          console.log(redirectFlow.redirect_url);
          res.send({ 
            redirectFlowID:redirectFlow.id,
            redirectFlowURL:redirectFlow.redirect_url
          })
          //untill now we create user and get a redirect url (page url on gocardless)   which we can send our customer to in order to have them set up a mandate.
          //for uk test sort code = 200000 and bank account = 55779911
          //after completing the given form user will be redirected to success redirect url we just set up above in
          //the code with redirectflow id in query parameter which will match the redirect flow id we get in redirectFlow object.
          

            //Now we’ll use a second API call to “complete” the redirect flow. In a real integration, we’d build our own success page,
            // setting it as the redirect_url, and this page would perform this step.
            // We’ll need the ID from above, and the session_token we set earlier:
            //in route gocardless2

    } catch (e) {
        console.log(e)
    }
})

//(iii) completing mandate
//run the code in gocardless2 route on your success page using redirectflowid in query parameters to get 
// mandate and customer so you can use it in future also store mandate and customer in database.

router.get('/listAllUsers',async(req,res)=>{
  try {
    const id = 'CU000DGQTH27X7'
    const singleCustomer=await client.customers.find(id);
    //const listResponse = await client.customers.list();
    //const customers = listResponse.customers;
    //console.log(customers)
    console.log(singleCustomer)
    res.send({
      singleCustomer:singleCustomer,
      //allCustomers:customers
    })
  } catch (e) {    
    console.log(e)
  }
})


router.get('/gocardlessCompleteMandate',async(req,res)=>{
    try {
        console.log(sessionToken)
        const redirectFlow = await client.redirectFlows.complete(
            "RE0002Y0P25Y2BQK6Y5J77N08DEDCJT8", //this is redirectFlow.id and in query parameter also we get in redirectFlow in above route.
            {
              session_token: sessionToken
            }
          );
          
          // Store the mandate and customer against the customer's database record so you can charge
          // them in future
          console.log(`Mandate: ${redirectFlow.links.mandate}`);
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
              amount: 20000,
              currency: "GBP",  // UK currency
              links: {
                mandate: "MD000D4EXGXFPV"  //mandate we get in route gocardless2
              },
              metadata: {
                invoice_number: "010" // generate according to your invoices in your database
              }
            },
            "random_payment_specific_string11" // a string should be unique for every payment
          );
          
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
        
        const paymentId = "PM001V0D1QTW2K";

        const paymentDetails = await client.payments.find(paymentId);

        console.log(`Amount: ${paymentDetails.amount}`);
        console.log(`Status: ${paymentDetails.status}`);
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
              amount: 250000,
              currency: "GBP",
              name: "Monthly subscription",
              interval: 1,
              interval_unit: "monthly",
              day_of_month: 5,
              links: {
                mandate: "MD000CXQWMPVN9"
              }
            },
            "unique_subscription_specific_string2"
          );
          
          console.log(subscription.id);
          res.send({
            subscriptionID:subscription.id
          })
    } catch (e) {
        console.log(e)
    }
})

router.get('/gocardlessCancelSubscription',async(req,res)=>{
    try {
        // Subscription ID from above
        const subscriptionId = "SB00042BACSXV7";

        const subscription = await client.subscriptions.find(subscriptionId);

        console.log(`Amount: ${subscription.amount}`);
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