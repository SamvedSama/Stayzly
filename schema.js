const Joi = require('joi');

const listingSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required();
    
module.exports = listingSchema;