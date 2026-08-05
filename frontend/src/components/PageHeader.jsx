import LanguageSwitcher from "./LanguageSwitcher";

function PageHeader({
  title = "Bharat CyberShield",
  subtitle = "AI-Powered QR Scam Detection Platform",
}) {
  return (
    <div
      style={{
        position: "relative",
        marginBottom: "40px",
      }}
    >
      {/* Language Button */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
        }}
      >
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <div className="text-center">

        <h1
          style={{
            color: "#39ff14",
            fontSize: "58px",
            fontWeight: "800",
            textShadow: "0 0 15px rgba(57,255,20,.7)",
            marginBottom: "10px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            color: "#8d99ae",
            fontSize: "22px",
          }}
        >
          {subtitle}
        </p>

      </div>
    </div>
  );
}

export default PageHeader;