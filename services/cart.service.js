const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getItems = async ({ userId }) => {
    return Cart.findOne({ user: userId }).populate("items.product")
};


const addProduct = async ({ productId, userId }) => {
    const cart = await Cart.findOne({ user: userId });
    console.log("serice: ", productId);
    if (cart) {
        let itemFound = false;
        for (let i = 0; i < cart.items.length; i++) {
            if (productId === cart.items[i].product.toString()) {
                cart.items[i].quantity++;
                itemFound = true;
            }
        }
        if (!itemFound) {
            cart.items.push({
                product: productId,
                quantity: 1
            });
        }
        return cart.save();
    }

    return Cart.create({
        user: userId,
        items: [
            {
                product: productId,
                quantity: 1
            }
        ]
    })
}


const deleteProduct = async ({ productId, userId }) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        let itemFound = false;
        for (let i = 0; i < cart.items.length; i++) {
            if (productId === cart.items[i].product.toString()) {
                if (cart.items[i].quantity !== 1) {
                    cart.items[i].quantity--;
                } else {
                    cart.items.splice(i, 1)
                }
                itemFound = true;
            }
        }
        if (!itemFound) {
            return null;
        }
        return cart.save();
    }
}

module.exports = {
    getItems,
    addProduct,
    deleteProduct
};