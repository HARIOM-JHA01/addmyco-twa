import { useState, useEffect } from "react";
import {
  getCompanyTemplates,
  getChamberTemplates,
  createEmployeeNamecard,
  updateEmployeeNamecard,
} from "../services/employeeNamecardService";
import {
  CompanyTemplate,
  ChamberTemplate,
  EmployeeNamecard,
  EmployeeNamecardFormData,
} from "../types/employeeNamecard";
import i18n from "../i18n";

interface EmployeeNamecardFormProps {
  isOperator?: boolean;
  editingNamecard?: EmployeeNamecard | null;
  availableCredits?: number;
  onSuccess: (namecard: EmployeeNamecard) => void;
  onCancel: () => void;
}

export default function EmployeeNamecardForm({
  isOperator = false,
  editingNamecard = null,
  availableCredits = 0,
  onSuccess,
  onCancel,
}: EmployeeNamecardFormProps) {
  const [formData, setFormData] = useState<EmployeeNamecardFormData>({
    name_english: editingNamecard?.name_english || "",
    name_chinese: editingNamecard?.name_chinese || "",
    telegram_username: editingNamecard?.telegram_username || "",
    contact_number: editingNamecard?.contact_number || "",
    address1: editingNamecard?.address1 || "",
    address2: editingNamecard?.address2 || "",
    address3: editingNamecard?.address3 || "",
    whatsapp_link: editingNamecard?.whatsapp_link || "",
    email: editingNamecard?.email || "",
    facebook: editingNamecard?.facebook || "",
    instagram: editingNamecard?.instagram || "",
    x_twitter: editingNamecard?.x_twitter || "",
    line: editingNamecard?.line || "",
    youtube: editingNamecard?.youtube || "",
    website: editingNamecard?.website || "",
    company_template_id: editingNamecard?.company_template?._id || "",
    chamber_template_id: editingNamecard?.chamber_template?._id || "",
  });

  const [companies, setCompanies] = useState<CompanyTemplate[]>([]);
  const [chambers, setChambers] = useState<ChamberTemplate[]>([]);
  const [profileMedia, setProfileMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const [companyData, chamberData] = await Promise.all([
          getCompanyTemplates(isOperator),
          getChamberTemplates(isOperator),
        ]);
        setCompanies(companyData);
        setChambers(chamberData);
      } catch (error: any) {
        setErrors({
          submit: error.message || "Failed to load templates",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [isOperator]);

  // Set existing media preview (image OR video)
  useEffect(() => {
    if (editingNamecard?.profile_image) {
      setMediaPreview(editingNamecard.profile_image);
      setMediaType("image");
    } else if (editingNamecard?.profile_video) {
      setMediaPreview(editingNamecard.profile_video);
      setMediaType("video");
    } else {
      setMediaPreview("");
      setMediaType(null);
    }
  }, [editingNamecard]);

  // Revoke blob URL previews when they change/unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (mediaPreview && mediaPreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(mediaPreview);
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, [mediaPreview]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileMedia(file);

    // determine type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (isImage) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = (event) =>
        setMediaPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    } else if (isVideo) {
      setMediaType("video");
      // use object URL for local video preview
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    } else {
      setMediaType(null);
      setMediaPreview("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.name_english)
      newErrors.name_english = "Full name (English) is required";
    if (!formData.name_chinese)
      newErrors.name_chinese = "Full name (Chinese) is required";
    if (!formData.telegram_username)
      newErrors.telegram_username = "Telegram username is required";
    if (!formData.contact_number)
      newErrors.contact_number = "Contact number is required";
    if (!formData.address1) newErrors.address1 = "Address 1 is required";
    if (!formData.address2) newErrors.address2 = "Address 2 is required";
    if (!formData.address3) newErrors.address3 = "Address 3 is required";
    if (!formData.whatsapp_link)
      newErrors.whatsapp_link = "WhatsApp link is required";
    if (!formData.company_template_id)
      newErrors.company_template_id = "Company template is required";

    // File validation (only for create, not edit)
    if (!editingNamecard && !profileMedia) {
      newErrors.files = "Please upload at least one profile image or video";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      let result: EmployeeNamecard;

      if (editingNamecard) {
        // Update existing namecard
        const fileImage =
          mediaType === "image" ? profileMedia || undefined : undefined;
        const fileVideo =
          mediaType === "video" ? profileMedia || undefined : undefined;
        result = await updateEmployeeNamecard(
          editingNamecard._id,
          formData,
          fileImage,
          fileVideo,
          isOperator,
        );
      } else {
        // Create new namecard
        const fileImage =
          mediaType === "image" ? profileMedia || undefined : undefined;
        const fileVideo =
          mediaType === "video" ? profileMedia || undefined : undefined;
        result = await createEmployeeNamecard(
          formData,
          fileImage,
          fileVideo,
          isOperator,
        );
      }

      onSuccess(result);
    } catch (error: any) {
      setErrors({
        submit: error.message || "Failed to save namecard",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">{i18n.t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center underline">
        {editingNamecard
          ? "Edit Employee Namecard"
          : "Create Employee Namecard"}
      </h2>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {errors.submit}
        </div>
      )}

      {isOperator && !editingNamecard && availableCredits === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-400 rounded-lg text-sm text-yellow-800 font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          You do not have any credits to create employee namecards.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Basic Information Section */}
        <div className="border-b pb-4 md:pb-6 text-blue-500">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
            Personal Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Full Name (English) *
              </label>
              <input
                type="text"
                name="name_english"
                value={formData.name_english}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name_english ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name_english && (
                <span className="text-red-500 text-xs">
                  {errors.name_english}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Full Name (Chinese) *
              </label>
              <input
                type="text"
                name="name_chinese"
                value={formData.name_chinese}
                onChange={handleInputChange}
                placeholder="e.g., 约翰·多"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name_chinese ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name_chinese && (
                <span className="text-red-500 text-xs">
                  {errors.name_chinese}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Telegram Username *( Required to log in to adddmy)
              </label>
              <input
                type="text"
                name="telegram_username"
                value={formData.telegram_username}
                onChange={handleInputChange}
                placeholder="without @ e.g., john_doe_123"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telegram_username
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.telegram_username && (
                <span className="text-red-500 text-xs">
                  {errors.telegram_username}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                placeholder="e.g., 6598765432"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contact_number ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.contact_number && (
                <span className="text-red-500 text-xs">
                  {errors.contact_number}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="border-b pb-4 md:pb-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Address 1 *
              </label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                placeholder="e.g., Block 123 Main Street"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address1 ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address1 && (
                <span className="text-red-500 text-xs">{errors.address1}</span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Address 2 *
              </label>
              <input
                type="text"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                placeholder="e.g., Unit 456"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address2 ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address2 && (
                <span className="text-red-500 text-xs">{errors.address2}</span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Address 3 *
              </label>
              <input
                type="text"
                name="address3"
                value={formData.address3}
                onChange={handleInputChange}
                placeholder="e.g., Singapore 123456"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address3 ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address3 && (
                <span className="text-red-500 text-xs">{errors.address3}</span>
              )}
            </div>
          </div>
        </div>

        {/* Social & Contact Section */}
        <div className="border-b pb-4 md:pb-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
            Social Media & Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                WhatsApp Link *
              </label>
              <input
                type="url"
                name="whatsapp_link"
                value={formData.whatsapp_link}
                onChange={handleInputChange}
                placeholder="e.g., https://wa.me/6598765432"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.whatsapp_link ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.whatsapp_link && (
                <span className="text-red-500 text-xs">
                  {errors.whatsapp_link}
                </span>
              )}
            </div>
            <p className="text-xl text-gray-500 mt-1 text-center">
              Below are optional fields
            </p>
            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/johndoe"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/johndoe"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                X/Twitter
              </label>
              <input
                type="url"
                name="x_twitter"
                value={formData.x_twitter}
                onChange={handleInputChange}
                placeholder="https://x.com/johndoe"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                LINE
              </label>
              <input
                type="url"
                name="line"
                value={formData.line}
                onChange={handleInputChange}
                placeholder="https://line.me/ti/p/your-line-id"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                YouTube
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleInputChange}
                placeholder="https://youtube.com/@johndoe"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://johndoe.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Media Upload Section */}
        <div className="border-b pb-4 md:pb-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
            Profile Image/video
          </h3>
          {errors.files && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs md:text-sm">
              {errors.files}
            </div>
          )}
          <div className="flex justify-center mb-4">
            <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 relative flex items-center justify-center">
              {mediaPreview ? (
                mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                )
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-1"
                  >
                    <path
                      d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 14l2.5-3 2 2.5L16 9l4 5H8z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-xs">Upload image or video</div>
                </div>
              )}

              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Template Selection Section */}
        <div className="border-b pb-4 md:pb-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
            Company & Chamber
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Company Template *
              </label>
              <select
                name="company_template_id"
                value={formData.company_template_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company_template_id
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a company template</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.template_title}
                  </option>
                ))}
              </select>
              {errors.company_template_id && (
                <span className="text-red-500 text-xs">
                  {errors.company_template_id}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-blue-500 mb-1">
                Chamber Template (Optional)
              </label>
              <select
                name="chamber_template_id"
                value={formData.chamber_template_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a chamber template</option>
                {chambers.map((chamber) => (
                  <option key={chamber._id} value={chamber._id}>
                    {chamber.template_title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              (isOperator && !editingNamecard && availableCredits === 0)
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {submitting
              ? "Saving..."
              : editingNamecard
                ? "Update Namecard"
                : "Create Namecard"}
          </button>
        </div>
      </form>
    </div>
  );
}
