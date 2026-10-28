// Polaris web components have no tabs component, so this is our own tab bar.
export function SettingsTabs({ tabs, selected, onSelect }) {
  function handleKeyDown(e) {
    const index = tabs.findIndex((tab) => tab.id === selected);
    if (e.key === "ArrowRight") {
      onSelect(tabs[(index + 1) % tabs.length].id);
    } else if (e.key === "ArrowLeft") {
      onSelect(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  }

  return (
    <div className="settings-tabs" role="tablist" aria-label="Settings sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`settings-tab-${tab.id}`}
          aria-controls={`settings-panel-${tab.id}`}
          aria-selected={tab.id === selected}
          tabIndex={tab.id === selected ? 0 : -1}
          className="settings-tabs__tab"
          onClick={() => onSelect(tab.id)}
          onKeyDown={handleKeyDown}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
