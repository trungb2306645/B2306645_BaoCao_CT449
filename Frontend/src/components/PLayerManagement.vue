<script setup>
import '../css/components/player-management.css';
import '../css/components/player-card.css';
import usePlayers from '../composables/usePlayers';

const {
    players,
    selectedPlayer,
    deleteTarget,
    showPlayers,
    AddForm,
    DeleteFrom,
    EditForm,
    newPlayer,
    editPlayer,
    playerPhotoFile,
    playerPhotoPreview,
    editPhotoPreview,
    inputNumber,
    searchTerm,
    getPlayers,
    searchPlayers,
    selectPlayer,
    closePlayer,
    addPlayer,
    saveEditPlayer,
    deletePlayer,
    getImg,
    handlePlayerPhotoChange,
    handleEditPhotoChange,
    openEditPlayer,
    closeEditPlayer,
    resetNewPlayerForm
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

            <button class="btn btn-danger m-2" @click="deleteTarget = null; DeleteFrom = true">
                <i class="bi bi-person-dash-fill"></i>
                Xóa cầu thủ
            </button>

        </div>


        <!-- ================= DANH SÁCH ================= -->

        <div v-if="showPlayers">

            <h2 class="text-center text-warning f mb-4">
                Danh sách cầu thủ
            </h2>

            <div class="mb-4 d-flex flex-column flex-md-row justify-content-center align-items-center gap-2">
                <input
                    v-model="searchTerm"
                    type="text"
                    class="form-control border border-secondary text-dark"
                    style="max-width: 420px;"
                    placeholder="Tìm theo tên hoặc số áo"
                    @keyup.enter="searchPlayers"
                />
                <button class="btn btn-primary" @click="searchPlayers">
                    <i class="bi bi-search"></i>
                    Tìm kiếm
                </button>
                <button class="btn btn-outline-secondary" @click="searchTerm = ''; getPlayers()">
                    Xem tất cả
                </button>
            </div>

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
                        <div class="player-info">
                            <h4 class="player-name name-animate">
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

        </div>


        <!-- ================= FORM THÊM ================= -->

        <div v-if="AddForm" class="modal-backdrop-custom">

            <div class="custom-modal">

                <h2 class="text-success mb-4">
                    <i class="bi bi-person-plus-fill"></i>
                    Thêm cầu thủ
                </h2>

                <input v-model="newPlayer.name" class="border boder-secondary text-dark form-control mb-3"
                    placeholder="Tên cầu thủ" />

                <input v-model="newPlayer.age" class="border boder-secondary text-dark form-control mb-3" type="number"
                    placeholder="Tuổi" />

                <input v-model="newPlayer.position" class="border boder-secondary text-dark form-control mb-3"
                    placeholder="Vị trí" />

                <input v-model="newPlayer.number" class="border boder-secondary text-dark form-control mb-3"
                    type="number" placeholder="Số áo" />

                <div class="mb-3">
                    <label class=" text-dark form-label fw-semibold">Ảnh cầu thủ</label>
                    <input type="file" accept="image/*" class="border boder-secondary text-dark form-control"
                        @change="handlePlayerPhotoChange" />
                    <div v-if="playerPhotoPreview" class="mt-3 text-center">
                        <img :src="playerPhotoPreview" alt="preview ảnh cầu thủ" class="img-fluid rounded"
                            style="max-height: 140px; object-fit: cover;" />
                    </div>
                </div>

                <div class="text-end">

                    <button class="btn btn-secondary me-2" @click="AddForm = false; resetNewPlayerForm()">
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

                <div class="mb-3">
                    <div class="fw-semibold text-dark mb-2">Chọn cầu thủ cần xóa:</div>
                    <div class="row g-2">
                        <div v-for="player in players" :key="player._id" class="col-12 col-sm-6">
                            <div class="border rounded p-2 text-dark bg-light cursor-pointer"
                                :class="{ 'border-danger bg-danger-subtle': deleteTarget && String(deleteTarget._id) === String(player._id) }"
                                @click="deleteTarget = player" style="cursor: pointer;">
                                <div class="fw-bold">{{ player.name }}</div>
                                <div class="small">Số áo: {{ player.number }} · {{ player.position }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="deleteTarget" class="border border-danger rounded p-3 mb-4 bg-light text-dark">
                    <div class="fw-bold mb-1">Đã chọn để xóa:</div>
                    <div>{{ deleteTarget.name }} - Số áo {{ deleteTarget.number }}</div>
                    <div class="text-muted small">{{ deleteTarget.position }}</div>
                </div>

                <div class="text-end">

                    <button class="btn btn-secondary me-2" @click="deleteTarget = null; DeleteFrom = false">
                        Hủy
                    </button>

                    <button class="btn btn-danger" :disabled="!deleteTarget" @click="deletePlayer">
                        Xóa cầu thủ đã chọn
                    </button>

                </div>

            </div>

        </div>


        <!-- ================= CARD ĐƯỢC CHỌN ================= -->

        <div v-if="selectedPlayer" class="player-focus" @click.self="closePlayer">
            <!-- selected-card tao hieu ung animation -->
            <div class="player-card selected-card is-active" :class="{ 'is-active': selectedPlayer }">
                <img class="player-image" :src="getImg(selectedPlayer)" alt="" aria-hidden="true" />
                <div class="card-overlay"></div>

                <div class="player-number">
                    {{ selectedPlayer.number }}
                </div>

                <div class="player-icon">
                    <i class="bi bi-person-fill"></i>
                </div>

                <div>
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

                <div class="player-actions text-start mt-3 position-absolute bottom-0 start-0 p-2 ">
                    <button class="btn border border-warning me-2 text-warning"
                        @click.stop="openEditPlayer(selectedPlayer)">
                        Sửa
                    </button>
                    <button class="btn border-secondary text-secondary" @click="closePlayer">
                        Đóng
                    </button>
                </div>

            </div>

        </div>
        <!-- FROM SỬA -->
        <div v-if="EditForm && editPlayer" class="modal-backdrop-custom">
            <div class="custom-modal">
                <h2 class="text-warning mb-4">
                    <i class="bi bi-pencil-square"></i>
                    Chỉnh sửa cầu thủ
                </h2>

                <input v-model="editPlayer.name" class="border boder-secondary text-dark form-control mb-3"
                    placeholder="Tên cầu thủ" />
                <input v-model="editPlayer.age" class="border boder-secondary text-dark  form-control mb-3"
                    type="number" placeholder="Tuổi" />
                <input v-model="editPlayer.position" class="border boder-secondary text-dark form-control mb-3"
                    placeholder="Vị trí" />
                <input v-model="editPlayer.number" class="border boder-secondary text-dark form-control mb-3"
                    type="number" placeholder="Số áo" />

                <div class="mb-3">
                    <label class=" text-dark form-label fw-semibold">Ảnh mới</label>
                    <input type="file" accept="image/*" class="border boder-secondary text-dark  form-control"
                        @change="handleEditPhotoChange" />
                    <div v-if="editPhotoPreview" class="mt-3 text-center">
                        <img :src="editPhotoPreview" alt="preview ảnh cầu thủ" class="img-fluid rounded"
                            style="max-height: 140px; object-fit: cover;" />
                    </div>
                </div>

                <div class="text-end">
                    <button class="btn btn-secondary me-2" @click="closeEditPlayer">
                        Hủy
                    </button>
                    <button class="btn btn-warning" @click="saveEditPlayer">
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>
