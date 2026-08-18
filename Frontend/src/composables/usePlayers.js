import { ref } from 'vue';
import api from '../services/api';
import defaultAvatar from '../assets/player-default.svg';

const players = ref([]);
const selectedPlayer = ref(null);
const showPlayers = ref(false);
const AddForm = ref(false);
const DeleteFrom = ref(false);

const newPlayer = ref({ name: '', age: '', position: '', number: '' });
const inputNumber = ref('');

const getPlayers = async () => {
  try {
    const res = await api.get('/api/players');
    players.value = res.data.data || res.data || [];
    showPlayers.value = true;
  } catch (e) {
    console.warn('getPlayers failed', e);
    players.value = [];
  }
};

const selectPlayer = (player) => { selectedPlayer.value = player; };
const closePlayer = () => { selectedPlayer.value = null; };

const addPlayer = async () => {
  try {
    const res = await api.post('/api/players', newPlayer.value);
    players.value.push(res.data.data || res.data);
    newPlayer.value = { name: '', age: '', position: '', number: '' };
    AddForm.value = false;
  } catch (e) {
    throw e;
  }
};

const deletePlayer = async () => {
  try {
    const res = await api.delete(`/api/players/${inputNumber.value}`);
    players.value = players.value.filter(p => p.number !== Number(inputNumber.value));
    inputNumber.value = '';
    DeleteFrom.value = false;
  } catch (e) {
    throw e;
  }
};

const getImg = (player) => {
  return player?.photo || player?.avatar || defaultAvatar;
};

export default function usePlayers() {
  return {
    players,
    selectedPlayer,
    showPlayers,
    AddForm,
    DeleteFrom,
    newPlayer,
    inputNumber,
    getPlayers,
    selectPlayer,
    closePlayer,
    addPlayer,
    deletePlayer,
    getImg
  };
}
