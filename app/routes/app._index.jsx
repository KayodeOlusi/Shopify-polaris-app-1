import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { authenticate } from "../shopify.server";
import { deleteQRCode, getQRCodes } from "../models/QRCode.server";
import { StatCard } from "../components/StatCard";
import { StatusPill } from "../components/StatusPill";

const DEFAULT_SORT = "newest";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const qrCodes = await getQRCodes(admin.graphql, session.shop);

  return {
    qrCodes,
    showProductImages: true,
    defaultSort: DEFAULT_SORT,
  };
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  if (formData.get("intent") === "delete") {
    await deleteQRCode(formData.get("id"), admin.graphql);
    return { deleted: true };
  }

  return new Response("Unknown intent", { status: 400 });
}

const EmptyQRCodeState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          alt="A stylized graphic of a document"
        />
      </s-box>
      <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
        <s-heading>Create unique QR codes for your products</s-heading>
        <s-paragraph>
          Allow customers to scan codes and buy products using their phones.
        </s-paragraph>
        <s-stack
          gap="small-200"
          justifyContent="center"
          padding="base"
          paddingBlockEnd="none"
          direction="inline"
        >
          <s-button href="/app/qrcodes/new" variant="primary">
            Create QR code
          </s-button>
        </s-stack>
      </s-grid>
    </s-grid>
  </s-section>
);

const NoMatchesState = ({ onClear }) => (
  <s-section accessibilityLabel="No matching QR codes">
    <div className="qr-no-results">
      <s-stack gap="base" alignItems="center">
        <s-icon type="search" />
        <s-heading>No QR codes match your filters</s-heading>
        <s-paragraph color="subdued">
          Try a different search term, or clear the filters to see every code.
        </s-paragraph>
        <s-button onClick={onClear}>Clear filters</s-button>
      </s-stack>
    </div>
  </s-section>
);

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

