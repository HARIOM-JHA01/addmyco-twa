import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faDownload } from "@fortawesome/free-solid-svg-icons";
import { QRCodeSVG } from "qrcode.react";
import logo from "../assets/logo.png";
import i18n from "../i18n";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MyQRPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrLink, setQrLink] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const res = await axios.get(`${API_BASE_URL}/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.data || res.data;
        setProfile(data || null);

        // derive username field (prefer explicit username)
        const username =
          data?.username ||
          data?.telegram_username ||
          data?.tgid ||
          data?._id ||
          "";

        const origin = (window.location && window.location.origin) || "";
        const link = username ? `${origin}/${username}` : origin;
        setQrLink(link);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Copy failed", err);
      // Fallback for older browsers or when clipboard API is not available
      try {
        // Create a temporary textarea element
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (success) {
          alert("Link copied to clipboard!");
        } else {
          throw new Error("execCommand failed");
        }
      } catch (fallbackErr) {
        console.error("Fallback copy also failed", fallbackErr);
        alert(`Copy failed. Here's the link: ${text}`);
      }
    }
  };

  const downloadQRCodeImage = async () => {
    try {
      if (!qrRef.current) {
        alert("QR Code not found");
        return;
      }

      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) {
        alert("QR Code not found");
        return;
      }

      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        alert("Unable to generate QR Code image");
        return;
      }

      const img = new Image();

      // Set canvas size to match SVG (larger for better quality)
      canvas.width = 512;
      canvas.height = 512;

      // Convert SVG to image
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          // Draw white background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the QR code (scaled up)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (!blob) {
              alert("Failed to generate QR Code image");
              URL.revokeObjectURL(url);
              return;
            }

            // Create download link
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            // Get username for filename
            const username =
              profile?.username || profile?.telegram_username || "QRCode";
            link.download = `${username}-QRCode.png`;
            link.href = downloadUrl;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(url);

            alert("QR Code downloaded successfully!");
          }, "image/png");
        } catch (err) {
          console.error("Error generating QR Code:", err);
          alert("Failed to download QR Code");
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert("Failed to load QR Code");
      };

      img.src = url;
    } catch (err) {
      console.error("Download QR failed:", err);
      alert("Failed to download QR Code");
    }
  };

  const handleCopyDetails = () => {
    if (!profile) return;
    const name =
      profile.owner_name_english ||
      profile.owner_name_chinese ||
      profile.owner_name ||
      "";
    const company =
      profile.companydata?.company_name_english ||
      profile.companydata?.company_name_chinese ||
      profile.companydata?.company_name ||
      "";
    const designation =
      profile.companydata?.companydesignation ||
      profile.designation ||
      profile.title ||
      "";
    const address = qrLink || "";

    const text = `Name : ${name}\nCompany name : ${company}\nDesignation: ${designation}\nAddmyCo address : ${address}`;
    copyToClipboard(text);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          Loading...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-red-600">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <div className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {/* Download QR Code */}
          <div
            className="flex items-center gap-2 mb-4 cursor-pointer"
            onClick={downloadQRCodeImage}
          >
            <p className="font-semibold text-app">
              {i18n.t("download_qr") || "Download QR Code"}
            </p>
            <FontAwesomeIcon icon={faDownload} className="text-app" />
          </div>

          {/* QR Code Generator */}
          <div
            ref={qrRef}
            className="p-4 bg-white mb-4 flex flex-col items-center"
          >
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
            onClick={handleCopyDetails}
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
