import logo from "../assets/logo.png";
import notification from "../assets/notification.png";
import dynamicNameCardLogo from "../assets/dynamic-name-card-logo.png";
import messageIcon from "../assets/message.png";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import axios from "axios";

interface HeaderProps {
  hideNotification?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Header({ hideNotification }: HeaderProps) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getcontact`, {
        headers: getAuthHeaders(),
      });
      const data = res.data?.data || [];
      const count = (data || []).filter(
        (c: any) => Number(c.status) === 0
      ).length;
      setPendingCount(count);
    } catch (err) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios({
        method: "get",
        url: `${API_BASE_URL}/getnotification`,
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      });
      const data = res.data?.data || [];
      // count unread (view === 0)
      const unread = (data || []).filter(
        (n: any) => Number(n.view) === 0
      ).length;
      setUnreadNotifications(unread);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchPending();
    fetchNotifications();
    const handler = (e: any) => {
      const cnt = e?.detail?.pendingCount;
      if (typeof cnt === "number") setPendingCount(cnt);
      else fetchPending();
    };
    window.addEventListener("contacts-updated", handler as EventListener);
    const notifHandler = (e: any) => {
      const cnt = e?.detail?.unreadNotifications;
      if (typeof cnt === "number") setUnreadNotifications(cnt);
      else fetchNotifications();
    };
    window.addEventListener(
      "notifications-updated",
      notifHandler as EventListener
    );
    return () => {
      window.removeEventListener("contacts-updated", handler as EventListener);
      window.removeEventListener(
        "notifications-updated",
        notifHandler as EventListener
      );
    };
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center justify-between px-2 py-2 bg-[#007cb6] rounded-full w-full max-w-md mt-4 shadow-lg mx-4 sm:mx-auto">
        <div className="flex items-center gap-1">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-full bg-white p-1 shadow"
            onClick={() => navigate("/")}
          />

          <span className="text-white text-2xl font-space-bold tracking-wide">
            AddMy.Co
          </span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={messageIcon}
            alt="Info"
            className="w-8 h-8 rounded-full border-2 border-white bg-white"
            onClick={() => WebApp.openLink("https://t.me/AddmyCompany")}
          />
          {!hideNotification && (
            <div className="relative">
              <img
                src={notification}
                alt="Bell"
                className="w-8 h-8 rounded-full border-2 border-white bg-white cursor-pointer"
                onClick={() => navigate("/notifications")}
              />
              {pendingCount + unreadNotifications > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount + unreadNotifications > 9
                    ? "9+"
                    : pendingCount + unreadNotifications}
                </div>
              )}
            </div>
          )}
          <img
            src={dynamicNameCardLogo}
            alt="Profile"
            className="w-8 h-8 rounded-full border-2 border-white bg-white"
            onClick={() => WebApp.openLink("https://t.me/dynamicnamecard")}
          />
        </div>
      </div>
    </div>
  );
}
