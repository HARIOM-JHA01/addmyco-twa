import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import i18n from "../i18n";
import {
  getOperatorProfile,
  getOperatorCredits,
  getPackages,
  buyPackage,
  createEmployee,
  getUsers,
  OperatorAuthError,
  operatorLogin,
} from "../services/donatorService";
import { useNavigate } from "react-router-dom";
import {
  DonatorTabType,
  OperatorProfile,
  OperatorCredits,
  DonatorPackage,
  OperatorUsers,
  CreateEmployeePayload,
} from "../types/donator";
import WebApp from "@twa-dev/sdk";

export default function DonatorDashboard() {
  const [activeTab, setActiveTab] = useState<DonatorTabType>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Dashboard state
  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [credits, setCredits] = useState<OperatorCredits | null>(null);
  const [users, setUsers] = useState<OperatorUsers | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Operator-login UI state
  const [operatorLoginOpen, setOperatorLoginOpen] = useState(false);
  const [operatorLoginEmail, setOperatorLoginEmail] = useState("");
  const [operatorLoginPassword, setOperatorLoginPassword] = useState("");
  const [operatorLoginLoading, setOperatorLoginLoading] = useState(false);
  const [operatorLoginError, setOperatorLoginError] = useState<string | null>(
    null,
  );

  // Buy Credits state
  const [packages, setPackages] = useState<DonatorPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<DonatorPackage | null>(
    null,
  );
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Create Employee state
  const [employeeForm, setEmployeeForm] = useState<CreateEmployeePayload>({
    employeeTgid: "",
    employeeEmail: "",
    employeeName: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // My Employees state
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === "dashboard") {
      // Check if operator is authenticated
      const operatorToken = localStorage.getItem("operatorToken");
      if (!operatorToken) {
        setDashboardError(
          "Please login as an operator. Operator authentication token not found.",
        );
        return;
      }
      fetchDashboardData();
    }
  }, [activeTab]);

  // Fetch packages
  useEffect(() => {
    if (activeTab === "buy-credits") {
      fetchPackages();
    }
  }, [activeTab]);

  // Fetch employees
  useEffect(() => {
    if (activeTab === "my-employees" || activeTab === "purchase-history") {
      // Check if operator is authenticated
      const operatorToken = localStorage.getItem("operatorToken");
      if (!operatorToken) {
        setEmployeesError(
          "Please login as an operator. Operator authentication token not found.",
        );
        return;
      }
      fetchEmployees();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const [profileData, creditsData, usersData] = await Promise.all([
        getOperatorProfile(),
        getOperatorCredits(),
        getUsers(),
      ]);
      setProfile(profileData);
      setCredits(creditsData);
      setUsers(usersData);
    } catch (error: any) {
      if (error instanceof OperatorAuthError) {
        setDashboardError(
          "Operator not authenticated — please login as an operator.",
        );
      } else {
        setDashboardError(error.message || "Failed to load dashboard data");
      }
      console.error("Dashboard error:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchPackages = async () => {
    setPackagesLoading(true);
    setPackagesError(null);
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error: any) {
      setPackagesError(error.message || "Failed to load packages");
      console.error("Packages error:", error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      setEmployeesError(error.message || "Failed to load employees");
      console.error("Employees error:", error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleBuyPackage = async () => {
    if (!selectedPackage || !transactionId.trim()) {
      setBuyError("Please enter a transaction ID");
      return;
    }

    // Check authentication first
    const operatorToken = localStorage.getItem("operatorToken");
    if (!operatorToken) {
      setBuyError(
        "Please login as an operator. Authentication token not found.",
      );
      return;
    }

    setBuyLoading(true);
    setBuyError(null);
    try {
      await buyPackage({
        packageId: selectedPackage._id,
        transactionId: transactionId.trim(),
      });

      WebApp.showAlert(
        "Purchase created successfully! Awaiting admin approval.",
      );
      setBuyModalOpen(false);
      setTransactionId("");
      setSelectedPackage(null);

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error: any) {
      setBuyError(error.message || "Failed to purchase package");
      console.error("Buy error:", error);
    } finally {
      setBuyLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication first
    const operatorToken = localStorage.getItem("operatorToken");
    if (!operatorToken) {
      setCreateError(
        "Please login as an operator. Authentication token not found.",
      );
      return;
    }

    if (
      !employeeForm.employeeTgid.trim() ||
      !employeeForm.employeeName.trim()
    ) {
      setCreateError("Telegram ID and Name are required");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const result = await createEmployee(employeeForm);
      setCreateSuccess(
        `Employee created successfully! Username: ${result.username}, Membership until: ${result.membershipEnd}`,
      );

      // Reset form
      setEmployeeForm({
        employeeTgid: "",
        employeeEmail: "",
        employeeName: "",
      });

      // Refresh credits and employees
      fetchDashboardData();
      fetchEmployees();
    } catch (error: any) {
      setCreateError(error.message || "Failed to create employee");
      console.error("Create employee error:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOperatorLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setOperatorLoginLoading(true);
    setOperatorLoginError(null);
    try {
      await operatorLogin(operatorLoginEmail.trim(), operatorLoginPassword);
      setOperatorLoginOpen(false);
      setOperatorLoginEmail("");
      setOperatorLoginPassword("");
      // refresh operator data
      await fetchDashboardData();
      WebApp.showAlert("Operator login successful");
    } catch (err: any) {
      setOperatorLoginError(err?.message || "Login failed");
      console.error("Operator login error:", err);
    } finally {
      setOperatorLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-gray-300">
      <Header />
      <main className="flex-1 flex justify-center w-full">
        <div className="w-full max-w-md pb-24 px-4">
          {/* Page Title with Hamburger Menu */}
          <div className="bg-[#005f8e] border border-gray-200 rounded-lg shadow-md p-4 mb-6 mt-2 relative">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white text-center flex-1">
                {i18n.t("donator_dashboard")}
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
                    setActiveTab("dashboard");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition first:rounded-t-lg"
                >
                  {i18n.t("dashboard")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("buy-credits");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  {i18n.t("buy_credits")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("create-employee");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  {i18n.t("create_employee")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("my-employees");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  {i18n.t("my_employees")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("purchase-history");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition last:rounded-b-lg"
                >
                  {i18n.t("purchase_history")}
                </button>
              </div>
            )}
          </div>

          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-xl text-center font-bold text-gray-800">
              {activeTab === "dashboard"
                ? i18n.t("dashboard")
                : activeTab === "buy-credits"
                  ? i18n.t("buy_credits")
                  : activeTab === "create-employee"
                    ? i18n.t("create_employee")
                    : activeTab === "my-employees"
                      ? i18n.t("my_employees")
                      : i18n.t("purchase_history")}
            </h2>
          </div>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {dashboardError &&
                // If the dashboard error is authentication-related show a helpful CTA instead of a raw error
                (dashboardError.includes("Operator not authenticated") ||
                dashboardError.includes("Operator authentication") ? (
                  <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-4 rounded mb-4">
                    <h4 className="font-semibold mb-1">
                      {i18n.t("donator_dashboard")} — Operator access required
                    </h4>
                    <p className="text-sm mb-3">
                      This area is the operator dashboard (managing credits &
                      employees). To use these features you must sign in as an
                      operator.
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="bg-[#005f8e] text-white px-3 py-2 rounded shadow-sm hover:opacity-95"
                        onClick={() => setOperatorLoginOpen(true)}
                      >
                        Operator login
                      </button>

                      <button
                        className="bg-white border border-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-50"
                        onClick={() => navigate("/search")}
                      >
                        Request operator access
                      </button>

                      {import.meta.env.DEV && (
                        <button
                          className="bg-gray-800 text-white px-3 py-2 rounded text-sm"
                          onClick={() => {
                            const userToken = localStorage.getItem("token");
                            if (userToken) {
                              localStorage.setItem("operatorToken", userToken);
                              setDashboardError(null);
                              fetchDashboardData();
                            } else {
                              setOperatorLoginError(
                                "No user token available to copy.",
                              );
                            }
                          }}
                        >
                          Use my account (dev)
                        </button>
                      )}
                    </div>

                    <p className="text-xs opacity-80 mt-3">
                      If you do not manage credits or employees, ignore this —
                      public Donator features are available elsewhere.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {dashboardError}
                  </div>
                ))}

              {dashboardLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">{i18n.t("loading")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Card */}
                  {profile && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        Operator Profile
                      </h3>
                      <div className="bg-gradient-to-r from-[#007cb6] to-[#005f8e] text-white rounded-lg p-4">
                        <p className="text-xl font-bold mb-1">{profile.name}</p>
                        <p className="text-sm opacity-90">{profile.email}</p>
                        <p className="text-xs opacity-75 mt-2">
                          {i18n.t("role")}: {profile.role}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Credits Section */}
                  {credits && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        Credits Overview
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">
                            {i18n.t("employee_credits")}
                          </p>
                          <p className="text-3xl font-bold text-green-600">
                            {credits.credits}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {i18n.t("available")}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">
                            {i18n.t("operator_slots")}
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            {credits.operatorSlots}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {i18n.t("available")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  {users && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        Employee Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-600 mb-1">
                            {i18n.t("credits_used")}
                          </p>
                          <p className="text-3xl font-bold text-purple-600">
                            {users.creditsUsed}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">
                            {i18n.t("total_employees")}
                          </p>
                          <p className="text-3xl font-bold text-orange-600">
                            {users.potentialUsers}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Buy Credits Tab */}
          {activeTab === "buy-credits" && (
            <>
              {packagesError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {packagesError}
                </div>
              )}

              {packagesLoading ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">{i18n.t("loading")}</div>
                </div>
              ) : packagesError ? (
                <div className="text-center py-12">
                  <div className="text-red-500">{packagesError}</div>
                  <button
                    onClick={fetchPackages}
                    className="mt-4 px-4 py-2 bg-[#007cb6] text-white rounded-md"
                  >
                    {i18n.t("retry")}
                  </button>
                </div>
              ) : packages.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  {i18n.t("no_packages_available")}
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className={`bg-white rounded-lg shadow-md p-5 ${
                        pkg.isPopular ? "border-2 border-[#007cb6]" : ""
                      }`}
                    >
                      {pkg.isPopular && (
                        <div className="text-xs font-bold text-[#007cb6] mb-2">
                          ⭐ {i18n.t("popular")}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="text-sm text-gray-600 mb-4">
                          {pkg.description}
                        </p>
                      )}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {i18n.t("employee_credits")}:
                          </span>
                          <span className="font-bold text-green-600">
                            {pkg.employeeCredits}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {i18n.t("operator_credits")}:
                          </span>
                          <span className="font-bold text-blue-600">
                            {pkg.operatorCredits}
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-800 mb-4">
                        ${pkg.price}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          USDT
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setBuyModalOpen(true);
                          setBuyError(null);
                        }}
                        className="w-full bg-[#007cb6] text-white py-2 rounded-md font-semibold hover:bg-[#005f8e] transition-colors"
                      >
                        {i18n.t("buy_now")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Employee Tab */}
          {activeTab === "create-employee" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Current Credits Display */}
              {credits && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-blue-700">
                    {i18n.t("available_credits")}:
                    <span className="font-bold ml-2">{credits.credits}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {i18n.t("telegram_id")} *
                  </label>
                  <input
                    type="text"
                    value={employeeForm.employeeTgid}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        employeeTgid: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                    placeholder="username123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {i18n.t("employee_name")} *
                  </label>
                  <input
                    type="text"
                    value={employeeForm.employeeName}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        employeeName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {i18n.t("email")} ({i18n.t("optional")})
                  </label>
                  <input
                    type="email"
                    value={employeeForm.employeeEmail}
                    onChange={(e) =>
                      setEmployeeForm({
                        ...employeeForm,
                        employeeEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                    placeholder="employee@company.com"
                  />
                </div>

                {createError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    {createError}
                  </div>
                )}

                {createSuccess && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                    {createSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createLoading || (credits?.credits || 0) === 0}
                  className="w-full bg-[#007cb6] text-white py-3 rounded-md font-semibold hover:bg-[#005f8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading
                    ? i18n.t("creating")
                    : i18n.t("create_employee")}
                </button>

                {(credits?.credits || 0) === 0 && (
                  <div className="text-orange-600 text-sm text-center">
                    {i18n.t("no_credits_available")}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* My Employees Tab */}
          {activeTab === "my-employees" && (
            <>
              {employeesError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {employeesError}
                </div>
              )}

              {employeesLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">{i18n.t("loading")}</p>
                </div>
              ) : users ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">
                          {i18n.t("credits_used")}
                        </p>
                        <p className="text-3xl font-bold text-purple-600">
                          {users.creditsUsed}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <p className="text-xs text-gray-600 mb-1">
                          {i18n.t("total_employees")}
                        </p>
                        <p className="text-3xl font-bold text-orange-600">
                          {users.potentialUsers}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Purchases/Packages List */}
                  {users.purchases && users.purchases.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        {i18n.t("packages_purchased")}
                      </h3>
                      <div className="space-y-3">
                        {users.purchases.map((purchase) => (
                          <div
                            key={purchase._id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-gray-800">
                                  {purchase.packageName}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {i18n.t("credits_granted")}:{" "}
                                  {purchase.creditsGranted}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    purchase.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                      {i18n.t("no_employees_yet")}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}

          {/* Purchase History Tab */}
          {activeTab === "purchase-history" && (
            <>
              {employeesError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {employeesError}
                </div>
              )}

              {employeesLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">{i18n.t("loading")}</p>
                </div>
              ) : users && users.purchases && users.purchases.length > 0 ? (
                <div className="space-y-4">
                  {users.purchases.map((purchase) => (
                    <div
                      key={purchase._id}
                      className="bg-white rounded-lg shadow-md p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {purchase.packageName}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(purchase.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {purchase.status !== undefined && (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                purchase.status === 1
                                  ? "bg-green-100 text-green-700"
                                  : purchase.status === 2
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {purchase.status === 1
                                ? i18n.t("approved")
                                : purchase.status === 2
                                  ? i18n.t("rejected")
                                  : i18n.t("pending")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            {i18n.t("credits_granted")}:
                          </span>
                          <span className="font-bold text-green-600 ml-2">
                            {purchase.creditsGranted}
                          </span>
                        </div>
                        {purchase.amount && (
                          <div>
                            <span className="text-gray-600">
                              {i18n.t("amount")}:
                            </span>
                            <span className="font-bold ml-2">
                              ${purchase.amount}
                            </span>
                          </div>
                        )}
                        {purchase.transactionId && (
                          <div className="col-span-2">
                            <span className="text-gray-600">
                              {i18n.t("transaction_id")}:
                            </span>
                            <span className="font-mono text-sm ml-2">
                              {purchase.transactionId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  {i18n.t("no_purchase_history")}
                </div>
              )}
            </>
          )}

          {/* Buy Package Modal */}
          {buyModalOpen && selectedPackage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {i18n.t("buy_package")}: {selectedPackage.name}
                </h3>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    {i18n.t("package_details")}:
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      {i18n.t("employee_credits")}:
                      <span className="font-bold ml-2">
                        {selectedPackage.employeeCredits}
                      </span>
                    </div>
                    <div>
                      {i18n.t("operator_credits")}:
                      <span className="font-bold ml-2">
                        {selectedPackage.operatorCredits}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-[#007cb6] mt-2">
                      ${selectedPackage.price} USDT
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {i18n.t("transaction_id")} *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                    placeholder="TXN-2026-0001"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {i18n.t("transaction_id_help")}
                  </div>
                </div>

                {buyError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">
                    {buyError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setBuyModalOpen(false);
                      setTransactionId("");
                      setSelectedPackage(null);
                      setBuyError(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                    disabled={buyLoading}
                  >
                    {i18n.t("cancel")}
                  </button>
                  <button
                    onClick={handleBuyPackage}
                    disabled={buyLoading || !transactionId.trim()}
                    className="flex-1 bg-[#007cb6] text-white py-2 rounded-md font-semibold hover:bg-[#005f8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buyLoading
                      ? i18n.t("processing")
                      : i18n.t("submit_payment")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Operator login modal */}
        {operatorLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Operator login</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sign in with your operator credentials to manage credits and
                employees.
              </p>

              {operatorLoginError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-3">
                  {operatorLoginError}
                </div>
              )}

              <form onSubmit={handleOperatorLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={operatorLoginEmail}
                    onChange={(e) => setOperatorLoginEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={operatorLoginPassword}
                    onChange={(e) => setOperatorLoginPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={operatorLoginLoading}
                    className="flex-1 bg-[#007cb6] text-white py-2 rounded-md font-semibold disabled:opacity-50"
                  >
                    {operatorLoginLoading
                      ? i18n.t("processing")
                      : i18n.t("login")}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-100 border rounded-md"
                    onClick={() => {
                      setOperatorLoginOpen(false);
                      setOperatorLoginError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  <span>Don't have operator access? </span>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => navigate("/search")}
                  >
                    Request access
                  </button>
                </div>

                {import.meta.env.DEV && (
                  <div className="text-xs text-gray-500 mt-2">
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() => {
                        const t = localStorage.getItem("token");
                        if (t) {
                          localStorage.setItem("operatorToken", t);
                          setOperatorLoginOpen(false);
                          fetchDashboardData();
                        } else {
                          setOperatorLoginError("No user token available");
                        }
                      }}
                    >
                      Use my user token (dev)
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
