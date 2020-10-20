const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gocardlessStatus:{
        type:String,
        required:true,
        default:"no"
    },
    gocardlessCustomerID: {
        type:String
    },
    gocardlessMandateID: {
        type:String
    },
    gocardlessSubscription:{
        type:String
    },
    subscription:{
        type:String
    },
    gocardlessPayments: [{
        paymentID:{
            type:String
        },
        productID:{
            type:String,
            ref:'Product'
        }
    }]
})

const User=mongoose.model('User',userSchema)
module.exports=User