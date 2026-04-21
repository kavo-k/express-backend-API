require("dotenv").config();
const Product = require("../models/Product");
const mongoose = require("mongoose");

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const transferImage = async () => {
        let count = 0;
        const products = await Product.find();

        for (const product of products) {

            if (!product.images || product.images.length <= 0) {
                if (product.imagePublicId && product.imageUrl) {
                    const migrateImagePublicId = product.imagePublicId;
                    const migrateImageUrl = product.imageUrl;

                    product.images = [{ imageUrl: migrateImageUrl, imagePublicId: migrateImagePublicId }]

                    await product.save();
                    count++;
                }
            }
        }
        return count;
    }

    const count = await transferImage();
    console.log(`количество обновлённых товаров: ${count}`);

    await mongoose.connection.close()
}

run().then(() => console.log(`скрипт завершён успешно`)).catch((err) => console.error("Ошибка подключения к MongoDB:", err));;