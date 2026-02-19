import { useState, useEffect, useRef, useMemo } from "react";
import {
  CompanyTemplate,
  ChamberTemplate,
  CompanyTemplateFormData,
  ChamberTemplateFormData,
} from "../types/employeeNamecard";
import {
  listCompanyTemplates,
  createCompanyTemplate,
  updateCompanyTemplate,
  deleteCompanyTemplate,
  listChamberTemplates,
  createChamberTemplate,
  updateChamberTemplate,
  deleteChamberTemplate,
} from "../services/employeeNamecardService";
import VideoPlayer from "../components/VideoPlayer";

type TemplateRole = "me" | "donator" | "operator";

// ─── Simple inline delete-confirm modal ──────────────────────────────────────
function ConfirmDeleteModal({
  itemName,
  onConfirm,
  onCancel,
}: {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">Delete Template</h3>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>{itemName}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface ManageTemplatesPageProps {
  /** "donator" uses /enterprise/donator routes, "operator" uses /enterprise/operator routes, "me" uses /enterprise/me routes */
  role?: TemplateRole;
}

// ─── Blank forms ─────────────────────────────────────────────────────────────
const blankCompany = (): CompanyTemplateFormData => ({
  template_title: "",
  company_name_english: "",
  company_name_chinese: "",
  companydesignation: "",
  description: "",
  email: "",
  WhatsApp: "",
  WeChat: "",
  Line: "",
  Instagram: "",
  Facebook: "",
  Twitter: "",
  Youtube: "",
  Linkedin: "",
  SnapChat: "",
  Skype: "",
  TikTok: "",
  telegramId: "",
  contact: "",
  website: "",
  fanpage: "",
  video: "",
});

const blankChamber = (): ChamberTemplateFormData => ({
  template_title: "",
  chamber_name_english: "",
  chamber_name_chinese: "",
  chamberdesignation: "",
  detail: "",
  tgchannel: "",
  chamberfanpage: "",
  chamberwebsite: "",
  WhatsApp: "",
  WeChat: "",
  Line: "",
  Instagram: "",
  Facebook: "",
  Twitter: "",
  Youtube: "",
  Linkedin: "",
  SnapChat: "",
  Skype: "",
  TikTok: "",
  video: "",
});

// Helper: input row
const Field = ({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  required?: boolean;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
    />
  </div>
);

// Helper: file upload field (square button for video)
const FileUploadField = ({
  label,
  onFileSelect,
  videoPreviewUrl,
}: {
  label: string;
  onFileSelect: (file: File) => void;
  videoPreviewUrl?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />
      {videoPreviewUrl ? (
        <div className="w-full border-2 border-gray-300 rounded-lg overflow-hidden bg-black flex flex-col">
          <VideoPlayer
            src={videoPreviewUrl}
            autoPlay={true}
            loop={true}
            controls={true}
            playsInline={true}
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 text-sm font-medium transition"
          >
            Change Video
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#007cb6] hover:bg-blue-50 transition"
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-sm text-gray-500">Click to upload video</p>
          </div>
        </button>
      )}
    </div>
  );
};

// ─── Company Template Form ────────────────────────────────────────────────────
function CompanyTemplateForm({
  initial,
  existingVideoUrl,
  onSave,
  onCancel,
  saving,
}: {
  initial: CompanyTemplateFormData;
  existingVideoUrl?: string;
  onSave: (data: CompanyTemplateFormData, videoFile: File | null) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CompanyTemplateFormData>(initial);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Memoize video preview URL
  const videoPreviewUrl = useMemo(() => {
    if (videoFile) {
      return URL.createObjectURL(videoFile);
    }
    return undefined;
  }, [videoFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form, videoFile);
      }}
      className="space-y-4"
    >
      <Field
        label="Template Title"
        name="template_title"
        value={form.template_title}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Company Name (English)"
          name="company_name_english"
          value={form.company_name_english || ""}
          onChange={handleChange}
          required
        />
        <Field
          label="Company Name (Chinese)"
          name="company_name_chinese"
          value={form.company_name_chinese || ""}
          onChange={handleChange}
          required
        />
      </div>

      <Field
        label="Designation"
        name="companydesignation"
        value={form.companydesignation || ""}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          rows={8}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* <Field
          label="Email"
          name="email"
          value={form.email || ""}
          onChange={handleChange}
          type="email"
        /> */}
        {/* <Field
          label="Contact"
          name="contact"
          value={form.contact || ""}
          onChange={handleChange}
        />
        <Field
          label="WhatsApp"
          name="WhatsApp"
          value={form.WhatsApp || ""}
          onChange={handleChange}
        />
        <Field
          label="WeChat"
          name="WeChat"
          value={form.WeChat || ""}
          onChange={handleChange}
        />
        <Field
          label="Line"
          name="Line"
          value={form.Line || ""}
          onChange={handleChange}
        /> */}
        <Field
          label="Website"
          name="website"
          value={form.website || ""}
          onChange={handleChange}
          required
        />
        <Field
          label="Telegram ID"
          name="telegramId"
          value={form.telegramId || ""}
          onChange={handleChange}
        />
        <Field
          label="Facebook"
          name="Facebook"
          value={form.Facebook || ""}
          onChange={handleChange}
        />
        <Field
          label="Instagram"
          name="Instagram"
          value={form.Instagram || ""}
          onChange={handleChange}
        />
        <Field
          label="YouTube"
          name="Youtube"
          value={form.Youtube || ""}
          onChange={handleChange}
        />
        {/* <Field
          label="Twitter / X"
          name="Twitter"
          value={form.Twitter || ""}
          onChange={handleChange}
        />
        
        <Field
          label="LinkedIn"
          name="Linkedin"
          value={form.Linkedin || ""}
          onChange={handleChange}
        />
        <Field
          label="TikTok"
          name="TikTok"
          value={form.TikTok || ""}
          onChange={handleChange}
        />
        <Field
          label="Skype"
          name="Skype"
          value={form.Skype || ""}
          onChange={handleChange}
        />
        <Field
          label="SnapChat"
          name="SnapChat"
          value={form.SnapChat || ""}
          onChange={handleChange}
        /> */}
        {/* <Field
          label="Fanpage"
          name="fanpage"
          value={form.fanpage || ""}
          onChange={handleChange}
        /> */}
        <div>
          <FileUploadField
            label="Video (Max file size: 10MB)"
            onFileSelect={(file) => setVideoFile(file)}
            videoPreviewUrl={videoPreviewUrl}
          />
          {!videoFile && existingVideoUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Current video:</p>
              <video
                src={existingVideoUrl}
                controls
                className="w-full max-w-xs rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-[#007cb6] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#006a9e] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Chamber Template Form ────────────────────────────────────────────────────
function ChamberTemplateForm({
  initial,
  existingVideoUrl,
  onSave,
  onCancel,
  saving,
}: {
  initial: ChamberTemplateFormData;
  existingVideoUrl?: string;
  onSave: (data: ChamberTemplateFormData, videoFile: File | null) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ChamberTemplateFormData>(initial);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Memoize video preview URL
  const videoPreviewUrl = useMemo(() => {
    if (videoFile) {
      return URL.createObjectURL(videoFile);
    }
    return undefined;
  }, [videoFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form, videoFile);
      }}
      className="space-y-4"
    >
      <Field
        label="Template Title"
        name="template_title"
        value={form.template_title}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Chamber Name (English)"
          name="chamber_name_english"
          value={form.chamber_name_english || ""}
          onChange={handleChange}
          required
        />
        <Field
          label="Chamber Name (Chinese)"
          name="chamber_name_chinese"
          value={form.chamber_name_chinese || ""}
          onChange={handleChange}
          required
        />
      </div>

      <Field
        label="Designation"
        name="chamberdesignation"
        value={form.chamberdesignation || ""}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="detail"
          value={form.detail || ""}
          onChange={handleChange}
          rows={8}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007cb6]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Website"
          name="chamberwebsite"
          value={form.chamberwebsite || ""}
          onChange={handleChange}
          required
        />
        <Field
          label="Telegram Channel"
          name="tgchannel"
          value={form.tgchannel || ""}
          onChange={handleChange}
        />
        <Field
          label="Instagram"
          name="Instagram"
          value={form.Instagram || ""}
          onChange={handleChange}
        />
        <Field
          label="Facebook"
          name="Facebook"
          value={form.Facebook || ""}
          onChange={handleChange}
        />
        <Field
          label="YouTube"
          name="Youtube"
          value={form.Youtube || ""}
          onChange={handleChange}
        />
        <div>
          <FileUploadField
            label="Video (Max file size: 10MB)"
            onFileSelect={(file) => setVideoFile(file)}
            videoPreviewUrl={videoPreviewUrl}
          />
          {!videoFile && existingVideoUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Current video:</p>
              <video
                src={existingVideoUrl}
                controls
                className="w-full max-w-xs rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-[#007cb6] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#006a9e] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageTemplatesPage({
  role = "me",
}: ManageTemplatesPageProps) {
  const [tab, setTab] = useState<"company" | "chamber">("company");

  // Company state
  const [companies, setCompanies] = useState<CompanyTemplate[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [companyView, setCompanyView] = useState<"list" | "create" | "edit">(
    "list",
  );
  const [editingCompany, setEditingCompany] = useState<CompanyTemplate | null>(
    null,
  );
  const [companySaving, setCompanySaving] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(
    null,
  );
  const [showDeleteCompany, setShowDeleteCompany] =
    useState<CompanyTemplate | null>(null);

  // Chamber state
  const [chambers, setChambers] = useState<ChamberTemplate[]>([]);
  const [chamberLoading, setChamberLoading] = useState(false);
  const [chamberError, setChamberError] = useState<string | null>(null);
  const [chamberView, setChamberView] = useState<"list" | "create" | "edit">(
    "list",
  );
  const [editingChamber, setEditingChamber] = useState<ChamberTemplate | null>(
    null,
  );
  const [chamberSaving, setChamberSaving] = useState(false);
  const [deletingChamberId, setDeletingChamberId] = useState<string | null>(
    null,
  );
  const [showDeleteChamber, setShowDeleteChamber] =
    useState<ChamberTemplate | null>(null);

  // Accordion state
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(
    null,
  );
  const [expandedChamberId, setExpandedChamberId] = useState<string | null>(
    null,
  );

  const formRef = useRef<HTMLDivElement>(null);

  // ─── Loaders ────────────────────────────────────────────────────────────────
  const loadCompanies = async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const data = await listCompanyTemplates(role);
      setCompanies(data);
    } catch (e: any) {
      setCompanyError(e.message || "Failed to load company templates");
    } finally {
      setCompanyLoading(false);
    }
  };

  const loadChambers = async () => {
    setChamberLoading(true);
    setChamberError(null);
    try {
      const data = await listChamberTemplates(role);
      setChambers(data);
    } catch (e: any) {
      setChamberError(e.message || "Failed to load chamber templates");
    } finally {
      setChamberLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadChambers();
  }, [role]);

  // Scroll form into view when switching to create/edit
  useEffect(() => {
    if (companyView !== "list" || chamberView !== "list") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [companyView, chamberView]);

  // ─── Company Handlers ────────────────────────────────────────────────────────
  const handleSaveCompany = async (
    data: CompanyTemplateFormData,
    videoFile: File | null,
  ) => {
    setCompanySaving(true);
    try {
      if (editingCompany) {
        const updated = await updateCompanyTemplate(
          editingCompany._id,
          data,
          undefined,
          videoFile ?? undefined,
          role,
        );
        setCompanies((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      } else {
        const created = await createCompanyTemplate(
          data,
          undefined,
          videoFile ?? undefined,
          role,
        );
        setCompanies((prev) => [created, ...prev]);
      }
      setCompanyView("list");
      setEditingCompany(null);
    } catch (e: any) {
      alert(e.message || "Failed to save company template");
    } finally {
      setCompanySaving(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    setDeletingCompanyId(id);
    try {
      await deleteCompanyTemplate(id, role);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete company template");
    } finally {
      setDeletingCompanyId(null);
      setShowDeleteCompany(null);
    }
  };

  // ─── Chamber Handlers ─────────────────────────────────────────────────────────
  const handleSaveChamber = async (
    data: ChamberTemplateFormData,
    videoFile: File | null,
  ) => {
    setChamberSaving(true);
    try {
      if (editingChamber) {
        const updated = await updateChamberTemplate(
          editingChamber._id,
          data,
          undefined,
          videoFile ?? undefined,
          role,
        );
        setChambers((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c)),
        );
      } else {
        const created = await createChamberTemplate(
          data,
          undefined,
          videoFile ?? undefined,
          role,
        );
        setChambers((prev) => [created, ...prev]);
      }
      setChamberView("list");
      setEditingChamber(null);
    } catch (e: any) {
      alert(e.message || "Failed to save chamber template");
    } finally {
      setChamberSaving(false);
    }
  };

  const handleDeleteChamber = async (id: string) => {
    setDeletingChamberId(id);
    try {
      await deleteChamberTemplate(id, role);
      setChambers((prev) => prev.filter((c) => c._id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete chamber template");
    } finally {
      setDeletingChamberId(null);
      setShowDeleteChamber(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setTab("company");
            setCompanyView("list");
            setEditingCompany(null);
          }}
          className={`px-5 py-2.5 text-sm font-medium transition ${
            tab === "company"
              ? "border-b-2 border-[#007cb6] text-[#007cb6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Company Templates ({companies.length})
        </button>
        <button
          onClick={() => {
            setTab("chamber");
            setChamberView("list");
            setEditingChamber(null);
          }}
          className={`px-5 py-2.5 text-sm font-medium transition ${
            tab === "chamber"
              ? "border-b-2 border-[#007cb6] text-[#007cb6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Chamber Templates ({chambers.length})
        </button>
      </div>

      {/* ── Company Tab ── */}
      {tab === "company" && (
        <div>
          {/* Header */}
          {companyView === "list" && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Company Templates
              </h3>
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setCompanyView("create");
                }}
                className="flex items-center gap-1 bg-[#007cb6] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#006a9e] transition"
              >
                <span className="text-lg leading-none">+</span> New Template
              </button>
            </div>
          )}

          {/* Form */}
          {(companyView === "create" || companyView === "edit") && (
            <div
              ref={formRef}
              className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  {companyView === "create"
                    ? "Create Company Template"
                    : "Edit Company Template"}
                </h3>
                <button
                  onClick={() => {
                    setCompanyView("list");
                    setEditingCompany(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <CompanyTemplateForm
                initial={
                  editingCompany
                    ? {
                        template_title: editingCompany.template_title || "",
                        company_name_english:
                          editingCompany.company_name_english || "",
                        company_name_chinese:
                          editingCompany.company_name_chinese || "",
                        companydesignation:
                          editingCompany.companydesignation || "",
                        description: editingCompany.description || "",
                        email: editingCompany.email || "",
                        WhatsApp: editingCompany.WhatsApp || "",
                        WeChat: editingCompany.WeChat || "",
                        Line: editingCompany.Line || "",
                        Instagram: editingCompany.Instagram || "",
                        Facebook: editingCompany.Facebook || "",
                        Twitter: editingCompany.Twitter || "",
                        Youtube: editingCompany.Youtube || "",
                        Linkedin: editingCompany.Linkedin || "",
                        SnapChat: editingCompany.SnapChat || "",
                        Skype: editingCompany.Skype || "",
                        TikTok: editingCompany.TikTok || "",
                        telegramId: editingCompany.telegramId || "",
                        contact: editingCompany.contact || "",
                        website: editingCompany.website || "",
                        fanpage: editingCompany.fanpage || "",
                        video: editingCompany.video || "",
                      }
                    : blankCompany()
                }
                existingVideoUrl={editingCompany?.video || undefined}
                onSave={handleSaveCompany}
                onCancel={() => {
                  setCompanyView("list");
                  setEditingCompany(null);
                }}
                saving={companySaving}
              />
            </div>
          )}

          {/* List */}
          {companyView === "list" && (
            <>
              {companyLoading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007cb6]" />
                </div>
              )}
              {companyError && (
                <div className="text-center py-8 text-red-500 text-sm">
                  {companyError}
                </div>
              )}
              {!companyLoading && !companyError && companies.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="mb-3 text-sm">No company templates yet.</p>
                  <button
                    onClick={() => setCompanyView("create")}
                    className="text-[#007cb6] text-sm underline"
                  >
                    Create your first template
                  </button>
                </div>
              )}
              {!companyLoading && companies.length > 0 && (
                <div className="space-y-2">
                  {companies.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() =>
                          setExpandedCompanyId(
                            expandedCompanyId === tpl._id ? null : tpl._id,
                          )
                        }
                        className="w-full px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 transition text-left"
                      >
                        <div className="flex gap-3 items-start min-w-0 flex-1">
                          {tpl.image ? (
                            <img
                              src={tpl.image}
                              alt={tpl.template_title}
                              className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#007cb6] text-xl font-bold">
                              {(
                                tpl.template_title ||
                                tpl.company_name_english ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {tpl.template_title || "(No title)"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {tpl.company_name_english}
                              {tpl.company_name_chinese
                                ? ` · ${tpl.company_name_chinese}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            expandedCompanyId === tpl._id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>

                      {/* Accordion Content */}
                      {expandedCompanyId === tpl._id && (
                        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">
                                Designation
                              </p>
                              <p className="text-gray-600">
                                {tpl.companydesignation || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="font-medium text-gray-700">
                                Website
                              </p>
                              <p className="text-gray-600">
                                {tpl.website || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="font-medium text-gray-700">
                                Telegram
                              </p>
                              <p className="text-gray-600">
                                {tpl.telegramId || "—"}
                              </p>
                            </div>
                          </div>

                          {/* Social Media Links */}
                          <div>
                            <p className="font-medium text-gray-700 mb-2">
                              Social Media
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              {[
                                { key: "WhatsApp", val: tpl.WhatsApp },
                                { key: "WeChat", val: tpl.WeChat },
                                { key: "Line", val: tpl.Line },
                                { key: "Instagram", val: tpl.Instagram },
                                { key: "Facebook", val: tpl.Facebook },
                                { key: "Twitter", val: tpl.Twitter },
                                { key: "Youtube", val: tpl.Youtube },
                                { key: "Linkedin", val: tpl.Linkedin },
                                { key: "TikTok", val: tpl.TikTok },
                                { key: "Skype", val: tpl.Skype },
                                { key: "SnapChat", val: tpl.SnapChat },
                              ]
                                .filter((item) => item.val)
                                .map((item) => (
                                  <span
                                    key={item.key}
                                    className="bg-white px-2 py-1 rounded text-gray-600"
                                  >
                                    {item.key}: {item.val}
                                  </span>
                                ))}
                            </div>
                          </div>

                          {/* Description */}
                          {tpl.description && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">
                                Description
                              </p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {tpl.description}
                              </p>
                            </div>
                          )}

                          {/* Image Preview */}
                          {tpl.image && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">
                                Image
                              </p>
                              <img
                                src={tpl.image}
                                alt="Template"
                                className="max-w-xs h-auto rounded-lg border border-gray-300"
                              />
                            </div>
                          )}

                          {/* Video Preview */}
                          {tpl.video && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">
                                Video
                              </p>
                              <video
                                src={tpl.video}
                                controls
                                className="max-w-xs h-auto rounded-lg border border-gray-300"
                              />
                            </div>
                          )}

                          {/* Owner Type */}
                          {tpl.owner_type && (
                            <div className="flex gap-2 pt-2">
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                                  tpl.owner_type === "enterprise"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {tpl.owner_type}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setEditingCompany(tpl);
                                setCompanyView("edit");
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-[#007cb6] hover:bg-[#006a9e] text-white rounded-lg transition font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteCompany(tpl)}
                              disabled={deletingCompanyId === tpl._id}
                              className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition font-medium disabled:opacity-50"
                            >
                              {deletingCompanyId === tpl._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Chamber Tab ── */}
      {tab === "chamber" && (
        <div>
          {/* Header */}
          {chamberView === "list" && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Chamber Templates
              </h3>
              <button
                onClick={() => {
                  setEditingChamber(null);
                  setChamberView("create");
                }}
                className="flex items-center gap-1 bg-[#007cb6] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#006a9e] transition"
              >
                <span className="text-lg leading-none">+</span> New Template
              </button>
            </div>
          )}

          {/* Form */}
          {(chamberView === "create" || chamberView === "edit") && (
            <div
              ref={formRef}
              className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">
                  {chamberView === "create"
                    ? "Create Chamber Template"
                    : "Edit Chamber Template"}
                </h3>
                <button
                  onClick={() => {
                    setChamberView("list");
                    setEditingChamber(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <ChamberTemplateForm
                initial={
                  editingChamber
                    ? {
                        template_title: editingChamber.template_title || "",
                        chamber_name_english:
                          editingChamber.chamber_name_english || "",
                        chamber_name_chinese:
                          editingChamber.chamber_name_chinese || "",
                        chamberdesignation:
                          editingChamber.chamberdesignation || "",
                        detail: editingChamber.detail || "",
                        tgchannel: editingChamber.tgchannel || "",
                        chamberfanpage: editingChamber.chamberfanpage || "",
                        chamberwebsite: editingChamber.chamberwebsite || "",
                        WhatsApp: editingChamber.WhatsApp || "",
                        WeChat: editingChamber.WeChat || "",
                        Line: editingChamber.Line || "",
                        Instagram: editingChamber.Instagram || "",
                        Facebook: editingChamber.Facebook || "",
                        Twitter: editingChamber.Twitter || "",
                        Youtube: editingChamber.Youtube || "",
                        Linkedin: editingChamber.Linkedin || "",
                        SnapChat: editingChamber.SnapChat || "",
                        Skype: editingChamber.Skype || "",
                        TikTok: editingChamber.TikTok || "",
                        video: editingChamber.video || "",
                      }
                    : blankChamber()
                }
                existingVideoUrl={editingChamber?.video || undefined}
                onSave={handleSaveChamber}
                onCancel={() => {
                  setChamberView("list");
                  setEditingChamber(null);
                }}
                saving={chamberSaving}
              />
            </div>
          )}

          {/* List */}
          {chamberView === "list" && (
            <>
              {chamberLoading && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007cb6]" />
                </div>
              )}
              {chamberError && (
                <div className="text-center py-8 text-red-500 text-sm">
                  {chamberError}
                </div>
              )}
              {!chamberLoading && !chamberError && chambers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="mb-3 text-sm">No chamber templates yet.</p>
                  <button
                    onClick={() => setChamberView("create")}
                    className="text-[#007cb6] text-sm underline"
                  >
                    Create your first template
                  </button>
                </div>
              )}
              {!chamberLoading && chambers.length > 0 && (
                <div className="space-y-2">
                  {chambers.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() =>
                          setExpandedChamberId(
                            expandedChamberId === tpl._id ? null : tpl._id,
                          )
                        }
                        className="w-full px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 transition text-left"
                      >
                        <div className="flex gap-3 items-start min-w-0 flex-1">
                          {tpl.image ? (
                            <img
                              src={tpl.image}
                              alt={tpl.template_title}
                              className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600 text-xl font-bold">
                              {(
                                tpl.template_title ||
                                tpl.chamber_name_english ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {tpl.template_title || "(No title)"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {tpl.chamber_name_english}
                              {tpl.chamber_name_chinese
                                ? ` · ${tpl.chamber_name_chinese}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            expandedChamberId === tpl._id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>

                      {/* Accordion Content */}
                      {expandedChamberId === tpl._id && (
                        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">
                                Designation
                              </p>
                              <p className="text-gray-600">
                                {tpl.chamberdesignation || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">
                                Website
                              </p>
                              <p className="text-gray-600">
                                {tpl.chamberwebsite || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="font-medium text-gray-700">
                                TG Channel
                              </p>
                              <p className="text-gray-600">
                                {tpl.tgchannel || "—"}
                              </p>
                            </div>
                          </div>

                          {/* Social Media Links */}
                          <div>
                            <p className="font-medium text-gray-700 mb-2">
                              Social Media
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              {[
                                { key: "WhatsApp", val: tpl.WhatsApp },
                                { key: "WeChat", val: tpl.WeChat },
                                { key: "Line", val: tpl.Line },
                                { key: "Instagram", val: tpl.Instagram },
                                { key: "Facebook", val: tpl.Facebook },
                                { key: "Twitter", val: tpl.Twitter },
                                { key: "Youtube", val: tpl.Youtube },
                                { key: "Linkedin", val: tpl.Linkedin },
                                { key: "TikTok", val: tpl.TikTok },
                                { key: "Skype", val: tpl.Skype },
                                { key: "SnapChat", val: tpl.SnapChat },
                              ]
                                .filter((item) => item.val)
                                .map((item) => (
                                  <span
                                    key={item.key}
                                    className="bg-white px-2 py-1 rounded text-gray-600"
                                  >
                                    {item.key}: {item.val}
                                  </span>
                                ))}
                            </div>
                          </div>

                          {/* Description */}
                          {tpl.detail && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">
                                Details
                              </p>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {tpl.detail}
                              </p>
                            </div>
                          )}

                          {/* Image Preview */}
                          {tpl.image && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">
                                Image
                              </p>
                              <img
                                src={tpl.image}
                                alt="Template"
                                className="max-w-xs h-auto rounded-lg border border-gray-300"
                              />
                            </div>
                          )}

                          {/* Video Preview */}
                          {tpl.video && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2">
                                Video
                              </p>
                              <video
                                src={tpl.video}
                                controls
                                className="max-w-xs h-auto rounded-lg border border-gray-300"
                              />
                            </div>
                          )}

                          {/* Owner Type */}
                          {tpl.owner_type && (
                            <div className="flex gap-2 pt-2">
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                                  tpl.owner_type === "enterprise"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {tpl.owner_type}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setEditingChamber(tpl);
                                setChamberView("edit");
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-[#007cb6] hover:bg-[#006a9e] text-white rounded-lg transition font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteChamber(tpl)}
                              disabled={deletingChamberId === tpl._id}
                              className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition font-medium disabled:opacity-50"
                            >
                              {deletingChamberId === tpl._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete confirmation modals */}
      {showDeleteCompany && (
        <ConfirmDeleteModal
          itemName={
            showDeleteCompany.template_title ||
            showDeleteCompany.company_name_english ||
            "this template"
          }
          onConfirm={() => handleDeleteCompany(showDeleteCompany._id)}
          onCancel={() => setShowDeleteCompany(null)}
        />
      )}
      {showDeleteChamber && (
        <ConfirmDeleteModal
          itemName={
            showDeleteChamber.template_title ||
            showDeleteChamber.chamber_name_english ||
            "this template"
          }
          onConfirm={() => handleDeleteChamber(showDeleteChamber._id)}
          onCancel={() => setShowDeleteChamber(null)}
        />
      )}
    </div>
  );
}
