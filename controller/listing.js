const Listing = require("../models/listing");
const axios = require("axios");


module.exports.index = async (req, res) => {
    const { search } = req.query;

    let allListings;
    if (search) {
        allListings = await Listing.find({
            $or: [
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
            ]
});

    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index", { allListings });
};

module.exports.new = (req, res) => {
    res.render('listings/new');
};

module.exports.show = async (req, res) => {
    const { id }= req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews", 
        populate: {
            path: "author",
        },
    })
    .populate('owner');
    if(!listing){
        req.flash('error', 'Listing Not Found!');
        return res.redirect('/listings');
    }
    console.log(listing);
    res.render("listings/show",{listing});
}

async function geocodeLocation(location) {
    if (!location || location.trim() === "") {
        return null;
    }

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: location ,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "Wanderlust-App"
            }
        }
    );

    if (!response.data || response.data.length === 0) {
        return null;
    }

    return {
        type: "Point",
        coordinates: [
            Number(response.data[0].lon),
            Number(response.data[0].lat)
        ]
    };
}



module.exports.create = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const geometry = await geocodeLocation(req.body.listing.location);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    if (geometry) {
        newListing.geometry = geometry;
    } else {
        console.log("❌ GEOCODING FAILED");
    }

    await newListing.save();

    console.log("✅ FINAL SAVED LISTING GEOMETRY:", newListing.geometry);

    req.flash('success', 'Successfully created a new listing!');
    res.redirect(`/listings/${newListing._id}`);
};


module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Listing Not Found!');
        return res.redirect('/listings');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/h_300,w_300');
    res.render('listings/edit', {
        listing,
        originalImageUrl,
        coordinates: listing.geometry ? listing.geometry.coordinates : null
    });
};   

module.exports.update = async (req, res) => {
    //console.log(req.body);
    let { id } = req.params;
    
    
  // 1️⃣ get existing listing
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

    const oldLocation = listing.location;
    const newLocation = req.body.listing.location;

    // 2️⃣ Update geometry ONLY if location changed
    if (newLocation && newLocation !== oldLocation) {
        const geometry = await geocodeLocation(newLocation);

        if (geometry) {
            listing.geometry = geometry;
        } else {
            req.flash("error", "Invalid location. Please enter a valid place.");
            return res.redirect(`/listings/${id}/edit`);
        }
    }

    listing.set(req.body.listing);
    
    /*let updatedListing =await Listing.findByIdAndUpdate(
        id,
        req.body.listing, 
        {runValidators: true, new: true }
    );*/
      
    
    if(typeof req.file !== 'undefined'){    
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    
    }  
    
    await listing.save();

    req.flash('success', 'Successfully updated the listing!');
    res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a listing!');
    res.redirect('/listings');
};