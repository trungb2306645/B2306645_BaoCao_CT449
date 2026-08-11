const express = require("express");
const cors = require("cors");
//gọi dùng bộ quy tắc express gán = app ( express backend)
const app = express();
//cài bộ quy tắc cors(người thông hành) cho app( express backend)
app.use(cors());
//cài này cho phép app( express backend) nhận dữ liệu dạng json
app.use(express.json());
//tạo mảng products chứa các sản phẩm theo ngôn ngữ lập trình javascript
let products = [
    { id: 1, name: "Laptop", price: 15000000 },
    { id: 2, name: "Chuột", price: 300000 }
];

// Lấy danh sách sản phẩm
app.get("/products", (req, res) => {
    res.json(products);
});

// Thêm sản phẩm
app.post("/products", (req, res) => {
    const product = {
        id: Date.now(),
        name: req.body.name,
        price: req.body.price
    };

    products.push(product);

    res.json(product);
});

// Xóa sản phẩm
app.delete("/products/:id", (req, res) => {
    products = products.filter(
        product => product.id != req.params.id
    );

    res.json({ message: "Đã xóa" });
});

app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});