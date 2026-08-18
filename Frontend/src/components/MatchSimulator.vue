<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { GOAL_WAV_DATA_URL } from '../assets/goalPlaceholder';
import api from '../services/api';

const teams = ref([]);
const players = ref([]);
const home = ref('');
const away = ref('');
const homeFormation = ref('4-4-2');
const awayFormation = ref('4-4-2');
const homeLineup = ref([]);
const awayLineup = ref([]);
const result = ref(null);
const displayEvents = ref([]);
const currentMinute = ref(0);
const playing = ref(false);
const loading = ref(false);
const intervalId = ref(null);
const speed = ref(600);
const homeScore = ref(0);
const awayScore = ref(0);
const goalFlash = ref(false);
const lastGoalTeam = ref(null);
const ballAnimate = ref(false);
const draggedPlayerNumber = ref(null);

const formationOptions = ['4-4-2', '4-3-3', '4-2-3-1'];
const formationSlotLabels = {
    GK: 'Thủ môn',
    LB: 'Hậu vệ trái',
    CB: 'Trung vệ',
    RB: 'Hậu vệ phải',
    LM: 'Tiền vệ cánh trái',
    CM: 'Tiền vệ trung tâm',
    RM: 'Tiền vệ cánh phải',
    ST: 'Tiền đạo',
    LW: 'Tiền đạo cánh trái',
    RW: 'Tiền đạo cánh phải',
    CDM: 'Tiền vệ phòng ngự',
    CAM: 'Tiền vệ tấn công'
};

const formationSlots = {
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'CAM', 'LW', 'RW', 'ST']
};

const homeName = computed(() => teams.value.find((team) => Number(team.teamId) === Number(home.value))?.name || 'Đội nhà');
const awayName = computed(() => teams.value.find((team) => Number(team.teamId) === Number(away.value))?.name || 'Đội khách');

const getFormationSlots = (formation) =>
    (formationSlots[formation] || formationSlots['4-4-2']).map((slotCode) => ({
        slot: slotCode,
        label: formationSlotLabels[slotCode] || slotCode
    }));

const getPlayerKey = (player) => String(player?._id || `${player?.name || 'player'}-${player?.number || 'unknown'}`);

const createEmptyLineup = (formation) =>
    getFormationSlots(formation).map((slot) => ({
        slot: slot.slot,
        label: slot.label,
        playerId: '',
        playerNumber: '',
        playerName: '',
        playerPhoto: ''
    }));

const getTeamPlayers = (teamId) => {
    const team = teams.value.find((item) => Number(item.teamId) === Number(teamId));
    const teamNumbers = (team?.players || []).map((number) => Number(number));

    return players.value
        .filter((player) => teamNumbers.includes(Number(player.number)))
        .sort((a, b) => Number(a.number) - Number(b.number));
};

const getPlayerByNumber = (teamId, playerNumber) => {
    return getTeamPlayers(teamId).find((player) => Number(player.number) === Number(playerNumber));
};

const getPlayerByKey = (teamId, playerKey) => {
    return getTeamPlayers(teamId).find((player) => getPlayerKey(player) === String(playerKey));
};

const syncLineup = (side) => {
    const selectedTeamId = side === 'home' ? home.value : away.value;
    const selectedFormation = side === 'home' ? homeFormation.value : awayFormation.value;
    const currentLineup = side === 'home' ? homeLineup.value : awayLineup.value;
    const teamPlayers = getTeamPlayers(selectedTeamId);
    const nextLineup = createEmptyLineup(selectedFormation);

    if (!selectedTeamId) {
        if (side === 'home') homeLineup.value = nextLineup;
        else awayLineup.value = nextLineup;
        return;
    }

    for (const currentSlot of currentLineup || []) {
        if (!currentSlot) continue;
        const matchingPlayer = currentSlot.playerId
            ? getPlayerByKey(selectedTeamId, currentSlot.playerId)
            : teamPlayers.find((player) => Number(player.number) === Number(currentSlot.playerNumber));

        if (!matchingPlayer) continue;

        const targetIndex = nextLineup.findIndex((slot) => slot.slot === currentSlot.slot);
        if (targetIndex === -1) continue;

        nextLineup[targetIndex] = {
            ...nextLineup[targetIndex],
            playerId: getPlayerKey(matchingPlayer),
            playerNumber: Number(matchingPlayer.number),
            playerName: matchingPlayer.name || '',
            playerPhoto: matchingPlayer.photo || ''
        };
    }

    if (side === 'home') homeLineup.value = nextLineup;
    else awayLineup.value = nextLineup;
};

