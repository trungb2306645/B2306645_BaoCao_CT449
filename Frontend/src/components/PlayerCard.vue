<script setup>
import { computed } from 'vue';
import defaultAvatar from '../assets/player-default.svg';
import '../css/components/player-card.css';
const props = defineProps({ player: Object });

const imgSrc = computed(() => {
    // support `photo` or `avatar` url in player object, otherwise fallback
    return props.player?.photo || props.player?.avatar || defaultAvatar;
});

</script>

<template>
    <div class="player-card small p-3 border-0 rounded d-flex align-items-end">
        <img class="player-image" :src="imgSrc" alt="" aria-hidden="true" />
        <div class="card-overlay"></div>

        <div class="flex-fill text-white">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold player-name">{{ props.player.name }}</div>
                    <div class="text-white-50 small player-meta">Số: {{ props.player.number }} • {{
                        props.player.position }}</div>
                </div>
                <div class="text-end">
                    <span class="badge goal-badge">⚽ {{ props.player.stats?.goals || 0 }}</span>
                    <span class="badge assist-badge ms-1">🎯 {{ props.player.stats?.assists || 0 }}</span>
                </div>
            </div>
            <div class="small text-white-50 mt-2">Trận: {{ props.player.stats?.matchesPlayed || 0 }}</div>
        </div>
    </div>
</template>

