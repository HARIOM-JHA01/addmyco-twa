import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    WebApp.ready();
    const login = async () => {
      try {
        const user = WebApp.initDataUnsafe.user;
        if (!user || !user.username) {
          console.warn('No Telegram username available on WebApp.initDataUnsafe.user');
          return;
        }
        if (window.location.protocol === 'https:' && API_BASE_URL && API_BASE_URL.startsWith('http:')) {
          console.error('Blocked insecure API call: page is HTTPS but API_BASE_URL uses HTTP. Update VITE_API_BASE_URL to https.');
          WebApp.showAlert('Configuration error: insecure API endpoint blocked. Please use an HTTPS API URL.');
          return;
        }
        let country = '';
        try {
          if (navigator.onLine) {
            const countryResponse = await axios.get('https://ipapi.co/json/');
            country = countryResponse?.data?.country_name || '';
          } else {
            console.warn('Offline: skipping ipapi call');
          }
        } catch (ipErr) {
          console.warn('Failed to fetch country from ipapi:', ipErr);
        }
        if (!API_BASE_URL) {
          console.error('VITE_API_BASE_URL is not defined. Set it in .env and rebuild.');
          WebApp.showAlert('Configuration error: API_BASE_URL not set.');
          return;
        }
        const response = await axios.post(`${API_BASE_URL}/telegram-login`, {
          telegram_username: user.username,
          country: country || 'India'
        });
        const { data } = response;
        if (data && data.success) {
          localStorage.setItem('token', data.data.token);
          if (data.message && data.message.includes('Welcome')) {
            try {
              WebApp.showPopup({ title: 'Congratulations!', message: data.message, buttons: [{ type: 'ok' }] });
            } catch (popupErr) {
              const err: any = popupErr;
              if (err && err.message && err.message.includes('Popup is already opened')) {
                console.info('Popup was already opened, skipping second popup.');
              } else {
                console.warn('Failed to show popup:', err);
              }
            }
            navigate('/create-profile');
          }
        } else {
          console.warn('Login response unsuccessful:', data);
        }
      } catch (error) {
        const err: any = error;
        console.error('Login failed:', err?.message || err);
        if (err && err.message && err.message.includes('Network Error')) {
          WebApp.showAlert('Network error: check your API server and CORS configuration.');
        } else if (err && err.response && err.response.status === 0) {
          WebApp.showAlert('Request blocked (mixed-content or CORS). See console for details.');
        } else {
          try {
            WebApp.showAlert('Login failed. Please try again.');
          } catch (_) {}
        }
      }
    };
    login();
  }, [navigate]);
  return null;
}
