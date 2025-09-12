import logo from '../assets/logo.png';
import chamberIcon from '../assets/chamber.svg';
import whatsappIcon from '../assets/message.png';
import telegramIcon from '../assets/dynamic-name-card-logo.png';
import phoneIcon from '../assets/company.svg';
import groupIcon from '../assets/profileIcon.png';
import { ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProfilePage() {
    return (
        <div className='bg-[url(/src/assets/background.jpg)] bg-cover bg-center min-h-screen w-full overflow-x-hidden'>
            <Header />
            <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
                <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
                    <button className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                        Something
                    </button>
                    <button className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-8 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                        something
                    </button>
                    <div className="flex flex-col items-center mb-6">
                        <div className="rounded-full border-8 border-blue-300 bg-white p-2 mb-2" style={{ width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={logo} alt="Logo" className="w-28 h-28 object-contain" />
                        </div>
                        <div className="w-full rounded-full bg-[#007cb6] text-white text-lg font-bold py-2 mb-2 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                            Hariom Jha
                        </div>
                        <div className="w-full rounded-full bg-[#007cb6] text-white text-lg font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                            哈里奥姆·賈
                        </div>
                    </div>
                    <div className="w-full rounded-2xl bg-white bg-opacity-80 p-4 mb-6 shadow">
                        <div className="text-blue-700 font-bold mb-2">Address</div>
                        <div className="text-gray-700">123 Main Street, City, Country</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ArrowLeft className="w-8 h-8" aria-label="Left" />
                        <img src={chamberIcon} alt="Chamber" className="w-12 h-12 rounded-full bg-blue-400 p-2" />
                        <img src={whatsappIcon} alt="WhatsApp" className="w-12 h-12 rounded-full bg-blue-400 p-2" />
                        <img src={telegramIcon} alt="Telegram" className="w-12 h-12 rounded-full bg-blue-400 p-2" />
                        <img src={phoneIcon} alt="Phone" className="w-12 h-12 rounded-full bg-blue-400 p-2" />
                        <img src={groupIcon} alt="Group" className="w-12 h-12 rounded-full bg-blue-400 p-2" />
                        <ArrowRight className="w-8 h-8" aria-label="Right" />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}