const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');
const { ref } = require('joi');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    image: {
        url: String,
        filename: String
        
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
    },
    country:{
        type: String,
        required: true
    },
    // ✅ CORRECT MAP FIELD
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
    reviews: [
       {
         type : mongoose.Schema.Types.ObjectId,
         ref: 'Review',
       }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
    }
});

listingSchema.post('findOneAndDelete', async(listing) => {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
});


// Create a Mongoose model based on the schema
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;