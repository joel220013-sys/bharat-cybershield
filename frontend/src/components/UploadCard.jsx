function UploadCard({ onFileChange, onScan, loading }) {
  return (
    <div className="card shadow-lg p-4 mb-4">
      <h3 className="mb-3">Upload QR Code</h3>

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
        {loading ? "Scanning..." : "Scan QR"}
      </button>
    </div>
  );
}

export default UploadCard;