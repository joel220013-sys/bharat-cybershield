function StatusBadge({ status }) {
  let badgeClass = "bg-success";

  switch (status) {
    case "Danger":
      badgeClass = "bg-danger";
      break;

    case "Suspicious":
      badgeClass = "bg-warning text-dark";
      break;

    case "Safe":
      badgeClass = "bg-success";
      break;

    default:
      badgeClass = "bg-secondary";
  }

  return (
    <span className={`badge ${badgeClass} fs-6 px-3 py-2`}>
      {status}
    </span>
  );
}

export default StatusBadge;