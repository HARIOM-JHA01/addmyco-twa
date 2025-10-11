import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNotification, setModalNotification] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/getnotification`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.data || []);
      } catch (err: any) {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // View notification (mark as read and show modal)
  const handleViewNotification = async (notification: any) => {
    setModalLoading(true);
    setModalNotification(notification);
    setModalOpen(true);
    try {
      const token = localStorage.getItem("token");
      await axios.get(`${API_BASE_URL}/viewnotification/${notification._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optionally update notification as read in UI
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
    } catch {}
    setModalLoading(false);
  };

  // Mark multiple as read
  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.get(`${API_BASE_URL}/multiplenotification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    setDeleteLoading(notificationId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/user/deletenotification/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (modalNotification && modalNotification._id === notificationId) {
        setModalOpen(false);
        setModalNotification(null);
      }
    } catch {}
    setDeleteLoading(null);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <button
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
          >
            Mark all as read
          </button>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-700">No new notifications</p>
          ) : (
            <ul className="w-full divide-y divide-blue-200">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`flex items-center justify-between py-3 px-2 rounded-lg transition ${
                    n.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleViewNotification(n)}
                  >
                    <div className="font-semibold text-gray-800">
                      {n.title || "Notification"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 px-2 py-1 rounded"
                    onClick={() => handleDeleteNotification(n._id)}
                    disabled={deleteLoading === n._id}
                  >
                    {deleteLoading === n._id ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Modal for notification details */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => {
                  setModalOpen(false);
                  setModalNotification(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-lg font-bold text-[#2fa8e0] mb-2 text-center">
                {modalNotification?.title || "Notification"}
              </h3>
              {modalLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  <div className="mb-2 text-gray-700 whitespace-pre-line">
                    {modalNotification?.message || "No details."}
                  </div>
                  <div className="text-xs text-gray-400 text-center mb-2">
                    {modalNotification?.createdAt
                      ? new Date(modalNotification.createdAt).toLocaleString()
                      : ""}
                  </div>
                  <button
                    className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() =>
                      handleDeleteNotification(modalNotification._id)
                    }
                    disabled={deleteLoading === modalNotification._id}
                  >
                    {deleteLoading === modalNotification._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
