import { useState, useEffect } from "react";
import axios from "axios";
import { Package, CreditBalance, CountryOption } from "../types/advertisement";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAdvertisementData = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login.");
        setLoading(false);
        return;
      }

      // Fetch packages
      try {
        const packagesRes = await axios.get(
          `${API_BASE_URL}/api/v1/advertisement/packages`,
          { headers: getAuthHeaders() },
        );
        setPackages(packagesRes.data?.data || []);
      } catch (pkgErr) {
        console.error("Failed to fetch packages:", pkgErr);
        // Default packages
        setPackages([]);
      }

      // Fetch credits
      try {
        const creditsRes = await axios.get(
          `${API_BASE_URL}/api/v1/advertisement/my-credits`,
          { headers: getAuthHeaders() },
        );
        setCredits(
          creditsRes.data?.data || {
            totalCredits: 0,
            usedCredits: 0,
            balanceCredits: 0,
          },
        );
      } catch (creditErr) {
        console.error("Failed to fetch credits:", creditErr);
        setCredits({ totalCredits: 0, usedCredits: 0, balanceCredits: 0 });
      }

      // Fetch countries
      try {
        setCountriesLoading(true);
        const countriesRes = await axios.get(
          `https://telegramdirectory.org/api/getCountry`,
        );
        const countryList = (countriesRes.data?.CountryData || [])
          .filter((it: any) => it.country_key !== "GLOBAL")
          .map((it: any) => ({
            code: it.country_id,
            name: it.country_name,
            key: it.country_key,
          }));
        setCountryOptions(countryList);
      } catch (countriesErr) {
        console.error("Failed to fetch countries:", countriesErr);
        // Fallback countries
        setCountryOptions([
          { code: "1", name: "Afghanistan", key: "AFGHANISTAN" },
          { code: "2", name: "Aland Islands", key: "ALAND_ISLANDS" },
          { code: "3", name: "Albania", key: "ALBANIA" },
          { code: "98", name: "India", key: "INDIA" },
          { code: "225", name: "United States", key: "UNITED_STATES" },
          { code: "229", name: "United Kingdom", key: "UNITED_KINGDOM" },
        ]);
      } finally {
        setCountriesLoading(false);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load advertisement data";
      setError(errorMessage);
      console.error("Advertisement data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCredits = async () => {
    try {
      const creditsRes = await axios.get(
        `${API_BASE_URL}/api/v1/advertisement/my-credits`,
        { headers: getAuthHeaders() },
      );
      setCredits(
        creditsRes.data?.data || {
          totalCredits: 0,
          usedCredits: 0,
          balanceCredits: 0,
        },
      );
    } catch (err) {
      console.error("Failed to refresh credits:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    packages,
    credits,
    countryOptions,
    loading,
    error,
    countriesLoading,
    refreshCredits,
    setCredits,
  };
};
