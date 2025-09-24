import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { QRCodeSVG } from "qrcode.react";
import logo from "../assets/logo.png";
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
            <p className="font-semibold text-white">Copy QR code</p>
            <FontAwesomeIcon icon={faCopy} className="text-white" />
          </div>

          {/* QR Code Generator */}
          <div className="p-4 bg-white mb-4 flex flex-col items-center">
            <QRCodeSVG
              value={qrLink}
              size={192}
              bgColor="#ffffff"
              fgColor="#007cb6"
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
          <p className="text-white mb-2">Scan my QR code</p>
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
            className="flex items-center justify-between w-full gap-2 bg-white text-gray-700 rounded-full px-4 py-2 hover:bg-[#007cb6] hover:text-white transition"
          >
            <span>Copy my Details</span>
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>
      </div>
    </Layout>
  );
}
