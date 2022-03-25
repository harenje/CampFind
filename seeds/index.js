const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect('mongodb://localhost:27017/yelp-camp').then(() => {
console.log("mongoDB connection open")
})
.catch (err => {
console.log("Error", err)
})

const sample = array => array[Math.floor(Math.random()*array.length)];


seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: "620c02d69cee8c10f4222c8d",
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url:"https://res.cloudinary.com/dv3csxgoc/image/upload/v1645451798/YelpCamp/Camp2_dolyya.jpg",
                    filename: "Camp2_dolyya"
                },
                {
                    url:"https://res.cloudinary.com/dv3csxgoc/image/upload/v1645451798/YelpCamp/Camp1_wuqgzd.jpg",
                    filename:"Camp1_wuqgzd" 
                }
            ]
        })
        await camp.save();
    }    
}

seedDB().then(() => {
    mongoose.connection.close()
})