<script setup>
import '../css/components/team-board.css';
import { computed, onMounted, ref } from 'vue';
import api from '../services/api';

const teams = ref([]);
const players = ref([]);
const selectedTeam = ref(null);
const newTeamName = ref('');
const addPlayerNumber = ref('');
const editingTeamName = ref('');
const editingPlayer = ref(null);
const playerForm = ref({ name: '', age: '', position: '' });
const loading = ref(false);

const teamPlayers = computed(() => {
  if (!selectedTeam.value) return [];
  return selectedTeam.value.players
    .map((number) => players.value.find((player) => Number(player.number) === Number(number)))
    .filter(Boolean);
});

const availablePlayers = computed(() => {
  const memberNumbers = new Set((selectedTeam.value?.players || []).map(Number));
  return players.value.filter((player) => !memberNumbers.has(Number(player.number)));
});

const responseData = (response) => response.data?.data || response.data;

const load = async () => {
  loading.value = true;
  try {
    const [teamResponse, playerResponse] = await Promise.all([
      api.get('/api/teams'),
      api.get('/api/players'),
    ]);
    teams.value = responseData(teamResponse) || [];
    players.value = responseData(playerResponse) || [];

    if (selectedTeam.value) {
      selectedTeam.value = teams.value.find((team) => team.teamId === selectedTeam.value.teamId) || null;
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể tải dữ liệu đội bóng');
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const selectTeam = (team) => {
  selectedTeam.value = team;
  editingTeamName.value = team.name;
  addPlayerNumber.value = '';
};

const createTeam = async () => {
  const name = newTeamName.value.trim();
  if (!name) return alert('Nhập tên đội');

  try {
    const response = await api.post('/api/teams/add', { name });
    teams.value.push(responseData(response));
    newTeamName.value = '';
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể tạo đội');
  }
};

const renameTeam = async () => {
  const name = editingTeamName.value.trim();
  if (!selectedTeam.value || !name) return alert('Nhập tên đội mới');

  try {
    const response = await api.put(`/api/teams/${selectedTeam.value.teamId}`, { name });
    const updatedTeam = responseData(response);
    const index = teams.value.findIndex((team) => team.teamId === updatedTeam.teamId);
    if (index !== -1) teams.value[index] = updatedTeam;
    selectedTeam.value = updatedTeam;
    alert('Đã cập nhật tên đội');
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể cập nhật tên đội');
  }
};

const deleteTeam = async () => {
  if (!selectedTeam.value) return;
  if (!confirm(`Bạn có chắc muốn xóa đội "${selectedTeam.value.name}" không?`)) return;

  try {
    await api.delete(`/api/teams/${selectedTeam.value.teamId}`);
    teams.value = teams.value.filter((team) => team.teamId !== selectedTeam.value.teamId);
    selectedTeam.value = null;
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể xóa đội');
  }
};

const addPlayerToTeam = async () => {
  if (!selectedTeam.value) return alert('Chọn đội');
  if (!addPlayerNumber.value) return alert('Chọn cầu thủ');

  try {
    const response = await api.put(`/api/teams/${selectedTeam.value.teamId}/add-player`, {
      playerNumber: Number(addPlayerNumber.value),
    });
    const updatedTeam = responseData(response);
    const index = teams.value.findIndex((team) => team.teamId === updatedTeam.teamId);
    if (index !== -1) teams.value[index] = updatedTeam;
    selectedTeam.value = updatedTeam;
    addPlayerNumber.value = '';
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể thêm cầu thủ vào đội');
  }
};

const removePlayerFromTeam = async (player) => {
  if (!selectedTeam.value) return;
  if (!confirm(`Gỡ ${player.name} khỏi đội ${selectedTeam.value.name}?`)) return;

  try {
    const response = await api.put(`/api/teams/${selectedTeam.value.teamId}/remove-player`, {
      playerNumber: Number(player.number),
    });
    const updatedTeam = responseData(response);
    const index = teams.value.findIndex((team) => team.teamId === updatedTeam.teamId);
    if (index !== -1) teams.value[index] = updatedTeam;
    selectedTeam.value = updatedTeam;
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể gỡ cầu thủ khỏi đội');
  }
};

const startEditPlayer = (player) => {
  editingPlayer.value = player.number;
  playerForm.value = {
    name: player.name,
    age: player.age,
    position: player.position,
  };
};

const cancelEditPlayer = () => {
  editingPlayer.value = null;
};

const savePlayer = async () => {
  const { name, age, position } = playerForm.value;
  if (!name || !age || !position) return alert('Nhập đầy đủ thông tin cầu thủ');

  try {
    const response = await api.put(`/api/players/${editingPlayer.value}`, {
      name,
      age: Number(age),
      position,
      number: Number(editingPlayer.value),
    });
    const updatedPlayer = responseData(response);
    const index = players.value.findIndex((player) => player.number === updatedPlayer.number);
    if (index !== -1) players.value[index] = updatedPlayer;
    cancelEditPlayer();
  } catch (error) {
    alert(error.response?.data?.message || 'Không thể cập nhật cầu thủ');
  }
};
</script>

<template>
  <section class="team-board">
    <div class="d-flex justify-content-between align-items-center mb-3 team-board-header">
      <div>
        <h3 class="text-white mb-1">Quản lý đội</h3>
        <p class="text-white-50 mb-0">Tạo, sửa đội và quản lý danh sách thành viên.</p>
      </div>
      <div class="team-create-form">
        <input v-model="newTeamName" class="form-control team-name-input" placeholder="Tên đội mới" @keyup.enter="createTeam" />
        <button class="btn btn-primary" type="button" @click="createTeam">Tạo đội</button>
      </div>
    </div>

    <div v-if="loading" class="team-empty-state">Đang tải dữ liệu...</div>

    <div v-else class="row g-4">
      <div class="col-lg-5">
        <h5 class="text-white">Danh sách đội</h5>
        <ul v-if="teams.length" class="list-group team-list" role="list">
          <li v-for="team in teams" :key="team.teamId"
            :class="['list-group-item', 'team-list-item', selectedTeam?.teamId === team.teamId ? 'team-selected' : '']"
            role="listitem" tabindex="0" @click="selectTeam(team)" @keyup.enter="selectTeam(team)">
            <div>
              <strong class="text-white">{{ team.name }}</strong>
              <div class="small text-white-50">{{ team.players.length }} thành viên · ID {{ team.teamId }}</div>
            </div>
            <button class="btn btn-sm btn-outline-light" type="button" @click.stop="selectTeam(team)">Chi tiết</button>
          </li>
        </ul>
        <div v-else class="team-empty-state">Chưa có đội bóng nào.</div>
      </div>

      <div class="col-lg-7">
        <div v-if="selectedTeam" class="team-details">
          <div class="team-details-heading">
            <div>
              <span class="team-label">ĐỘI ĐANG CHỌN</span>
              <h4 class="text-white mb-0">{{ selectedTeam.name }}</h4>
            </div>
            <button class="btn btn-outline-danger btn-sm" type="button" @click="deleteTeam">Xóa đội</button>
          </div>

          <div class="team-edit-form">
            <input v-model="editingTeamName" class="form-control" aria-label="Tên đội" />
            <button class="btn btn-warning" type="button" @click="renameTeam">Lưu tên đội</button>
          </div>

          <div class="member-toolbar">
            <select v-model="addPlayerNumber" class="form-select" aria-label="Chọn cầu thủ để thêm">
              <option value="">-- Chọn cầu thủ để thêm --</option>
              <option v-for="player in availablePlayers" :key="player.number" :value="player.number">
                {{ player.name }} · Số {{ player.number }}
              </option>
            </select>
            <button class="btn btn-success" type="button" @click="addPlayerToTeam">Thêm thành viên</button>
          </div>

          <div class="member-list">
            <div v-if="!teamPlayers.length" class="team-empty-state">Đội chưa có thành viên.</div>
            <article v-for="player in teamPlayers" :key="player.number" class="member-row">
              <div>
                <strong>{{ player.name }}</strong>
                <div class="small text-white-50">Số {{ player.number }} · {{ player.position }} · {{ player.age }} tuổi</div>
              </div>
              <div class="member-actions">
                <button class="btn btn-sm btn-outline-warning" type="button" @click="startEditPlayer(player)">Sửa</button>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="removePlayerFromTeam(player)">Gỡ</button>
              </div>
            </article>
          </div>
        </div>
        <div v-else class="team-details team-empty-state">Chọn một đội để xem và chỉnh sửa.</div>
      </div>
    </div>

    <div v-if="editingPlayer !== null" class="team-modal-backdrop" @click.self="cancelEditPlayer">
      <form class="team-modal" @submit.prevent="savePlayer">
        <h4 class="text-success mb-3">Chỉnh sửa cầu thủ</h4>
        <label class="form-label">Tên cầu thủ</label>
        <input v-model="playerForm.name" class="form-control mb-3" required />
        <label class="form-label">Tuổi</label>
        <input v-model="playerForm.age" class="form-control mb-3" type="number" min="1" required />
        <label class="form-label">Vị trí</label>
        <input v-model="playerForm.position" class="form-control mb-4" required />
        <div class="text-end">
          <button class="btn btn-secondary me-2" type="button" @click="cancelEditPlayer">Hủy</button>
          <button class="btn btn-success" type="submit">Lưu thay đổi</button>
        </div>
      </form>
    </div>
  </section>
</template>
