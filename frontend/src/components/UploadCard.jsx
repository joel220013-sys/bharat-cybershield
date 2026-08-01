import { useTranslation } from "react-i18next";

function UploadCard({ onFileChange, onScan, loading }) {
  const { t } = useTranslation();

  return (
    <div className="card shadow-lg p-4 mb-4">

      <h3 className="mb-3">
        {t("home.upload")}
      </h3>

      <input
        className="form-control mb-3"
        type="file"
        accept="image/*"
        onChange={onFileChange}
      />

      <button
        className="btn btn-primary w-100"
        onClick={onScan}
        disabled={loading}
      >
        {loading
          ? t("home.scanning")
          : t("home.analyze")}
      </button>

    </div>
  );
}

export default UploadCard;