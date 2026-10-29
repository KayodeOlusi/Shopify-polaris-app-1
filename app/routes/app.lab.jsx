import { useEffect, useRef, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";

// Isolation page: the patterns used on the QR codes list and Settings pages,
// built with Polaris web components and App Bridge only (no app.css classes,
// no custom components), so problems can be traced to Polaris or to our code.

export async function loader({ request }) {
  await authenticate.admin(request);

  return null;
}

const thumbnail = (color) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/></svg>`,
  )}`;

const SAMPLE_ROWS = [
  {
    id: "1",
    title: "Summer sale flyer",
    product: "Linen shirt",
    created: "2026-09-02",
    scans: 128,
    color: "#f4a261",
  },
  {
    id: "2",
    title: "Store window poster",
    product: "Canvas tote",
    created: "2026-09-14",
    scans: 54,
    color: "#2a9d8f",
  },
  {
    id: "3",
    title: "Packaging insert",
    product: "Ceramic mug",
    created: "2026-10-01",
    scans: 0,
    color: "#e9c46a",
  },
  {
    id: "4",
    title: "Market stall sign",
    product: "Wool beanie",
    created: "2026-10-09",
    scans: 17,
    color: "#264653",
  },
  {
    id: "5",
    title: "Receipt footer",
    product: "Gift card",
    created: "2026-10-20",
    scans: 3,
    color: "#e76f51",
  },
];

export default function Lab() {
  const [savedName, setSavedName] = useState("Lab sample");
  const [name, setName] = useState(savedName);
  const isDirty = name !== savedName;

  const defaultFilters = { query: "", destination: "all", sort: "newest" };
  const [filters, setFilters] = useState(defaultFilters);
  const hasActiveFilters =
    filters.query !== "" ||
    filters.destination !== "all" ||
    filters.sort !== defaultFilters.sort;

  const [pendingDelete, setPendingDelete] = useState(null);

  const saveBarRef = useRef(null);
  const modalRef = useRef(null);

  function updateFilters(changes) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function handleSave(e) {
    e.preventDefault();
    setSavedName(name);
    shopify.toast.show("Lab form saved");
  }

  function handleDiscard() {
    setName(savedName);
    saveBarRef.current?.hide();
  }

  function handleConfirm() {
    modalRef.current?.hideOverlay();
    shopify.toast.show("Confirmed");
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

  return (
    <>
      <ui-save-bar ref={saveBarRef} id="lab-form">
        <button variant="primary" onClick={handleSave}></button>
        <button onClick={handleDiscard}></button>
      </ui-save-bar>
      <s-page heading="Polaris lab">
        <s-section heading="Fields">
          <s-stack direction="inline" gap="base" alignItems="end">
            <s-text-field
              label="Search"
              placeholder="Search by title"
              autocomplete="off"
            />
            <s-select label="Destination">
              <s-option value="all">All destinations</s-option>
              <s-option value="product">Product page</s-option>
              <s-option value="cart">Checkout</s-option>
            </s-select>
            <s-select label="Sort by" icon="sort">
              <s-option value="newest">Newest</s-option>
              <s-option value="most-scans">Most scans</s-option>
            </s-select>
          </s-stack>
        </s-section>

        {/* Same markup as FilterBar in app._index.jsx, without the wrapper div */}
        <s-section>
          <s-grid gridTemplateColumns="2fr 1fr 1fr auto" gap="base" alignItems="end">
            <s-search-field
              label="Search QR codes"
              labelAccessibilityVisibility="exclusive"
              placeholder="Search by title"
              value={filters.query}
              onInput={(e) => updateFilters({ query: e.currentTarget.value })}
            />
            <s-select
              label="Destination"
              value={filters.destination}
              onInput={(e) => updateFilters({ destination: e.currentTarget.value })}
            >
              <s-option value="all">All destinations</s-option>
              <s-option value="product">Product page</s-option>
              <s-option value="cart">Checkout</s-option>
            </s-select>
            <s-select
              label="Sort by"
              icon="sort"
              value={filters.sort}
              onInput={(e) => updateFilters({ sort: e.currentTarget.value })}
            >
              <s-option value="newest">Newest</s-option>
              <s-option value="most-scans">Most scans</s-option>
            </s-select>
            <s-button disabled={!hasActiveFilters} onClick={clearFilters}>
              Clear filters
            </s-button>
          </s-grid>
        </s-section>

        {/* Same as the row above, made responsive like the list's summary cards */}
        <s-section>
          <s-query-container>
            <s-grid
              gridTemplateColumns="@container (inline-size > 600px) 2fr 1fr 1fr auto, 1fr"
              gap="base"
              alignItems="end"
            >
              <s-search-field
                label="Search QR codes"
                labelAccessibilityVisibility="exclusive"
                placeholder="Search by title"
                value={filters.query}
                onInput={(e) => updateFilters({ query: e.currentTarget.value })}
              />
              <s-select
                label="Destination"
                value={filters.destination}
                onInput={(e) => updateFilters({ destination: e.currentTarget.value })}
              >
                <s-option value="all">All destinations</s-option>
                <s-option value="product">Product page</s-option>
                <s-option value="cart">Checkout</s-option>
              </s-select>
              <s-select
                label="Sort by"
                icon="sort"
                value={filters.sort}
                onInput={(e) => updateFilters({ sort: e.currentTarget.value })}
              >
                <s-option value="newest">Newest</s-option>
                <s-option value="most-scans">Most scans</s-option>
              </s-select>
              <s-button disabled={!hasActiveFilters} onClick={clearFilters}>
                Clear filters
              </s-button>
            </s-grid>
          </s-query-container>
        </s-section>

        <s-section heading="Menu, modal and popover">
          <s-stack direction="inline" gap="base">
            <s-button
              commandFor="lab-menu"
              icon="menu-horizontal"
              accessibilityLabel="Lab actions"
            />
            <s-menu id="lab-menu" accessibilityLabel="Lab actions">
              <s-button icon="edit">Edit</s-button>
              <s-button icon="duplicate">Duplicate</s-button>
              <s-button
                icon="delete"
                tone="critical"
                commandFor="lab-modal"
                command="--show"
              >
                Delete
              </s-button>
            </s-menu>

            <s-button
              variant="tertiary"
              icon="question-circle"
              commandFor="lab-popover"
              accessibilityLabel="About this page"
            />
            <s-popover id="lab-popover" inlineSize="280px">
              <s-box padding="base">
                <s-paragraph>
                  This page uses Polaris web components and App Bridge only.
                </s-paragraph>
              </s-box>
            </s-popover>
          </s-stack>

          <s-modal
            ref={modalRef}
            id="lab-modal"
            heading="Delete sample item?"
            size="small"
          >
            <s-paragraph>
              {pendingDelete
                ? `"${pendingDelete.title}" isn't really deleted. This is a sample.`
                : "Nothing is deleted. This is a sample."}
            </s-paragraph>
            <s-button
              slot="primary-action"
              variant="primary"
              tone="critical"
              onClick={handleConfirm}
            >
              Confirm
            </s-button>
            <s-button
              slot="secondary-actions"
              commandFor="lab-modal"
              command="--hide"
            >
              Cancel
            </s-button>
          </s-modal>
        </s-section>

        <form onSubmit={handleSave} onReset={handleDiscard}>
          <s-section heading="Save bar">
            <s-text-field
              label="Name"
              name="name"
              autocomplete="off"
              value={name}
              onInput={(e) => setName(e.currentTarget.value)}
            />
          </s-section>
        </form>

        <s-section padding="none" accessibilityLabel="Sample table">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Title</s-table-header>
              <s-table-header>Product</s-table-header>
              <s-table-header>Date created</s-table-header>
              <s-table-header format="numeric">Scans</s-table-header>
              <s-table-header>Actions</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {SAMPLE_ROWS.map((row) => (
                <s-table-row key={row.id}>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-clickable
                        href="/app/lab"
                        accessibilityLabel={`Open ${row.title}`}
                        border="base"
                        borderRadius="base"
                        overflow="hidden"
                        inlineSize="20px"
                        blockSize="20px"
                      >
                        <s-image
                          objectFit="cover"
                          src={thumbnail(row.color)}
                          alt=""
                        ></s-image>
                      </s-clickable>
                      <s-link href="/app/lab">{row.title}</s-link>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>{row.product}</s-table-cell>
                  <s-table-cell>
                    {new Date(row.created).toDateString()}
                  </s-table-cell>
                  <s-table-cell>{row.scans}</s-table-cell>
                  <s-table-cell>
                    <s-button
                      commandFor={`lab-actions-${row.id}`}
                      icon="menu-horizontal"
                      variant="tertiary"
                      accessibilityLabel={`Actions for ${row.title}`}
                    />
                    <s-menu
                      id={`lab-actions-${row.id}`}
                      accessibilityLabel={`Actions for ${row.title}`}
                    >
                      <s-button icon="edit" href="/app/lab">
                        Edit
                      </s-button>
                      <s-button
                        icon="download"
                        href={thumbnail(row.color)}
                        download={`sample-${row.id}.svg`}
                      >
                        Download
                      </s-button>
                      <s-button
                        icon="delete"
                        tone="critical"
                        commandFor="lab-modal"
                        command="--show"
                        onClick={() => setPendingDelete(row)}
                      >
                        Delete
                      </s-button>
                    </s-menu>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      </s-page>

      <div
        style={{
          position: "fixed",
          insetInline: 0,
          bottom: "var(--shopify-safe-area-inset-bottom, 0px)",
        }}
      >
        <s-box
          padding="base"
          background="base"
          borderWidth="base none none none"
        >
          <s-button variant="primary">Fixed bottom action</s-button>
        </s-box>
      </div>
    </>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
