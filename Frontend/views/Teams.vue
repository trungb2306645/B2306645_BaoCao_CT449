<script setup>
import TeamBoard from '../src/components/TeamBoard.vue';
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
                    <span class="home-kicker">⚡ CLUB MANAGEMENT CENTER</span>
                    <h1>QUẢN LÝ <span>ĐỘI BÓNG</span></h1>
                    <p>Tạo đội, xây dựng đội hình và điều hành thành viên với giao diện trực quan.</p>
                </div>
                <div class="teams-trophy" aria-hidden="true">🏆</div>
            </div>
        </header>
        <main class="teams-shell teams-content">
            <div class="teams-section-title">
                <div><span class="home-kicker">TEAM HUB</span>
                    <h2>Đội bóng của bạn</h2>
                </div><span class="teams-live"><i></i> Sẵn sàng quản lý</span>
            </div>
            <TeamBoard />
        </main>
        <footer class="teams-footer">
            <div class="teams-shell">⚽ Football Club Management System</div>
        </footer>
    </div>
</template>
