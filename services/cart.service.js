const Cart = require("../models/Cart");


const {
    getProductById,
} = require("../services/product.service");



const getItems = async ({ userId }) => {
    let totalPrice = 0;
    let totalItems = 0;
    const cart = await Cart.findOne({ user: userId }).populate("items.product")
    if (cart) {
        for (let i = 0; i < cart.items.length; i++) {
            totalPrice += cart.items[i].product.price * cart.items[i].quantity;
            totalItems += cart.items[i].quantity;
            itemFound = true;
        }
        return { cart, totalItems, totalPrice };
    }
    else {
        return { cart: null, totalItems, totalPrice };
    }
};


const addProduct = async ({ productId, userId }) => {
    const cart = await Cart.findOne({ user: userId });
    const product = await getProductById(productId);
    if (product) {

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
    } else {
        return null;
    }
}


const decreaseCartItem = async ({ productId, userId }) => {
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
    } else {
        return null;
    }
}


const removeCartItem = async ({ productId, userId }) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        let itemFound = false;
        for (let i = 0; i < cart.items.length; i++) {
            if (productId === cart.items[i].product.toString()) {
                cart.items.splice(i, 1)
                itemFound = true;
            }
        }
        if (!itemFound) {
            return null;
        }
        return cart.save();
    } else {
        return null;
    }
}

module.exports = {
    getItems,
    addProduct,
    decreaseCartItem,
    removeCartItem,
};