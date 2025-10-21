import logo from "../assets/logo.png";
import notification from "../assets/notification.png";
import dynamicNameCardLogo from "../assets/dynamic-name-card-logo.png";
import messageIcon from "../assets/message.png";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";

interface HeaderProps {
  hideNotification?: boolean;
}

export default function Header({ hideNotification }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center justify-between px-2 py-2 bg-[#007cb6] rounded-full w-full max-w-3xl mt-4 shadow-lg mx-4">
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
            <img
              src={notification}
              alt="Bell"
              className="w-8 h-8 rounded-full border-2 border-white bg-white"
              onClick={() => navigate("/notifications")}
            />
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
