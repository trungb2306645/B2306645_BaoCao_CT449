<script setup>
import { ref, onMounted } from 'vue';
import api from '../src/services/api';

const standings = ref([]);
const teams = ref([]);

const load = async () => {
    const r = await api.get('/api/standings');
    standings.value = r.data.data;
    const t = await api.get('/api/teams');
    teams.value = t.data.data;
};

onMounted(load);

const teamName = (id) => {
    const item = teams.value.find((x) => Number(x.teamId) === Number(id));
    return item ? item.name : `Team ${id}`;
};
</script>

<template>
    <div class="container py-4">
        <div class="content-inner">
            <h3 class="text-white">Bảng xếp hạng</h3>
            <div class="table-responsive mt-3">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Vị trí</th>
                            <th>Đội</th>
                            <th>Trận</th>
                            <th>Thắng</th>
                            <th>Hòa</th>
                            <th>Thua</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th>Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(s, idx) in standings" :key="s.teamId">
                            <td>{{ idx + 1 }}</td>
                            <td>{{ teamName(s.teamId) }}</td>
                            <td>{{ s.played }}</td>
                            <td>{{ s.win }}</td>
                            <td>{{ s.draw }}</td>
                            <td>{{ s.loss }}</td>
                            <td>{{ s.gf }}</td>
                            <td>{{ s.ga }}</td>
                            <td>{{ s.gd }}</td>
                            <td>{{ s.points }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
