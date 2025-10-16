export type Lang = 'en' | 'zh';

const STORAGE_KEY = 'app_language';

const defaultLang: Lang = 'en';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    membership: 'Membership',
    background: 'Background',
    theme: 'Theme',
    language: 'Language',
    logout: 'Logout',
    english: 'English',
    chinese: 'Chinese (Traditional)',
    cancel: 'Cancel',
    save_language: 'Save Language',
    add_new_folder: 'Add New Folder',
    folder_name: 'Folder Name',
    submit: 'Submit',
    edit_folder: 'Edit Folder',
    update: 'Update',
    delete: 'Delete',
    no_contacts: 'No contacts available',
    search_placeholder: 'Search by Name and Company name',
    add_more_folders: '+ add more folders'
  },
  zh: {
    membership: '會員',
    background: '背景',
    theme: '主題',
    language: '語言',
    logout: '登出',
    english: '英語',
    chinese: '繁體中文',
    cancel: '取消',
    save_language: '儲存語言',
    add_new_folder: '新增資料夾',
    folder_name: '資料夾名稱',
    submit: '送出',
    edit_folder: '編輯資料夾',
    update: '更新',
    delete: '刪除',
    no_contacts: '沒有聯絡人',
    search_placeholder: '以姓名或公司搜尋',
    add_more_folders: '+ 新增資料夾'
  }
};

export function getLanguage(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return defaultLang;
    return v === 'zh' ? 'zh' : 'en';
  } catch {
    return defaultLang;
  }
}

export function setLanguage(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    // notify listeners
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
  } catch {}
}

export function t(key: string, lang?: Lang) {
  const use = lang || getLanguage();
  return translations[use][key] ?? key;
}

export default { getLanguage, setLanguage, t };
