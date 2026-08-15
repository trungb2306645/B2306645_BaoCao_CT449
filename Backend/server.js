// Import Express để tạo server
const express = require("express");

// Import CORS để cho phép frontend Vue gọi API backend
const cors = require("cors");
// Import connectDB để kết nối đến cơ sở dữ liệu MongoDB
const connectDB = require("./config/database");
// Import các route của cầu thủ và đội bóng
const playerRoutes = require("./routes/player.routes");
const matchRoutes = require("./routes/match.routes");
const PORT = 3000;

// Tạo ứng dụng Express
const app = express();

// Kết nối đến cơ sở dữ liệu
connectDB();

// Cho phép frontend ở domain/port khác gọi đến backend
app.use(cors());

// Cho phép Express đọc dữ liệu JSON mà client gửi lên
app.use(express.json());

// Route kiểm tra server
app.get("/", (req, res) => {
    res.send("Football Management API is running");
});

// Sử dụng các route đã định nghĩa
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);

// Khởi động server tại cổng PORT
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});