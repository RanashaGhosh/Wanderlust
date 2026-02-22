const mongoose = require('mongoose');
const initData=require('./data.js');
const Listing = require('../models/listing');

// MongoDB connection setup
const mongo_url = 'mongodb://localhost:27017/wanderlust';

main()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongo_url);
}

// Initialize Database with Sample Data
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: '6970f4cfc0a46a230e304318'}))
    await Listing.insertMany(initData.data);
    console.log('Database initialized with sample data');
}
initDB();