import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://admin.addmy.co";

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

export const fetchUserProfile = async (
  username: string
): Promise<PublicProfileData> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getuserprofile`, {
      username,
    });

    if (response.data && response.data.success && response.data.data) {
      const profile = response.data.data;

      const result: PublicProfileData = {
        _id: profile._id,
        username: profile.username,
        tgid: profile.tgid,
        country: profile.country,
        countryCode: profile.countryCode,
        memberid: profile.memberid,
        membertype: profile.membertype,
        owner_name_english: profile.owner_name_english,
        owner_name_chinese: profile.owner_name_chinese,
        email: profile.email,
        contact: profile.contact,
        address1: profile.address1,
        address2: profile.address2,
        address3: profile.address3,
        telegramId: profile.telegramId || profile.tgid || profile.tgId,
        WhatsApp: profile.WhatsApp,
        Facebook: profile.Facebook,
        Instagram: profile.Instagram,
        Youtube: profile.Youtube,
        Linkedin: profile.Linkedin,
        Twitter: profile.Twitter,
        Line: profile.Line,
        WeChat: profile.WeChat,
        SnapChat: profile.SnapChat,
        Skype: profile.Skype,
        TikTok: profile.TikTok,
        profile_image: profile.profile_image,
        video: profile.video,
        website: profile.website,
        companydata: profile.companydata,
      };

      return result;
    }

    throw new Error("Profile not found");
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
    const response = await axios.post(`${API_BASE_URL}/getuserchambers`, {
      username,
    });
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch chambers:", error);
    return [];
  }
};

export const fetchPublicCompanies = async (
  username: string
): Promise<CompanyData[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/getusercompanies`, {
      username,
    });
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
};
