const express = require("express");
const router = express.Router();

const accounts = require("../models/login.model");

router.post("/", (req, res) => {
    const { name, pass } = req.body;

    const Login = accounts.find(
        account => account.name === name && account.pass === pass
    );

    if (Login) {
        return res.status(200).json({
            message: "Đăng nhập thành công"
        });
    } 
    return res.status(401).json({
        message: "Sai tài khoản hoặc mật khẩu"
    });
});

module.exports = router;