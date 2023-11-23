const Banner = require('../models/bannermodel')
const mongoose = require('mongoose')
const { objectId } = require('mongodb')


const bannerListHelper = async () => {
    try {
        const response = await Banner.find();
        return response;
    } catch (error) {
        throw error;  // propagate the error upwards, so you can handle it where this function is called
    }
};

const addBannerHelper = async(texts, image) => {
    try {
        const banner = new Banner({
            title: texts.title,
            link: texts.link,
            image: image
        })
        console.log(banner)
        const response = await banner.save()
        return response
    } catch (error) {
        throw error
    }
}

const editBannerHelper = async (bannerId) => {
    try {
        const response = await Banner.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(bannerId) }
            },
            {
                $project: {
                    title: 1,
                    image: 1,
                    link: 1
                }
            }
        ]);
        return response;
    } catch (error) {
        console.log(error.message);
    }
}

const updateBannerHelper = async (data, image) => {
    try {
        console.log(data,'data')
        const bannerData = await Banner.updateOne(
            {
                _id: (data.id)
            },
            {
                $set: {
                    title: data.title,
                    link: data.link,
                    image: image
                } 
            }
        )
    } catch (error) {
        console.log(error.message)
    }
}





const deleteBannerHelper = async (deleteId) => {
    try {
        await Banner.deleteOne({_id: deleteId})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    bannerListHelper,
    addBannerHelper,
    deleteBannerHelper,
    editBannerHelper,
    updateBannerHelper

}