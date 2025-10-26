import { useState, useEffect } from "react";
import { FaEllipsisV, FaTrash } from "react-icons/fa";
import axios from "axios";
import Layout from "../components/Layout";
import i18n from "../i18n";
import { useProfileStore } from "../store/profileStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface ContactData {
  _id: string;
  user_id: string;
  contact_id: string;
  status: number;
  userdetails?: Array<{
    owner_name_english?: string;
    owner_name_chinese?: string;
    profile_image?: string;
    username?: string;
    companydetails?: any[];
  }>;
  contactfolders_data?: any[];
  profile_image?: string;
}

// Inline component to handle Add Folder button with membership check
function AddFolderButton({ openModal }: { openModal: () => void }) {
  const profile = useProfileStore((s) => s.profile);
  const memberType = profile?.membertype || profile?.membertype || "free";
  const isFree =
    memberType === "free" || memberType === "Free" || memberType === "FREE";

  const handleClick = () => {
    if (isFree) {
      alert(
        "Folder creation is available for premium users only. Please upgrade to create more folders."
      );
      return;
    }
    openModal();
  };

  return (
    <button
      type="button"
      className={`flex justify-between items-center w-full px-4 py-1 rounded-sm ${
        isFree
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-700 hover:bg-[#007cb6] hover:text-[#ffffff]"
      }`}
      onClick={handleClick}
      disabled={isFree}
    >
      <span className="text-left w-full truncate">+ add more folders</span>
    </button>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ContactPage() {
  const navigate = useNavigate();
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState<any[]>([]);
  // contactFolders are used only in Notifications accept flow; not needed here
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactData[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [editModal, setEditModal] = useState<{
    open: boolean;
    folderId: string;
    folderName: string;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/getcontact`, {
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        const data = res.data.data || [];
        setContacts(data);
        // show only accepted contacts on the contacts page
        const accepted = (data || []).filter(
          (c: any) => Number(c.status) === 1
        );
        setFilteredContacts(accepted);
        // dispatch event to notify header / other listeners about pending count
        const pendingCount = (data || []).filter(
          (c: any) => Number(c.status) === 0
        ).length;
        window.dispatchEvent(
          new CustomEvent("contacts-updated", { detail: { pendingCount } })
        );
      }
    } catch (error: any) {
      console.error("Failed to fetch contacts:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts by folder
  const fetchContactsByFolder = async (folderId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/contactlist/${folderId}`, {
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        // ensure we only show accepted contacts inside folders
        const data = res.data.data || [];
        setFilteredContacts(
          (data || []).filter((c: any) => Number(c.status) === 1)
        );
      }
    } catch (error: any) {
      console.error("Failed to fetch folder contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search contacts
  const searchContacts = async (query: string) => {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/searchcontact`,
        { search: query },
        { headers: getAuthHeaders() }
      );
      if (res.data.success && res.data.data) {
        // API may return an array or a single object
        const d = res.data.data;
        const raw = Array.isArray(d) ? d : [d];
        // only show accepted contacts on the contacts page
        setFilteredContacts(raw.filter((c: any) => Number(c.status) === 1));
      } else {
        setFilteredContacts([]);
      }
    } catch (error: any) {
      console.error("Search failed:", error);
      setFilteredContacts([]);
    }
  };

  // Remove contact
  const removeContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to remove this contact?")) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/removefromcontact/${contactId}`,
        { headers: getAuthHeaders() }
      );
      if (res.data.success) {
        alert(res.data.message || "Contact removed successfully");
        fetchContacts();
      }
    } catch (error: any) {
      console.error("Failed to remove contact:", error);
      alert(error.response?.data?.message || "Failed to remove contact");
    }
  };

  // Helper to refresh folders
  const refreshFolders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/getfolder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(res.data.data || []);
    } catch {}
  };

  // Fetch folders and contacts on mount
  useEffect(() => {
    refreshFolders();
    fetchContacts();
    const handler = () => {
      // when contacts updated elsewhere (Notifications), refresh list
      try {
        fetchContacts();
      } catch (err) {
        /* noop */
      }
    };
    window.addEventListener("contacts-updated", handler as EventListener);
    return () => {
      window.removeEventListener("contacts-updated", handler as EventListener);
    };
  }, []);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchContacts(searchQuery);
      } else {
        setFilteredContacts(contacts);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, contacts]);

  const openModal = () => {
    setFolderName("");
    setModalError("");
    setShowModal(true);
  };

  // (Accept/Reject handled on Notifications page) Contact page shows delete only

  const closeModal = () => {
    setShowModal(false);
    setModalError("");
  };

  const handleAddFolder = async () => {
    setModalLoading(true);
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      await axios.post(
        `${API_BASE_URL}/addfolder`,
        { Folder: folderName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await refreshFolders();
      setShowModal(false);
    } catch (err: any) {
      setModalError(
        err?.response?.data?.message || err.message || "Failed to add folder"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Edit modal handlers
  const openEditModal = (folder: any) => {
    setEditModal({
      open: true,
      folderId: folder._id,
      folderName: folder.Folder,
    });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditError("");
  };

  const handleEditFolder = async () => {
    if (!editModal) return;
    setEditLoading(true);
    setEditError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      await axios.post(
        `${API_BASE_URL}/editfolder/${editModal.folderId}`,
        { Folder: editModal.folderName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await refreshFolders();
      closeEditModal();
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message || err.message || "Failed to update folder"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!editModal) return;
    setEditLoading(true);
    setEditError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      await axios.delete(`${API_BASE_URL}/deletefolder/${editModal.folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshFolders();
      closeEditModal();
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message || err.message || "Failed to delete folder"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleFolderClick = (folderName: string, folderId?: string) => {
    setSelectedFolder(folderName);
    if (folderName === "All") {
      fetchContacts();
    } else if (folderId) {
      fetchContactsByFolder(folderId);
    }
  };

  // Contact circles are non-clickable on this page per design
  const handleContactClick = (contact: ContactData) => {
    const username = contact.userdetails?.[0]?.username || contact.contact_id;
    if (username) navigate(`/${username}`);
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
                placeholder={i18n.t("folder_name")}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                disabled={modalLoading}
              />
              {modalError && (
                <div className="text-red-500 mb-2 text-center">
                  {modalError}
                </div>
              )}
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 bg-gray-300 text-gray-700 rounded-full py-2 font-bold"
                  onClick={closeModal}
                  type="button"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-full py-2 font-bold disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    color: "var(--app-font-color)",
                  }}
                  onClick={handleAddFolder}
                  type="button"
                  disabled={modalLoading || !folderName.trim()}
                >
                  {modalLoading ? "Adding..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                onChange={(e) =>
                  setEditModal((m) =>
                    m ? { ...m, folderName: e.target.value } : m
                  )
                }
                disabled={editLoading}
              />
              {editError && (
                <div className="text-red-500 mb-2 text-center">{editError}</div>
              )}
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 bg-gray-300 text-gray-700 rounded-full py-2 font-bold"
                  onClick={closeEditModal}
                  type="button"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-full py-2 font-bold disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--app-background-color)",
                    color: "var(--app-font-color)",
                  }}
                  onClick={handleEditFolder}
                  type="button"
                  disabled={editLoading || !editModal.folderName.trim()}
                >
                  {editLoading ? "Updating..." : "Update"}
                </button>
                <button
                  className="flex-1 bg-red-500 text-white rounded-full py-2 font-bold disabled:opacity-50"
                  onClick={handleDeleteFolder}
                  type="button"
                  disabled={editLoading}
                >
                  {editLoading ? "Deleting..." : "Delete"}
                </button>
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
              placeholder={i18n.t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Folder buttons with styled scrollbar */}
          <div className="mt-4 overflow-x-auto scrollbar-custom">
            <div className="flex gap-4 min-w-max px-2 mb-4">
              {/* Default folders */}
              {["All", "Business", "Friends", "Partner"].map((name) => (
                <div key={name} className="flex items-center w-30">
                  <button
                    type="button"
                    className={`flex justify-between items-center w-full px-4 py-1 rounded-sm ${
                      selectedFolder === name
                        ? "bg-[#007cb6] text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => handleFolderClick(name)}
                  >
                    <span className="text-left w-full truncate">{name}</span>
                  </button>
                </div>
              ))}
              {/* User-created folders */}
              {folders
                .filter(
                  (f) =>
                    !["All", "Business", "Friends", "Partner"].includes(
                      f.Folder
                    )
                )
                .map((folder) => (
                  <div key={folder._id} className="flex items-center w-30">
                    <button
                      type="button"
                      className={`flex justify-between items-center w-full px-4 py-1 rounded-sm ${
                        selectedFolder === folder.Folder
                          ? "bg-[#007cb6] text-white"
                          : "bg-white text-gray-700"
                      }`}
                      onClick={() =>
                        handleFolderClick(folder.Folder, folder._id)
                      }
                    >
                      <span className="text-left w-full truncate">
                        {folder.Folder}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(folder);
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-gray-200 flex items-center"
                      >
                        <FaEllipsisV size={16} />
                      </span>
                    </button>
                  </div>
                ))}
              <div className="flex items-center w-30">
                <AddFolderButton openModal={openModal} />
              </div>
            </div>
          </div>

          {/* Contacts List */}
          <div className="mt-8">
            {loading ? (
              <div className="text-center text-gray-600">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="font-extrabold text-lg text-center text-black">
                {i18n.t("no_contacts")}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredContacts.map((contact) => {
                  const userDetail = contact.userdetails?.[0];
                  return (
                    <div
                      key={contact._id}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-visible shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleContactClick(contact)}
                      >
                        {userDetail?.profile_image || contact.profile_image ? (
                          <img
                            src={`https://admin.addmy.co/assets/${
                              userDetail?.profile_image || contact.profile_image
                            }`}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            onClick={() => handleContactClick(contact)}
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <span
                            className="text-gray-400 text-2xl font-bold"
                            onClick={() => handleContactClick(contact)}
                            style={{ cursor: "pointer" }}
                          >
                            {userDetail?.owner_name_english?.charAt(0) || "?"}
                          </span>
                        )}

                        {/* Always show delete icon overlay (no approve/reject on contact page) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeContact(contact.contact_id);
                          }}
                          className="absolute -top-2 -right-2 bg-white p-1 rounded-full text-red-500 shadow-sm hover:bg-red-50 z-10"
                          aria-label="Remove contact"
                          title="Remove contact"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>

                      <div className="mt-2 max-w-[96px] truncate">
                        <div className="w-full bg-app text-app text-sm font-semibold py-1 rounded-full px-2 truncate">
                          {userDetail?.owner_name_english || "Unknown"}
                        </div>
                        {userDetail?.owner_name_chinese && (
                          <div className="w-full bg-app text-app text-xs py-1 rounded-full px-2 mt-1 truncate">
                            {userDetail.owner_name_chinese}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
