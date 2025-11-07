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
  const [freeLink, setFreeLink] = useState("");
  const [premiumLink, setPremiumLink] = useState("");
  const [isPremium, setIsPremium] = useState(false);
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

        const origin = (window.location && window.location.origin) || "";
        // free link uses tgid (or fallback)
        const tgid = data?.tgid || data?.telegram_username || "";
        const free = tgid ? `${origin}/t.me/${tgid}` : origin;

        // premium link uses username (or fallback)
        const uname =
          data?.username || data?.telegram_username || data?.tgid || "";
        const premium = uname ? `${origin}/t.me/${uname}` : origin;

        setFreeLink(free);
        setPremiumLink(premium);
        const premiumFlag =
          String(data?.membertype).toLowerCase() === "premium";
        setIsPremium(premiumFlag);

        // QR encodes premium link when user is premium, otherwise free link
        setQrLink(premiumFlag && premium ? premium : free);
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

      // Create a larger canvas for better quality
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        alert("Unable to generate QR Code image");
        return;
      }

      const size = 1024; // High resolution
      const padding = 80; // Padding around QR code
      const qrSize = size - padding * 2;

      canvas.width = size;
      canvas.height = size;

      // Draw white background with rounded corners
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const qrImg = new Image();

      qrImg.onload = () => {
        // Draw the QR code
        ctx.drawImage(qrImg, padding, padding, qrSize, qrSize);

        // Load and draw the logo in the center
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";

        logoImg.onload = () => {
          const logoSize = qrSize * 0.2; // Logo is 20% of QR code size
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // Draw white circle background for logo
          const logoRadius = logoSize / 2;
          const logoCenterX = logoX + logoRadius;
          const logoCenterY = logoY + logoRadius;

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(logoCenterX, logoCenterY, logoRadius + 8, 0, Math.PI * 2);
          ctx.fill();

          // Draw the logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          // Add a subtle border around the whole QR code
          ctx.strokeStyle = "#e5e7eb";
          ctx.lineWidth = 2;
          ctx.strokeRect(padding - 10, padding - 10, qrSize + 20, qrSize + 20);

          // Convert canvas to blob and download
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                alert("Failed to generate QR Code image");
                URL.revokeObjectURL(svgUrl);
                return;
              }

              try {
                // Prepare filename
                const username =
                  profile?.username ||
                  profile?.telegram_username ||
                  profile?.tgid ||
                  "QRCode";
                const filename = `AddMyCo-${username}-QR.png`;

                // Try Web Share API with files (mobile friendly)
                const file = new File([blob], filename, { type: "image/png" });
                // @ts-ignore navigator.canShare may not exist in all browsers
                if (
                  navigator.canShare &&
                  navigator.canShare({ files: [file] })
                ) {
                  try {
                    // @ts-ignore
                    await navigator.share({ files: [file], title: filename });
                    URL.revokeObjectURL(svgUrl);
                    return;
                  } catch (shareErr) {
                    console.warn(
                      "Share failed, falling back to download:",
                      shareErr
                    );
                  }
                }

                const downloadUrl = URL.createObjectURL(blob);

                // iOS Safari doesn't support the download attribute reliably.
                const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
                if (isIOS) {
                  const newWin = window.open(downloadUrl, "_blank");
                  if (newWin) {
                    alert(
                      "A new tab was opened with the QR image. Long-press the image and choose 'Save Image' to download it."
                    );
                  } else {
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.rel = "noopener noreferrer";
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }

                  setTimeout(() => {
                    URL.revokeObjectURL(downloadUrl);
                    URL.revokeObjectURL(svgUrl);
                  }, 2000);

                  return;
                }

                // Desktop / modern browsers: use anchor with download attribute
                const link = document.createElement("a");
                link.download = filename;
                link.href = downloadUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                  URL.revokeObjectURL(downloadUrl);
                  URL.revokeObjectURL(svgUrl);
                }, 100);

                alert("QR Code downloaded successfully!");
              } catch (err) {
                console.error("Download flow failed:", err);
                alert(
                  "Failed to download QR Code. Please try long-pressing the image to save it."
                );
                URL.revokeObjectURL(svgUrl);
              }
            },
            "image/png",
            1.0
          );
        };

        logoImg.onerror = () => {
          // If logo fails to load, still download QR without logo
          console.warn("Logo failed to load, downloading QR without logo");
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                URL.revokeObjectURL(svgUrl);
                return;
              }
              const username =
                profile?.username ||
                profile?.telegram_username ||
                profile?.tgid ||
                "QRCode";
              const filename = `AddMyCo-${username}-QR.png`;
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.download = filename;
              link.href = downloadUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
                URL.revokeObjectURL(svgUrl);
              }, 100);
            },
            "image/png",
            1.0
          );
        };

        logoImg.src = logo;
      };

      qrImg.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        alert("Failed to load QR Code image. Please try again.");
      };

      qrImg.src = svgUrl;
    } catch (err) {
      console.error("Download QR failed:", err);
      alert("Failed to download QR Code. Please try again.");
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

          {/* QR Code Generator - Enhanced Design */}
          <div
            ref={qrRef}
            className="p-1 bg-white mb-4 flex flex-col items-center rounded-md shadow-xl border-2 border-gray-100"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            }}
          >
            <QRCodeSVG
              value={qrLink}
              size={220}
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
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* Scan my QR Code */}
          <p className="text-app mb-2">{i18n.t("scan_qr")}</p>

          {/* Free Link (constructed from tgid) */}
          <div className="w-full max-w-xs mb-2">
            <div className="text-sm font-semibold text-gray-600">Free link</div>
            <div className="flex items-center bg-white rounded-full px-4 py-2 mt-1">
              <input
                type="text"
                value={freeLink}
                readOnly
                className="bg-transparent focus:outline-none text-gray-700 w-full"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(freeLink)}
                className="ml-2"
                aria-label="Copy free link"
              >
                <FontAwesomeIcon icon={faCopy} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Premium Link (constructed from username) */}
          <div className="w-full max-w-xs mb-4">
            <div className="text-sm font-semibold text-gray-600">
              Premium link
            </div>
            <div
              className={`flex items-center rounded-full px-4 py-2 mt-1 ${
                isPremium ? "bg-white" : "bg-gray-100"
              }`}
            >
              <input
                type="text"
                value={premiumLink}
                readOnly
                disabled={!isPremium}
                className={`bg-transparent focus:outline-none text-gray-700 w-full ${
                  !isPremium ? "opacity-60" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => isPremium && copyToClipboard(premiumLink)}
                className={`ml-2 ${
                  !isPremium ? "opacity-50 pointer-events-none" : ""
                }`}
                aria-label="Copy premium link"
                disabled={!isPremium}
              >
                <FontAwesomeIcon icon={faCopy} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Copy my Details Button */}
          <div className="w-full max-w-xs mb-4">
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
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "white";
                (e.currentTarget as HTMLElement).style.color = "#374151";
              }}
            >
              <span>{i18n.t("copy_details")}</span>
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
