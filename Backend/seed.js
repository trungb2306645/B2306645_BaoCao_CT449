const connectDB = require("./config/database");
const Player = require("./models/player.model");
const Team = require("./models/team.model");

const seed = async () => {
  await connectDB();

  // Xóa dữ liệu cũ
  await Player.deleteMany({});
  await Team.deleteMany({});

  // Tạo players mẫu
  const samplePlayers = [
    { name: "Nguyen Van A", age: 25, position: "Tiền đạo", number: 9, photo: "/uploads/player1.svg" },
    { name: "Tran Van B", age: 22, position: "Tiền vệ", number: 8, photo: "/uploads/player2.svg" },
    { name: "Le Van C", age: 27, position: "Hậu vệ", number: 4 },
    { name: "Pham Van D", age: 21, position: "Thủ môn", number: 1 },
    { name: "Hoang Van E", age: 24, position: "Tiền đạo", number: 11 },
    { name: "Mai Van F", age: 23, position: "Tiền vệ", number: 10 }
  ];

  await Player.insertMany(samplePlayers);

  // Tạo teams mẫu, sử dụng số áo từ players
  const team1 = { teamId: 1, name: "FC Rồng", players: [9, 8, 4, 1] };
  const team2 = { teamId: 2, name: "United Sao", players: [11, 10] };

  await Team.create(team1);
  await Team.create(team2);

  console.log("Seeding completed.");
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
