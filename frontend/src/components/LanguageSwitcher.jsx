import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      style={{
        background: "#111827",
        color: "#39ff14",
        border: "1px solid #39ff14",
        borderRadius: "10px",
        padding: "8px 14px",
        fontWeight: "600",
        cursor: "pointer",
        outline: "none",
        boxShadow: "0 0 10px rgba(57,255,20,.25)",
      }}
    >
      <option value="en">🇺🇸 English</option>
      <option value="hi">🇮🇳 हिन्दी</option>
      <option value="kn">🇮🇳 ಕನ್ನಡ</option>
      <option value="ta">🇮🇳 தமிழ்</option>
      <option value="te">🇮🇳 తెలుగు</option>
      <option value="ml">🇮🇳 മലയാളം</option>
    </select>
  );
}

export default LanguageSwitcher;