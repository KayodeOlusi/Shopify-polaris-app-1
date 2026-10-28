import db from "../db.server";
import { BRAND_LABEL_MAX_LENGTH } from "../constants/settings";

export const DEFAULT_SETTINGS = {
  defaultDestination: "product",
  brandLabel: "QR Studio",
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  showProductImages: true,
  defaultSort: "newest",
};

const DESTINATIONS = ["product", "cart"];
const SORTS = ["newest", "most-scans"];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function pickSettings(record) {
  return {
    defaultDestination: record.defaultDestination,
    brandLabel: record.brandLabel,
    foregroundColor: record.foregroundColor,
    backgroundColor: record.backgroundColor,
    showProductImages: record.showProductImages,
    defaultSort: record.defaultSort,
  };
}

export async function getSettings(shop) {
  const record = await db.shopSettings.findUnique({ where: { shop } });

  return record ? pickSettings(record) : { ...DEFAULT_SETTINGS };
}

// Form data arrives as strings, so normalise before validating or saving.
export function parseSettings(data) {
  return {
    defaultDestination: String(data.defaultDestination ?? ""),
    brandLabel: String(data.brandLabel ?? "").trim(),
    foregroundColor: String(data.foregroundColor ?? "").trim(),
    backgroundColor: String(data.backgroundColor ?? "").trim(),
    showProductImages: data.showProductImages === "true",
    defaultSort: String(data.defaultSort ?? ""),
  };
}

export function validateSettings(settings) {
  const errors = {};

  if (!DESTINATIONS.includes(settings.defaultDestination)) {
    errors.defaultDestination = "Choose a scan destination";
  }

  if (!settings.brandLabel) {
    errors.brandLabel = "Brand label is required";
  } else if (settings.brandLabel.length > BRAND_LABEL_MAX_LENGTH) {
    errors.brandLabel = `Brand label must be ${BRAND_LABEL_MAX_LENGTH} characters or fewer`;
  }

  if (!HEX_COLOR.test(settings.foregroundColor)) {
    errors.foregroundColor = "Enter a hex colour, for example #000000";
  }

  if (!HEX_COLOR.test(settings.backgroundColor)) {
    errors.backgroundColor = "Enter a hex colour, for example #ffffff";
  }

  if (
    !errors.foregroundColor &&
    !errors.backgroundColor &&
    settings.foregroundColor.toLowerCase() ===
      settings.backgroundColor.toLowerCase()
  ) {
    errors.backgroundColor =
      "Background must be different from the foreground or codes won't scan";
  }

  if (!SORTS.includes(settings.defaultSort)) {
    errors.defaultSort = "Choose a sort order";
  }

  if (Object.keys(errors).length) {
    return errors;
  }
}

export async function saveSettings(shop, settings) {
  const record = await db.shopSettings.upsert({
    where: { shop },
    create: { shop, ...settings },
    update: settings,
  });

  return pickSettings(record);
}

export async function resetSettings(shop) {
  await db.shopSettings.deleteMany({ where: { shop } });

  return { ...DEFAULT_SETTINGS };
}
