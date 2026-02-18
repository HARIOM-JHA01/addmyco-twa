import React, { useState } from "react";
import {
  createEmployeeStage1,
  createEmployeeStage2,
  createEmployeeStage3,
  createDonatorStage1,
  createDonatorStage2,
  createDonatorStage3,
  createOperatorStage1,
  createOperatorStage2,
  createOperatorStage3,
} from "../services/enterpriseService";

type UserType = "employee" | "donator" | "operator";

interface ThreeStageCreationProps {
  userType: UserType;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Stage2FormData {
  owner_name_english: string;
  owner_name_chinese: string;
  contact: string;
  whatsapp?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  email?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  wechat?: string;
  twitter?: string;
  line?: string;
  tiktok?: string;
}

interface Stage3FormData {
  company_name_english: string;
  company_name_chinese: string;
  designation: string;
  description?: string;
  website?: string;
  telegram_link?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  display_order?: number;
}

const ThreeStageCreation: React.FC<ThreeStageCreationProps> = ({
  userType,
  onSuccess,
  onCancel,
}) => {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stage 1: Telegram username
  const [telegramUsername, setTelegramUsername] = useState("");

  // Stage 2: Profile data
  const [stage2Data, setStage2Data] = useState<Stage2FormData>({
    owner_name_english: "",
    owner_name_chinese: "",
    contact: "",
  });

  // Stage 3: Company data
  const [stage3Data, setStage3Data] = useState<Stage3FormData>({
    company_name_english: "",
    company_name_chinese: "",
    designation: "",
  });
  const [videos, setVideos] = useState<File[]>([]);

  const handleStage1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (userType === "employee") {
        result = await createEmployeeStage1(telegramUsername);
      } else if (userType === "donator") {
        result = await createDonatorStage1(telegramUsername);
      } else {
        result = await createOperatorStage1(telegramUsername);
      }

      setUserId(result.userId || result.operatorId);
      setCurrentStage(2);
    } catch (err: any) {
      setError(err.message || "Failed to register username");
    } finally {
      setLoading(false);
    }
  };

  const handleStage2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userType === "employee") {
        await createEmployeeStage2(userId, stage2Data);
      } else if (userType === "donator") {
        await createDonatorStage2(userId, stage2Data);
      } else {
        // For operator, use 'name' instead of owner_name_english
        const operatorData = {
          name: stage2Data.owner_name_english,
          contact: stage2Data.contact,
          whatsapp: stage2Data.whatsapp,
          address1: stage2Data.address1,
          address2: stage2Data.address2,
          address3: stage2Data.address3,
          email: stage2Data.email,
          instagram: stage2Data.instagram,
          linkedin: stage2Data.linkedin,
          youtube: stage2Data.youtube,
          facebook: stage2Data.facebook,
          wechat: stage2Data.wechat,
          twitter: stage2Data.twitter,
          line: stage2Data.line,
          tiktok: stage2Data.tiktok,
        };
        await createOperatorStage2(userId, operatorData);
      }

      setCurrentStage(3);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStage3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userType === "operator") {
        // Operator doesn't use FormData
        await createOperatorStage3(userId, stage3Data);
      } else {
        // Employee/Donator can have videos
        const formData = new FormData();
        Object.entries(stage3Data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        videos.forEach((video) => formData.append("videos", video));

        if (userType === "employee") {
          await createEmployeeStage3(userId, formData);
        } else {
          await createDonatorStage3(userId, formData);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to complete creation");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3);
      setVideos(selectedFiles);
    }
  };

  const getUserTypeLabel = () => {
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Stage {currentStage} of 3</span>
          <span className="text-sm text-gray-500">
            {currentStage === 1 && "Username"}
            {currentStage === 2 && "Profile"}
            {currentStage === 3 && "Company"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentStage / 3) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        Create {getUserTypeLabel()} - Stage {currentStage}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Stage 1: Telegram Username */}
      {currentStage === 1 && (
        <form onSubmit={handleStage1Submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Telegram Username *
            </label>
            <input
              type="text"
              required
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="username"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be the username (without @) of a Telegram account.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Next"}
            </button>
          </div>
        </form>
      )}

      {/* Stage 2: Profile Information */}
      {currentStage === 2 && (
        <form onSubmit={handleStage2Submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {userType === "operator" ? "Name *" : "English Name *"}
              </label>
              <input
                type="text"
                required
                value={stage2Data.owner_name_english}
                onChange={(e) =>
                  setStage2Data({
                    ...stage2Data,
                    owner_name_english: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {userType !== "operator" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Chinese Name *
                </label>
                <input
                  type="text"
                  required
                  value={stage2Data.owner_name_chinese}
                  onChange={(e) =>
                    setStage2Data({
                      ...stage2Data,
                      owner_name_chinese: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={stage2Data.contact}
                onChange={(e) =>
                  setStage2Data({ ...stage2Data, contact: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="tel"
                value={stage2Data.whatsapp || ""}
                onChange={(e) =>
                  setStage2Data({ ...stage2Data, whatsapp: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={stage2Data.email || ""}
                onChange={(e) =>
                  setStage2Data({ ...stage2Data, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={stage2Data.address1 || ""}
              onChange={(e) =>
                setStage2Data({ ...stage2Data, address1: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={stage2Data.address2 || ""}
              onChange={(e) =>
                setStage2Data({ ...stage2Data, address2: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Address Line 3 (City/State)
            </label>
            <input
              type="text"
              value={stage2Data.address3 || ""}
              onChange={(e) =>
                setStage2Data({ ...stage2Data, address3: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Social Media - Collapsible */}
          <details className="border rounded p-4">
            <summary className="cursor-pointer font-medium">
              Social Media (Optional)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={stage2Data.instagram || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, instagram: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={stage2Data.linkedin || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, linkedin: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  YouTube
                </label>
                <input
                  type="text"
                  value={stage2Data.youtube || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, youtube: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Facebook
                </label>
                <input
                  type="text"
                  value={stage2Data.facebook || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, facebook: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WeChat</label>
                <input
                  type="text"
                  value={stage2Data.wechat || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, wechat: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Twitter
                </label>
                <input
                  type="text"
                  value={stage2Data.twitter || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, twitter: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Line</label>
                <input
                  type="text"
                  value={stage2Data.line || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, line: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TikTok</label>
                <input
                  type="text"
                  value={stage2Data.tiktok || ""}
                  onChange={(e) =>
                    setStage2Data({ ...stage2Data, tiktok: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </details>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStage(1)}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Next"}
            </button>
          </div>
        </form>
      )}

      {/* Stage 3: Company Information */}
      {currentStage === 3 && (
        <form onSubmit={handleStage3Submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name (English) *
              </label>
              <input
                type="text"
                required
                value={stage3Data.company_name_english}
                onChange={(e) =>
                  setStage3Data({
                    ...stage3Data,
                    company_name_english: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name (Chinese) *
              </label>
              <input
                type="text"
                required
                value={stage3Data.company_name_chinese}
                onChange={(e) =>
                  setStage3Data({
                    ...stage3Data,
                    company_name_chinese: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Designation/Job Title *
              </label>
              <input
                type="text"
                required
                value={stage3Data.designation}
                onChange={(e) =>
                  setStage3Data({ ...stage3Data, designation: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Director, Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={stage3Data.website || ""}
                onChange={(e) =>
                  setStage3Data({ ...stage3Data, website: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Company Description
            </label>
            <textarea
              value={stage3Data.description || ""}
              onChange={(e) =>
                setStage3Data({ ...stage3Data, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Telegram Link
            </label>
            <input
              type="url"
              value={stage3Data.telegram_link || ""}
              onChange={(e) =>
                setStage3Data({ ...stage3Data, telegram_link: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="https://t.me/channel"
            />
          </div>

          {/* Company Social Media */}
          <details className="border rounded p-4">
            <summary className="cursor-pointer font-medium">
              Company Social Media (Optional)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Facebook
                </label>
                <input
                  type="text"
                  value={stage3Data.facebook || ""}
                  onChange={(e) =>
                    setStage3Data({ ...stage3Data, facebook: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={stage3Data.instagram || ""}
                  onChange={(e) =>
                    setStage3Data({ ...stage3Data, instagram: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  YouTube
                </label>
                <input
                  type="text"
                  value={stage3Data.youtube || ""}
                  onChange={(e) =>
                    setStage3Data({ ...stage3Data, youtube: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={stage3Data.display_order || ""}
                  onChange={(e) =>
                    setStage3Data({
                      ...stage3Data,
                      display_order: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </details>

          {/* Video Upload (Employee/Donator only) */}
          {userType !== "operator" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Videos (Optional, max 3)
              </label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {videos.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {videos.length} video{videos.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStage(2)}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Complete"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ThreeStageCreation;
