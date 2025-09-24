import { useState, useEffect } from "react";
import { FaEllipsisV } from 'react-icons/fa';
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function SearchPage() {

    const [folderName, setFolderName] = useState('');
    const [folders, setFolders] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    const [editModal, setEditModal] = useState<{ open: boolean, folderId: string, folderName: string } | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    // Helper to refresh folders
    const refreshFolders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${API_BASE_URL}/getfolder`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setFolders(res.data.data || []);
        } catch {}
    };

    // Fetch folders on mount
    useEffect(() => { refreshFolders(); }, []);

    const openModal = () => {
        setFolderName('');
        setModalError('');
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setModalError('');
    };
    const handleAddFolder = async () => {
        setModalLoading(true);
        setModalError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found. Please login again.');
            await axios.post(`${API_BASE_URL}/addfolder`, { Folder: folderName }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await refreshFolders();
            setShowModal(false);
        } catch (err: any) {
            setModalError(err?.response?.data?.message || err.message || 'Failed to add folder');
        } finally {
            setModalLoading(false);
        }
    };

    // Edit modal handlers
    const openEditModal = (folder: any) => {
        setEditModal({ open: true, folderId: folder._id, folderName: folder.Folder });
        setEditError('');
    };
    const closeEditModal = () => {
        setEditModal(null);
        setEditError('');
    };
    const handleEditFolder = async () => {
        if (!editModal) return;
        setEditLoading(true);
        setEditError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found. Please login again.');
            await axios.post(`${API_BASE_URL}/editfolder/${editModal.folderId}`, { Folder: editModal.folderName }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await refreshFolders();
            closeEditModal();
        } catch (err: any) {
            setEditError(err?.response?.data?.message || err.message || 'Failed to update folder');
        } finally {
            setEditLoading(false);
        }
    };
    const handleDeleteFolder = async () => {
        if (!editModal) return;
        setEditLoading(true);
        setEditError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found. Please login again.');
            await axios.delete(`${API_BASE_URL}/deletefolder/${editModal.folderId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await refreshFolders();
            closeEditModal();
        } catch (err: any) {
            setEditError(err?.response?.data?.message || err.message || 'Failed to delete folder');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col items-center justify-start min-h-screen py-4 px-2 bg-blue-200 bg-opacity-20">
                {/* Modal for adding folder */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl p-6 w-80 max-w-full flex flex-col items-center shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Add New Folder</h3>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-full px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Folder Name"
                                value={folderName}
                                onChange={e => setFolderName(e.target.value)}
                                disabled={modalLoading}
                            />
                            {modalError && <div className="text-red-500 mb-2 text-center">{modalError}</div>}
                            <div className="flex gap-4 w-full">
                                <button
                                    className="flex-1 bg-gray-300 text-gray-700 rounded-full py-2 font-bold"
                                    onClick={closeModal}
                                    type="button"
                                    disabled={modalLoading}
                                >Cancel</button>
                                <button
                                    className="flex-1 bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-50"
                                    onClick={handleAddFolder}
                                    type="button"
                                    disabled={modalLoading || !folderName.trim()}
                                >{modalLoading ? 'Adding...' : 'Submit'}</button>
                            </div>
                        </div>
                    </div>
                )}
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

                    {/* Folder buttons with styled scrollbar */}
                    <div className="mt-4 overflow-x-auto scrollbar-custom">
                        <div className="flex gap-4 min-w-max px-2 mb-4">
                            {/* Default folders */}
                            {['All', 'Business', 'Friends', 'Partner'].map(name => (
                                <div key={name} className="flex items-center w-30">
                                    <button className="flex justify-between items-center w-full px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff]">
                                        <span className="text-left w-full truncate">{name}</span>
                                    </button>
                                </div>
                            ))}
                            {/* User-created folders (exclude default ones) */}
                            {folders.filter(f => !['All', 'Business', 'Friends', 'Partner'].includes(f.Folder)).map(folder => (
                                <div key={folder._id} className="flex items-center w-30">
                                    <button className="flex justify-between items-center w-full px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff]"
                                        type="button"
                                    >
                                        <span className="text-left w-full truncate">{folder.Folder}</span>
                                        <span onClick={e => { e.stopPropagation(); openEditModal(folder); }} className="ml-2 p-1 rounded-full hover:bg-gray-200 flex items-center">
                                            <FaEllipsisV size={16} />
                                        </span>
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center w-30">
                                <button
                                    className="flex justify-between items-center w-full px-4 py-1 rounded-sm bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff]"
                                    onClick={openModal}
                                >
                                    <span className="text-left w-full truncate">+ add more folders</span>
                                </button>
                            </div>
                        </div>
                {/* Edit folder modal */}
                {editModal?.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl p-6 w-80 max-w-full flex flex-col items-center shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Edit Folder</h3>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-full px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Folder Name"
                                value={editModal.folderName}
                                onChange={e => setEditModal(m => m ? { ...m, folderName: e.target.value } : m)}
                                disabled={editLoading}
                            />
                            {editError && <div className="text-red-500 mb-2 text-center">{editError}</div>}
                            <div className="flex gap-4 w-full">
                                <button
                                    className="flex-1 bg-gray-300 text-gray-700 rounded-full py-2 font-bold"
                                    onClick={closeEditModal}
                                    type="button"
                                    disabled={editLoading}
                                >Cancel</button>
                                <button
                                    className="flex-1 bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-50"
                                    onClick={handleEditFolder}
                                    type="button"
                                    disabled={editLoading || !editModal.folderName.trim()}
                                >{editLoading ? 'Updating...' : 'Update'}</button>
                                <button
                                    className="flex-1 bg-red-500 text-white rounded-full py-2 font-bold disabled:opacity-50"
                                    onClick={handleDeleteFolder}
                                    type="button"
                                    disabled={editLoading}
                                >{editLoading ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </div>
                    </div>
                )}
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
