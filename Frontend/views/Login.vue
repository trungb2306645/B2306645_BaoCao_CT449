<template>
    <div class="login-bg min-vh-100 d-flex justify-content-center align-items-center">

        <div>

            <!-- Tiêu đề -->
            <div class="text-center mb-0">
                <h1 class="fw-bold text-success mt-0">
                   ⚽ BÓNG ĐÁ XANH
                </h1>
                <!--chữ mờ-->
                <p class="text-muted mb-2">
                    Hệ thống quản lý câu lạc bộ bóng đá
                </p>
            </div>

            <!-- Form đăng nhập -->
            <LoginManagement />

        </div>

    </div>
    
</template>

<script setup>
import LoginManagement from '../src/components/LoginManagement.vue';
</script>