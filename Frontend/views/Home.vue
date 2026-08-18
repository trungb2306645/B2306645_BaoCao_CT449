<script setup>
const features = [
    { icon: '👤', title: 'Quản lý cầu thủ', text: 'Thêm, chỉnh sửa và theo dõi hồ sơ cầu thủ.', to: '/players', action: 'Mở quản lý' },
    { icon: '🎽', title: 'Quản lý đội bóng', text: 'Tổ chức đội hình và thành viên dễ dàng.', to: '/teams', action: 'Quản lý đội' },
    { icon: '⚔️', title: 'Quản lý trận đấu', text: 'Mô phỏng, theo dõi lịch và kết quả trận đấu.', to: '/matches', action: 'Mở trận đấu' },
    { icon: '📊', title: 'Thống kê cầu thủ', text: 'Xem thành tích và bảng xếp hạng ghi bàn.', to: '/stats', action: 'Xem thống kê' },
];
</script>

<template>
    <div class="home-page">
        <nav class="home-navbar">
            <div class="home-shell home-nav-inner">
                <router-link class="home-brand" to="/home"><span>⚽</span> FOOTBALL CLUB</router-link>
                <router-link class="home-logout" to="/">Đăng xuất</router-link>
            </div>
        </nav>
        <main class="home-shell home-main">
            <section class="home-hero">
                <div class="home-hero-copy">
                    <span class="home-kicker">⚡ QUẢN LÝ ĐỘI BÓNG THÔNG MINH</span>
                    <h1>Chào mừng <span>trở lại!</span></h1>
                    <p>Điều hành đội bóng, cầu thủ và các trận đấu trong một không gian trực quan, nhanh chóng.</p>
                    <div class="home-hero-actions">
                        <router-link class="home-primary-btn" to="/players">Bắt đầu quản lý <span>→</span></router-link>
                        <router-link class="home-secondary-btn" to="/matches">Xem trận đấu</router-link>
                    </div>
                </div>
                <div class="home-ball" aria-hidden="true">⚽</div>
            </section>
            <section class="home-section-heading">
                <div><span class="home-kicker">KHU VỰC ĐIỀU HÀNH</span>
                    <h2>Mọi thứ bạn cần cho đội bóng</h2>
                </div>
                <span class="home-live"><i></i> Hệ thống đang hoạt động</span>
            </section>
            <section class="home-feature-grid">
                <article v-for="(feature, index) in features" :key="feature.to" class="home-feature-card"
                    :class="'home-feature-' + (index + 1)">
                    <div class="home-feature-icon">{{ feature.icon }}</div>
                    <span class="home-feature-number">0{{ index + 1 }}</span>
                    <h3>{{ feature.title }}</h3>
                    <p>{{ feature.text }}</p>
                    <router-link :to="feature.to">{{ feature.action }} <span>↗</span></router-link>
                </article>
            </section>
        </main>
    </div>
</template>
