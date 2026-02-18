// Employee Namecard Types

export interface CompanyTemplate {
  _id: string;
  template_title?: string;
  owner_id?: string;
  owner_type?: "enterprise" | "operator";
  company_name_english: string;
  company_name_chinese: string;
  companydesignation: string;
  description?: string;
  email?: string;
  WhatsApp?: string;
  WeChat?: string;
  Line?: string;
  Instagram?: string;
  Facebook?: string;
  Twitter?: string;
  Youtube?: string;
  Linkedin?: string;
  SnapChat?: string;
  Skype?: string;
  TikTok?: string;
  telegramId?: string;
  contact?: string;
  fax?: string;
  website?: string;
  fanpage?: string;
  companystatus?: number;
  company_order?: number;
  image?: string;
  video?: string;
  date?: string;
}

export interface ChamberTemplate {
  _id: string;
  template_title?: string;
  owner_id?: string;
  owner_type?: "enterprise" | "operator";
  chamber_name_english: string;
  chamber_name_chinese: string;
  chamberdesignation: string;
  detail?: string;
  tgchannel?: string;
  chamberfanpage?: string;
  chamberwebsite?: string;
  chamber_order?: number;
  WhatsApp?: string;
  WeChat?: string;
  Line?: string;
  Instagram?: string;
  Facebook?: string;
  Twitter?: string;
  Youtube?: string;
  Linkedin?: string;
  SnapChat?: string;
  Skype?: string;
  TikTok?: string;
  usertype?: number;
  image?: string;
  video?: string;
  date?: string;
}

export interface CompanyTemplateFormData {
  template_title: string;
  company_name_english?: string;
  company_name_chinese?: string;
  companydesignation?: string;
  description?: string;
  email?: string;
  WhatsApp?: string;
  WeChat?: string;
  Line?: string;
  Instagram?: string;
  Facebook?: string;
  Twitter?: string;
  Youtube?: string;
  Linkedin?: string;
  SnapChat?: string;
  Skype?: string;
  TikTok?: string;
  telegramId?: string;
  contact?: string;
  fax?: string;
  website?: string;
  fanpage?: string;
  video?: string;
  companystatus?: number;
  company_order?: number;
}

export interface ChamberTemplateFormData {
  template_title: string;
  chamber_name_english?: string;
  chamber_name_chinese?: string;
  chamberdesignation?: string;
  detail?: string;
  tgchannel?: string;
  chamberfanpage?: string;
  chamberwebsite?: string;
  chamber_order?: number;
  WhatsApp?: string;
  WeChat?: string;
  Line?: string;
  Instagram?: string;
  Facebook?: string;
  Twitter?: string;
  Youtube?: string;
  Linkedin?: string;
  SnapChat?: string;
  Skype?: string;
  TikTok?: string;
  video?: string;
  usertype?: number;
}

export interface TemplateResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DeleteTemplateResponse {
  success: boolean;
  message: string;
}

export interface EmployeeNamecard {
  _id: string;
  name_english: string;
  name_chinese: string;
  telegram_username: string;
  contact_number: string;
  address1: string;
  address2: string;
  address3: string;
  whatsapp_link: string;
  profile_image?: string;
  profile_video?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  x_twitter?: string;
  line?: string;
  youtube?: string;
  website?: string;
  company_template: CompanyTemplate;
  chamber_template?: ChamberTemplate | null;
  createdByUser?: string;
  createdByOperator?: string;
  isActive: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeNamecardFormData {
  name_english: string;
  name_chinese: string;
  telegram_username: string;
  contact_number: string;
  address1: string;
  address2: string;
  address3: string;
  whatsapp_link: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  x_twitter?: string;
  line?: string;
  youtube?: string;
  website?: string;
  company_template_id: string;
  chamber_template_id?: string;
}

export interface CreateEmployeeNamecardResponse {
  success: boolean;
  message: string;
  data: EmployeeNamecard;
}

export interface GetEmployeeNamecardsResponse {
  success: boolean;
  message: string;
  data: EmployeeNamecard[];
}

export interface GetTemplatesResponse {
  success: boolean;
  message: string;
  data: CompanyTemplate[] | ChamberTemplate[];
}

export interface DeleteEmployeeNamecardResponse {
  success: boolean;
  message: string;
}

export interface UpdateEmployeeNamecardResponse {
  success: boolean;
  message: string;
  data: EmployeeNamecard;
}
