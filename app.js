const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const PORT = 8080;
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema");

const MONGO_URL = "mongodb://localhost:27017/Stayzly";

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

main().then(()=>{
    console.log("Successfully Connected to Database")})
.catch(()=>{
    console.log("Connection to Database Failed");
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("Server Working");
})

const validateListing = (req,res,next)=>{
    let error = listingSchema.validate(req.body)
    if(error){
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(errMsg,400);
    }else{
        next();
    }
}

// app.get("/testListing",async (req,res)=>{
//     const listing = new Listing({
//         title:"Test Listing",
//         description:"Test Description",
//         image:"",
//         price:10000,
//         location:"Test Location",
//         country:"Test Country"
//     })
//     await listing.save().then(()=>{
//         res.send("Listing Saved");
//         res.send("Test Successful");
//     })
// })

//Index
app.get("/listings",async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})

//New Route //Put this before listings/:id or else app.js will think it's an id and search in db
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//Show
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}))

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}))

//Create Route
app.post("/listings",validateListing,wrapAsync(async (req,res)=>{
    const listing = new Listing(req.body);
    await listing.save();
    res.redirect("/listings");
}))

//Update Route
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body});
    res.redirect(`/listings/${id}`)
}))

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

app.all("*",(req,res,next)=>{
    next(new ExpressError("Page Not Found!",404));
})

app.use((err,req,res,next)=>{
    let {statusCode = 500,message = "Something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs",{message});
})

app.listen(PORT,()=>{
    console.log("Server Listening at port",PORT)
})