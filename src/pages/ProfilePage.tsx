import logo from '../assets/logo.png';
import groupIcon from '../assets/profileIcon.png';
import company from '../assets/company.svg'
import leftArrow from '../assets/left-arrow.png';
import rightArrow from '../assets/right-arrow.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
                <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
                    <button className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-1 mb-2 flex items-center justify-center">
                        Something
                    </button>
                    <button className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-1 mb-2 flex items-center justify-center">
                        something
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="rounded-full mb-2">
                            <img src={logo} alt="Logo" className="w-[180px] h-[180px] object-contain" />
                        </div>
                        <div className="w-full rounded-full bg-[#007cb6] text-white text-lg font-bold py-2 mb-2 flex items-center justify-center">
                            Hariom Jha
                        </div>
                        <div className="w-full rounded-full bg-[#007cb6] text-white text-lg font-bold py-2 mb-4 flex items-center justify-center">
                            哈里奥姆·賈
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img src={leftArrow} alt="Left" className="w-4 h-8" />
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center p-2 overflow-hidden">
                            <img src={company} alt="Company" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                            <FontAwesomeIcon icon={faWhatsapp} size="2x" color="white" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                            <FontAwesomeIcon icon={faTelegram} size="2x" color="white" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                            <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                            <img src={groupIcon} alt="Group" className="w-8 h-8 object-contain" />
                        </div>
                        {/* <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                                    <FontAwesomeIcon icon={faEnvelope} size="2x" color="white" />
                                </div> */}
                        <img src={rightArrow} alt="Right" className="w-4 h-8" />
                    </div>
                    <div className="w-full rounded-md border-2 border-[#007cb6] bg-white p-4 mb-4 shadow">
                        <div className="text-[#007cb6]">123 Main Street, City, Country</div>
                        <div className="text-[#007cb6]">123 Main Street, City, Country</div>
                        <div className="text-[#007cb6]">123 Main Street, City, Country</div>
                    </div>

                    <div className='text-white mb-2 p-2 w-full bg-[#d50078] text-center'
                        onClick={() => navigate('/update-profile')}
                    >
                        Update your Profile
                    </div>
                </div>
            </div>
        </Layout>
    );
}