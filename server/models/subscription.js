const mongoose=require("mongoose")
const subSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    interval:{
        type:Number,
        required:true
    },
    interval_unit:{
        type:String
    },
    day_of_month:{
        type:String
    }
})

const Subscription=mongoose.model('Subscription',subSchema)
module.exports=Subscription