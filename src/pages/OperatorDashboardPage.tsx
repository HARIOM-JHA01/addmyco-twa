import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  getOperatorProfile,
  getOperatorCredits,
  getOperatorDetails,
  createEmployee,
  operatorLogout,
} from "../services/donatorService";
import WebApp from "@twa-dev/sdk";

interface OperatorProfile {
  _id: string;
  tgid: string;
  creditsAllocated: number;
  donatorId: string;
  createdAt: string;
}

interface OperatorCredits {
  employeeCredits: number;
  slotsUsed: number;
  remainingSlots: number;
}

interface Employee {
  _id: string;
  telegram_username: string;
  owner_name_english?: string;
  owner_name_chinese?: string;
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
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "create">("overview");
  
  // Create employee form state
  const [createEmployeeForm, setCreateEmployeeForm] = useState({
    employeeTgid: "",
    employeeName: "",
    employeeEmail: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

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
      if (err?.message?.includes("authenticate") || err?.message?.includes("token")) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      WebApp.showPopup(
        {
          title: "Confirm Logout",
          message: "Are you sure you want to logout?",
          buttons: [
            { id: "cancel", type: "cancel" },
            { id: "logout", type: "destructive", text: "Logout" },
          ],
        },
        (buttonId) => {
          if (buttonId === "logout") {
            operatorLogout();
            navigate("/");
          }
        }
      );
    } catch {
      // Fallback if WebApp popup fails
      if (window.confirm("Are you sure you want to logout?")) {
        operatorLogout();
        navigate("/");
      }
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const result = await createEmployee({
        employeeTgid: createEmployeeForm.employeeTgid.trim(),
        employeeName: createEmployeeForm.employeeName.trim(),
        employeeEmail: createEmployeeForm.employeeEmail.trim() || undefined,
      });
      setCreateSuccess(`Employee created successfully! Username: ${result.username}`);
      
      // Reset form
      setCreateEmployeeForm({
        employeeTgid: "",
        employeeName: "",
        employeeEmail: "",
      });

      // Refresh data
      await fetchOperatorData();

      // Switch to employees tab
      setTimeout(() => {
        setActiveTab("employees");
        setCreateSuccess(null);
      }, 2000);
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create employee");
      console.error("Create employee error:", err);
    } finally {
      setCreateLoading(false);
    }
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
        <Footer />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Operator Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "employees"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "create"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Create Employee
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Operator Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Telegram ID</p>
                  <p className="font-medium">{profile?.tgid}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Operator ID</p>
                  <p className="font-mono text-sm">{profile?._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Credits Allocated</p>
                  <p className="font-medium text-2xl text-blue-600">{profile?.creditsAllocated || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Credits Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Credits & Slots</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Available Credits</p>
                  <p className="text-3xl font-bold text-green-600">{credits?.employeeCredits || 0}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Slots Used</p>
                  <p className="text-3xl font-bold text-blue-600">{credits?.slotsUsed || 0}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Remaining Slots</p>
                  <p className="text-3xl font-bold text-purple-600">{credits?.remainingSlots || 0}</p>
                </div>
              </div>
              {(credits?.remainingSlots || 0) === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚠️ You have no remaining slots. Contact your administrator to get more credits.
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {employees.filter(e => e.membertype === "premium").length}
                  </p>
                  <p className="text-sm text-gray-600">Premium Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {employees.filter(e => e.membertype === "free").length}
                  </p>
                  <p className="text-sm text-gray-600">Free Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {((credits?.slotsUsed || 0) / (profile?.creditsAllocated || 1) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Usage Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Employees Created</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {employees.length} employees
              </p>
            </div>
            <div className="overflow-x-auto">
              {employees.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-2">No employees created yet</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Create your first employee
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">English Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Chinese Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{employee.telegram_username}</td>
                        <td className="px-4 py-3 text-sm">{employee.owner_name_english || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">{employee.owner_name_chinese || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded ${
                              employee.membertype === "premium"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {employee.membertype || "free"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {employee.createdAt
                            ? new Date(employee.createdAt).toLocaleDateString()
                            : "N/A"}
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
        {activeTab === "create" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Create New Employee</h2>
            
            {(credits?.remainingSlots || 0) === 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
                <p className="font-medium">Cannot create employee</p>
                <p className="text-sm mt-1">
                  You have no remaining slots. Please contact your administrator to get more credits.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    {createSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telegram ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={createEmployeeForm.employeeTgid}
                    onChange={(e) =>
                      setCreateEmployeeForm({
                        ...createEmployeeForm,
                        employeeTgid: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="telegram_username or user_id"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the employee's Telegram username or user ID
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createEmployeeForm.employeeName}
                    onChange={(e) =>
                      setCreateEmployeeForm({
                        ...createEmployeeForm,
                        employeeName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={createEmployeeForm.employeeEmail}
                    onChange={(e) =>
                      setCreateEmployeeForm({
                        ...createEmployeeForm,
                        employeeEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {createLoading ? "Creating..." : "Create Employee"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCreateEmployeeForm({
                        employeeTgid: "",
                        employeeName: "",
                        employeeEmail: "",
                      })
                    }
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}