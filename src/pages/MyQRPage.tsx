import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { QRCodeSVG } from "qrcode.react";
import logo from "../assets/logo.png";
import i18n from "../i18n";
export default function MyQRPage() {
  const qrLink = "https://addmy.co/6500b34d"; // Replace with dynamic profile link if available

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {/* Copy QR Code */}
          <div
            className="flex items-center gap-2 mb-4 cursor-pointer"
            onClick={() => copyToClipboard(qrLink)}
          >
            <p className="font-semibold text-app">{i18n.t("copy_qr")}</p>
            <FontAwesomeIcon icon={faCopy} className="text-app" />
          </div>

          {/* QR Code Generator */}
          <div className="p-4 bg-white mb-4 flex flex-col items-center">
            <QRCodeSVG
              value={qrLink}
              size={192}
              bgColor="#ffffff"
              fgColor={(() => {
                try {
                  return (
                    getComputedStyle(document.documentElement)
                      .getPropertyValue("--app-background-color")
                      .trim() || "#007cb6"
                  );
                } catch (e) {
                  return "#007cb6";
                }
              })()}
              level="H"
              imageSettings={{
                src: logo,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>

          {/* Scan my QR Code */}
          <p className="text-app mb-2">{i18n.t("scan_qr")}</p>
          <div
            className="flex items-center bg-white rounded-full px-4 py-2 mb-4 w-full max-w-xs cursor-pointer"
            onClick={() => copyToClipboard(qrLink)}
          >
            <input
              type="text"
              value={qrLink}
              readOnly
              className="bg-transparent focus:outline-none text-gray-700 w-full"
            />
            <FontAwesomeIcon icon={faCopy} className="text-gray-500 ml-2" />
          </div>

          {/* Copy my Details Button */}
          <button
            onClick={() => copyToClipboard("My details text here")}
            className="flex items-center justify-between w-full gap-2 bg-white text-gray-700 rounded-full px-4 py-2 transition"
            style={{ "--hover-bg": "var(--app-background-color)" } as any}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                getComputedStyle(document.documentElement).getPropertyValue(
                  "--app-background-color"
                ) || "#007cb6";
              (e.currentTarget as HTMLElement).style.color =
                getComputedStyle(document.documentElement).getPropertyValue(
                  "--app-font-color"
                ) || "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "white";
              (e.currentTarget as HTMLElement).style.color = "#374151";
            }}
          >
            <span>{i18n.t("copy_details")}</span>
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>
      </div>
    </Layout>
  );
}
