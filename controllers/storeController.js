const mongoose = require('mongoose')
const Store = mongoose.model("Store") //get the Store.js 
exports.homePage = (req, res)=>{
    res.render('index.pug')
};

exports.addStore = (req,res)=>{
    res.render("editStore",{title:'Add Store'});
};


exports.createStore = async (req,res) =>{
    // when you clock save store, this method gets the info and saves in 'store' variable
    const store = await (new Store(req.body)).save(); //"Store" is being sent ot Store.js and follow the databaseSchema we defined
    // .save()  SAVES the data into the mongoDB database
    req.flash('success',`Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req,res) => {
    //query database for a list of all stores
    const stores = await Store.find();
    res.render('stores',{title:'Stores', stores: stores})
}