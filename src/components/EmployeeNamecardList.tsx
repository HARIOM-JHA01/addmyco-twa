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
    <div className="space-y-4">
      {namecards.map((namecard) => (
        <div
          key={namecard._id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image/Video */}
            <div className="flex-shrink-0">
              {namecard.profile_image ? (
                <img
                  src={namecard.profile_image}
                  alt={namecard.name_english}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
              ) : namecard.profile_video ? (
                <video
                  src={namecard.profile_video}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                ></video>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Namecard Information */}
            <div className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {namecard.name_english}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {namecard.name_chinese}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">
                        Company:
                      </span>{" "}
                      {namecard.company_template?.company_name_english}
                    </p>
                    {namecard.chamber_template && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Chamber:
                        </span>{" "}
                        {namecard.chamber_template.chamber_name_english}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-gray-700">
                        Contact:
                      </span>{" "}
                      {namecard.contact_number}
                    </p>
                  </div>
                </div>

                {/* Right Column - Social Links */}
                <div>
                  <div className="space-y-2 text-sm">
                    {namecard.telegram_username && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Telegram:
                        </span>{" "}
                        @{namecard.telegram_username}
                      </p>
                    )}
                    {namecard.email && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Email:
                        </span>{" "}
                        {namecard.email}
                      </p>
                    )}
                    {namecard.whatsapp_link && (
                      <p>
                        <span className="font-medium text-gray-700">
                          WhatsApp:
                        </span>{" "}
                        <a
                          href={namecard.whatsapp_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Contact
                        </a>
                      </p>
                    )}
                    {namecard.website && (
                      <p>
                        <span className="font-medium text-gray-700">
                          Website:
                        </span>{" "}
                        <a
                          href={namecard.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span>{" "}
                  {namecard.address1}, {namecard.address2}, {namecard.address3}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(namecard)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(namecard)}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
