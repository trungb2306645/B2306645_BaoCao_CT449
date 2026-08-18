const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
//load dữ liệu cầu thủ và đội bóng từ file data
const players = require("../models/player.model");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `player-${unique}${ext}`);
  }
});

const upload = multer({ storage });

//----------------------------------------------------------------------------------
// API lấy danh sách tất cả cầu thủ.
router.get("/", async (req, res) => {
  // Trả về mã HTTP 200 và danh sách cầu thủ dưới dạng JSON.
  const playersall = await players.find();
  res.status(200).json({message: "Lấy danh sách cầu thủ thành công", data: playersall});
});
//----------------------------------------------------------------------------------
// API tìm kiếm cầu thủ theo tên.
router.get("/search/:name", async (req, res) => {
  const name = req.params.name;
  //xem co name includes trong item.name khong, nếu có thì trả về item đó.
  const result = await players.find({ name: { $regex: name, $options: "i" } });
  if (!result) {
    return res.status(404).json({
      message: `Không tìm thấy cầu thủ có tên chứa "${name}"`,
    });
  }
  res.status(200).json({
    message: `Tìm thấy ${result.length} cầu thủ có tên chứa "${name}"`,
    data: result});
});
//----------------------------------------------------------------------------------
// API lấy thống kê một cầu thủ theo số áo
router.get("/:number/stats", async (req, res) => {
  const number = Number(req.params.number);
  const player = await players.findOne({ number: number }).select("name number stats");
  if (!player) return res.status(404).json({ message: "Không tìm thấy cầu thủ" });
  res.status(200).json({ message: "Thống kê cầu thủ", data: player });
});
//----------------------------------------------------------------------------------
// Upload player photo: multipart field name 'photo'
// Note: place this BEFORE the route that matches '/:number'
router.post('/:number/photo', (req, res, next) => {
  if (!upload) {
    return res.status(500).json({ message: "Server missing dependency 'multer'. Run 'npm install multer' in the Backend folder and restart the server." });
  }
  return upload.single('photo')(req, res, next);
}, async (req, res) => {
  const number = Number(req.params.number);
  const player = await players.findOne({ number });
  if (!player) return res.status(404).json({ message: 'Không tìm thấy cầu thủ' });
  if (!req.file) return res.status(400).json({ message: 'Không có file được gửi' });
  // Build public URL
  const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  player.photo = photoUrl;
  await player.save();
  res.status(200).json({ message: 'Upload ảnh thành công', data: player });
});
//----------------------------------------------------------------------------------
// API lấy top scorers (use query param ?limit=10)
router.get("/stats/top-scorers", async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const top = await players.find().sort({ 'stats.goals': -1 }).limit(limit).select("name number stats");
  res.status(200).json({ message: `Top ${limit} ghi bàn`, data: top });
});
//----------------------------------------------------------------------------------
//API sắp xếp cầu thủ theo vị trí.
router.get("/sort/:position", async (req, res) => {
  const position = req.params.position.toLowerCase();
  const result = await players.find({ position: { $regex: position, $options: "i" } });
  if (!result) {
    return res.status(404).json({
      message: `Không tìm thấy cầu thủ có vị trí "${position}"`,
    });
  }
  res.status(200).json({
    message: `Tìm thấy ${result.length} cầu thủ có vị trí "${position}"`,
    data: result});
});
//----------------------------------------------------------------------------------

//----------------------------------------------------------------------------------
// API lấy thông tin một cầu thủ theo số áo.
router.get("/:number", async (req, res) => {
  const number = Number(req.params.number);
  const player = await players.findOne({ number: number });
  if (!player) {
    return res.status(404).json({
      message: "Không tìm thấy cầu thủ",
    });
  }
  res.status(200).json(player);
});
//----------------------------------------------------------------------------------
// API thêm một cầu thủ mới, có thể kèm ảnh upload.
router.post("/", (req, res, next) => {
  if (!upload) {
    return res.status(500).json({ message: "Server missing dependency 'multer'. Run 'npm install multer' in the Backend folder and restart the server." });
  }
  return upload.single('photo')(req, res, next);
}, async (req, res) => {
  const { name, age, position, number } = req.body;

  if (!name || !age || !position || number === undefined) {
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin cầu thủ",
    });
  }

  const parsedNumber = Number(number);

  const photoUrl = req.file
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    : '';

  const newPlayer = new players({
    name,
    age: Number(age),
    position,
    number: parsedNumber,
    photo: photoUrl,
  });

  await newPlayer.save();

  return res.status(201).json({
    message: "Thêm cầu thủ thành công",
    data: newPlayer,
  });
});
//----------------------------------------------------------------------------------
// API cập nhật thông tin cầu thủ.
router.put("/:number", async (req, res) => {
    const oldNumber = Number(req.params.number);
    const { playerId, name, age, position, number: newNumber } = req.body;

    if (!name || !age || !position || newNumber === undefined) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin cầu thủ"
        });
    }

    let player = null;
    if (playerId) {
        player = await players.findById(playerId);
    }

    if (!player) {
        player = await players.findOne({ number: oldNumber });
    }

    if (!player) {
        return res.status(404).json({
            message: "Không có cầu thủ nào có số áo này để cập nhật"
        });
    }

    const targetNumber = Number(newNumber);

    Object.assign(player, {
        name,
        age: Number(age),
        position,
        number: targetNumber
    });

    await player.save();

    res.status(200).json({
        message: "Cập nhật cầu thủ thành công",
        data: player
    });
});
//----------------------------------------------------------------------------------
// API xóa cầu thủ.
router.delete("/:id", async (req, res) => {
  const target = req.params.id;
  let player = null;

  if (/^[0-9a-fA-F]{24}$/.test(target)) {
    player = await players.findById(target);
  }

  if (!player) {
    const isNumeric = /^-?\d+(\.\d+)?$/.test(String(target));
    if (isNumeric) {
      const numericTarget = Number(target);
      player = await players.findOne({ number: numericTarget });
    }
  }

  if (!player) {
    return res.status(404).json({
      message: "Không tìm thấy cầu thủ",
    });
  }

  const deletedPlayer = await players.deleteOne({ _id: player._id });

  res.status(200).json({
    message: "Xóa cầu thủ thành công",
    data: deletedPlayer
  });
});
//----------------------------------------------------------------------------------
module.exports = router;