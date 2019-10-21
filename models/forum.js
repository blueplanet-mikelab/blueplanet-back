const mongoose = require('mongoose')

const forumSchema = new mongoose.Schema({
    topic_id: { type: String },
    title: { type: String },
    thumbnail: { type: String },
    countries: { type: Array },
    duration: { type: JSON },
    month: { type: Array },
    season: { type: String },
    theme: { type: Array },
    budget: { type: Number },
    totalView: { type: Number },
    totalVote: { type: Number },
    totalComment: { type: Number },
    popularity: { type: Number },
    create_at: { type: Date }
})

module.exports = mongoose.model('Forum', forumSchema)