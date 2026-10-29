// Summary card built from Polaris web components so it follows the admin's
// styling. A top-level s-section draws its own card.
export function StatCard({ label, value, hint = null }) {
  return (
    <s-section heading={label}>
      <s-stack gap="small-200">
        <s-text type="strong">{value}</s-text>
        {hint ? <s-text color="subdued">{hint}</s-text> : null}
      </s-stack>
    </s-section>
  );
}