const normalizeLineup = (lineup) => {
    return (lineup || [])
        .filter((slot) => slot && slot.playerNumber !== '' && slot.playerNumber !== undefined && slot.playerNumber !== null)
        .map((slot) => ({
            slot: slot.slot,
            playerNumber: Number(slot.playerNumber)
        }));
};

const setPlayerToSlot = (side, slotIndex, player) => {
    const lineupRef = side === 'home' ? homeLineup : awayLineup;
    const playerKey = getPlayerKey(player);
    const playerNumber = Number(player.number);
    const playerName = player.name || '';
    const playerPhoto = player.photo || '';

    const current = lineupRef.value.map((slot) => {
        if (slot.playerId === playerKey) {
            return {
                ...slot,
                playerId: '',
                playerNumber: '',
                playerName: '',
                playerPhoto: ''
            };
        }
        return slot;
    });

    current[slotIndex] = {
        ...current[slotIndex],
        playerId: playerKey,
        playerNumber,
        playerName,
        playerPhoto
    };

    lineupRef.value = current;
    draggedPlayerNumber.value = null;
};

const clearSlot = (side, slotIndex) => {
    const lineupRef = side === 'home' ? homeLineup : awayLineup;
    const next = [...lineupRef.value];
    next[slotIndex] = { ...next[slotIndex], playerId: '', playerNumber: '', playerName: '', playerPhoto: '' };
    lineupRef.value = next;
};

const handleDragStart = (event, player) => {
    draggedPlayerNumber.value = Number(player.number);
    event.dataTransfer?.setData('text/player-key', getPlayerKey(player));
    event.dataTransfer?.setData('text/player-number', String(player.number));
    event.dataTransfer.effectAllowed = 'move';
};

const handleSlotDragStart = (event, side, slotIndex, playerId, playerNumber) => {
    if (!playerId || !playerNumber) return;
    draggedPlayerNumber.value = Number(playerNumber);
    event.dataTransfer?.setData('text/player-key', String(playerId));
    event.dataTransfer?.setData('text/player-number', String(playerNumber));
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/slot-side', side);
    event.dataTransfer.setData('text/slot-index', String(slotIndex));
};

const handleSlotDrop = (event, side, slotIndex) => {
    event.preventDefault();
    const playerKey = event.dataTransfer.getData('text/player-key');
    const playerNumber = Number(event.dataTransfer.getData('text/player-number'));
    if (!playerKey || !playerNumber) return;

    const selectedTeamId = side === 'home' ? home.value : away.value;
    const player = getPlayerByKey(selectedTeamId, playerKey) || getPlayerByNumber(selectedTeamId, playerNumber);
    if (!player) return;

    setPlayerToSlot(side, slotIndex, player);
};

const stopTimer = () => {
    if (intervalId.value) clearInterval(intervalId.value);
    intervalId.value = null;
    playing.value = false;
};

const loadTeams = async () => {
    try {
        const response = await api.get('/api/teams');
        teams.value = response.data.data || [];
    } catch (error) {
        alert(error.response?.data?.message || 'Không thể tải danh sách đội');
    }
};

const loadPlayers = async () => {
    try {
        const response = await api.get('/api/players');
        players.value = response.data.data || [];
    } catch (error) {
        alert(error.response?.data?.message || 'Không thể tải danh sách cầu thủ');
    }
};

onMounted(async () => {
    await loadTeams();
    await loadPlayers();
    syncLineup('home');
    syncLineup('away');
});

