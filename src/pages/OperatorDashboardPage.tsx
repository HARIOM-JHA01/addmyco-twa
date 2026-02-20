import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EmployeeNamecardForm from "../components/EmployeeNamecardForm";
import ManageTemplatesPage from "./ManageTemplatesPage";
import {
  getOperatorProfile,
  getOperatorCredits,
  getOperatorDetails,
} from "../services/enterpriseService";
import type { OperatorCredits } from "../types/enterprise";
import WebApp from "@twa-dev/sdk";

interface OperatorProfile {
  _id: string;
  tgid: string;
  creditsAllocated: number;
  enterpriseId: string;
  createdAt: string;
}

interface Employee {
  _id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  createdAt: string;
  membertype?: string;
}

export default function OperatorDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [credits, setCredits] = useState<OperatorCredits | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "employees" | "create-employee" | "manage-templates"
  >("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  useEffect(() => {
    fetchOperatorData();
  }, []);

  const fetchOperatorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login.");
        navigate("/");
        return;
      }

      // Fetch operator profile and credits
      const [profileData, creditsData] = await Promise.all([
        getOperatorProfile(),
        getOperatorCredits(),
      ]);

      setProfile(profileData as any);
      setCredits(creditsData as any);

      // Fetch employees created by this operator
      if (profileData._id) {
        try {
          const details = await getOperatorDetails(profileData._id);
          setEmployees(details?.employees || []);
        } catch (err) {
          console.error("Failed to fetch employees:", err);
          setEmployees([]);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch operator data:", err);
      setError(err?.message || "Failed to load operator dashboard");
      // If not authenticated, redirect to welcome page
      if (
        err?.message?.includes("authenticate") ||
        err?.message?.includes("token")
      ) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreationSuccess = async () => {
    await fetchOperatorData();
    setShowEmployeeForm(false);
    setActiveTab("employees");
  };

  const handleCreationCancel = () => {
    setShowEmployeeForm(false);
    setActiveTab("overview");
  };

  const handleLogout = () => {
    // Clear authentication token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    // Redirect to home/welcome page
    WebApp.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading operator dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {/* Page Title with Hamburger Menu */}
        <div className="bg-[#005f8e] border border-gray-200 rounded-lg shadow-md p-4 mb-6 relative">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white text-center flex-1">
              {activeTab === "overview"
                ? "Operator Dashboard"
                : activeTab === "employees"
                  ? "Employees"
                  : activeTab === "create-employee"
                    ? "Create Employee"
                    : "Manage Templates"}
            </h1>
            <button
              className="text-white hover:bg-[#004570] p-2 rounded transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Hamburger Menu Dropdown */}
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-[#007cb6] bg-opacity-90 rounded-lg shadow-lg z-50 min-w-max">
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition first:rounded-t-lg"
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab("employees");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
              >
                Employees ({employees.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("create-employee");
                  setShowEmployeeForm(true);
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
              >
                Create Employee
              </button>
              <button
                onClick={() => {
                  setActiveTab("manage-templates");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
              >
                Manage Templates
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-red-700 transition last:rounded-b-lg border-t border-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#007cb6] via-[#005f8e] to-[#004570] rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                <p className="text-blue-100">
                  Manage your team and create amazing profiles
                </p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Your Profile
                </h2>
                <div className="w-12 h-12 bg-gradient-to-br from-[#007cb6] to-[#005f8e] rounded-lg flex items-center justify-center text-white text-lg font-bold">
                  {(profile?.tgid || "O").charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-[#007cb6]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                      Username
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {profile?.tgid}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                      Member Since
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits Card */}
            <div className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-xl shadow-md p-8 border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 opacity-30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Available Credits
                  </h2>
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center py-6">
                  <p className="text-sm text-gray-600 mb-3 font-semibold">
                    Employee Credits
                  </p>
                  <p className="text-7xl font-bold text-green-600">
                    {credits?.credits || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-4 italic">
                    Ready to create amazing team members
                  </p>
                </div>
                {(credits?.credits || 0) === 0 && (
                  <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-sm text-yellow-800 font-medium flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    You do not have credits to create employee namecards.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
              <h2 className="text-xl font-bold text-gray-800">
                Employees Created
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Total:{" "}
                <span className="font-bold text-blue-600">
                  {employees.length}
                </span>{" "}
                employees
              </p>
            </div>
            <div className="overflow-x-auto">
              {employees.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 006-6V4a6 6 0 00-6-6H6a6 6 0 00-6 6v10a6 6 0 006 6z"
                    />
                  </svg>
                  <p className="mb-4 font-medium">No employees created yet</p>
                  <button
                    onClick={() => setActiveTab("create-employee")}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline"
                  >
                    Create your first employee
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        English Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="hover:bg-blue-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {employee.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {employee.firstname || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                              employee.membertype === "premium"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {employee.membertype || "free"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {employee.createdAt
                            ? new Date(employee.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Create Employee Tab */}
        {activeTab === "create-employee" && !showEmployeeForm && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <button
              onClick={() => setShowEmployeeForm(true)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              + Create New Employee
            </button>
          </div>
        )}

        {/* Create Employee Form */}
        {activeTab === "create-employee" && showEmployeeForm && (
          <EmployeeNamecardForm
            isOperator={true}
            availableCredits={credits?.credits || 0}
            onSuccess={handleCreationSuccess}
            onCancel={handleCreationCancel}
          />
        )}

        {/* Manage Templates Tab */}
        {activeTab === "manage-templates" && (
          <ManageTemplatesPage role="operator" />
        )}
      </main>
    </div>
  );
}
