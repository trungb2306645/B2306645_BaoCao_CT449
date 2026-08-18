<script setup>
import '../css/components/player-management.css';
import '../css/components/player-card.css';
import usePlayers from '../composables/usePlayers';

const {
    players,
    selectedPlayer,
    showPlayers,
    AddForm,
    DeleteFrom,
    newPlayer,
    inputNumber,
    getPlayers,
    selectPlayer,
    closePlayer,
    addPlayer,
    deletePlayer,
    getImg
} = usePlayers();
</script>

<template>
    <div class="player-management-content">

        <!-- Tiêu đề -->
        <div class="text-center mb-4">
            <h1 class="fw-bold text-success">
                <i class="bi bi-people-fill"></i>
                Quản lý cầu thủ
            </h1>

            <p class="text-secondary">
                Quản lý danh sách thành viên của đội bóng
            </p>
        </div>

        <!-- Các nút chức năng -->
        <div class="text-center mb-4">

            <button class="btn btn-primary m-2" @click="getPlayers">
                <i class="bi bi-people"></i>
                Xem danh sách
            </button>

            <button class="btn btn-success m-2" @click="AddForm = true">
                <i class="bi bi-person-plus-fill"></i>
                Thêm cầu thủ
            </button>

            <button class="btn btn-danger m-2" @click="DeleteFrom = true">
                <i class="bi bi-person-dash-fill"></i>
                Xóa cầu thủ
            </button>

        </div>


        <!-- ================= DANH SÁCH ================= -->

        <div v-if="showPlayers">

            <h2 class="text-center text-warning f mb-4">
                Danh sách cầu thủ
            </h2>

            <div class="row g-4">

                <!-- Một card cầu thủ -->
                <div v-for="player in players" :key="player._id" class="col-12 col-sm-6 col-md-4 col-lg-3">

                    <div class="player-card" @click="selectPlayer(player)">
                        <img class="player-image" :src="getImg(player)" alt="" aria-hidden="true" />
                        <div class="card-overlay"></div>

                        <!-- Số áo -->
                        <div class="player-number">
                            {{ player.number }}
                        </div>

                        <!-- Icon người (kept for fallback) -->
                        <div class="player-icon">
                            <i class="bi bi-person-fill"></i>
                        </div>

                        <!-- Thông tin -->
                        <h4 class="player-name">
                            {{ player.name }}
                        </h4>

                        <p class="player-position">
                            {{ player.position }}
                        </p>

                        <div class="player-age">
                            {{ player.age }} tuổi
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- ================= FORM THÊM ================= -->

        <div v-if="AddForm" class="modal-backdrop-custom">

            <div class="custom-modal">

                <h2 class="text-success mb-4">
                    <i class="bi bi-person-plus-fill"></i>
                    Thêm cầu thủ
                </h2>

                <input v-model="newPlayer.name" class="form-control mb-3" placeholder="Tên cầu thủ" />

                <input v-model="newPlayer.age" class="form-control mb-3" type="number" placeholder="Tuổi" />

                <input v-model="newPlayer.position" class="form-control mb-3" placeholder="Vị trí" />

                <input v-model="newPlayer.number" class="form-control mb-3" type="number" placeholder="Số áo" />

                <div class="text-end">

                    <button class="btn btn-secondary me-2" @click="AddForm = false">
                        Hủy
                    </button>

                    <button class="btn btn-success" @click="addPlayer">
                        Lưu cầu thủ
                    </button>

                </div>

            </div>

        </div>


        <!-- ================= FORM XÓA ================= -->

        <div v-if="DeleteFrom" class="modal-backdrop-custom">

            <div class="custom-modal">

                <h2 class="text-danger mb-4">
                    <i class="bi bi-person-dash-fill"></i>
                    Xóa cầu thủ
                </h2>

                <input v-model="inputNumber" class="form-control mb-4" type="number" placeholder="Nhập số áo" />

                <div class="text-end">

                    <button class="btn btn-secondary me-2" @click="DeleteFrom = false">
                        Hủy
                    </button>

                    <button class="btn btn-danger" @click="deletePlayer">
                        Xóa
                    </button>

                </div>

            </div>

        </div>


        <!-- ================= CARD ĐƯỢC CHỌN ================= -->

        <div v-if="selectedPlayer" class="player-focus" @click.self="closePlayer">

            <div class="player-card selected-card">
                <img class="player-image" :src="getImg(selectedPlayer)" alt="" aria-hidden="true" />
                <div class="card-overlay"></div>

                <button class="close-button" @click="closePlayer">
                    ×
                </button>

                <div class="player-number">
                    {{ selectedPlayer.number }}
                </div>

                <div class="player-icon">
                    <i class="bi bi-person-fill"></i>
                </div>

                <h2 class="player-name">
                    {{ selectedPlayer.name }}
                </h2>

                <p class="player-position">
                    {{ selectedPlayer.position }}
                </p>

                <div class="player-age">
                    {{ selectedPlayer.age }} tuổi
                </div>

            </div>

        </div>

    </div>
</template>

