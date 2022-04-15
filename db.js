const mongoose = require('mongoose');

// const mongoURI = "mongodb://localhost:27017/RenTech?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
const mongoURI = "mongodb+srv://renTech:renRech2334445555@cluster0.qj9d3.mongodb.net/RenTech?retryWrites=true&w=majority"
const connectToMongo = () => {
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected SucessFully");
    })
}

module.exports = connectToMongo;