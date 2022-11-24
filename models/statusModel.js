const mongoose = require('mongoose')

const StatusSchema = new mongoose.Schema({
    type: {
        type: String
    },
    scraping_cur_page: {
        type: Number
    },
    scraped_total_page: {
        type: Number
    },
    saved_cur_num: {
        type: Number
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('status', StatusSchema)