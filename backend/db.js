const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://harshitamore16:Harshita16@cluster0.p1hfn8w.mongodb.net/paytm')
.then(()=>{
    console.log("Mongo connected");
})
.catch((err) =>{
    console.log('error');
})

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },

    last_name:{
        type: String,
        required: true
    },

    password:{
        type: String,
        required: true
    }
})

const User = mongoose.model("User",userSchema)
module.exports = {
    User
}