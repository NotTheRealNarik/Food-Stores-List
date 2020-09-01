const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const { Store } = require('express-session');

const storeSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required:'Please enter a store name'
    },
    
    slug: String,
    
    description: {
        type: String,
        trim: true
    },
    
    tags: [String],

    created: {
        type: Date,
        default: Date.now
    },
    
    location:{
        type:{
            type: String,
            default: 'Point'
        },
        coordinates: [
            {
                type: Number,
                required: 'You must supply coordinates'
        }],
        
        address: {
            type: String,
            required: "You must supply an address"
        }
    },

    photo: String

});


storeSchema.pre('save', async function(next){
    if (!this.isModified('name')){
        next(); // skip it
        return; //stop this function 
    }
    this.slug = slug(this.name);
    //find duplicates with same slug and handle it
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`,'i');
    const storesWithSlug = await this.constructor.find({slug: slugRegEx}); //this.constructor is equal to "Store"
    if(storesWithSlug.length){
        //overwrite this.slug
        this.slug = `${this.slug}-${storesWithSlug.length+1}`;
    }
    
    next();
    // check for unique slug

})

module.exports = mongoose.model('Store', storeSchema);