import profileIcon from '../assets/profileIcon.png';
import subCompanyIcon from '../assets/subCompany.png'
import chamberIcon from '../assets/chamberPage.png';
import TGDIcon from '../assets/tgdlogo.png'
import heartIcon from '../assets/heart.png'
import qrIcone from '../assets/scanner-sidebar.png'
import settingIcon from '../assets/settingIcon.png'
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const router = useNavigate();
    return (
        <div className="fixed bottom-0 left-0 w-full flex justify-center z-50">
            <div className="flex items-center justify-between bg-[#007cb6] w-full max-w-3xl shadow-lg px-2 py-2">
                <div className='flex gap-2'>
                    <img src={profileIcon} alt="Profile" className="w-10 h-10 rounded-full"
                        onClick={() => router('/profile')}
                    />
                    <img src={subCompanyIcon} alt="SubCompany" className="w-10 h-10 rounded-full"
                        onClick={() => router('/sub-company')}
                    />
                    <img src={chamberIcon} alt="Chamber" className="w-10 h-10 rounded-full"
                        onClick={() => router('/chamber')}
                    />
                </div>
                <img src={TGDIcon} alt="TGD" className="w-16 h-16 rounded-full bg-white  border-[#007cb6] z-10" />
                <div className='flex gap-2'>
                    <img src={heartIcon} alt="Heart" className="w-10 h-10 rounded-full" onClick={() => router('/search')} />
                    <img src={qrIcone} alt="QR" className="w-10 h-10 rounded-full" onClick={() => router('/my-qr')} />
                    <img src={settingIcon} alt="Setting" className="w-10 h-10 rounded-full" />
                </div>
            </div>
        </div>
    );
}