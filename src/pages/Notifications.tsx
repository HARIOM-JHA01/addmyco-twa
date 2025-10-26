import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../store/profileStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Notifications() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const isPremium =
    (profile?.membertype || "").toString().toLowerCase() !== "free";
  const [loading, setLoading] = useState(true);
  const [pendingContacts, setPendingContacts] = useState<any[]>([]);
  const [contactFolders, setContactFolders] = useState<any[]>([]);
  const [acceptModal, setAcceptModal] = useState<{
    open: boolean;
    contactId?: string | null;
    loading?: boolean;
    error?: string | null;
    selectedFolderId?: string | null;
    newFolderName?: string;
  } | null>(null);

  // Fetch pending contact requests (notifications removed per design)
  useEffect(() => {
    const fetchPendingContacts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/getcontact`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.data || [];
        const pending = (data || []).filter((c: any) => Number(c.status) === 0);
        setPendingContacts(pending);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchPendingContacts();
  }, []);

  const openAcceptModal = async (contactId: string) => {
    setAcceptModal({ open: true, contactId, loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/getcontactfolder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      setContactFolders(data);
      setAcceptModal((m) =>
        m
          ? { ...m, loading: false, selectedFolderId: data?.[0]?._id ?? null }
          : m
      );
    } catch (err: any) {
      setAcceptModal((m) =>
        m ? { ...m, loading: false, error: "Failed to load folders" } : m
      );
    }
  };

  const closeAcceptModal = () => setAcceptModal(null);

  const handleCreateFolder = async () => {
    if (!acceptModal?.newFolderName) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/addfolder`,
        { Folder: acceptModal.newFolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh folder list
      const res = await axios.get(`${API_BASE_URL}/getcontactfolder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      setContactFolders(data);
      setAcceptModal((m) =>
        m
          ? {
              ...m,
              newFolderName: "",
              selectedFolderId: data?.[0]?._id ?? null,
            }
          : m
      );
    } catch (err: any) {
      setAcceptModal((m) =>
        m ? { ...m, error: err?.message || "Failed to create folder" } : m
      );
    }
  };

  const handleAcceptPending = async () => {
    if (!acceptModal?.contactId) return;
    try {
      setAcceptModal((m) => (m ? { ...m, loading: true, error: null } : m));
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/invitationcontact`,
        {
          id: acceptModal.contactId,
          status: 1,
          folder_id: acceptModal.selectedFolderId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // refresh pending contacts and notify others
      const res = await axios.get(`${API_BASE_URL}/getcontact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      const pending = (data || []).filter((c: any) => Number(c.status) === 0);
      setPendingContacts(pending);
      window.dispatchEvent(
        new CustomEvent("contacts-updated", {
          detail: { pendingCount: pending.length },
        })
      );
      closeAcceptModal();
    } catch (err: any) {
      setAcceptModal((m) =>
        m
          ? { ...m, loading: false, error: err?.message || "Failed to accept" }
          : m
      );
    }
  };

  const handleRejectPending = async (contactId: string) => {
    if (!confirm("Reject this contact request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/invitationcontact`,
        { id: contactId, status: 2 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`${API_BASE_URL}/getcontact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data || [];
      const pending = (data || []).filter((c: any) => Number(c.status) === 0);
      setPendingContacts(pending);
      window.dispatchEvent(
        new CustomEvent("contacts-updated", {
          detail: { pendingCount: pending.length },
        })
      );
    } catch (err: any) {
      alert(err?.message || "Failed to reject");
    }
  };
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">
            You have received below contact requests
          </h2>
          {/* Mark all as read removed per design change */}
          {pendingContacts.length > 0 && (
            <div className="w-full mb-4">
              <ul className="w-full divide-y divide-blue-200 mb-3">
                {pendingContacts.map((c: any) => {
                  const user = c.userdetails?.[0];
                  const username = user?.username || c.contact_id;
                  return (
                    <li
                      key={c._id}
                      className="flex items-center justify-between py-3 px-2 rounded-lg bg-white"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(`/${username}`)}
                      >
                        <img
                          src={
                            user?.profile_image
                              ? `https://admin.addmy.co/assets/${user.profile_image}`
                              : undefined
                          }
                          alt="avatar"
                          className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                          onError={(e) =>
                            ((
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none")
                          }
                        />
                        <div className="text-sm">
                          <div className="font-semibold text-gray-800">
                            {user?.owner_name_english || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {username}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="bg-green-500 text-white w-9 h-9 flex items-center justify-center rounded-full"
                          onClick={() => openAcceptModal(c._id)}
                          aria-label="Approve contact"
                          title="Approve"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          className="bg-red-200 text-red-700 w-9 h-9 flex items-center justify-center rounded-full"
                          onClick={() => handleRejectPending(c._id)}
                          aria-label="Reject contact"
                          title="Reject"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : pendingContacts.length === 0 ? (
            <p className="text-gray-700">No pending contact requests</p>
          ) : null}
        </div>
        {/* Notification UI removed per request */}
        {/* Accept modal for pending contact requests */}
        {acceptModal?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl p-6 w-80 max-w-full flex flex-col items-center shadow-lg">
              <h3 className="text-lg font-bold mb-2">Accept Contact</h3>
              {acceptModal.loading ? (
                <div>Loading folders...</div>
              ) : acceptModal.error ? (
                <div className="text-red-500 mb-2">{acceptModal.error}</div>
              ) : (
                <>
                  <label className="w-full text-sm mb-2">Select Folder</label>
                  <select
                    className="w-full rounded-full px-3 py-2 mb-3 border"
                    value={acceptModal.selectedFolderId ?? ""}
                    onChange={(e) =>
                      setAcceptModal((m) =>
                        m ? { ...m, selectedFolderId: e.target.value } : m
                      )
                    }
                  >
                    <option value="">-- Select Folder --</option>
                    {contactFolders.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.Folder}
                      </option>
                    ))}
                  </select>
                  {isPremium && (
                    <div className="w-full mb-3">
                      <label className="w-full text-sm mb-1">
                        Create folder (optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-full px-3 py-2 border"
                          placeholder="Folder name"
                          value={acceptModal.newFolderName || ""}
                          onChange={(e) =>
                            setAcceptModal((m) =>
                              m ? { ...m, newFolderName: e.target.value } : m
                            )
                          }
                        />
                        <button
                          className="bg-gray-200 px-3 py-2 rounded"
                          onClick={handleCreateFolder}
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 w-full">
                    <button
                      className="flex-1 bg-gray-300 text-gray-700 rounded-full py-2 font-bold"
                      onClick={closeAcceptModal}
                      type="button"
                      disabled={acceptModal.loading}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 rounded-full py-2 font-bold disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--app-background-color)",
                        color: "var(--app-font-color)",
                      }}
                      onClick={handleAcceptPending}
                      type="button"
                      disabled={
                        acceptModal.loading || !acceptModal.selectedFolderId
                      }
                    >
                      {acceptModal.loading ? "Accepting..." : "Accept"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
