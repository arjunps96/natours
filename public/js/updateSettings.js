import axios from 'axios';
import { showAlert } from './alert';

exports.updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:8000/api/v1/users/updatePassword'
      : 'http://127.0.0.1:8000/api/v1/users/updateData';
  try {
    const updatedData = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (updatedData.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
