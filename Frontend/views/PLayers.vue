<script setup>
import PlayerManagement from '../src/components/PLayerManagement.vue';
</script>

<template>
    <div class="players-page">
        <nav class="players-navbar">
            <div class="players-shell players-nav-inner">
                <router-link class="players-brand" to="/home"><span>⚽</span> FOOTBALL CLUB</router-link>
                <router-link class="players-home-link" to="/home">⌂ Trang chủ</router-link>
            </div>
        </nav>
        <header class="players-hero">
            <div class="players-shell players-hero-inner">
                <div>
                    <span class="home-kicker">⚡ PLAYER PERFORMANCE CENTER</span>
                    <h1>QUẢN LÝ <span>CẦU THỦ</span></h1>
                    <p>Quản lý hồ sơ, số áo và đội hình của bạn trong một không gian chuyên nghiệp.</p>
                </div>
                <div class="players-hero-ball" aria-hidden="true">⚽</div>
            </div>
        </header>
        <main class="players-shell players-content">
            <div class="players-section-title">
                <div><span class="home-kicker">ĐỘI HÌNH</span>
                    <h2>Danh sách cầu thủ</h2>
                </div><span class="players-live"><i></i> Đang hoạt động</span>
            </div>
            <PlayerManagement />
        </main>
        <footer class="players-footer">
            <div class="players-shell">⚽ Football Club Management System</div>
        </footer>
    </div>
</template>
