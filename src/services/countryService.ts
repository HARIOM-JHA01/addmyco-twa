import axios from "axios";

export interface CountryOption {
  code: string;
  name: string;
}

const COUNTRY_API_URL = "https://telegramdirectory.org/api/getCountry";

export const getCountries = async (): Promise<CountryOption[]> => {
  try {
    const response = await axios.get<{ CountryData: any[] }>(COUNTRY_API_URL);
    
    const countries = (response.data.CountryData || [])
      .filter(
        (c) => c.country_key !== "GLOBAL" && c.country_code && c.country_code !== "0"
      )
      .map((c) => ({
        code: c.country_code,
        name: c.country_name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error("Failed to fetch countries:", error);
    return [];
  }
};
