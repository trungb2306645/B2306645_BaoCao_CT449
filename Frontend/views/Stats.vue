<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const top = ref([]);
const load = async () => {
    try {
        const r = await axios.get('http://localhost:3000/api/players/stats/top-scorers?limit=10');
        top.value = r.data.data;
    } catch (e) {
        console.error(e);
    }
};

onMounted(load);
</script>

<template>
    <div class="teams-page">
        <nav class="teams-navbar">
            <div class="teams-shell teams-nav-inner">
                <router-link class="teams-brand" to="/home"><span>⚽</span> FOOTBALL CLUB</router-link>
                <router-link class="teams-home-link" to="/home">⌂ Trang chủ</router-link>
            </div>
        </nav>
        <header class="teams-hero">
            <div class="teams-shell teams-hero-inner">
                <div>
                    <span class="home-kicker">⚡ PLAYER STATISTICS</span>
                    <h1>THỐNG KÊ <span>CẦU THỦ</span></h1>
                    <p>Cầu thủ ghi được bạn thắng KDA trong suốt sự nghiệp.</p>
                </div>
                <div class="teams-trophy" aria-hidden="true">📊</div>
            </div>
        </header>
        <div class="container py-4">
            <div class="content-inner">
                <h3 class="text-white">Top ghi bàn</h3>
                <div class="row g-3 mt-3">
                    <div v-for="p in top" :key="p.number" class="col-12 col-sm-6 col-md-4">
                        <div class="card p-3 mb-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-0 text-white">{{ p.name }}</h5>
                                    <div class="small text-white-50">Số: {{ p.number }}</div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold fs-4 text-warning">{{ p.stats?.goals || 0 }}</div>
                                    <div class="small text-white-50">Ghi bàn</div>
                                </div>
                            </div>
                            <div class="mt-2 small text-white-50">Assist: {{ p.stats?.assists || 0 }} • Trận: {{
                                p.stats?.matchesPlayed || 0 }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  </div>
   
</template>
