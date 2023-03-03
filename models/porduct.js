const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description:{
        type: String,
        require:true    
    },
    price: {
        type: Number,
        require: true,
        default:0
    },
    availability:{
        type: Boolean,
        require: true
    },
    image:{ 
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        require: true,
        
    }],
    isFeatured:{
        type: Boolean,
        default: false
    }
})

exports.Product = mongoose.model('Product', productSchema)
