import { ButtonHTMLAttributes, useEffect, useState } from "react";
import i18n, { getLanguage } from "../i18n";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  textKey?: string;
};

export default function TransButton({ textKey, children, ...rest }: Props) {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    const onLang = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLang(detail?.lang || getLanguage());
    };
    window.addEventListener("language-changed", onLang as EventListener);
    return () =>
      window.removeEventListener("language-changed", onLang as EventListener);
  }, []);

  if (textKey) {
    return <button {...rest}>{i18n.t(textKey, lang)}</button>;
  }

  return <button {...rest}>{children}</button>;
}
