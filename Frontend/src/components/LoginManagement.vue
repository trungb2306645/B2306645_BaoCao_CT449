<script setup>
import '../css/components/login-management.css';
import api from '../services/api';
import { ref } from 'vue';

import { useRouter } from "vue-router";
const router = useRouter();

const Account = ref({
    name: "",
    pass: ""
});

const loginplayer = async () => {
    if (!Account.value.name || !Account.value.pass) {
        alert("Vui lòng nhập đầy đủ tên tài khoản và mật khẩu");
        return;
    }

    try {
        const response = await api.post('/api/login', Account.value);

        alert(response.data.message);
        router.push("/home");

    } catch (error) {
        alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
};
</script>

<template>

    <!-- Toàn bộ màn hình -->
    <div class="bg-success-subtle d-flex justify-content-center ">

        <!-- Khung đăng nhập /đổ bóng/viền/kịch thước -->
        <div class="card shadow-lg border-1 login-card">

            <!-- Phần tiêu đề /căn chỉnh card, phông xanh, chữ trắng, chữ ở giữa,lớp đệm trục y -->
            <div class="card-header bg-success text-white text-center py-2">

                <h2 class="fw-bold mb-1 mt-2">
                    FOOTBALL CLUB ⚽
                </h2>

                <p class="mb-0">
                    Quản lý đội bóng
                </p>

            </div>

            <!-- Nội dung form -->
            <div class="card-body p-4">

                <h4 class="text-center mb-4">
                    Đăng nhập
                </h4>

                <!-- Tài khoản -->
                <div class="mb-3">

                    <label class="text-start form-label fw-semibold">
                        Tên tài khoản
                    </label>

                    <input class="form-control" type="text" v-model="Account.name" placeholder="Nhập tên tài khoản">

                </div>

                <!-- Mật khẩu -->
                <div class="mb-4">

                    <label class="form-label fw-semibold">
                        Mật khẩu
                    </label>

                    <input class="form-control" type="password" v-model="Account.pass" placeholder="Nhập mật khẩu">

                </div>

                <!-- Nút đăng nhập -->
                <button class="btn btn-success w-100 fw-bold py-2" @click="loginplayer">
                    ⚽ Đăng nhập
                </button>
              
            </div>
           <!-- Footer -->
            <div class=" mt-2 card-footer text-center text-muted">
                Football Club Management
            </div>
          

        </div>

    </div>

</template>
