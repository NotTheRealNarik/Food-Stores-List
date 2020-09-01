const mongoose = require('mongoose');
const Store = mongoose.model("Store");//get the Store.js 
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid'); //gives unique identitfiers to images uploaded




// multer handles upload request
const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next){
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto){
            next(null, true); //first value of "next" is an error, if null that means it worked
        }
        else{
            next({message: 'that file is not allowed'}, false);
        }
    }
};

exports.homePage = (req, res)=>{
    res.render('index.pug')
};

exports.addStore = (req,res)=>{
    res.render("editStore",{title:'Add Store'});
};

exports.upload = multer(multerOptions).single('photo')

exports.resize = async(req, res, next)=>{
    //check if no new file is uploaded
    if (!req.file){
        next(); // skips to next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1]; //extract extension from mimetype
    req.body.photo =`${uuid.v4()}.${extension}`; // store it with a unique identifier
    // now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // after writing the photo to filesystem we go to next
    next();
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
    const stores = await Store.find(); //store.find gets the data from the mongodb databse
    res.render('stores',{title:'Stores', stores: stores}) //render stores.pug and send title and stores as props
}

exports.editStore = async (req,res) => {
    //get the store with ID and confirm if they are the owner of the store. to enable editing
    const store = await Store.findOne({ _id: req.params.id});
    //then render out the edit form so the user can u[date their store
    res.render('editStore',{title: `Edit ${store.name}`, store: store});
}


exports.updateStore = async (req,res) => {
    //set location data to be a point
    req.body.location.type = 'Point'

    //passing the below data to the datbase, to update it
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
        new: true, //return the new updated data instead of the old data
        runValidators: true, //force to use schema when editing the stores
    }).exec();
    req.flash('success',`Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}> View Store`);
    res.redirect(`/stores/${store._id}/edit`);

}


exports.getStoreBySlug = async (req, res) =>{
    //res.json(req.params.slug)
    const store = await Store.findOne({ slug:req.params.slug})
    if (!store){
        //if store doesnt exist we go to next. in app.js next goes to error handlers.. which gives a 404 error.
        return next();
    }
    else{
        res.render('store', {store, title: store.name}); // we render store.pug from views folder and display its content
    }
}