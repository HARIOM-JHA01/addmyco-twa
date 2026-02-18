import { useState, useEffect } from "react";
import {
  getEmployeeNamecards,
  deleteEmployeeNamecard,
} from "../services/employeeNamecardService";
import { EmployeeNamecard } from "../types/employeeNamecard";
import EmployeeNamecardForm from "../components/EmployeeNamecardForm";
import EmployeeNamecardList from "../components/EmployeeNamecardList";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

interface EmployeeNamecardPageProps {
  isOperator?: boolean;
  enterpriseId?: string;
  leftEmployeeCredits?: number;
}

export default function EmployeeNamecardPage({
  isOperator = false,
  enterpriseId,
  leftEmployeeCredits,
}: EmployeeNamecardPageProps) {
  const [namecards, setNamecards] = useState<EmployeeNamecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNamecard, setEditingNamecard] =
    useState<EmployeeNamecard | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<EmployeeNamecard | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch namecards on mount
  useEffect(() => {
    fetchNamecards();
  }, [isOperator]);

  const fetchNamecards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeNamecards(isOperator);
      setNamecards(data);
    } catch (error: any) {
      setError(error.message || "Failed to load employee namecards");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (namecard: EmployeeNamecard) => {
    setDeleteConfirmation(namecard);
  };

  const handleConfirmDelete = async (namecard: EmployeeNamecard) => {
    try {
      setDeleteLoading(true);
      await deleteEmployeeNamecard(namecard._id, isOperator);
      setNamecards((prev) => prev.filter((nc) => nc._id !== namecard._id));
      setDeleteConfirmation(null);
      setSuccessMessage(
        `Employee namecard "${namecard.name_english}" deleted successfully`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to delete employee namecard");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingNamecard(null);
  };

  const handleFormSuccess = (namecard: EmployeeNamecard) => {
    if (editingNamecard) {
      // Update existing
      setNamecards((prev) =>
        prev.map((nc) => (nc._id === namecard._id ? namecard : nc)),
      );
      setSuccessMessage("Employee namecard updated successfully");
    } else {
      // Create new
      setNamecards((prev) => [namecard, ...prev]);
      setSuccessMessage("Employee namecard created successfully");
    }
    setShowForm(false);
    setEditingNamecard(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (namecard: EmployeeNamecard) => {
    setEditingNamecard(namecard);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="w-full">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex justify-between items-start">
              <div>{error}</div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <div className="flex justify-between items-start">
              <div>{successMessage}</div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {showForm ? (
          <div className="mb-8">
            <EmployeeNamecardForm
              isOperator={isOperator}
              editingNamecard={editingNamecard}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        ) : (
          <>
            {/* Create Button */}
            <div className="mb-8">
              <button
                onClick={() => {
                  // Check for employee credits
                  if (
                    !isOperator &&
                    typeof leftEmployeeCredits === "number" &&
                    leftEmployeeCredits <= 0
                  ) {
                    setError(
                      "You do not have employee credits remaining. Please buy employee credits before creating an employee namecard.",
                    );
                    return;
                  }
                  setEditingNamecard(null);
                  setShowForm(true);
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                + Create New Namecard
              </button>
            </div>

            {/* Namecards List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <EmployeeNamecardList
                namecards={namecards}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        namecard={deleteConfirmation}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </div>
  );
}
