import Layout from "../components/Layout";
import profileIcon from '../assets/profileIcon.png';
import groupIcon from '../assets/profileIcon.png';
import chamberIcon from '../assets/chamber.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faPhone, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function SubCompanyPage() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
                <section className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
                    <div className="flex items-center justify-center gap-4 mb-6">
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
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center p-2 overflow-hidden">
                            <img src={chamberIcon} alt="chamber icon" className="w-8 h-8 object-contain" />
                        </div>
                    </div>
                    <div className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                        Something
                    </div>
                    <div className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                        something
                    </div>
                    <div className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-2 mb-4 flex items-center justify-center" style={{ borderRadius: '2rem' }}>
                        CEO
                    </div>
                    <div className="flex flex-col items-center mb-6">
                        <div className="rounded-full bg-white mb-4" >
                            <img src={profileIcon} alt="Logo" className="w-36 h-36 object-contain" />
                        </div>
                        <div className="w-80 h-48 bg-white rounded-md border-2 border-[#007cb6] p-2">
                            something
                        </div>
                    </div>
                    <div className="flex justify-between w-full gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                            <FontAwesomeIcon icon={faTelegram} size="2x" color="white" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                            <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
                        </div>
                    </div>
                    <div className="flex justify-center w-full gap-4 text-center mt-6">
                        <div className="p-2 w-full text-white bg-[#d50078] shadow-md">Update</div>
                        <div className="p-2 w-full text-white bg-[#009944] shadow-md">Add More</div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}