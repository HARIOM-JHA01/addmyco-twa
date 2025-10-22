import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface PublicProfileData {
  _id: string;
  username: string;
  tgid?: string;
  country?: string;
  countryCode?: string;
  memberid?: string;
  membertype?: string;
  owner_name_english?: string;
  owner_name_chinese?: string;
  email?: string;
  contact?: number;
  address1?: string;
  address2?: string;
  address3?: string;
  telegramId?: string;
  WhatsApp?: string;
  Facebook?: string;
  Instagram?: string;
  Youtube?: string;
  Linkedin?: string;
  Twitter?: string;
  Line?: string;
  WeChat?: string;
  SnapChat?: string;
  Skype?: string;
  TikTok?: string;
  profile_image?: string;
  video?: string;
  website?: string;
  companydata?: {
    company_name_english?: string;
    company_name_chinese?: string;
  };
  userDoc?: CompanyData[];
  chamberDoc?: ChamberData[];
  theme?: ThemeData;
}

export interface CompanyData {
  _id: string;
  user_id: string;
  company_name_english?: string;
  company_name_chinese?: string;
  companydesignation?: string;
  description?: string;
  email?: string;
  WhatsApp?: string;
  telegramId?: string;
  website?: string;
  Instagram?: string;
  Youtube?: string;
  facebook?: string;
  image?: string;
  company_order?: number;
}

export interface ChamberData {
  _id: string;
  user_id: string;
  chamber_name_english?: string;
  chamber_name_chinese?: string;
  chamberdesignation?: string;
  detail?: string;
  chamberwebsite?: string;
  WhatsApp?: string;
  WeChat?: string;
  Instagram?: string;
  Youtube?: string;
  Facebook?: string;
  Line?: string;
  Twitter?: string;
  Linkedin?: string;
  SnapChat?: string;
  Skype?: string;
  TikTok?: string;
  tgchannel?: string;
  chamberfanpage?: string;
  image?: string;
  video?: string;
  chamber_order?: number;
}

export interface ThemeData {
  _id: string;
  user_id: string;
  Thumbnail?: string;
  backgroundcolor?: string;
  fontcolor?: string;
  iconcolor?: string;
}

export const fetchPublicProfile = async (
  username: string
): Promise<PublicProfileData> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getlandingpage`, {
      username,
    });

    if (
      response.data.success &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      return response.data.data[0];
    } else {
      throw new Error("Profile not found");
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      throw new Error("User not found");
    }
    throw new Error(error.message || "Failed to fetch profile");
  }
};

export const fetchPublicChambers = async (
  username: string
): Promise<ChamberData[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getlandingpage`, {
      username,
    });

    if (
      response.data.success &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      const profileData = response.data.data[0];
      // Assuming chambers are also included in the response similar to companies
      // Adjust this based on actual API response structure
      return profileData.chamberDoc || [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch chambers:", error);
    return [];
  }
};
