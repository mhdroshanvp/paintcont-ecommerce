const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    category : {
        type:String,
        require:true
    },
    isDelete: {
        type: Boolean,
        default:false
    }
})

module.exports = mongoose.model("category",categorySchema)