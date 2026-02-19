import { useState } from "react";
import { EmployeeNamecard } from "../types/employeeNamecard";
import i18n from "../i18n";

interface EmployeeNamecardListProps {
  namecards: EmployeeNamecard[];
  loading: boolean;
  onEdit: (namecard: EmployeeNamecard) => void;
  onDelete: (namecard: EmployeeNamecard) => void;
}

export default function EmployeeNamecardList({
  namecards,
  loading,
  onEdit,
  onDelete,
}: EmployeeNamecardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">{i18n.t("loading")}</p>
      </div>
    );
  }

  if (namecards.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-lg font-medium">
          No employee namecards found
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Create your first employee namecard to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {namecards.map((namecard) => {
        const isOpen = expandedId === namecard._id;
        return (
          <div
            key={namecard._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Accordion Header */}
            <button
              onClick={() => setExpandedId(isOpen ? null : namecard._id)}
              className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition text-left"
            >
              <div className="flex gap-3 items-center min-w-0 flex-1">
                {namecard.profile_image ? (
                  <img
                    src={namecard.profile_image}
                    alt={namecard.name_english}
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#007cb6] text-xl font-bold">
                    {(namecard.name_english || "E").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {namecard.name_english}
                    {namecard.name_chinese ? ` · ${namecard.name_chinese}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {namecard.company_template?.company_name_english}
                    {namecard.designation ? ` · ${namecard.designation}` : ""}
                  </p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-4">
                {/* Profile media */}
                {(namecard.profile_image || namecard.profile_video) && (
                  <div className="flex justify-center">
                    {namecard.profile_image ? (
                      <img
                        src={namecard.profile_image}
                        alt={namecard.name_english}
                        className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <video
                        src={namecard.profile_video}
                        className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        controls
                      />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Name (EN)</p>
                    <p className="text-gray-600">
                      {namecard.name_english || "—"}
                    </p>
                  </div>
                  {namecard.name_chinese && (
                    <div>
                      <p className="font-medium text-gray-700">Name (ZH)</p>
                      <p className="text-gray-600">{namecard.name_chinese}</p>
                    </div>
                  )}
                  {namecard.designation && (
                    <div>
                      <p className="font-medium text-gray-700">Designation</p>
                      <p className="text-gray-600">{namecard.designation}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-700">Company</p>
                    <p className="text-gray-600">
                      {namecard.company_template?.company_name_english || "—"}
                    </p>
                  </div>
                  {namecard.chamber_template && (
                    <div>
                      <p className="font-medium text-gray-700">Chamber</p>
                      <p className="text-gray-600">
                        {namecard.chamber_template.chamber_name_english}
                      </p>
                    </div>
                  )}
                  {namecard.contact_number && (
                    <div>
                      <p className="font-medium text-gray-700">Contact</p>
                      <p className="text-gray-600">{namecard.contact_number}</p>
                    </div>
                  )}
                  {namecard.email && (
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{namecard.email}</p>
                    </div>
                  )}
                  {namecard.telegram_username && (
                    <div>
                      <p className="font-medium text-gray-700">Telegram</p>
                      <p className="text-gray-600">
                        @{namecard.telegram_username}
                      </p>
                    </div>
                  )}
                  {namecard.whatsapp_link && (
                    <div>
                      <p className="font-medium text-gray-700">WhatsApp</p>
                      <a
                        href={namecard.whatsapp_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Contact
                      </a>
                    </div>
                  )}
                  {namecard.website && (
                    <div>
                      <p className="font-medium text-gray-700">Website</p>
                      <a
                        href={namecard.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {namecard.website}
                      </a>
                    </div>
                  )}
                  {namecard.profile_url && (
                    <div>
                      <p className="font-medium text-gray-700">Profile URL</p>
                      <a
                        href={namecard.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all text-xs"
                      >
                        {namecard.profile_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Address */}
                {(namecard.address1 ||
                  namecard.address2 ||
                  namecard.address3) && (
                  <div className="pt-2 border-t border-gray-200 text-sm">
                    <p className="font-medium text-gray-700 mb-1">Address</p>
                    <p className="text-gray-600">
                      {[namecard.address1, namecard.address2, namecard.address3]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => onEdit(namecard)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(namecard)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
