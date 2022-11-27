const mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
    carId: {
        type: String
    },
    title: {
        type: String
    },
    post_meta: {
        type: Array
    },
    post: {
        type: Object
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('vehicle', VehicleSchema)