const playGoalSound = async () => {
    try { await new Audio('/assets/goal.wav').play(); }
    catch { try { await new Audio(GOAL_WAV_DATA_URL).play(); } catch { /* âm thanh bị trình duyệt chặn */ } }
};

const finishPlayback = () => {
    stopTimer();
    if (!result.value?.simulation) return;
    const simulation = result.value.simulation;
    displayEvents.value = [...(simulation.events || [])].reverse();
    homeScore.value = simulation.homeScore || 0;
    awayScore.value = simulation.awayScore || 0;
    currentMinute.value = 90;
};

const startPlayback = () => {
    if (!result.value?.simulation) return;
    stopTimer();
    playing.value = true;
    intervalId.value = setInterval(() => {
        currentMinute.value += 1;
        const events = (result.value.simulation.events || []).filter((event) => event.minute === currentMinute.value);
        events.forEach((event) => {
            displayEvents.value.unshift(event);
            if (event.type === 'goal') {
                if (event.team === 'home') homeScore.value += 1;
                else awayScore.value += 1;
                playGoalSound();
                goalFlash.value = true;
                lastGoalTeam.value = event.team;
                ballAnimate.value = true;
                setTimeout(() => { ballAnimate.value = false; }, 750);
                setTimeout(() => { goalFlash.value = false; }, 700);
            }
        });
        if (currentMinute.value >= 90) finishPlayback();
    }, speed.value);
};

const stopPlayback = () => stopTimer();
const togglePlay = () => {
    if (!result.value) return;
    if (playing.value) stopPlayback();
    else startPlayback();
};
const resetPlayback = () => {
    stopTimer();
    result.value = null;
    displayEvents.value = [];
    currentMinute.value = 0;
    homeScore.value = 0;
    awayScore.value = 0;
};
const setSpeed = (value) => {
    speed.value = Number(value);
    if (playing.value) startPlayback();
};

const simulate = async () => {
    if (!home.value || !away.value) return alert('Vui lòng chọn đủ hai đội');
    if (home.value === away.value) return alert('Hai đội phải khác nhau');
    if (!homeLineup.value.length || !awayLineup.value.length) return alert('Vui lòng gán đầy đủ cầu thủ cho hai đội hình');

    loading.value = true;
    stopTimer();
    try {
        const response = await api.post('/api/simulate', {
            homeTeamId: Number(home.value),
            awayTeamId: Number(away.value),
            homeFormation: homeFormation.value,
            awayFormation: awayFormation.value,
            homeLineup: normalizeLineup(homeLineup.value),
            awayLineup: normalizeLineup(awayLineup.value)
        });

        result.value = response.data.data;
        displayEvents.value = [];
        currentMinute.value = 0;
        homeScore.value = 0;
        awayScore.value = 0;
        startPlayback();
    } catch (error) {
        alert(error.response?.data?.message || 'Không thể mô phỏng trận đấu');
    } finally { loading.value = false; }
};

onBeforeUnmount(stopTimer);
</script>

