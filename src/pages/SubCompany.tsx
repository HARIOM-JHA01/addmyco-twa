import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import chamberIcon from "../assets/chamber.svg";
import profileIcon from "../assets/profileIcon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faTelegram } from "@fortawesome/free-brands-svg-icons";
import {
  faPhone,
  faGlobe,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SubCompanyPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const companyProfile = companies[currentCompanyIndex] || null;
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<null | "create" | "update">(null);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Fetch company profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please login again.");
        const res = await axios.get(`${API_BASE_URL}/getcompanyprofile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Try different possible response structures
        let profileData = null;
        if (res.data && res.data.data) {
          profileData = res.data.data;
        } else if (res.data && typeof res.data === "object") {
          profileData = res.data;
        } else if (res.data && res.data.company) {
          profileData = res.data.company;
        }

        // If array, set all companies; else, wrap single object in array
        if (Array.isArray(profileData) && profileData.length > 0) {
          setCompanies(profileData);
          setCurrentCompanyIndex(0);
        } else if (profileData && typeof profileData === "object") {
          setCompanies([profileData]);
          setCurrentCompanyIndex(0);
        } else {
          setCompanies([]);
          setCurrentCompanyIndex(0);
        }
      } catch (err: any) {
        setCompanies([]);
        setCurrentCompanyIndex(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Open edit form for update
  const openEditProfile = () => {
    setEditMode("update");
    setEditProfile(companyProfile);
    setEditError("");
  };
  // Open edit form for create
  const openCreateProfile = () => {
    setEditMode("create");
    setEditProfile({});
    setEditError("");
  };
  // Handle edit form input
  const handleEditInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };
  // Handle edit form file
  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setEditProfile((prev: any) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  // Save handler for both create and update
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");
      const formData = new FormData();
      formData.append(
        "company_name_english",
        editProfile.company_name_english || ""
      );
      formData.append(
        "company_name_chinese",
        editProfile.company_name_chinese || ""
      );
      formData.append(
        "companydesignation",
        editProfile.companydesignation || ""
      );
      formData.append("telegramId", editProfile.telegramId || "");
      formData.append("description", editProfile.description || "");
      formData.append("email", editProfile.email || "");
      formData.append("WhatsApp", editProfile.WhatsApp || "");
      formData.append("website", editProfile.website || "");
      formData.append("facebook", editProfile.facebook || "");
      if (editProfile.image && editProfile.image.startsWith("data:image")) {
        // Convert base64 to blob and append
        const arr = editProfile.image.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        formData.append("image", new Blob([u8arr], { type: mime }));
      }
      await axios.post(`${API_BASE_URL}/companyprofile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh profile
      const res = await axios.get(`${API_BASE_URL}/getcompanyprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Try different possible response structures
      let profileData = null;
      if (res.data && res.data.data) {
        profileData = res.data.data;
      } else if (res.data && typeof res.data === "object") {
        profileData = res.data;
      } else if (res.data && res.data.company) {
        profileData = res.data.company;
      }

      // Handle array response - if profileData is an array, take the first item
      if (Array.isArray(profileData) && profileData.length > 0) {
        profileData = profileData[0];
      }

      if (
        profileData &&
        typeof profileData === "object" &&
        !Array.isArray(profileData)
      ) {
        setCompanies([profileData]);
        setCurrentCompanyIndex(0);
      } else {
        setCompanies([]);
        setCurrentCompanyIndex(0);
      }

      setEditMode(null);
      setEditProfile(null);
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save company profile"
      );
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-grow py-4 px-2 pb-32">
        <section className="bg-blue-100 bg-opacity-40 rounded-3xl p-6 w-full max-w-md mx-auto flex flex-col items-center shadow-lg">
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : editMode ? (
            <form
              onSubmit={handleEditSave}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-xl font-bold mb-4 text-center">
                {editMode === "update"
                  ? "Update Company Profile"
                  : "Create Company Profile"}
              </h2>
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="company_name_english"
                placeholder="English Name for Company"
                value={editProfile?.company_name_english || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="company_name_chinese"
                placeholder="Chinese Name for Company"
                value={editProfile?.company_name_chinese || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="companydesignation"
                placeholder="Designation"
                value={editProfile?.companydesignation || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              {/* Upload area */}
              <div className="w-full bg-blue-400 rounded-xl flex flex-col items-center justify-center py-8 mb-3">
                <div className="text-white text-center text-base font-semibold">
                  Please upload
                  <br />
                  640 width by 360 high Image
                  <br />
                  or
                </div>
                <div className="text-yellow-300 text-center text-base font-semibold mb-2">
                  Premium Member Upload 1 Minute Video
                </div>
                {editProfile?.image &&
                  editProfile.image.startsWith("data:image") && (
                    <img
                      src={editProfile.image}
                      alt="company"
                      className="max-h-20 mt-2"
                    />
                  )}
              </div>
              {/* File input and Cancel button below the upload box */}
              <div className="w-full flex flex-row items-center justify-center gap-4 mb-3">
                <label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleEditFile}
                    disabled={editLoading}
                    className="hidden"
                  />
                  <span className="bg-black text-white rounded px-6 py-2 font-semibold cursor-pointer select-none text-sm text-center">
                    Browse
                  </span>
                </label>
                <button
                  type="button"
                  className="bg-black text-white rounded px-6 py-2 font-semibold text-sm text-center"
                  onClick={() => {
                    setEditMode(null);
                    setEditProfile(null);
                    setEditError("");
                  }}
                  disabled={editLoading}
                >
                  Cancel
                </button>
              </div>
              <textarea
                className="rounded-xl border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500 min-h-[80px]"
                name="description"
                placeholder="Company Description"
                value={editProfile?.description || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="website"
                placeholder="Website"
                value={editProfile?.website || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="telegramId"
                placeholder="Telegram ID"
                value={editProfile?.telegramId || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="facebook"
                placeholder="https://Facebook"
                value={editProfile?.facebook || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="instagram"
                placeholder="https://Instagram"
                value={editProfile?.instagram || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="youtube"
                placeholder="https://Youtube"
                value={editProfile?.youtube || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />

              <input
                className="rounded-full border-2 border-blue-200 px-4 py-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white placeholder-gray-500"
                type="text"
                name="order"
                placeholder="Set display order"
                value={editProfile?.order || ""}
                onChange={handleEditInput}
                disabled={editLoading}
              />
              {editError && (
                <div className="text-red-500 mb-2 text-center">{editError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-[#007cb6] text-white rounded-full py-2 font-bold disabled:opacity-50 mt-2"
                disabled={editLoading}
              >
                {editLoading
                  ? editMode === "update"
                    ? "Updating..."
                    : "Saving..."
                  : editMode === "update"
                  ? "Update"
                  : "Save"}
              </button>
              {/* Cancel button below Update/Save in edit mode */}
              <button
                type="button"
                className="w-full bg-black text-white rounded-full py-2 font-bold mt-2"
                onClick={() => {
                  setEditMode(null);
                  setEditProfile(null);
                  setEditError("");
                }}
                disabled={editLoading}
              >
                Cancel
              </button>
            </form>
          ) : companyProfile ? (
            <>
              {/* Company Icons Row */}
              <div className="flex items-center justify-center gap-4 mb-4 px-6 relative">
                {/* Right arrow for multiple companies */}
                {companies.length > 1 &&
                  currentCompanyIndex < companies.length - 1 && (
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#007cb6] rounded-full cursor-pointer shadow-lg z-10"
                      onClick={() =>
                        setCurrentCompanyIndex((i) =>
                          Math.min(i + 1, companies.length - 1)
                        )
                      }
                      title="Next Company"
                    >
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        size="lg"
                        color="white"
                      />
                    </div>
                  )}
                {/* First icon: Profile, always shown, navigates to profile page */}
                <div
                  className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => (window.location.href = "/profile")}
                >
                  <img
                    src={profileIcon}
                    alt="Profile"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                {/* WhatsApp icon or placeholder */}
                {companyProfile?.WhatsApp ? (
                  <div
                    className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() =>
                      window.open(companyProfile.WhatsApp, "_blank")
                    }
                  >
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      size="2x"
                      color="white"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12" />
                )}
                {/* Telegram icon or placeholder */}
                {companyProfile?.Telegram ? (
                  <div
                    className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() =>
                      window.open(companyProfile.Telegram, "_blank")
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTelegram}
                      size="2x"
                      color="white"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12" />
                )}
                {/* Phone icon or placeholder */}
                {companyProfile?.Phone ? (
                  <div
                    className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() =>
                      window.open(`tel:${companyProfile.Phone}`, "_self")
                    }
                  >
                    <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
                  </div>
                ) : (
                  <div className="w-12 h-12" />
                )}
                {/* Website icon or placeholder */}
                {companyProfile?.Website ? (
                  <div
                    className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() =>
                      window.open(companyProfile.Website, "_blank")
                    }
                  >
                    <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
                  </div>
                ) : (
                  <div className="w-12 h-12" />
                )}
                {/* Last icon: Chamber, always shown, navigates to chamber page */}
                <div
                  className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center p-2 overflow-hidden cursor-pointer"
                  onClick={() => (window.location.href = "/chamber")}
                >
                  <img
                    src={chamberIcon}
                    alt="chamber icon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>

              {/* Company Names */}
              <div
                className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-1 mb-2 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {companyProfile.company_name_english || "English Company Name"}
              </div>
              <div
                className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-1 mb-2 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {companyProfile.company_name_chinese || "中文公司名称"}
              </div>
              <div
                className="w-full rounded-full bg-[#007cb6] text-white text-xl font-bold py-1 mb-4 flex items-center justify-center"
                style={{ borderRadius: "2rem" }}
              >
                {companyProfile.companydesignation || "Company Designation"}
              </div>

              {/* Company Image and Description */}
              <div className="flex flex-col items-center mb-6">
                {/* Image container - matching ChamberPage style */}
                <div className="w-full flex justify-center mb-4">
                  <div
                    className="rounded-xl p-2 flex items-center justify-center w-full"
                    style={{ width: 350, height: 200 }}
                  >
                    <img
                      src={companyProfile.image || profileIcon}
                      alt="Company Logo"
                      className="object-contain mx-auto rounded-md"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  </div>
                </div>
                <div className="w-80 h-48 bg-white rounded-md border-2 border-[#007cb6] p-2 overflow-auto">
                  {companyProfile.description || "No description available"}
                </div>
              </div>

              {/* Contact Information */}
              <div className="w-full space-y-3 mb-6">
                {companyProfile.email && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <span className="font-bold text-gray-700">Email: </span>
                    <a
                      href={`mailto:${companyProfile.email}`}
                      className="text-blue-600 underline"
                    >
                      {companyProfile.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex justify-between w-full gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                  <FontAwesomeIcon icon={faTelegram} size="2x" color="white" />
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                  <FontAwesomeIcon icon={faGlobe} size="2x" color="white" />
                </div>
              </div>
              <div className="flex justify-center w-full gap-4 text-center mt-6">
                <button
                  className="p-2 w-full text-white bg-[#d50078] shadow-md rounded-full"
                  onClick={openEditProfile}
                >
                  Update
                </button>
                <button
                  className="p-2 w-full text-white bg-[#009944] shadow-md rounded-full"
                  onClick={openCreateProfile}
                >
                  Add More
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">
              No company profile found.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
