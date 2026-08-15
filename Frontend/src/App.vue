<script setup>
import axios from "axios";
import { ref } from "vue";

//import bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
//danh sách  cầu thủ rổng hiển thị riêng cho vue
const players = ref([]);
//danh sách cầu thủ chưa hiển thị
const showPlayers = ref(false);
// from thêm cầu thủ chưa hiển thị
const AddForm = ref(false);
//form xóa cầu thủ chưa hiển thị
const DeleteFrom = ref(false)

//------------------------------------------------------
//Hàm xem danh sách cầu thủ
const getPlayers = async () => {
  const response = await axios.get(
    "http://localhost:3000/api/players"
  );
  players.value = response.data.data;
  showPlayers.value = true;
};

//------------------------------------------------------
//HÀM THÊM ADDFROM
//dự liệu nhập trong input dể post ban đầu rỗng
  const newPlayer = ref({
    name: "",
    age: "",
    position: "",
    number: ""
  });
  const addPlayer = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/players",
        newPlayer.value
      );
      alert(response.data.message);
      players.value.push(response.data.data);
      newPlayer.value = {
        name: "",
        age: "",
        position: "",
        number: ""
      };
      AddForm.value = false;
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };
//HÀM XÓA CẦU THỦ 
const inputNumber = ref("");
  const deletePlayer = async () =>
  {
    try {
      const response = await axios.delete(`http://localhost:3000/api/players/${inputNumber.value}`);
      // Hiển thị thông báo thành công bên backend trả về
      alert(response.data.message);

      // Xóa cầu thủ khỏi danh sách đang hiển thị
      players.value = players.value.filter(
        player => player.number !== Number(inputNumber.value)
      );

      inputNumber.value = "";
      DeleteFrom.value = false;
    } catch (error) {  
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  }
</script>

<template>

  <div>
    <h1>Quản lý đội bóng</h1>

    <!-- From show player-->
    <button @click="getPlayers">
      Xem danh sách cầu thủ
    </button>

    <div v-if="showPlayers">
      <h2>Danh sách cầu thủ</h2>

      <p v-for="player in players" :key="player._id">
        {{ player.name }}
        - {{ player.age }} tuổi
        - {{ player.position }}
        - Số {{ player.number }}
      </p>
    </div>
  </div>

  <!-- From add player-->
  <button @click="AddForm = true">
    Thêm cầu thủ
  </button>

  <div v-if="AddForm">

    <h2>Thêm cầu thủ</h2>

    <input v-model="newPlayer.name" placeholder="Tên cầu thủ" />

    <input v-model="newPlayer.age" type="number" placeholder="Tuổi" />

    <input v-model="newPlayer.position" placeholder="Vị trí" />

    <input v-model="newPlayer.number" type="number" placeholder="Số áo" />

    <button @click="addPlayer">
      Lưu cầu thủ
    </button>

    <button @click="AddForm = false">
      Hủy
    </button>

  </div>

<!-- From delete player-->
  <button class="btn-primary" @click="DeleteFrom= true">
    Xóa cầu thủ
  </button>

  <div> 
    <div v-if="DeleteFrom">
      <h2>Xóa cầu thủ</h2>
      <input v-model="inputNumber" type="number" placeholder="Số áo"/> 
      <button @click="DeleteFrom = false">
        Hủy
      </button>
      <button @click="deletePlayer">
        Xóa
      </button>
    </div>
  </div>
  <!-- From delete player-->


</template>