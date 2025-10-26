import { useEffect, useState, useRef } from "react";
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
import { fetchBackgroundByUsername } from "../utils/theme";

type ViewType = "profile" | "company" | "chamber";

export default function PublicProfileContainer() {
  const { username, view } = useParams<{ username: string; view?: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [chambers, setChambers] = useState<ChamberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("profile");
  const restoreRef = useRef<(() => void) | null>(null);

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

        // attempt to fetch and apply user-specific background/theme for public pages
        // save current theme so we can restore it when leaving the public profile
        let previousTheme: any = null;
        try {
          previousTheme = {
            bgColor: getComputedStyle(
              document.documentElement
            ).getPropertyValue("--app-background-color"),
            fontColor: getComputedStyle(
              document.documentElement
            ).getPropertyValue("--app-font-color"),
            bgImage: getComputedStyle(
              document.documentElement
            ).getPropertyValue("--app-background-image"),
            bodyBgImage: document.body.style.backgroundImage,
            bodyBgSize: document.body.style.backgroundSize,
            bodyBgPosition: document.body.style.backgroundPosition,
            bodyBgAttachment: document.body.style.backgroundAttachment,
          };
        } catch (e) {
          previousTheme = null;
        }

        try {
          const uname = username;
          if (uname) await fetchBackgroundByUsername(uname);
        } catch (err) {
          console.debug(
            "fetchBackgroundByUsername in PublicProfileContainer failed",
            err
          );
        }

        // restore previous theme when unmounting or when username changes
        const restoreTheme = () => {
          try {
            if (previousTheme) {
              if (previousTheme.bgColor)
                document.documentElement.style.setProperty(
                  "--app-background-color",
                  previousTheme.bgColor
                );
              if (previousTheme.fontColor)
                document.documentElement.style.setProperty(
                  "--app-font-color",
                  previousTheme.fontColor
                );
              if (previousTheme.bgImage)
                document.documentElement.style.setProperty(
                  "--app-background-image",
                  previousTheme.bgImage
                );
              document.body.style.backgroundImage =
                previousTheme.bodyBgImage || "";
              document.body.style.backgroundSize =
                previousTheme.bodyBgSize || "";
              document.body.style.backgroundPosition =
                previousTheme.bodyBgPosition || "";
              document.body.style.backgroundAttachment =
                previousTheme.bodyBgAttachment || "";
            }
          } catch (e) {
            console.debug("Failed to restore previous theme", e);
          }
        };
        // store restore function in ref so cleanup can call it when effect re-runs or unmounts
        restoreRef.current = restoreTheme;

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
  // cleanup: run restoreRef.current when username changes or component unmounts
  useEffect(() => {
    return () => {
      try {
        if (restoreRef.current) restoreRef.current();
      } catch (e) {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
