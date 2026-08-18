<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { GOAL_WAV_DATA_URL } from '../assets/goalPlaceholder';
import api from '../services/api';

const teams = ref([]);
const home = ref('');
const away = ref('');
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

const homeName = computed(() => teams.value.find((team) => Number(team.teamId) === Number(home.value))?.name || 'Đội nhà');
const awayName = computed(() => teams.value.find((team) => Number(team.teamId) === Number(away.value))?.name || 'Đội khách');

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
onMounted(loadTeams);

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
    loading.value = true;
    stopTimer();
    try {
        const response = await api.post('/api/simulate', { homeTeamId: Number(home.value), awayTeamId: Number(away.value) });
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
    <section class="match-simulator">
        <div class="simulator-heading">
            <div><span class="home-kicker">⚡ LIVE MATCH CENTER</span>
                <h2>Mô phỏng trận đấu</h2>
                <p>Chọn hai đội để bắt đầu trận đấu trực tiếp.</p>
            </div>
            <span class="simulator-status"><i></i>{{ playing ? 'Đang phát' : 'Sẵn sàng' }}</span>
        </div>
        <div class="simulator-controls">
            <label>Đội nhà<select v-model="home" class="form-select">
                    <option value="">-- Chọn đội --</option>
                    <option v-for="team in teams" :key="team.teamId" :value="team.teamId">{{ team.name }}</option>
                </select></label>
            <label>Đội khách<select v-model="away" class="form-select">
                    <option value="">-- Chọn đội --</option>
                    <option v-for="team in teams" :key="team.teamId" :value="team.teamId">{{ team.name }}</option>
                </select></label>
            <div class="simulator-actions"><button class="btn btn-success" type="button" :disabled="loading"
                    @click="simulate">{{ loading ? 'Đang tạo...' : 'Bắt đầu' }}</button><button
                    class="btn btn-outline-light" type="button" :disabled="!playing" @click="stopPlayback">Dừng</button>
            </div>
        </div>
        <div v-if="result" class="game-ui">
            <div :class="['scoreboard', goalFlash ? 'goal-flash' : '']">
                <div class="score-team"><span>ĐỘI NHÀ</span><strong>{{ homeName }}</strong></div>
                <div class="score-center">
                    <div class="score-numbers">{{ homeScore }} <b>:</b> {{ awayScore }}</div>
                    <div class="ball-area"><span class="ball-icon"
                            :class="ballAnimate && lastGoalTeam === 'home' ? 'animate-to-right' : ''">⚽</span><span
                            class="ball-icon"
                            :class="ballAnimate && lastGoalTeam === 'away' ? 'animate-to-left' : ''">⚽</span></div>
                    <small>PHÚT {{ currentMinute }} / 90</small>
                </div>
                <div class="score-team score-team-away"><span>ĐỘI KHÁCH</span><strong>{{ awayName }}</strong></div>
            </div>
            <div class="simulator-playback"><button class="btn btn-warning btn-sm" type="button" @click="togglePlay">{{
                playing ? 'Tạm dừng' : 'Phát tiếp' }}</button><button class="btn btn-outline-light btn-sm"
                    type="button" @click="finishPlayback">Tua đến hết</button><button
                    class="btn btn-outline-light btn-sm" type="button" @click="resetPlayback">Trận
                    mới</button><label>Tốc độ<select class="form-select form-select-sm" :value="speed"
                        @change="setSpeed($event.target.value)">
                        <option value="800">Chậm</option>
                        <option value="600">Trung bình</option>
                        <option value="300">Nhanh</option>
                    </select></label></div>
            <div class="row g-3">
                <div class="col-md-7">
                    <div class="simulator-panel">
                        <h5>Diễn biến trận đấu</h5>
                        <ul 
                        class="event-log">
                            <li v-for="(event, index) in displayEvents" :key="index" class="event-item"><strong>{{
                                    event.minute }}'</strong><span>{{ event.team === 'home' ? homeName : awayName }} ·
                                    Số áo {{ event.playerNumber }}</span><b v-if="event.type === 'goal'">GOAL</b></li>
                            <li v-if="!displayEvents.length" class="empty-event">Chưa có sự kiện.</li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="simulator-panel">
                        <h5>Thông tin trận</h5>
                        <p class="match-result">{{ result.match.score }}</p>
                        <p>Trận đấu giữa <strong>{{ homeName }}</strong> và <strong>{{ awayName }}</strong>.</p>
                        <p class="text-white-50">Kết quả cuối cùng được lưu tự động sau khi tạo mô phỏng.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
