const Joi = require('joi');

const SchemaList = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.object({
            url: Joi.string().required().allow("", null),
            filename: Joi.string().allow("", null)
        }),
        location: Joi.string().required(),
        country: Joi.string().required(),
    }).required()
});

const ReviewSchemaList = Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    createdAt: Joi.date().default(Date.now)
});

module.exports = {SchemaList, ReviewSchemaList};
