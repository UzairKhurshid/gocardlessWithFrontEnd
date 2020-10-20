const express=require('express')
const mongoose=require('mongoose')
const auth=require('../auth/auth')
const {createProduct , createPlan , createCustomer , subscribeCustomerToPlan} =require('../helper/stripeSubscription')
const router=new express.Router()

//change Publishable_Key and Secret_Key with your accounts Publishable_Key ,Secret_Key
var Publishable_Key = 'pk_test_51HcRbkAlTfZZPS72VGsA44iI5qXSbN4ZWbEmZoX80hAkeNkKxAykPJbqr2tVj0Mf5iQyNMOKMp5rcSbrA3zx6rYP00705juEi0'
var Secret_Key = 'sk_test_51HcRbkAlTfZZPS72oChrmPbpFAmOowohzeEqRs2eAfncDIM3mD47wV3vgzWbTaYfYtTiOCwpqIV19P3y5K719xUx00RfzmDwzr'
const stripe = require('stripe')(Secret_Key) 


//One time payment using Stripe
router.get('/stripe',async(req,res)=>{
    res.render('dashboard/Stripe',{
        title:"Stripe",
        key: Publishable_Key 
    })
})

router.post('/stripe',async(req,res)=>{
    console.log('Route to handle one time payment')
    // Moreover you can take more details from user 
    // like Address, Name, etc from form 
    stripe.customers.create({ 
        email: req.body.stripeEmail, 
        source: req.body.stripeToken, 
        //name will be your user name here is demo name is user
        name: 'User', 
        //can get user details/info here if required
        address: { 
            line1: 'user address ', 
            postal_code: '123456', 
            city: 'userCity', 
            state: 'userState', 
            country: 'userCountery', 
        } 
    }) 
    .then((customer) => { 
        //change these fields according to your need . these are just for testing purpose
        return stripe.charges.create({ 
            amount: '100',     //amount you want to charge your customer. Charing 1 doller
            description: 'Web Development Product', //your product name on which you r charging above amount.
            currency: 'USD',  //currency of amount
            customer: customer.id  //customer id will be returned by stripe you can use it or store in your database.
        }); 
    }) 
    .then((charge) => { 
        res.send("Success")  // If no error occurs 
    }) 
    .catch((err) => { 
        res.send(err)       // If some error occurs 
    }); 
})





router.get('/subscribe',async(req,res)=>{
    try {
        //all the details in below functions are dummy data just for testing purpose change it with your 
        //real application data
        const productID=await createProduct()
        const planID=await createPlan(productID)
        const customerID=await createCustomer()
        const result=await subscribeCustomerToPlan(customerID , planID)
        res.send('Subscribed')
    } catch (e) {
        console.log(e.message)
    }
})


module.exports=router