<template>
        <div class="simulator-controls mt-3">
            <label>
                Đội nhà
                <select v-model="home" class="form-select" @change="syncLineup('home')">
                    <option class="text-dark" value="">-- Chọn đội --</option>
                    <option class="text-dark" v-for="team in teams" :key="team.teamId" :value="team.teamId">{{ team.name }}</option>
                </select>
            </label>

            <label>
                Đội khách
                <select v-model="away" class="form-select" @change="syncLineup('away')">
                    <option class="text-dark" value="">-- Chọn đội --</option>
                    <option class="text-dark" v-for="team in teams" :key="team.teamId" :value="team.teamId">{{ team.name }}</option>
                </select>
            </label>

            <div class="simulator-actions">
                <button class="btn btn-success" type="button" :disabled="loading" @click="simulate">
                    {{ loading ? 'Đang tạo...' : 'Bắt đầu & lưu đội hình' }}
                </button>
                <button class="btn btn-outline-light" type="button" :disabled="!playing"
                    @click="stopPlayback">Dừng</button>
            </div>
        </div>

        <div class="formation-block">
            <div class="formation-team">
                <div class="formation-header">
                    <h5>{{ homeName || 'Đội nhà' }}</h5>
                    <div class="formation-options">
                        <button v-for="option in formationOptions" :key="option" type="button" class="formation-btn"
                            :class="{ active: homeFormation === option }"
                            @click="homeFormation = option; syncLineup('home')">
                            {{ option }}
                        </button>
                    </div>
                </div>

                <div class="lineup-grid">
                    <div v-for="(slot, index) in homeLineup" :key="`${home}-${slot.slot}`" class="lineup-slot"
                        @dragover.prevent @drop="handleSlotDrop($event, 'home', index)">
                        <div class="lineup-slot-header">
                            <label>{{ slot.label || slot.slot }}</label>
                            <button v-if="slot.playerNumber" type="button" class="slot-clear-btn"
                                @click.stop="clearSlot('home', index)">×</button>
                        </div>

                        <div class="drop-zone" :class="{ filled: slot.playerNumber }"
                            :draggable="Boolean(slot.playerNumber)"
                            @dragstart="handleSlotDragStart($event, 'home', index, slot.playerId, slot.playerNumber)"
                            @dragend="draggedPlayerNumber = null"
                            @click="slot.playerNumber ? clearSlot('home', index) : null">
                            <template v-if="slot.playerNumber">
                                <img v-if="slot.playerPhoto || getPlayerByNumber(home, slot.playerNumber)?.photo"
                                    :src="slot.playerPhoto || getPlayerByNumber(home, slot.playerNumber)?.photo" alt=""
                                    class="slot-player-photo" />
                                <span class="slot-number">#{{ slot.playerNumber }}</span>
                                <span class="slot-name">{{ slot.playerName || getPlayerByNumber(home,
                                    slot.playerNumber)?.name || 'Cầu thủ' }}</span>
                            </template>
                            <template v-else>
                                <span class="slot-empty-text">Kéo cầu thủ vào đây</span>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="team-player-bank">
                    <div v-for="player in getTeamPlayers(home)" :key="player._id || player.number" class="player-chip"
                        :class="{ 'selected': homeLineup.some(slot => slot.playerId === getPlayerKey(player)) }"
                        draggable="true" @dragstart="handleDragStart($event, player)"
                        @dragend="draggedPlayerNumber = null">
                        <img v-if="player.photo" :src="player.photo" alt="" class="player-chip-photo" />
                        <span class="player-chip-number">#{{ player.number }}</span>
                        <span>{{ player.name }}</span>
                    </div>
                </div>
            </div>

            <div class="formation-team">
                <div class="formation-header">
                    <h5>{{ awayName || 'Đội khách' }}</h5>
                    <div class="formation-options">
                        <button v-for="option in formationOptions" :key="option" type="button" class="formation-btn"
                            :class="{ active: awayFormation === option }"
                            @click="awayFormation = option; syncLineup('away')">
                            {{ option }}
                        </button>
                    </div>
                </div>

                <div class="lineup-grid">
                    <div v-for="(slot, index) in awayLineup" :key="`${away}-${slot.slot}`" class="lineup-slot"
                        @dragover.prevent @drop="handleSlotDrop($event, 'away', index)">
                        <div class="lineup-slot-header">
                            <label>{{ slot.label || slot.slot }}</label>
                            <button v-if="slot.playerNumber" type="button" class="slot-clear-btn"
                                @click.stop="clearSlot('away', index)">×</button>
                        </div>

                        <div class="drop-zone" :class="{ filled: slot.playerNumber }"
                            :draggable="Boolean(slot.playerNumber)"
                            @dragstart="handleSlotDragStart($event, 'away', index, slot.playerId, slot.playerNumber)"
                            @dragend="draggedPlayerNumber = null"
                            @click="slot.playerNumber ? clearSlot('away', index) : null">
                            <template v-if="slot.playerNumber">
                                <img v-if="slot.playerPhoto || getPlayerByNumber(away, slot.playerNumber)?.photo"
                                    :src="slot.playerPhoto || getPlayerByNumber(away, slot.playerNumber)?.photo" alt=""
                                    class="slot-player-photo" />
                                <span class="slot-number">#{{ slot.playerNumber }}</span>
                                <span class="slot-name">{{ slot.playerName || getPlayerByNumber(away,
                                    slot.playerNumber)?.name || 'Cầu thủ' }}</span>
                            </template>
                            <template v-else>
                                <span class="slot-empty-text">Kéo cầu thủ vào đây</span>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="team-player-bank">
                    <div v-for="player in getTeamPlayers(away)" :key="player._id || player.number" class="player-chip"
                        :class="{ 'selected': awayLineup.some(slot => slot.playerId === getPlayerKey(player)) }"
                        draggable="true" @dragstart="handleDragStart($event, player)"
                        @dragend="draggedPlayerNumber = null">
                        <img v-if="player.photo" :src="player.photo" alt="" class="player-chip-photo" />
                        <span class="player-chip-number">#{{ player.number }}</span>
                        <span>{{ player.name }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="result" class="game-ui">
            <div :class="['scoreboard', goalFlash ? 'goal-flash' : '']">
                <div class="score-team"><span>ĐỘI NHÀ</span><strong>{{ homeName }}</strong></div>
                <div class="score-center">
                    <div class="score-numbers">{{ homeScore }} <b>:</b> {{ awayScore }}</div>
                    <div class="ball-area">
                        <span class="ball-icon"
                            :class="ballAnimate && lastGoalTeam === 'home' ? 'animate-to-right' : ''">⚽</span>
                        <span class="ball-icon"
                            :class="ballAnimate && lastGoalTeam === 'away' ? 'animate-to-left' : ''">⚽</span>
                    </div>
                    <small>PHÚT {{ currentMinute }} / 90</small>
                </div>
                <div class="score-team score-team-away"><span>ĐỘI KHÁCH</span><strong>{{ awayName }}</strong></div>
            </div>

            <div class="simulator-playback">
                <button class="btn btn-warning btn-sm" type="button" @click="togglePlay">
                    {{ playing ? 'Tạm dừng' : 'Phát tiếp' }}
                </button>
                <button class="btn btn-outline-light btn-sm" type="button" @click="finishPlayback">Tua đến hết</button>
                <button class="btn btn-outline-light btn-sm" type="button" @click="resetPlayback">Trận mới</button>
                <label>
                    Tốc độ
                    <select class="form-select form-select-sm" :value="speed" @change="setSpeed($event.target.value)">
                        <option value="800">Chậm</option>
                        <option value="600">Trung bình</option>
                        <option value="300">Nhanh</option>
                    </select>
                </label>
            </div>

            <div class="row g-3">
                <div class="col-md-7">
                    <div class="simulator-panel">
                        <h5>Diễn biến trận đấu</h5>
                        <ul class="event-log">
                            <li v-for="(event, index) in displayEvents" :key="index" class="event-item">
                                <strong>{{ event.minute }}'</strong>
                                <span>{{ event.team === 'home' ? homeName : awayName }} · Số áo {{ event.playerNumber
                                }}</span>
                                <b v-if="event.type === 'goal'">GOAL</b>
                            </li>
                            <li v-if="!displayEvents.length" class="empty-event">Chưa có sự kiện.</li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="simulator-panel">
                        <h5>Thông tin trận</h5>
                        <p class="match-result">{{ result.match.score }}</p>
                        <p>Trận đấu giữa <strong>{{ homeName }}</strong> và <strong>{{ awayName }}</strong>.</p>
                        <p class="text-white-50">Đội hình đã lưu theo sơ đồ đã chọn.</p>
                        <div class="small text-white-50">
                            <div>{{ homeName }}: {{ homeFormation }}</div>
                            <div>{{ awayName }}: {{ awayFormation }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  
</template>
