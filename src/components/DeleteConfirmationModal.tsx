import { EmployeeNamecard } from "../types/employeeNamecard";

interface DeleteConfirmationModalProps {
  namecard: EmployeeNamecard | null;
  loading: boolean;
  onConfirm: (namecard: EmployeeNamecard) => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  namecard,
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!namecard) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Delete Employee Namecard
          </h3>

          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the namecard for{" "}
            <strong>{namecard.name_english}</strong>? This action cannot be
            undone.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Employee:</strong> {namecard.name_english} (
              {namecard.name_chinese})
            </p>
            <p className="text-sm text-blue-800">
              <strong>Company:</strong>{" "}
              {namecard.company_template?.company_name_english}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(namecard)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
