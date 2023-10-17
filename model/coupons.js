const mongoose = require('mongoose')

const couponSchema=mongoose.Schema({

    code:{
        type:String,
        required:true,
        uppercase:true,
    },
    type:{
        type:String,
        required:true,
        uppercase:true,
    },
    expiry:{
        type:Date,
        required:true
    },
    discount:{
        type:Number,
        required:true,
    },min:{
        type:Number,
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    category:{
        type:String
    }
});

module.exports=mongoose.model("coupon",couponSchema)