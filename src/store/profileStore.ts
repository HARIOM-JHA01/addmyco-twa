import { create } from 'zustand';

export type Profile = {
  _id: string;
  username: string;
  country: string;
  membertype: string;
  membershiperiod: string;
  joindate: string;
  count: number;
  usertype: number;
  languagetype: number;
  profilestatus: number;
  companystatus: number;
  enddate: string | null;
  startdate: string | null;
  paymentstatus: string | null;
  isReferral: number;
  refstatue: number;
  refimgstatue: number;
  referralType: number;
  paymentBy: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  token: string;
  Facebook: string;
  Instagram: string;
  Line: string;
  Linkedin: string;
  Skype: string;
  SnapChat: string;
  TikTok: string;
  Twitter: string;
  WeChat: string;
  WhatsApp: string;
  Youtube: string;
  address1: string;
  address2: string;
  address3: string;
  contact: string | number;
  email: string;
  owner_name_chinese: string;
  owner_name_english: string;
  telegramId: string;
  logoImage: string;
  logoTelegramUrl: string;
  profile_image: string;
  video: string;
};

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set(() => {
    localStorage.setItem('profile', JSON.stringify(profile));
    return { profile };
  }),
  clearProfile: () => set(() => {
    localStorage.removeItem('profile');
    return { profile: null };
  }),
}));
