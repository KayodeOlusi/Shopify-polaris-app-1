// Our own pill instead of s-badge so the scan status uses the brand palette.
export function StatusPill({ scans }) {
  const scanned = scans > 0;

  return (
    <span
      className={
        scanned ? "status-pill status-pill--scanned" : "status-pill status-pill--idle"
      }
    >
      {scanned ? "Scanned" : "No scans yet"}
    </span>
  );
}
