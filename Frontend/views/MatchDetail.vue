<script setup>
import { ref, onMounted } from 'vue';
import api from '../src/services/api';
import { GOAL_WAV_DATA_URL } from '../src/assets/goalPlaceholder.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const matchId = Number(route.params.matchId);

const match = ref(null);
const simulation = ref(null);
const displayEvents = ref([]);
const currentMinute = ref(0);
const homeScore = ref(0);
const awayScore = ref(0);
const intervalId = ref(null);

const load = async () => {
    try {
        const m = await api.get(`/api/matches/${matchId}`);
        match.value = m.data.data;
    } catch (e) {
        console.error(e);
    }

    try {
        const s = await api.get(`/api/simulations/${matchId}`);
        simulation.value = s.data.data;
        // sort
        simulation.value.events.sort((a, b) => a.minute - b.minute);
    } catch (e) {
        console.warn('No simulation for this match');
    }
};

onMounted(load);

const playGoalSound = async () => {
    const audioUrl = '/assets/goal.wav';
    try {
        const a = new Audio(audioUrl);
        await a.play();
        return;
    } catch (err) {
        try {
            // use embedded placeholder
            const p = new Audio(GOAL_WAV_DATA_URL);
            await p.play();
            return;
        } catch (err2) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const now = ctx.currentTime;
                const g = ctx.createGain();
                g.connect(ctx.destination);
                const o1 = ctx.createOscillator();
                o1.type = 'sine'; o1.frequency.setValueAtTime(660, now); o1.connect(g);
                const o2 = ctx.createOscillator();
                o2.type = 'sine'; o2.frequency.setValueAtTime(880, now); o2.connect(g);
                g.gain.setValueAtTime(0.001, now);
                g.gain.linearRampToValueAtTime(0.6, now + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                o1.start(now); o2.start(now); o1.stop(now + 0.42); o2.stop(now + 0.42);
            } catch (e) { }
        }
    }
};

const startReplay = () => {
    if (!simulation.value) return;
    displayEvents.value = [];
    currentMinute.value = 0;
    homeScore.value = 0;
    awayScore.value = 0;
    if (intervalId.value) clearInterval(intervalId.value);
    intervalId.value = setInterval(() => {
        currentMinute.value++;
        const evs = simulation.value.events.filter(e => e.minute === currentMinute.value);
        for (const e of evs) {
            displayEvents.value.unshift(e);
            if (e.type === 'goal') {
                if (e.team === 'home') homeScore.value++;
                else awayScore.value++;
                // animate and play sound
                playGoalSound();
                // simple visual cue: set a temporary CSS class on body (or element)
                try { document.body.classList.add('goal-flash'); setTimeout(() => document.body.classList.remove('goal-flash'), 700); } catch (e) { }
            }
        }
        if (currentMinute.value >= 90) {
            clearInterval(intervalId.value);
            intervalId.value = null;
        }
    }, 500);
};

</script>

<template>
    <div class="container py-4">
        <div class="content-inner">
            <h3>Replay Trận {{ match ? match.matchId : matchId }}</h3>

            <div v-if="match" class="mb-3">
                <div><strong>{{ match.homeTeamId }} vs {{ match.awayTeamId }}</strong></div>
                <div class="small text-muted">Ngày: {{ new Date(match.date).toLocaleString() }}</div>
                <div class="mt-2">Kết quả lưu: {{ match.score }}</div>
            </div>

            <div v-if="simulation">
                <div class="mb-2">
                    <button class="btn btn-primary me-2" @click="startReplay">Play Replay</button>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card p-3">
                            <h6 class="text-white">Event log</h6>
                            <ul class="event-log">
                                <li v-for="(e, i) in displayEvents" :key="i" class="event-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Phút {{ e.minute }}</strong>
                                            <div class="small text-white-50">{{ e.team }} • Số áo {{ e.playerNumber }} •
                                                {{
                                                    e.type }}</div>
                                        </div>
                                        <div>
                                            <span v-if="e.type === 'goal'" class="badge badge-goal">Goal</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card p-3">
                            <h6>Summary</h6>
                            <div>Current score: {{ homeScore }} - {{ awayScore }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="alert alert-secondary">Không có replay cho trận này.</div>
        </div>
    </div>
</template>
