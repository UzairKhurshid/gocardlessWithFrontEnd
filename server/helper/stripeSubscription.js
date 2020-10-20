
//change Publishable_Key and Secret_Key with your accounts Publishable_Key ,Secret_Key

var Publishable_Key = 'pk_test_51HcRbkAlTfZZPS72VGsA44iI5qXSbN4ZWbEmZoX80hAkeNkKxAykPJbqr2tVj0Mf5iQyNMOKMp5rcSbrA3zx6rYP00705juEi0'
var Secret_Key = 'sk_test_51HcRbkAlTfZZPS72oChrmPbpFAmOowohzeEqRs2eAfncDIM3mD47wV3vgzWbTaYfYtTiOCwpqIV19P3y5K719xUx00RfzmDwzr'
const stripe = require('stripe')(Secret_Key) 




//  Subscription on stripe
//function to create product on stripe
const createProduct = async () => {
    //you will be providing product name and type
    const PRODUCT_NAME = "Monthly Subscription";
    const PRODUCT_TYPE = 'service'

    const product = await stripe.products.create({
      name: PRODUCT_NAME,
      type: PRODUCT_TYPE,
    });

    console.log(product);
    return product.id;  
}


//create plan function we will pass product id we just created in above function
const createPlan = async productId => {
    //this is dummy data .provide your PLAN_NICKNAME,PLAN_INTERVAL,CURRENCY,PLAN_PRICE
    const PLAN_NICKNAME = "Monthly Subscription Plan";
    const PLAN_INTERVAL = "month";
    const CURRENCY = "usd";
    const PLAN_PRICE = 200;

    const plan = await stripe.plans.create({
        product: productId,
        nickname: PLAN_NICKNAME,
        currency: CURRENCY,
        interval: PLAN_INTERVAL,
        amount: PLAN_PRICE,
    });

    console.log(plan);
    return plan.id;
}


//creating customers using this function
const createCustomer = async () => {
    const CUSTOMER_EMAIl = "testemail@example.com";
    const CUSTOMER_SOURCE = 'tok_mastercard';

    const customer = await stripe.customers.create({
        email: CUSTOMER_EMAIl,
        source: CUSTOMER_SOURCE,
    });
    console.log(customer);
    return customer.id;
}

//create subscription of user created with above function and plan we created.pass both of the ids in this function

const subscribeCustomerToPlan = async (customerId, planId) => {
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{plan: planId}],
    });

    console.log(subscription);
    return subscription;
}


module.exports = {createProduct , createPlan , createCustomer , subscribeCustomerToPlan}
