const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");
const MONGO_URL = "mongodb://localhost:27017/Stayzly";

main().then(()=>{
    console.log("Successfully Connected to Database")})
.catch(()=>{
    console.log("Connection to Database Failed");
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Database Initialized");
}

initDB();