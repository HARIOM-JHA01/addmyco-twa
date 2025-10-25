import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchUserProfile,
  fetchPublicCompanies,
  fetchPublicChambers,
  PublicProfileData,
  CompanyData,
  ChamberData,
} from "../services/publicProfileService";
import PublicLayout from "../components/PublicLayout";
import PublicProfileView from "./PublicProfileView";
import PublicCompanyView from "./PublicCompanyView";
import PublicChamberView from "./PublicChamberView";

type ViewType = "profile" | "company" | "chamber";

export default function PublicProfileContainer() {
  const { username, view } = useParams<{ username: string; view?: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [chambers, setChambers] = useState<ChamberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("profile");

  useEffect(() => {
    if (view === "company") {
      setCurrentView("company");
    } else if (view === "chamber") {
      setCurrentView("chamber");
    } else {
      setCurrentView("profile");
    }
  }, [view]);

  useEffect(() => {
    const loadAllData = async () => {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [profileData, companiesData, chambersData] = await Promise.all([
          fetchUserProfile(username),
          fetchPublicCompanies(username),
          fetchPublicChambers(username),
        ]);

        setProfile(profileData);

        if (companiesData && companiesData.length > 0) {
          const sortedCompanies = [...companiesData].sort((a, b) => {
            const ao = Number(a.company_order ?? 0);
            const bo = Number(b.company_order ?? 0);
            return ao - bo;
          });
          setCompanies(sortedCompanies);
        }

        if (chambersData && chambersData.length > 0) {
          const sortedChambers = [...chambersData].sort((a, b) => {
            const ao = Number(a.chamber_order ?? 0);
            const bo = Number(b.chamber_order ?? 0);
            return ao - bo;
          });
          setChambers(sortedChambers);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [username]);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-600">Loading profile...</div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              Profile Not Found
            </h1>
            <p className="text-gray-600">
              {error || "The requested profile does not exist."}
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (currentView === "company") {
    return (
      <PublicCompanyView
        profile={profile}
        companies={companies}
        chambers={chambers}
        onViewChange={handleViewChange}
      />
    );
  }

  if (currentView === "chamber") {
    return (
      <PublicChamberView
        profile={profile}
        companies={companies}
        chambers={chambers}
        onViewChange={handleViewChange}
      />
    );
  }

  return (
    <PublicProfileView
      profile={profile}
      companies={companies}
      chambers={chambers}
      onViewChange={handleViewChange}
    />
  );
}
