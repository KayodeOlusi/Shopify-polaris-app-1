import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import {
  getSettings,
  parseSettings,
  resetSettings,
  saveSettings,
  validateSettings,
} from "../models/Settings.server";
import { BRAND_LABEL_MAX_LENGTH } from "../constants/settings";
import { ColorInput } from "../components/ColorInput";
import { SettingsTabs } from "../components/SettingsTabs";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);

  return { settings: await getSettings(session.shop) };
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const data = Object.fromEntries(await request.formData());

  if (data.intent === "reset") {
    return { settings: await resetSettings(session.shop), reset: true };
  }

  const settings = parseSettings(data);
  const errors = validateSettings(settings);

  if (errors) {
    return new Response(JSON.stringify({ errors }), {
      status: 422,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return { settings: await saveSettings(session.shop, settings), saved: true };
}

const TABS = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "advanced", label: "Advanced" },
];

const FIELD_TABS = {
  defaultDestination: "general",
  brandLabel: "general",
  foregroundColor: "appearance",
  backgroundColor: "appearance",
  defaultSort: "appearance",
};

export default function Settings() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();

  const [initialFormState, setInitialFormState] = useState(settings);
  const [formState, setFormState] = useState(settings);
  const [selectedTab, setSelectedTab] = useState("general");
  const errors = fetcher.data?.errors || {};
  const isDirty =
    JSON.stringify(formState) !== JSON.stringify(initialFormState);
  const saving =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "save";
  const resetting =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "reset";

  const saveBarRef = useRef(null);
  const resetModalRef = useRef(null);

  function updateField(field, value) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    fetcher.submit(
      {
        intent: "save",
        ...formState,
        showProductImages: String(formState.showProductImages),
      },
      { method: "post" },
    );
  }

  function handleDiscard() {
    setFormState(initialFormState);
    saveBarRef.current?.hide();
  }

  function handleReset() {
    fetcher.submit({ intent: "reset" }, { method: "post" });
  }

  useEffect(() => {
    const saveBar = saveBarRef.current;
    if (!saveBar) return;

    if (isDirty) {
      saveBar.show();
    } else {
      saveBar.hide();
    }
  }, [isDirty]);

  useEffect(() => {
    setInitialFormState(settings);
    setFormState(settings);
  }, [settings]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.saved) {
      shopify.toast.show("Settings saved");
    } else if (fetcher.data.reset) {
      resetModalRef.current?.hideOverlay();
      shopify.toast.show("Settings reset to defaults");
    } else if (fetcher.data.errors) {
      const firstField = Object.keys(fetcher.data.errors)[0];
      setSelectedTab(FIELD_TABS[firstField] || "general");
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="settings-page">
      <ui-save-bar ref={saveBarRef} id="settings-form">
        <button variant="primary" onClick={handleSave} disabled={saving}></button>
        <button onClick={handleDiscard}></button>
      </ui-save-bar>
      <form onSubmit={handleSave} onReset={handleDiscard}>
        <s-page heading="Settings">
          <div className="settings-header">
            <h2 className="settings-header__title">QR Studio</h2>
            <p className="settings-header__description">
              Choose how new QR codes behave, how they look when printed, and
              how your QR code list is shown.
            </p>
          </div>

          <SettingsTabs
            tabs={TABS}
            selected={selectedTab}
            onSelect={setSelectedTab}
          />

          {selectedTab === "general" ? (
            <div
              role="tabpanel"
              id="settings-panel-general"
              aria-labelledby="settings-tab-general"
            >
              <s-section heading="General">
                <s-stack gap="base">
                  <s-select
                    label="Default scan destination"
                    name="defaultDestination"
                    details="Used for new QR codes"
                    value={formState.defaultDestination}
                    error={errors.defaultDestination}
                    onInput={(e) =>
                      updateField("defaultDestination", e.currentTarget.value)
                    }
                  >
                    <s-option value="product">Link to product page</s-option>
                    <s-option value="cart">
                      Link to checkout page with product in the cart
                    </s-option>
                  </s-select>
                  <s-grid gridTemplateColumns="1fr auto" gap="small" alignItems="start">
                    <s-text-field
                      label="Brand label"
                      name="brandLabel"
                      required
                      maxLength={BRAND_LABEL_MAX_LENGTH}
                      autocomplete="off"
                      details={`${formState.brandLabel.length}/${BRAND_LABEL_MAX_LENGTH} characters`}
                      value={formState.brandLabel}
                      error={errors.brandLabel}
                      onInput={(e) =>
                        updateField("brandLabel", e.currentTarget.value)
                      }
                    />
                    <s-box paddingBlockStart="large">
                      <s-button
                        variant="tertiary"
                        icon="question-circle"
                        commandFor="brand-label-help"
                        accessibilityLabel="What is the brand label?"
                      />
                    </s-box>
                  </s-grid>
                  <s-popover id="brand-label-help" inlineSize="280px">
                    <s-box padding="base">
                      <s-stack gap="small">
                        <s-text type="strong">Brand label</s-text>
                        <s-paragraph>
                          The name customers see next to your QR codes, such
                          as your store or brand name. Keep it short so it fits
                          on printed labels.
                        </s-paragraph>
                      </s-stack>
                    </s-box>
                  </s-popover>
                </s-stack>
              </s-section>
            </div>
          ) : null}

          {selectedTab === "appearance" ? (
            <div
              role="tabpanel"
              id="settings-panel-appearance"
              aria-labelledby="settings-tab-appearance"
            >
              <s-section heading="QR code colours">
                <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                  <ColorInput
                    label="Foreground"
                    name="foregroundColor"
                    value={formState.foregroundColor}
                    error={errors.foregroundColor}
                    onChange={(value) => updateField("foregroundColor", value)}
                  />
                  <ColorInput
                    label="Background"
                    name="backgroundColor"
                    value={formState.backgroundColor}
                    error={errors.backgroundColor}
                    onChange={(value) => updateField("backgroundColor", value)}
                  />
                </s-grid>
              </s-section>
              <s-section heading="QR code list">
                <s-stack gap="base">
                  <s-switch
                    label="Show product images in the list"
                    name="showProductImages"
                    checked={formState.showProductImages}
                    onInput={(e) =>
                      updateField("showProductImages", e.currentTarget.checked)
                    }
                  />
                  <s-select
                    label="Default sort"
                    name="defaultSort"
                    value={formState.defaultSort}
                    error={errors.defaultSort}
                    onInput={(e) =>
                      updateField("defaultSort", e.currentTarget.value)
                    }
                  >
                    <s-option value="newest">Newest</s-option>
                    <s-option value="most-scans">Most scans</s-option>
                  </s-select>
                </s-stack>
              </s-section>
            </div>
          ) : null}

          {selectedTab === "advanced" ? (
            <div
              role="tabpanel"
              id="settings-panel-advanced"
              aria-labelledby="settings-tab-advanced"
            >
              <s-section heading="Reset settings">
                <s-stack gap="base">
                  <s-paragraph>
                    Put every setting on this page back to its default. Your QR
                    codes and their scan counts aren&apos;t affected.
                  </s-paragraph>
                  <s-stack direction="inline">
                    <s-button
                      tone="critical"
                      commandFor="reset-settings-modal"
                      command="--show"
                    >
                      Reset settings
                    </s-button>
                  </s-stack>
                </s-stack>
              </s-section>
            </div>
          ) : null}

          <s-modal
            ref={resetModalRef}
            id="reset-settings-modal"
            heading="Reset all settings?"
            size="small"
          >
            <s-paragraph>
              Every setting goes back to its default value. Unsaved changes on
              this page are lost too.
            </s-paragraph>
            <s-button
              slot="primary-action"
              variant="primary"
              tone="critical"
              loading={resetting}
              onClick={handleReset}
            >
              Reset settings
            </s-button>
            <s-button
              slot="secondary-actions"
              commandFor="reset-settings-modal"
              command="--hide"
            >
              Cancel
            </s-button>
          </s-modal>
        </s-page>
      </form>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
