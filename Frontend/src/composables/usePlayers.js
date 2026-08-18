import { ref } from 'vue';
import api from '../services/api';
import defaultAvatar from '../assets/player-default.svg';

const players = ref([]);
const selectedPlayer = ref(null);
const showPlayers = ref(false);
const AddForm = ref(false);
const DeleteFrom = ref(false);
const EditForm = ref(false);

const newPlayer = ref({ name: '', age: '', position: '', number: '' });
const editPlayer = ref(null);
const playerPhotoFile = ref(null);
const playerPhotoPreview = ref('');
const editPhotoFile = ref(null);
const editPhotoPreview = ref('');
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

const resetNewPlayerForm = () => {
  newPlayer.value = { name: '', age: '', position: '', number: '' };
  playerPhotoFile.value = null;
  playerPhotoPreview.value = '';
};

const uploadPlayerPhoto = async (playerNumber, file) => {
  if (!playerNumber || !file) return null;

  const formData = new FormData();
  formData.append('photo', file);

  const res = await api.post(`/api/players/${playerNumber}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return res.data?.data || res.data || null;
};

const showPlayerError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
  console.error('Player action failed:', error);
  alert(message);
  return false;
};

const handlePlayerPhotoChange = (event) => {
  const file = event?.target?.files?.[0];

  playerPhotoFile.value = file || null;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      playerPhotoPreview.value = e.target?.result || '';
    };
    reader.readAsDataURL(file);
    return;
  }

  playerPhotoPreview.value = '';
};

const handleEditPhotoChange = (event) => {
  const file = event?.target?.files?.[0];

  editPhotoFile.value = file || null;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      editPhotoPreview.value = e.target?.result || '';
    };
    reader.readAsDataURL(file);
    return;
  }

  editPhotoPreview.value = '';
};

const openEditPlayer = (player) => {
  if (!player) return;

  editPlayer.value = {
    ...player,
    originalNumber: Number(player.number),
    age: Number(player.age),
    number: Number(player.number)
  };
  editPhotoFile.value = null;
  editPhotoPreview.value = player?.photo || '';
  EditForm.value = true;
};

const closeEditPlayer = () => {
  EditForm.value = false;
  editPlayer.value = null;
  editPhotoFile.value = null;
  editPhotoPreview.value = '';
};

const addPlayer = async () => {
  try {
    const payload = {
      ...newPlayer.value,
      age: Number(newPlayer.value.age),
      number: Number(newPlayer.value.number)
    };

    if (!payload.name || !payload.position || Number.isNaN(payload.age) || Number.isNaN(payload.number)) {
      alert('Vui lòng nhập đầy đủ thông tin cầu thủ');
      return false;
    }

    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('age', String(payload.age));
    formData.append('position', payload.position);
    formData.append('number', String(payload.number));

    if (playerPhotoFile.value) {
      formData.append('photo', playerPhotoFile.value);
    }

    const res = await api.post('/api/players', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const savedPlayer = res.data.data || res.data;
    players.value.push(savedPlayer);
    resetNewPlayerForm();
    AddForm.value = false;
    return true;
  } catch (e) {
    return showPlayerError(e);
  }
};

const saveEditPlayer = async () => {
  try {
    if (!editPlayer.value) return false;

    const payload = {
      ...editPlayer.value,
      age: Number(editPlayer.value.age),
      number: Number(editPlayer.value.number)
    };

    const originalNumber = Number(payload.originalNumber ?? payload.number);

    if (!payload.name || !payload.position || Number.isNaN(payload.age) || Number.isNaN(payload.number)) {
      alert('Vui lòng nhập đầy đủ thông tin cầu thủ');
      return false;
    }

    const res = await api.put(`/api/players/${originalNumber}`, {
      name: payload.name,
      age: payload.age,
      position: payload.position,
      number: payload.number
    });

    const updatedPlayer = res.data.data || res.data;

    if (editPhotoFile.value && updatedPlayer?.number) {
      const uploadedPhoto = await uploadPlayerPhoto(Number(updatedPlayer.number), editPhotoFile.value);
      if (uploadedPhoto?.photo) {
        updatedPlayer.photo = uploadedPhoto.photo;
      }
    }

    players.value = players.value.map(player => {
      if (Number(player.number) === originalNumber) {
        return updatedPlayer;
      }
      return player;
    });

    if (selectedPlayer.value && Number(selectedPlayer.value.number) === originalNumber) {
      selectedPlayer.value = updatedPlayer;
    }

    closeEditPlayer();
    return true;
  } catch (e) {
    return showPlayerError(e);
  }
};

const deletePlayer = async () => {
  try {
    const res = await api.delete(`/api/players/${inputNumber.value}`);
    players.value = players.value.filter(p => p.number !== Number(inputNumber.value));
    inputNumber.value = '';
    DeleteFrom.value = false;
    return true;
  } catch (e) {
    return showPlayerError(e);
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
    EditForm,
    newPlayer,
    editPlayer,
    playerPhotoFile,
    playerPhotoPreview,
    editPhotoFile,
    editPhotoPreview,
    inputNumber,
    getPlayers,
    selectPlayer,
    closePlayer,
    addPlayer,
    saveEditPlayer,
    deletePlayer,
    getImg,
    handlePlayerPhotoChange,
    handleEditPhotoChange,
    openEditPlayer,
    closeEditPlayer,
    resetNewPlayerForm
  };
}
