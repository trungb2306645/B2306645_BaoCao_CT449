const mongoose = require("mongoose");
//footballweb là tên database, nếu chưa có thì mongoose sẽ tự tạo ra
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb://127.0.0.1:27017/FootballWeb"
        );

        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;