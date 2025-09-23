

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import addmycoIcon from '../assets/addmyco.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function CreateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    owner_name_english: '',
    owner_name_chinese: '',
    telegramId: '',
    email: '',
    contact: '',
    address1: '',
    address2: '',
    address3: '',
    WhatsApp: '',
    WeChat: '',
    Line: '',
    Instagram: '',
    Facebook: '',
    Twitter: '',
    Youtube: '',
    Linkedin: '',
    SnapChat: '',
    Skype: '',
    TikTok: '',
  });
  const [profile_image, setProfileImage] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setProfileImage(e.target.files[0]);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login again.');
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profile_image) formData.append('profile_image', profile_image);
      await axios.post(
        `${API_BASE_URL}/addprofile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setSuccess('Profile created successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/src/assets/background.jpg')] bg-cover bg-center flex flex-col items-center overflow-x-hidden w-full">
      <Header />
      <div className="flex flex-col items-center w-full flex-1 mt-4 px-2">
        <div className="bg-white bg-opacity-80 rounded-3xl p-4 pt-2 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          <h2 className="text-xl font-bold text-center mt-2 mb-2">Complete your Profile</h2>
          <form className="w-full flex flex-col items-center" onSubmit={handleSubmit} autoComplete="off">
      <div className="flex w-full gap-2 mb-2 flex-row justify-between">
        <input
          name="owner_name_english"
          placeholder="Owner Name in English"
          value={form.owner_name_english}
          onChange={handleChange}
          className="w-44 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          name="owner_name_chinese"
          placeholder="Owner Name in Chinese"
          value={form.owner_name_chinese}
          onChange={handleChange}
          className="w-44 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex flex-col items-center mb-2">
              <div className="relative w-[180px] h-[180px] flex items-center justify-center mb-1">
                <img
                  src={profile_image ? URL.createObjectURL(profile_image) : addmycoIcon}
                  alt="Profile Preview"
                  className="w-[180px] h-[180px]"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Upload Profile Image"
                />
              </div>
              <span className="text-xs text-gray-600 text-center">Upload Profile Image<br />Size 180 x 180</span>
            </div>
            <div className="flex w-full gap-2 mb-2 flex-col sm:flex-row">
              <input name="WhatsApp" placeholder="https://WhatsApp" value={form.WhatsApp} onChange={handleChange} className="flex-1 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input name="contact" placeholder="Contact No." value={form.contact} onChange={handleChange} className="flex-1 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2 sm:mt-0" />
            </div>
            <input name="address1" placeholder="Enter Your Address line 1" value={form.address1} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="address2" placeholder="Enter Your Address line 2" value={form.address2} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="address3" placeholder="Enter Your Address line 3" value={form.address3} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="w-full bg-white text-center font-bold text-black py-2 my-2 border border-gray-200">Below are optional</div>
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="SnapChat" placeholder="https://SnapChat" value={form.SnapChat} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Instagram" placeholder="https://Instagram" value={form.Instagram} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Linkedin" placeholder="https://Linkedin" value={form.Linkedin} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Youtube" placeholder="https://Youtube" value={form.Youtube} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Skype" placeholder="https://Skype" value={form.Skype} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Facebook" placeholder="https://Facebook" value={form.Facebook} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="WeChat" placeholder="https://Wechat" value={form.WeChat} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Twitter" placeholder="https://Twitter" value={form.Twitter} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="Line" placeholder="https://Line" value={form.Line} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input name="TikTok" placeholder="https://Tiktok" value={form.TikTok} onChange={handleChange} className="w-full rounded-full px-3 py-2 border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {error && <div className="text-red-500 mt-2 text-center w-full">{error}</div>}
            {success && <div className="text-green-600 mt-2 text-center w-full">{success}</div>}
            <button type="submit" className="mt-4 w-full bg-pink-600 text-white py-2 rounded-full font-bold text-lg disabled:opacity-50" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
