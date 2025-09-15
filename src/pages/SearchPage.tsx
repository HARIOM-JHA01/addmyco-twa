import Layout from "../components/Layout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function SearchPage() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-start min-h-screen py-4 px-2 bg-blue-200 bg-opacity-20">
                {/* Search box container */}
                <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-4 w-full max-w-md mx-auto shadow-lg">
                    <div className="relative">
                        <input
                            type="text"
                            className="border border-gray-300 rounded-lg p-2 pr-10 w-full bg-white placeholder-gray-500"
                            placeholder="Search by Name and Company name"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Filter buttons with styled scrollbar */}
                    <div className="mt-4 overflow-x-auto scrollbar-custom">
                        <div className="flex gap-4 min-w-max px-2 mb-4">
                            <button className="px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff] flex-shrink-0">All</button>
                            <button className="px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff] flex-shrink-0">Business</button>
                            <button className="px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff] flex-shrink-0">Friends</button>
                            <button className="px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff] flex-shrink-0">Partner</button>
                        </div>
                    </div>

                    {/* No contacts message */}
                    <div className="mt-8 font-extrabold text-lg text-center text-black">
                        No contacts available
                    </div>
                </div>
            </div>
        </Layout>
    );
}
