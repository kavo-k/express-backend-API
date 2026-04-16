const Favorites = require("../models/Favorites");


const {
    getProductById,
} = require("../services/product.service");



const getItems = async ({ userId }) => {
    const favorites = await Favorites.findOne({ user: userId }).populate("items.product")
    return { favorites };
};



const addProduct = async ({ productId, userId }) => {
    const favorites = await Favorites.findOne({ user: userId });
    const product = await getProductById(productId);
    if (product) {
        if (favorites) {
            const item = favorites.items.find((item) => item.product.toString() === productId);
            if (!item) {
                favorites.items.push({
                    product: productId,
                });
            }
            return favorites.save();
        }

        return Favorites.create({
            user: userId,
            items: [
                {
                    product: productId,
                }
            ]
        })
    } else {
        return null;
    }
}


const removeFavoritesItem = async ({ productId, userId }) => {
    const favorites = await Favorites.findOne({ user: userId });
    if (favorites) {
        let itemFound = false;
        for (let i = 0; i < favorites.items.length; i++) {
            if (productId === favorites.items[i].product.toString()) {
                favorites.items.splice(i, 1)
                itemFound = true;
            }
        }
        if (!itemFound) {
            return null;
        }
        return favorites.save();
    } else {
        return null;
    }
}


const removeFavoritesAllItems = async ({ userId }) => {
    const favorites = await Favorites.findOne({ user: userId });
    if (favorites) {
        favorites.items.splice(0, favorites.items.length)
    } else {
        return null;
    }
    return favorites.save();
}


module.exports = {
    getItems,
    addProduct,
    removeFavoritesItem,
    removeFavoritesAllItems,
};