function filterAndSort(qrCodes, { query, destination, sort }) {
  const search = query.trim().toLowerCase();

  const filtered = qrCodes.filter((qrCode) => {
    if (search && !qrCode.title?.toLowerCase().includes(search)) return false;
    if (destination !== "all" && qrCode.destination !== destination) {
      return false;
    }
    return true;
  });

  return filtered.sort((a, b) =>
    sort === "most-scans"
      ? b.scans - a.scans
      : Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

const FilterBar = ({ filters, onChange, onClear, hasActiveFilters }) => (
  <div className="qr-filter-bar">
    <s-section>
      <s-grid gridTemplateColumns="2fr 1fr 1fr auto" gap="base" alignItems="end">
        <s-search-field
          label="Search QR codes"
          labelAccessibilityVisibility="exclusive"
          placeholder="Search by title"
          value={filters.query}
          onInput={(e) => onChange({ query: e.currentTarget.value })}
        />
        <s-select
          label="Destination"
          value={filters.destination}
          onInput={(e) => onChange({ destination: e.currentTarget.value })}
        >
          <s-option value="all">All destinations</s-option>
          <s-option value="product">Product page</s-option>
          <s-option value="cart">Checkout</s-option>
        </s-select>
        <s-select
          label="Sort by"
          icon="sort"
          value={filters.sort}
          onInput={(e) => onChange({ sort: e.currentTarget.value })}
        >
          <s-option value="newest">Newest</s-option>
          <s-option value="most-scans">Most scans</s-option>
        </s-select>
        <s-button disabled={!hasActiveFilters} onClick={onClear}>
          Clear filters
        </s-button>
      </s-grid>
    </s-section>
  </div>
);

const QRTable = ({ qrCodes, showProductImages, onDelete }) => (
  <s-section padding="none" accessibilityLabel="QRCode table">
    <s-table>
      <s-table-header-row>
        <s-table-header listSlot="primary">Title</s-table-header>
        <s-table-header>Product</s-table-header>
        <s-table-header>Date created</s-table-header>
        <s-table-header format="numeric">Scans</s-table-header>
        <s-table-header>Status</s-table-header>
        <s-table-header>
          <span className="visually-hidden">Actions</span>
        </s-table-header>
      </s-table-header-row>
      <s-table-body>
        {qrCodes.map((qrCode) => (
          <QRTableRow
            key={qrCode.handle}
            qrCode={qrCode}
            showProductImages={showProductImages}
            onDelete={onDelete}
          />
        ))}
      </s-table-body>
    </s-table>
  </s-section>
);

const QRTableRow = ({ qrCode, showProductImages, onDelete }) => {
  const menuId = `qr-actions-${qrCode.handle}`;

  return (
    <s-table-row id={qrCode.handle}>
      <s-table-cell>
        <s-stack direction="inline" gap="small" alignItems="center">
          {showProductImages ? (
            <s-clickable
              href={`/app/qrcodes/${qrCode.handle}`}
              accessibilityLabel={`Go to the product page for ${qrCode.productTitle}`}
              border="base"
              borderRadius="base"
              overflow="hidden"
              inlineSize="20px"
              blockSize="20px"
            >
              {qrCode.productImage ? (
                <s-image objectFit="cover" src={qrCode.productImage}></s-image>
              ) : (
                <s-icon size="large" type="image" />
              )}
            </s-clickable>
          ) : null}
          <s-link href={`/app/qrcodes/${qrCode.handle}`}>
            {truncate(qrCode.title)}
          </s-link>
        </s-stack>
      </s-table-cell>
      <s-table-cell>
        {qrCode.productDeleted ? (
          <s-badge icon="alert-diamond" tone="critical">
            Product has been deleted
          </s-badge>
        ) : (
          truncate(qrCode.productTitle)
        )}
      </s-table-cell>
      <s-table-cell>{new Date(qrCode.createdAt).toDateString()}</s-table-cell>
      <s-table-cell>{qrCode.scans}</s-table-cell>
      <s-table-cell>
        <StatusPill scans={qrCode.scans} />
      </s-table-cell>
      <s-table-cell>
        <s-button
          commandFor={menuId}
          icon="menu-horizontal"
          variant="tertiary"
          accessibilityLabel={`Actions for ${qrCode.title}`}
        />
        <s-menu id={menuId} accessibilityLabel={`Actions for ${qrCode.title}`}>
          <s-button icon="edit" href={`/app/qrcodes/${qrCode.handle}`}>
            Edit
          </s-button>
          <s-button
            icon="download"
            href={qrCode.image}
            download={`${qrCode.handle}.png`}
          >
            Download
          </s-button>
          <s-button
            icon="delete"
            tone="critical"
            commandFor="delete-qr-modal"
            command="--show"
            onClick={() => onDelete(qrCode)}
          >
            Delete
          </s-button>
        </s-menu>
      </s-table-cell>
    </s-table-row>
  );
};

const DeleteModal = ({ modalRef, qrCode, onConfirm, deleting }) => (
  <s-modal
    ref={modalRef}
    id="delete-qr-modal"
    heading="Delete QR code?"
    size="small"
  >
    <s-paragraph>
      {qrCode
        ? `"${qrCode.title}" will be deleted and stop working for anyone who scans it. This can't be undone.`
        : ""}
    </s-paragraph>
    <s-button
      slot="primary-action"
      variant="primary"
      tone="critical"
      loading={deleting}
      onClick={onConfirm}
    >
      Delete QR code
    </s-button>
    <s-button
      slot="secondary-actions"
      commandFor="delete-qr-modal"
      command="--hide"
    >
      Cancel
    </s-button>
  </s-modal>
);

const StickyActionBar = ({ total, shown }) => (
  <div className="qr-sticky-bar">
    <span className="qr-sticky-bar__count">
      {shown === total
        ? `${total} QR ${total === 1 ? "code" : "codes"}`
        : `Showing ${shown} of ${total} QR codes`}
    </span>
    <s-button href="/app/qrcodes/new" variant="primary" icon="plus">
      Create QR code
    </s-button>
  </div>
);

export default function Index() {
  const { qrCodes, showProductImages, defaultSort } = useLoaderData();
  const fetcher = useFetcher();
  const modalRef = useRef(null);

  const defaultFilters = { query: "", destination: "all", sort: defaultSort };
  const [filters, setFilters] = useState(defaultFilters);
  const [pendingDelete, setPendingDelete] = useState(null);

  const visibleCodes = useMemo(
    () => filterAndSort(qrCodes, filters),
    [qrCodes, filters],
  );

  const totalScans = qrCodes.reduce((sum, qrCode) => sum + qrCode.scans, 0);
  const unscannedCount = qrCodes.filter((qrCode) => qrCode.scans === 0).length;
  const hasActiveFilters =
    filters.query !== "" ||
    filters.destination !== "all" ||
    filters.sort !== defaultSort;

  const deleting = fetcher.state !== "idle";

  function updateFilters(changes) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    fetcher.submit(
      { intent: "delete", id: pendingDelete.id },
      { method: "post" },
    );
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.deleted) {
      modalRef.current?.hideOverlay();
      setPendingDelete(null);
      shopify.toast.show("QR code deleted");
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="qr-list-page">
      <s-page heading="QR codes">
        <s-link slot="secondary-actions" href="/app/qrcodes/new">
          Create QR code
        </s-link>
        {qrCodes.length === 0 ? (
          <EmptyQRCodeState />
        ) : (
          <>
            <div className="stat-card-row">
              <StatCard
                label="Total QR codes"
                value={qrCodes.length}
                highlight
              />
              <StatCard
                label="Total scans"
                value={totalScans.toLocaleString()}
                hint="Across all codes"
              />
              <StatCard
                label="Codes with no scans"
                value={unscannedCount}
                hint={
                  unscannedCount > 0
                    ? "Check where these codes are printed"
                    : "Every code has been scanned"
                }
              />
            </div>
            <FilterBar
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
            {visibleCodes.length === 0 ? (
              <NoMatchesState onClear={clearFilters} />
            ) : (
              <QRTable
                qrCodes={visibleCodes}
                showProductImages={showProductImages}
                onDelete={setPendingDelete}
              />
            )}
          </>
        )}
        <DeleteModal
          modalRef={modalRef}
          qrCode={pendingDelete}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      </s-page>
      {qrCodes.length > 0 ? (
        <StickyActionBar total={qrCodes.length} shown={visibleCodes.length} />
      ) : null}
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
