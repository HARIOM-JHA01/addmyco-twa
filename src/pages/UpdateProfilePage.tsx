
import Layout from '../components/Layout';
import { useState } from 'react';
// import pencilImage from '../assets/pencil.png';
import profileIcon from '../assets/profileIcon.png';
import WebApp from '@twa-dev/sdk';
export default function UpdateProfilePage() {
    const [isPremiumMember] = useState(false);
    return (
        <Layout>
            <div className="flex flex-col  justify-center flex-grow py-4 px-2 pb-32">
                {!isPremiumMember && (
                    <div className="bg-black text-white text-center border-2 border-gray-400">
                        <h2 className="text-lg font-bold mb-2">Upgrade to Premium Membership to avail exciting features <span className="text-[#00AEEF]">
                            Upgrade now
                        </span></h2>
                    </div>
                )}
                <section className="w-full max-w-md mx-auto mt-4">
                    {/* <div className="mb-4">
                        <label className="text-black font-bold text-sm mb-2 block">Profile URL:</label>
                        <div className="flex items-center gap-2">
                            <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300 flex-1">
                                <span className="text-black">https://addmy.co/<span className="text-blue-500">6500b34d</span></span>
                            </div>
                            <div className="bg-gray-700 rounded-lg p-2">
                                <img src={pencilImage} alt="Edit" className="w-6 h-6 filter" />
                            </div>
                        </div>
                    </div> */}
                    <div className="flex gap-2 mb-4">
                        <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF] flex-1">
                            <input
                                type="text"
                                className="w-full bg-transparent text-black outline-none"
                                defaultValue="Hariom Jha"
                            />
                        </div>
                        <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF] flex-1">
                            <input
                                type="text"
                                className="w-full bg-transparent text-black outline-none"
                                defaultValue="哈里奥姆·賈"
                            />
                        </div>
                    </div>
                </section>

                <section className="w-full max-w-md mx-auto mt-2">
                    <div className="flex flex-col items-center">
                        {/* Large circular profile picture placeholder */}
                        <div className="rounded-full flex items-center justify-center mb-6">
                            <img src={profileIcon} alt="Profile Icon" className="w-[180px] h-[180px]" />
                        </div>

                        {/* Browse and Cancel buttons */}
                        <div className="flex gap-4 mb-4">
                            <button
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                onClick={() => WebApp.showAlert('Browse functionality to be implemented')}
                            >
                                Browse
                            </button>
                            <button
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                onClick={() => WebApp.showAlert('Cancel functionality to be implemented')}
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Upload instruction text */}
                        <p className="text-black text-center text-sm">
                            Please upload 180 X 180 Image or upgrade to <br />
                            premium for upload <span className="text-[#00AEEF] font-medium">Video</span>
                        </p>
                    </div>
                </section>

                {/* Contact Information Section */}
                <section className="w-full max-w-md mx-auto mt-6 space-y-3">
                    {/* Username */}
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
                        <input
                            type="text"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                            placeholder="Telegram Username"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
                        <input
                            type="text"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                            placeholder="Phone Number"
                        />
                    </div>

                    {/* WhatsApp */}
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                            placeholder="WhatsApp"
                        />
                    </div>

                    {/* Address Fields */}
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                            placeholder="Address Line 1"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
                        <input
                            type="text"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                            placeholder="Address Line 2"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-[#00AEEF]">
                        <input
                            type="text"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-[#00AEEF]"
                            placeholder="Address Line 3"
                        />
                    </div>

                    {/* Optional Section Header */}
                    <div className="bg-gray-100 px-4 py-1 text-center">
                        <span className="text-black font-medium">Below are optional</span>
                    </div>

                    {/* Email */}
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="email"
                            className="w-full bg-transparent text-[#00AEEF] outline-none placeholder-blue-300"
                            placeholder="Email"
                        />
                    </div>

                    {/* Social Media Links */}
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="Wechat"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="Facebook"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="Instagram"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="Line"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="LinkedIn"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="SnapChat"
                        />
                    </div>

                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="Tiktok"
                        />
                    </div>
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="Youtube"
                        />
                    </div>
                    <div className="bg-white rounded-full px-4 py-1 border-2 border-blue-300">
                        <input
                            type="text"
                            className="w-full bg-transparent text-gray-500 outline-none placeholder-gray-400"
                            placeholder="X"
                        />
                    </div>
                </section>

                <div className='text-white mt-6 p-1 w-full bg-[#d50078] text-center'
                    onClick={() => WebApp.showAlert('Profile updated successfully!')}
                >
                    Update your Profile
                </div>
            </div>
        </Layout>
    );
}