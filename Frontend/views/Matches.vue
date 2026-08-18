<script setup>
import MatchSimulator from "../src/components/MatchSimulator.vue";
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
                    <span class="home-kicker">⚡ LIVE MATCH CENTER</span>
                    <h1>MÔ PHỎNG <span>TRẬN ĐẤU</span></h1>
                    <p>Chọn đội, chọn sơ đồ, gán cầu thủ theo vị trí rồi lưu đội hình.</p>
                </div>
                <div class="teams-trophy" aria-hidden="true">⚔️</div>
            </div>
        </header>
        <div class="mt-2">
            <MatchSimulator />
        </div>
  </div>
    
</template>
