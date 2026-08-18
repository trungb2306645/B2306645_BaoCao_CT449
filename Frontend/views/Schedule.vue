<script setup>
import '../src/css/components/schedule.css';
import { ref, onMounted } from 'vue';
import api from '../src/services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const matches = ref([]);

const load = async () => {
    const r = await api.get('/api/matches');
    // sort by date
    matches.value = r.data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
};

onMounted(load);

const simulateMatch = async (m) => {
    // simulate now and redirect to match detail
    try {
        const r = await api.post('/api/simulate', { homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId });
        const newMatchId = r.data.data.match.matchId;
        router.push(`/match/${newMatchId}`);
    } catch (e) {
        alert(e.response?.data?.message || e.message);
    }
};
</script>

<template>
    <div class="container py-4">
        <div class="content-inner">
            <h3 class="text-white">Lịch thi đấu</h3>
            <div class="list-group mt-3">
                <div v-for="m in matches" :key="m.matchId"
                    class="list-group-item d-flex justify-content-between align-items-center schedule-item">
                    <div>
                        <div><strong class="text-white">Match {{ m.matchId }}</strong> • <span class="text-white-50">{{
                            new
                                Date(m.date).toLocaleString() }}</span></div>
                        <div class="small text-white-50">{{ m.homeTeamId }} vs {{ m.awayTeamId }} — KQ: {{ m.score }}
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary me-2"
                            @click="() => router.push(`/match/${m.matchId}`)">Xem</button>
                        <button class="btn btn-sm btn-success" @click="() => simulateMatch(m)">Mô phỏng</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
