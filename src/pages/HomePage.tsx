
import logo from '../assets/logo.png';
import Layout from '../components/Layout';
import groupIcon from '../assets/chamber.svg';
import company from '../assets/company.svg'
import qrCode from '../assets/scannerIcon.png';
import leftArrow from '../assets/left-arrow.png';
import rightArrow from '../assets/right-arrow.png';
import shareIcon from '../assets/shareIcon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
    return (
        <Layout>
            <div className=''>
                <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
                    <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
                        <button className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                            Something
                        </button>
                        <button className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-8 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                            something
                        </button>
                        <div className="flex flex-col items-center mb-6">
                            <div className="rounded-full bg-white mb-2" >
                                <img src={logo} alt="Logo" className="w-36 h-36 object-contain" />
                            </div>
                            <div className="w-full rounded-full bg-[#007cb6] text-white text-lg font-bold py-2 mb-2 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                                Hariom Jha
                            </div>
                            <div className="w-full rounded-full bg-[#007cb6] text-white text-lg font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                                哈里奥姆·賈
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-6">
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

                        <div className="flex justify-center">
                            <img src={qrCode} alt="QR Code" className="w-40 h-40 object-contain" />
                        </div>

                        <div
                            className="flex justify-center mt-4 space-x-4">
                            <img src={shareIcon} alt="Share" className="w-12 h-12 rounded-full bg-blue-400" />
                            <img src={qrCode} alt="QR Code" className="w-12 h-12 object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}