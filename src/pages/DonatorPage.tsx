import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import i18n from "../i18n";
import {
  getPackages,
  donatorBuyPackage,
  getUsers,
  getOperators,
  getOperatorsEmployeesAdmin,
  createOperator,
  searchOperators,
  buyPackageForOperator,
  searchEmployees,
  getDonatorSummary,
  getDonatorPurchases,
  assignCreditsToOperator,
  OperatorAuthError,
  operatorLogin,
  getOperatorDetails,
  deleteOperator,
} from "../services/donatorService";
import { useNavigate } from "react-router-dom";
import {
  DonatorTabType,
  DonatorPackage,
  OperatorUsers,
  CreateOperatorPayload,
  SubOperator,
  SearchResponse,
  DonatorSummary,
  DonatorPurchase,
} from "../types/donator";
import WebApp from "@twa-dev/sdk";
import { DonatorUsdtPaymentModal } from "../components/donator/DonatorUsdtPaymentModal";
import { formatDate } from "../utils/date";

export default function DonatorDashboard() {
  const [activeTab, setActiveTab] = useState<
    DonatorTabType | "create-operator" | "manage-operators" | "search-employees"
  >("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Dashboard state
  const [donatorSummary, setDonatorSummary] = useState<DonatorSummary | null>(
    null,
  );
  const [_, setUsers] = useState<OperatorUsers | null>(null);
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
  const [walletAddress, setWalletAddress] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  // Create Employee UI removed from this screen — server API remains available in services
  // (state & handler were unused in the current UI; re-add when wiring a form)

  // My Employees state
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [, setEmployeesError] = useState<string | null>(null);
  // If the signed-in token has admin scope, prefer the admin endpoint's richer response
  const [, setAdminOperatorsEmployees] = useState<any | null>(null);

  // Manage Operators state
  const [operatorForm, setOperatorForm] = useState<CreateOperatorPayload>({
    tgid: "",
    password: "",
  });
  const [, setOperatorsLoading] = useState(false);
  const [operatorsError, setOperatorsError] = useState<string | null>(null);
  const [operatorsList, setOperatorsList] = useState<SubOperator[]>([]);
  const [operatorsPage] = useState(1);
  const [operatorsSearch] = useState("");
  const [operatorsTotal, setOperatorsTotal] = useState(0);
  const [createOperatorLoading, setCreateOperatorLoading] = useState(false);
  const [createOperatorError, setCreateOperatorError] = useState<string | null>(
    null,
  );
  const [createOperatorSuccess, setCreateOperatorSuccess] = useState<
    string | null
  >(null);

  // Buy for Operator state (now Assign Credits)
  const [assignCreditsLoading, setAssignCreditsLoading] = useState(false);
  const [assignCreditsError, setAssignCreditsError] = useState<string | null>(
    null,
  );
  const [selectedOperatorForAssign, setSelectedOperatorForAssign] =
    useState<SubOperator | null>(null);
  const [assignCreditsModal, setAssignCreditsModal] = useState(false);
  const [employeeCreditsToAssign, setEmployeeCreditsToAssign] = useState("");

  // Old buy for operator state (keeping for backward compatibility)
  const [buyForOperatorLoading, setBuyForOperatorLoading] = useState(false);
  const [buyForOperatorError, setBuyForOperatorError] = useState<string | null>(
    null,
  );
  const [selectedOperatorForBuy, setSelectedOperatorForBuy] =
    useState<SubOperator | null>(null);
  const [buyForOperatorModal, setBuyForOperatorModal] = useState(false);
  const [buyForOperatorTxn, setBuyForOperatorTxn] = useState("");
  const [buyForOperatorWallet, setBuyForOperatorWallet] = useState("");
  const [selectedPackageForOperator, setSelectedPackageForOperator] =
    useState<DonatorPackage | null>(null);

  // Search Employees state
  const [employeesSearchQuery, setEmployeesSearchQuery] = useState("");
  const [employeesSearchPage, setEmployeesSearchPage] = useState(1);
  const [employeesSearchLoading, setEmployeesSearchLoading] = useState(false);
  const [employeesSearchError, setEmployeesSearchError] = useState<
    string | null
  >(null);
  const [employeesSearchResults, setEmployeesSearchResults] = useState<any[]>(
    [],
  );
  const [employeesSearchTotal, setEmployeesSearchTotal] = useState(0);

  // Purchase History state
  const [purchaseHistory, setPurchaseHistory] = useState<DonatorPurchase[]>([]);
  const [purchaseHistoryLoading, setPurchaseHistoryLoading] = useState(false);
  const [purchaseHistoryError, setPurchaseHistoryError] = useState<
    string | null
  >(null);
  const [purchaseHistoryPage, setPurchaseHistoryPage] = useState(1);
  const [purchaseHistoryTotal, setPurchaseHistoryTotal] = useState(0);
  const [purchaseHistoryPages, setPurchaseHistoryPages] = useState(0);
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<
    number | undefined
  >(undefined);
  const [openPaymentId, setOpenPaymentId] = useState<string | null>(null);

  // Operator actions state
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [viewOperatorModal, setViewOperatorModal] = useState(false);
  const [selectedOperatorForView, setSelectedOperatorForView] =
    useState<SubOperator | null>(null);
  const [operatorDetailsLoading, setOperatorDetailsLoading] = useState(false);
  const [operatorDetailsError, setOperatorDetailsError] = useState<
    string | null
  >(null);
  const [operatorDetails, setOperatorDetails] = useState<any>(null);
  const [deleteOperatorLoading, setDeleteOperatorLoading] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<SubOperator | null>(
    null,
  );

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === "dashboard") {
      // Check if operator is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
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

  // Fetch operators when manage-operators or create-operator tab is active
  useEffect(() => {
    if (activeTab === "manage-operators" || activeTab === "create-operator") {
      // Check if operator is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        setOperatorsError(
          "Please login as a donator. Authentication token not found.",
        );
        return;
      }
      fetchEmployees();
    }
  }, [activeTab]);

  // Fetch purchase history
  useEffect(() => {
    if (activeTab === "purchase-history") {
      // Check if donator is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        setPurchaseHistoryError(
          "Please login as a donator. Authentication token not found.",
        );
        return;
      }
      fetchPurchaseHistory();
    }
  }, [activeTab, purchaseHistoryPage, purchaseStatusFilter]);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      // Fetch aggregated donator summary (profile, operators, employees, purchases, credits)
      const summary = await getDonatorSummary();
      setDonatorSummary(summary);

      // Store operators list for other tabs
      setOperatorsList(summary.operators || []);
      setOperatorsTotal(summary.operators?.length || 0);

      // Map summary data to users format for compatibility
      setUsers({
        creditsUsed: 0, // Not provided in summary
        potentialUsers: summary.employeesSummary.totalEmployeesCreated,
        purchases: summary.purchases,
      });
    } catch (error: any) {
      if (error instanceof OperatorAuthError) {
        setDashboardError(
          "Donator not authenticated — please login as a donator.",
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
    setAdminOperatorsEmployees(null);

    try {
      // Fetch operators list
      const operatorsData = await getOperators();
      setOperatorsList(operatorsData.data || []);
      setOperatorsTotal(operatorsData.total || 0);

      // Fetch admin data or users data for employees
      try {
        const adminData = await getOperatorsEmployeesAdmin();
        setAdminOperatorsEmployees(adminData || null);

        if (adminData && adminData.usersSummary) {
          setUsers({
            creditsUsed: adminData.usersSummary.creditsUsed || 0,
            potentialUsers: adminData.usersSummary.totalEmployees || 0,
            purchases: adminData.usersSummary.purchases || [],
          });
        }
      } catch (adminError: any) {
        console.warn(
          "Admin operators-employees fetch failed, falling back to operator users:",
          adminError?.message || adminError,
        );
        try {
          const data = await getUsers();
          setUsers(data);
        } catch (err: any) {
          setEmployeesError(err.message || "Failed to load employees");
          console.error("Employees error:", err);
        }
      }
    } catch (error: any) {
      if (error instanceof OperatorAuthError) {
        setEmployeesError(
          "Please login as a donator. Authentication token not found.",
        );
      } else {
        setEmployeesError(error.message || "Failed to load operators");
      }
      console.error("Operators error:", error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchPurchaseHistory = async () => {
    setPurchaseHistoryLoading(true);
    setPurchaseHistoryError(null);
    try {
      const response = await getDonatorPurchases(
        purchaseHistoryPage,
        20, // limit
        purchaseStatusFilter,
      );
      setPurchaseHistory(response.data);
      setPurchaseHistoryTotal(response.meta.total);
      setPurchaseHistoryPages(response.meta.pages);
    } catch (error: any) {
      if (error instanceof OperatorAuthError) {
        setPurchaseHistoryError(
          "Donator not authenticated — please login as a donator.",
        );
      } else {
        setPurchaseHistoryError(
          error.message || "Failed to load purchase history",
        );
      }
      console.error("Purchase history error:", error);
    } finally {
      setPurchaseHistoryLoading(false);
    }
  };

  const handleBuyPackage = async () => {
    if (!selectedPackage || !transactionId.trim() || !walletAddress.trim()) {
      setBuyError("Please enter a transaction ID and your wallet address");
      return;
    }

    // Check authentication first
    const token = localStorage.getItem("token");
    if (!token) {
      setBuyError("Please login as a donator. Authentication token not found.");
      return;
    }

    setBuyLoading(true);
    setBuyError(null);
    try {
      await donatorBuyPackage({
        packageId: selectedPackage._id,
        transactionId: transactionId.trim(),
        walletAddress: walletAddress.trim(),
      });

      WebApp.showAlert(
        "Your payment details has been submitted successfully! please wait for admin approval.",
      );
      setBuyModalOpen(false);
      setTransactionId("");
      setWalletAddress("");
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

  // create-employee handler removed — there is currently no form wired to create employees
  // Reintroduce this (or call `createEmployee`) when adding the Create Employee UI.

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

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setCreateOperatorError(
        "Please login as an operator. Authentication token not found.",
      );
      return;
    }

    if (!operatorForm.tgid.trim() || !operatorForm.password.trim()) {
      setCreateOperatorError("Telegram username and password are required");
      return;
    }

    setCreateOperatorLoading(true);
    setCreateOperatorError(null);
    setCreateOperatorSuccess(null);

    try {
      const result = await createOperator(operatorForm);
      setCreateOperatorSuccess(`Operator created: ${result.name}`);
      setOperatorForm({
        tgid: "",
        password: "",
      });
      // Refresh operators list
      await handleSearchOperators();
    } catch (error: any) {
      setCreateOperatorError(error.message || "Failed to create operator");
      console.error("Create operator error:", error);
    } finally {
      setCreateOperatorLoading(false);
    }
  };

  const handleSearchOperators = async (query: string = operatorsSearch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setOperatorsError("Authentication token not found");
      return;
    }

    setOperatorsLoading(true);
    setOperatorsError(null);

    try {
      const result: SearchResponse<SubOperator> = await searchOperators(
        query || undefined,
        operatorsPage,
        50,
      );
      setOperatorsList(result.data || []);
      setOperatorsTotal(result.total || 0);
    } catch (error: any) {
      setOperatorsError(error.message || "Failed to search operators");
      console.error("Search operators error:", error);
    } finally {
      setOperatorsLoading(false);
    }
  };

  const handleBuyForOperator = async () => {
    if (!selectedOperatorForBuy || !selectedPackageForOperator) {
      setBuyForOperatorError("Please select an operator and package");
      return;
    }

    if (!buyForOperatorTxn.trim() || !buyForOperatorWallet.trim()) {
      setBuyForOperatorError("Transaction ID and wallet address are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setBuyForOperatorError("Authentication token not found");
      return;
    }

    setBuyForOperatorLoading(true);
    setBuyForOperatorError(null);

    try {
      await buyPackageForOperator({
        packageId: selectedPackageForOperator._id,
        operatorId: selectedOperatorForBuy._id,
        transactionId: buyForOperatorTxn.trim(),
        walletAddress: buyForOperatorWallet.trim(),
      });

      WebApp.showAlert("Purchase created for operator successfully!");
      setBuyForOperatorModal(false);
      setBuyForOperatorTxn("");
      setBuyForOperatorWallet("");
      setSelectedOperatorForBuy(null);
      setSelectedPackageForOperator(null);
    } catch (error: any) {
      setBuyForOperatorError(
        error.message || "Failed to purchase for operator",
      );
      console.error("Buy for operator error:", error);
    } finally {
      setBuyForOperatorLoading(false);
    }
  };

  const handleAssignCredits = async () => {
    if (!selectedOperatorForAssign) {
      setAssignCreditsError("Please select an operator");
      return;
    }

    const credits = parseInt(employeeCreditsToAssign);
    if (!employeeCreditsToAssign.trim() || isNaN(credits) || credits <= 0) {
      setAssignCreditsError("Please enter a valid number of credits");
      return;
    }

    // Client-side check against donator available employee credits (if available)
    const available =
      donatorSummary?.purchasesSummary?.leftCreditsEmployee ?? undefined;
    if (typeof available === "number" && credits > available) {
      setAssignCreditsError(
        `You only have ${available} employee credits available`,
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setAssignCreditsError("Authentication token not found");
      return;
    }

    setAssignCreditsLoading(true);
    setAssignCreditsError(null);

    try {
      await assignCreditsToOperator(selectedOperatorForAssign._id, credits);

      WebApp.showAlert(
        `Successfully assigned ${credits} credits to ${selectedOperatorForAssign.name || selectedOperatorForAssign.email}!`,
      );
      setAssignCreditsModal(false);
      setEmployeeCreditsToAssign("");
      setSelectedOperatorForAssign(null);

      // Refresh operators list to show updated credits
      await fetchEmployees();

      // refresh dashboard summary (balances)
      fetchDashboardData();
    } catch (error: any) {
      setAssignCreditsError(error.message || "Failed to assign credits");
      console.error("Assign credits error:", error);
    } finally {
      setAssignCreditsLoading(false);
    }
  };

  const handleSearchEmployees = async (
    query: string = employeesSearchQuery,
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setEmployeesSearchError("Authentication token not found");
      return;
    }

    setEmployeesSearchLoading(true);
    setEmployeesSearchError(null);

    try {
      const result: SearchResponse<any> = await searchEmployees(
        query || undefined,
        employeesSearchPage,
        50,
      );
      setEmployeesSearchResults(result.data || []);
      setEmployeesSearchTotal(result.total || 0);
    } catch (error: any) {
      setEmployeesSearchError(error.message || "Failed to search employees");
      console.error("Search employees error:", error);
    } finally {
      setEmployeesSearchLoading(false);
    }
  };

  // Handle view operator details
  const handleViewOperator = async (operator: SubOperator) => {
    setSelectedOperatorForView(operator);
    setViewOperatorModal(true);
    setOperatorDetailsLoading(true);
    setOperatorDetailsError(null);
    setOperatorDetails(null);

    try {
      const details = await getOperatorDetails(operator._id);
      setOperatorDetails(details);
    } catch (error: any) {
      setOperatorDetailsError(
        error.message || "Failed to load operator details",
      );
      console.error("View operator error:", error);
    } finally {
      setOperatorDetailsLoading(false);
    }
  };

  // Handle delete operator
  const handleDeleteOperator = async (operator: SubOperator) => {
    setOperatorToDelete(operator);
  };

  const confirmDeleteOperator = async () => {
    if (!operatorToDelete) return;

    setDeleteOperatorLoading(true);
    try {
      await deleteOperator(operatorToDelete._id);
      WebApp.showAlert(
        `Operator ${operatorToDelete.name || operatorToDelete.email} deleted successfully!`,
      );
      setOperatorToDelete(null);

      // Refresh operators list
      await fetchEmployees();
    } catch (error: any) {
      WebApp.showAlert(`Failed to delete operator: ${error.message}`);
      console.error("Delete operator error:", error);
    } finally {
      setDeleteOperatorLoading(false);
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
                    setActiveTab("create-operator" as any);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  Create Operator
                </button>
                <button
                  onClick={() => {
                    setActiveTab("manage-operators" as any);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  {i18n.t("manage_operators")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("purchase-history");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition"
                >
                  {i18n.t("purchase_history")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("search-employees" as any);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white font-semibold hover:bg-gray-800 transition last:rounded-b-lg"
                >
                  Search Employees
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
                  : activeTab === "create-operator"
                    ? "Create Operator"
                    : activeTab === "manage-operators"
                      ? i18n.t("manage_operators")
                      : activeTab === "purchase-history"
                        ? i18n.t("purchase_history")
                        : "Search Employees"}
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
                              localStorage.setItem("token", userToken);
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
                  {/* Credits Overview */}
                  {donatorSummary?.purchasesSummary && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        Credits Overview
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {/* Operator Credits Box */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <h4 className="text-sm font-bold text-purple-700 mb-3">
                            Operator Credits
                          </h4>

                          {/* Total Credits */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 font-medium">
                              Total Credits:
                            </span>
                            <span className="text-xl font-bold text-purple-600">
                              {
                                donatorSummary.purchasesSummary
                                  .totalCreditsOperator
                              }
                            </span>
                          </div>

                          {/* Used Credits */}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-700 font-medium">
                              Used Credits:
                            </span>
                            <span className="text-xl font-bold text-purple-600">
                              {
                                donatorSummary.purchasesSummary
                                  .usedCreditsOperator
                              }
                            </span>
                          </div>

                          {/* Horizontal Line */}
                          <hr className="border-purple-300 my-3" />

                          {/* Balance Credits */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">
                              Balance Credits:
                            </span>
                            <span className="text-2xl font-bold text-purple-700">
                              {
                                donatorSummary.purchasesSummary
                                  .leftCreditsOperator
                              }
                            </span>
                          </div>
                        </div>

                        {/* Employee Credits Box */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <h4 className="text-sm font-bold text-green-700 mb-3">
                            Employee Credits
                          </h4>

                          {/* Total Credits */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700 font-medium">
                              Total Credits:
                            </span>
                            <span className="text-xl font-bold text-green-600">
                              {
                                donatorSummary.purchasesSummary
                                  .totalCreditsEmployee
                              }
                            </span>
                          </div>

                          {/* Used Credits */}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-700 font-medium">
                              Used Credits:
                            </span>
                            <span className="text-xl font-bold text-green-600">
                              {
                                donatorSummary.purchasesSummary
                                  .usedCreditsEmployee
                              }
                            </span>
                          </div>

                          {/* Horizontal Line */}
                          <hr className="border-green-300 my-3" />

                          {/* Balance Credits */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">
                              Balance Credits:
                            </span>
                            <span className="text-2xl font-bold text-green-700">
                              {
                                donatorSummary.purchasesSummary
                                  .leftCreditsEmployee
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operators & Employees Summary */}
                  {donatorSummary && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                        Operators & Employees
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Operators
                          </p>
                          <p className="text-3xl font-bold text-blue-600">
                            {donatorSummary.operators?.length || 0}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {donatorSummary.operators?.filter(
                              (op: any) => op.isActive,
                            ).length || 0}{" "}
                            active
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">
                            Total Employees
                          </p>
                          <p className="text-3xl font-bold text-green-600">
                            {
                              donatorSummary.employeesSummary
                                .totalEmployeesCreated
                            }
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Created by your operators
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Transactions */}
                  {donatorSummary?.purchases &&
                    donatorSummary.purchases.length > 0 && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg text-center font-bold text-gray-800 mb-4">
                          Recent Transactions
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {donatorSummary.purchases.map((purchase, idx) => (
                            <div
                              key={purchase._id || idx}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {purchase.packageName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    +{purchase.creditsGranted} Credits
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    purchase.status === 1
                                      ? "bg-green-100 text-green-700"
                                      : purchase.status === 2
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {purchase.status === 1
                                    ? "Approved"
                                    : purchase.status === 2
                                      ? "Rejected"
                                      : "Pending"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                {purchase.amount && (
                                  <span>${purchase.amount} USDT</span>
                                )}
                                {purchase.transactionId && (
                                  <span className="text-xs font-mono truncate max-w-[150px]">
                                    {purchase.transactionId}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {formatDate(purchase.createdAt)}
                              </div>
                            </div>
                          ))}
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

          {/* Create Operator Tab */}
          {/* Purchase History Tab */}
          {activeTab === "purchase-history" && (
            <>
              {purchaseHistoryError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {purchaseHistoryError}
                </div>
              )}

              {/* Filter Section */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filter by Status
                    </label>
                    <select
                      value={purchaseStatusFilter?.toString() || ""}
                      onChange={(e) =>
                        setPurchaseStatusFilter(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="0">Pending</option>
                      <option value="1">Approved</option>
                      <option value="2">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {purchaseHistoryLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">{i18n.t("loading")}</p>
                </div>
              ) : purchaseHistory && purchaseHistory.length > 0 ? (
                <div className="space-y-4">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase._id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenPaymentId(
                            openPaymentId === purchase._id
                              ? null
                              : purchase._id,
                          )
                        }
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">
                            {purchase.packageName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(purchase.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              purchase.status === 1
                                ? "bg-green-100 text-green-700"
                                : purchase.status === 2
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {purchase.statusLabel}
                          </span>
                          <svg
                            className={`h-4 w-4 text-gray-500 transform transition-transform ${
                              openPaymentId === purchase._id ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 8l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </button>

                      {openPaymentId === purchase._id && (
                        <div className="p-4 bg-gray-50 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">Amount</p>
                              <p className="font-bold">
                                ${purchase.amount} {purchase.currency}
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">
                                Employee Credits
                              </p>
                              <p className="font-bold text-green-600">
                                {purchase.creditsGrantedEmployee}
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">
                                Operator Credits
                              </p>
                              <p className="font-bold text-blue-600">
                                {purchase.creditsGrantedOperator}
                              </p>
                            </div>
                            <div className="col-span-2 bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">
                                Transaction ID
                              </p>
                              <p className="text-xs font-mono break-all">
                                {purchase.transactionId}
                              </p>
                            </div>
                            <div className="col-span-2 bg-white p-2 rounded shadow-sm">
                              <p className="text-xs text-gray-600">
                                Wallet Address
                              </p>
                              <p className="text-xs font-mono break-all">
                                {purchase.walletAddress}
                              </p>
                            </div>
                          </div>

                          {purchase.approvedAt && (
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-xs text-gray-600">
                                <strong>Approved At:</strong>
                              </p>
                              <p className="text-sm text-green-700">
                                {new Date(purchase.approvedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      Page {purchaseHistoryPage} of {purchaseHistoryPages}{" "}
                      (Total: {purchaseHistoryTotal})
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={purchaseHistoryPage <= 1}
                        onClick={() =>
                          setPurchaseHistoryPage(purchaseHistoryPage - 1)
                        }
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        disabled={purchaseHistoryPage >= purchaseHistoryPages}
                        onClick={() =>
                          setPurchaseHistoryPage(purchaseHistoryPage + 1)
                        }
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">
                    {i18n.t("no_purchases_found")}
                  </p>
                </div>
              )}
            </>
          )}

          {buyModalOpen && selectedPackage && (
            <DonatorUsdtPaymentModal
              isOpen={buyModalOpen}
              selectedPackage={selectedPackage}
              transactionId={transactionId}
              walletAddress={walletAddress}
              loading={buyLoading}
              error={buyError}
              onClose={() => {
                setBuyModalOpen(false);
                setTransactionId("");
                setWalletAddress("");
                setSelectedPackage(null);
                setBuyError(null);
              }}
              onTransactionIdChange={setTransactionId}
              onWalletAddressChange={setWalletAddress}
              onSubmit={handleBuyPackage}
            />
          )}

          {/* Create Operator Tab */}
          {activeTab === "create-operator" && (
            <>
              {operatorsError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {operatorsError}
                </div>
              )}

              <div className="space-y-6">
                {/* Create Operator Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Create New Operator
                  </h3>

                  <form onSubmit={handleCreateOperator} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telegram Username *
                      </label>
                      <input
                        type="text"
                        value={operatorForm.tgid}
                        onChange={(e) =>
                          setOperatorForm({
                            ...operatorForm,
                            tgid: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                        placeholder="john_operator_01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={operatorForm.password}
                        onChange={(e) =>
                          setOperatorForm({
                            ...operatorForm,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    {createOperatorError && (
                      <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                        {createOperatorError}
                      </div>
                    )}

                    {createOperatorSuccess && (
                      <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                        {createOperatorSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={createOperatorLoading}
                      className="w-full bg-[#007cb6] text-white py-2 rounded-md font-semibold hover:bg-[#005f8e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createOperatorLoading
                        ? "Creating..."
                        : "Create Operator"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* Manage Operators Tab */}
          {activeTab === "manage-operators" && (
            <>
              {operatorsError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {operatorsError}
                </div>
              )}

              <div className="space-y-6">
                {/* My Operators List */}
                {employeesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">{i18n.t("loading")}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      My Operators
                    </h3>

                    {operatorsList && operatorsList.length > 0 ? (
                      <div className="space-y-3">
                        {operatorsList.map((op) => (
                          <div
                            key={op._id}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-lg text-gray-800">
                                    {op.name || op.email}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      op.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {op.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {op.email}
                                </div>
                                <div className="flex gap-4 mt-3 items-center">
                                  <div className="bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                                    <span className="text-xs text-gray-600">
                                      Credits:
                                    </span>
                                    <span className="ml-2 font-bold text-blue-700">
                                      {op.credits ?? 0}
                                    </span>
                                  </div>
                                  {/* <div className="text-xs text-gray-500">
                                    &middot; Created:{" "}
                                    {new Date(
                                      op.createdAt,
                                    ).toLocaleDateString()}
                                  </div> */}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                  Created:{" "}
                                  {new Date(op.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Action Menu */}
                              <div className="relative ml-4">
                                <button
                                  onClick={() =>
                                    setOpenActionMenuId(
                                      openActionMenuId === op._id
                                        ? null
                                        : op._id,
                                    )
                                  }
                                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                  aria-label="Actions"
                                >
                                  <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {openActionMenuId === op._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setSelectedOperatorForAssign(op);
                                        setAssignCreditsModal(true);
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-2 first:rounded-t-lg"
                                    >
                                      <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      </svg>
                                      <span className="font-medium text-gray-700">
                                        Assign Credits
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        handleViewOperator(op);
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-2"
                                    >
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
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      <span className="font-medium text-gray-700">
                                        View Operator
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        handleDeleteOperator(op);
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-2 last:rounded-b-lg"
                                    >
                                      <svg
                                        className="w-5 h-5 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      <span className="font-medium text-gray-700">
                                        Delete Operator
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="text-center text-sm text-gray-500 mt-4">
                          Showing {operatorsList.length} of {operatorsTotal}{" "}
                          operators
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No operators found. Create your first operator!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Search Employees Tab */}
          {activeTab === "search-employees" && (
            <>
              {employeesSearchError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {employeesSearchError}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Search Employees
                  </h3>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={employeesSearchQuery}
                      onChange={(e) => setEmployeesSearchQuery(e.target.value)}
                      placeholder="Search by name, email, username..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        setEmployeesSearchPage(1);
                        handleSearchEmployees(employeesSearchQuery);
                      }}
                      disabled={employeesSearchLoading}
                      className="px-4 py-2 bg-[#007cb6] text-white rounded-md font-semibold hover:bg-[#005f8e] disabled:opacity-50"
                    >
                      Search
                    </button>
                  </div>

                  {employeesSearchLoading ? (
                    <div className="text-center py-4 text-gray-600">
                      Loading...
                    </div>
                  ) : employeesSearchResults.length > 0 ? (
                    <div className="space-y-3">
                      {employeesSearchResults.map((emp: any, idx: number) => (
                        <div
                          key={emp._id || idx}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="font-semibold text-gray-800">
                            {emp.name || emp.username || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {emp.email || emp.tgid || "—"}
                          </div>
                          {emp.membershipEnd && (
                            <div className="text-xs text-gray-500 mt-1">
                              Membership until:{" "}
                              {new Date(emp.membershipEnd).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {employeesSearchQuery
                        ? "No employees found"
                        : "Enter a search term to find employees"}
                    </div>
                  )}

                  {employeesSearchTotal > 50 && (
                    <div className="text-center mt-4 text-sm text-gray-600">
                      Showing {employeesSearchResults.length} of{" "}
                      {employeesSearchTotal} employees
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Buy Package for Operator Modal */}
          {buyForOperatorModal && selectedOperatorForBuy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    Buy Package for {selectedOperatorForBuy.name}
                  </h3>
                  <button
                    onClick={() => {
                      setBuyForOperatorModal(false);
                      setBuyForOperatorTxn("");
                      setBuyForOperatorWallet("");
                      setSelectedPackageForOperator(null);
                    }}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Select Package */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Package *
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {packages.map((pkg) => (
                        <button
                          key={pkg._id}
                          onClick={() => setSelectedPackageForOperator(pkg)}
                          className={`w-full text-left p-3 rounded border-2 transition ${
                            selectedPackageForOperator?._id === pkg._id
                              ? "border-[#007cb6] bg-blue-50"
                              : "border-gray-200 hover:border-[#007cb6]"
                          }`}
                        >
                          <div className="font-semibold text-gray-800">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Employees: {pkg.employeeCredits} | Operators:{" "}
                            {pkg.operatorCredits}
                          </div>
                          <div className="text-sm font-bold text-[#007cb6]">
                            ${pkg.price} USDT
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedPackageForOperator && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Transaction ID *
                        </label>
                        <input
                          type="text"
                          value={buyForOperatorTxn}
                          onChange={(e) => setBuyForOperatorTxn(e.target.value)}
                          placeholder="TXN-2026-0001"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Wallet Address *
                        </label>
                        <input
                          type="text"
                          value={buyForOperatorWallet}
                          onChange={(e) =>
                            setBuyForOperatorWallet(e.target.value)
                          }
                          placeholder="Your wallet address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  {buyForOperatorError && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                      {buyForOperatorError}
                    </div>
                  )}

                  <button
                    onClick={handleBuyForOperator}
                    disabled={
                      buyForOperatorLoading ||
                      !selectedPackageForOperator ||
                      !buyForOperatorTxn.trim() ||
                      !buyForOperatorWallet.trim()
                    }
                    className="w-full bg-[#007cb6] text-white py-2 rounded-md font-semibold hover:bg-[#005f8e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buyForOperatorLoading
                      ? "Processing..."
                      : "Complete Purchase"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assign Credits Modal */}
          {assignCreditsModal && selectedOperatorForAssign && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="bg-white border-b p-4 flex justify-between items-center rounded-t-xl">
                  <h3 className="text-lg font-bold text-gray-800">
                    Assign Credits to{" "}
                    {selectedOperatorForAssign.name ||
                      selectedOperatorForAssign.email}
                  </h3>
                  <button
                    onClick={() => {
                      setAssignCreditsModal(false);
                      setEmployeeCreditsToAssign("");
                      setAssignCreditsError(null);
                    }}
                    className="text-gray-400 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Operator</div>
                        <div className="font-semibold text-gray-800">
                          {selectedOperatorForAssign.name ||
                            selectedOperatorForAssign.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Current Credits
                        </div>
                        <div className="font-bold text-blue-700 text-lg">
                          {selectedOperatorForAssign.credits ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          Available to assign
                        </p>
                        <p className="font-semibold text-gray-800 text-lg">
                          {donatorSummary?.purchasesSummary
                            ?.leftCreditsEmployee ?? "—"}
                          <span className="ml-2 text-xs text-gray-500">
                            employee credits
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEmployeeCreditsToAssign("100")}
                          className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200 hover:bg-gray-200"
                        >
                          +100
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmployeeCreditsToAssign("500")}
                          className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200 hover:bg-gray-200"
                        >
                          +500
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmployeeCreditsToAssign("1000")}
                          className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-200 hover:bg-gray-200"
                        >
                          +1000
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEmployeeCreditsToAssign(
                              String(
                                donatorSummary?.purchasesSummary
                                  ?.leftCreditsEmployee ?? "",
                              ),
                            )
                          }
                          className="px-3 py-1 bg-white rounded-md text-sm text-[#007cb6] border border-[#007cb6] hover:bg-[#007cb6] hover:text-white transition"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Employee Credits *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={employeeCreditsToAssign}
                        onChange={(e) =>
                          setEmployeeCreditsToAssign(e.target.value)
                        }
                        placeholder="Enter number of credits (e.g., 1000)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#007cb6] focus:border-transparent text-lg font-medium"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <div>Minimum 1 credit</div>
                        <div>
                          {employeeCreditsToAssign &&
                          !isNaN(parseInt(employeeCreditsToAssign)) ? (
                            <span>
                              Will assign:{" "}
                              <strong>{employeeCreditsToAssign}</strong>
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {assignCreditsError && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                      {assignCreditsError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAssignCreditsModal(false);
                        setEmployeeCreditsToAssign("");
                        setAssignCreditsError(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-semibold hover:bg-gray-200"
                      disabled={assignCreditsLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignCredits}
                      disabled={
                        assignCreditsLoading ||
                        !employeeCreditsToAssign.trim() ||
                        parseInt(employeeCreditsToAssign) <= 0 ||
                        (typeof donatorSummary?.purchasesSummary
                          ?.leftCreditsEmployee === "number" &&
                          parseInt(employeeCreditsToAssign) >
                            (donatorSummary?.purchasesSummary
                              ?.leftCreditsEmployee ?? 0))
                      }
                      className="flex-1 px-4 py-2 bg-[#007cb6] text-white rounded-md font-semibold hover:bg-[#005f8e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assignCreditsLoading ? "Assigning..." : "Assign Credits"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Tip: Use the quick buttons to set common amounts or press{" "}
                    <strong>Max</strong> to assign all available employee
                    credits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Operator Modal */}
          {viewOperatorModal && selectedOperatorForView && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-[#007cb6] to-[#005f8e] text-white p-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold">
                    {selectedOperatorForView.name || "Operator"}
                  </h3>
                  <button
                    onClick={() => {
                      setViewOperatorModal(false);
                      setSelectedOperatorForView(null);
                      setOperatorDetails(null);
                      setOperatorDetailsError(null);
                    }}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {/* Operator Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-6 border border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Operator Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`ml-2 font-semibold ${selectedOperatorForView.isActive ? "text-green-600" : "text-red-600"}`}
                        >
                          {selectedOperatorForView.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Credits:</span>
                        <span className="ml-2 font-bold text-blue-600">
                          {selectedOperatorForView.credits ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Employees List */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Created Employees
                    </h4>

                    {operatorDetailsLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#007cb6]"></div>
                        <p className="text-gray-600 mt-2">
                          Loading employees...
                        </p>
                      </div>
                    ) : operatorDetailsError ? (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {operatorDetailsError}
                      </div>
                    ) : operatorDetails?.employees &&
                      operatorDetails.employees.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Username
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Membership
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  Created
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {operatorDetails.employees.map(
                                (employee: any, idx: number) => (
                                  <tr
                                    key={employee._id || idx}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                      {employee.owner_name_english ||
                                        employee.name ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {employee.email || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {employee.username ||
                                        employee.tgid ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {employee.enddate ? (
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-semibold ${
                                            new Date(employee.enddate) >
                                            new Date()
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {new Date(
                                            employee.enddate,
                                          ).toLocaleDateString()}
                                        </span>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      {employee.createdAt
                                        ? new Date(
                                            employee.createdAt,
                                          ).toLocaleDateString()
                                        : "-"}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-gray-500 mt-2">
                          No employees created yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Operator Confirmation Modal */}
          {operatorToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                    Delete Operator
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-6">
                    Are you sure you want to delete{" "}
                    <strong>
                      {operatorToDelete.name || operatorToDelete.email}
                    </strong>
                    ? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOperatorToDelete(null)}
                      disabled={deleteOperatorLoading}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteOperator}
                      disabled={deleteOperatorLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteOperatorLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
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
                          localStorage.setItem("token", t);
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
