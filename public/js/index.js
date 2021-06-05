import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './MapBox';
import { updateSettings } from './updateSettings';
import { createBooking } from './checkout';
//DOM elements
const Mapel = document.getElementById('map');
const formel = document.querySelector('.form--login');
const logoutEL = document.querySelector('.nav__el--logout');
const updateDataEl = document.querySelector('.form-user-data');
const updatePassEl = document.querySelector('.form-user-settings');
const bookTourEl = document.getElementById('book-tour');

if (Mapel) {
  const locations = JSON.parse(Mapel.dataset.locations);
  displayMap(locations);
}
if (formel) {
  formel.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const Password = document.getElementById('password').value;
    login(email, Password);
  });
}
if (logoutEL) {
  logoutEL.addEventListener('click', logout);
}
if (updateDataEl) {
  updateDataEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateSettings(form, 'data');
  });
}
if (updatePassEl) {
  updatePassEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent =
      'Updating........';
    const PasswordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm')
      .value;
    await updateSettings(
      { PasswordCurrent, newPassword, newPasswordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
if (bookTourEl) {
  bookTourEl.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    createBooking(tourId);
  });
}
