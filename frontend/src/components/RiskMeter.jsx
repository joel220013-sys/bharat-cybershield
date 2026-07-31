function RiskMeter({ score = 0 }) {
  let color = "bg-success";

  if (score >= 80) {
    color = "bg-danger";
  } else if (score >= 50) {
    color = "bg-warning";
  }

  // Keep a small visible bar when score is 0
  const displayWidth = score === 0 ? 5 : score;

  return (
    <>
      <h5 className="mb-3">Risk Score</h5>

      <div
        className="progress mb-3"
        style={{ height: "28px" }}
      >
        <div
          className={`progress-bar ${color}`}
          role="progressbar"
          style={{ width: `${displayWidth}%` }}
          aria-valuenow={score}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {score}%
        </div>
      </div>
    </>
  );
}

export default RiskMeter;