const mongoose = require("mongoose");
const Listing = require("./models/listing");
const axios = require("axios");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

async function geocodeLocation(location) {
  const res = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { q: location, format: "json", limit: 1 },
      headers: { "User-Agent": "Wanderlust-App" }
    }
  );

  if (!res.data.length) return null;

  return {
    type: "Point",
    coordinates: [
      parseFloat(res.data[0].lon),
      parseFloat(res.data[0].lat)
    ]
  };
}

async function fixListings() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    const geo = await geocodeLocation(listing.location);
    
    if (geo) {
      listing.geometry = geo;
      await listing.save();
      console.log("✅ Fixed:", listing.title);
    }
  }

  mongoose.connection.close();
}

fixListings();
