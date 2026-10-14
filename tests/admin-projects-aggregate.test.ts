import { test } from "vitest";
import assert from "node:assert/strict";
import {
  addBlock,
  adoptLegacyMaterialMaps,
  collectProjectMediaAssetIds,
  countHotspotsForMaterial,
  createBlock,
  createEmptyProjectAggregateDraft,
  duplicateBlock,
  disableBlockPoints,
  draftToProjectData,
  enableBlockPoints,
  getProjectBlockerSections,
  getProjectPublishBlockers,
  hotspotsForBlock,
  blockImageId,
  insertBlocks,
  mergeProjectMediaOptions,
  moveProjectDraftItem,
  normalizeProjectDraftForSave,
  removeBlock,
  setBlockImage,
} from "../src/features/projects/projectAggregate.ts";
import {
  assertPublishDraft,
  assertPublishableMedia,
  fillDraftAltText,
  mapRpcError,
  normalizeAutomaticClaimStatuses,
  summarizePublishCompensation,
  validateDraftShape,
} from "../functions/_lib/admin-projects.js";
import { isProjectApiResponse } from "../src/features/projects/projectApiContract.ts";
import {
  adminProjectsOptionsResponse,
  handleAdminProjectsRequest,
} from "../functions/_lib/admin-projects.js";


async function withAdminProjectsFetchMock(mock, run) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const call = {
      url: input instanceof Request ? input.url : String(input),
      method: init.method || (input instanceof Request ? input.method : "GET"),
      body: init.body,
    };
    calls.push(call);
    return mock(call, calls);
  };

  try {
    return await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function imageBlock(key, mediaAssetId, fields = {}, sortOrder = 0) {
  return {
    key,
    id: null,
    type: "image",
    content: { mediaAssetId, alt: "", title: "", label: "", caption: "", ...fields },
    sortOrder,
  };
}

function videoBlock(key, youtubeUrl, title = "", sortOrder = 0) {
  return {
    key,
    id: null,
    type: "video",
    content: { youtubeUrl, title, label: "", caption: "" },
    sortOrder,
  };
}

const mockAdminUserId = "11111111-1111-4111-8111-111111111111";
const mockAdminEnvironment = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
};

function mockAdminIdentity(call) {
  const url = new URL(call.url);
  if (url.pathname === "/auth/v1/user") {
    return Response.json(
      { id: mockAdminUserId, email: "owner@example.test" },
      { status: 200 },
    );
  }
  if (url.pathname === "/rest/v1/admin_profiles") {
    return Response.json([{ role: "owner", is_active: true }], {
      status: 200,
    });
  }
  return null;
}

function adminProjectMutationRequest(body) {
  return new Request("https://example.test/api/admin/projects", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function revisionConflictResponse(message) {
  return Response.json(
    {
      code: "PGRST",
      message: JSON.stringify({ code: "revision_conflict", message }),
      details: JSON.stringify({
        status: 409,
        status_text: "Conflict",
        headers: {},
      }),
      hint: null,
    },
    { status: 409 },
  );
}

test("unauthenticated GET and malformed POST are rejected before any database work", async () => {
  const unauthenticatedGet = await handleAdminProjectsRequest(
    new Request("https://example.test/api/admin/projects", { method: "GET" }),
    {},
  );
  assert.equal(
    unauthenticatedGet.status,
    401,
    "Unauthenticated GET must fail before environment or database work",
  );
  assert.equal((await unauthenticatedGet.json()).error, "missing_session");

  const unauthenticatedMalformedPost = await handleAdminProjectsRequest(
    new Request("https://example.test/api/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
    {},
  );
  assert.equal(
    unauthenticatedMalformedPost.status,
    401,
    "Unauthenticated POST must fail before reading malformed JSON",
  );
  assert.equal(
    (await unauthenticatedMalformedPost.json()).error,
    "missing_session",
  );

});

test("a stale Save returns a 409 revision conflict without overwriting the draft", async () => {
  const conflictDraft = createEmptyProjectAggregateDraft();
  Object.assign(conflictDraft.project, {
    id: 12,
    title: "Conflict proof",
    slug: "conflict-proof",
  });
  await withAdminProjectsFetchMock(
    (call) => {
      const identityResponse = mockAdminIdentity(call);
      if (identityResponse) return identityResponse;
      if (new URL(call.url).pathname === "/rest/v1/rpc/admin_project_aggregate") {
        return revisionConflictResponse("Reload before saving.");
      }
      throw new Error(`Unexpected mocked Projects request: ${call.method} ${call.url}`);
    },
    async (calls) => {
      const response = await handleAdminProjectsRequest(
        adminProjectMutationRequest({
          action: "save",
          projectId: 12,
          baseRevision: 1,
          baseUpdatedAt: "2026-07-19T00:00:00.000000+00:00",
          draft: conflictDraft,
        }),
        mockAdminEnvironment,
      );
      const body = await response.json();
      assert.equal(
        response.status,
        409,
        `Stale Save response: ${JSON.stringify(body)}; calls: ${JSON.stringify(calls)}`,
      );
      assert.equal(body.error, "revision_conflict");
      assert.equal(body.message, "Reload before saving.");
      assert.equal(
        calls.filter(
          (call) =>
            new URL(call.url).pathname ===
            "/rest/v1/rpc/admin_project_aggregate",
        ).length,
        1,
        "A stale Save must issue one aggregate RPC and preserve its revision-conflict response",
      );
    },
  );

});

test("a failed Publish compensates public copies and audits the original error", async () => {
  const compensationDraft = createEmptyProjectAggregateDraft();
  Object.assign(compensationDraft.project, {
    id: 12,
    title: "Publish compensation proof",
    slug: "publish-compensation-proof",
    summary: "A local mocked publish compensation proof.",
    claimReviewStatus: "approved",
    heroMediaId: 7,
    coverMediaId: 7,
  });
  const compensationSourceBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const compensationSourceBlob = new Blob([compensationSourceBytes], {
    type: "image/jpeg",
  });
  const compensationMediaRow = {
    id: 7,
    status: "draft",
    bucket: "urblo-admin-media",
    object_path: "project-editor/compensation-proof.jpg",
    source_url: null,
    source_kind: "storage",
    media_type: "image",
    mime_type: "image/jpeg",
    size_bytes: compensationSourceBlob.size,
    alt: "Mocked compensation proof image",
    updated_at: "2026-07-19T00:00:00.000000+00:00",
  };

  await withAdminProjectsFetchMock(
    (call) => {
      const identityResponse = mockAdminIdentity(call);
      if (identityResponse) return identityResponse;

      const url = new URL(call.url);
      if (
        url.pathname === "/rest/v1/media_assets" &&
        url.searchParams.get("select")?.startsWith("id,status")
      ) {
        return Response.json([compensationMediaRow], { status: 200 });
      }
      if (
        url.pathname ===
          "/storage/v1/object/urblo-admin-media/project-editor/compensation-proof.jpg" &&
        call.method === "GET"
      ) {
        return new Response(compensationSourceBlob, {
          status: 200,
          headers: { "Content-Type": "image/jpeg" },
        });
      }
      if (
        url.pathname.startsWith(
          "/storage/v1/object/urblo-public-media/project-assets/7/",
        ) &&
        call.method === "POST"
      ) {
        return Response.json({ Key: url.pathname }, { status: 200 });
      }
      if (
        url.pathname.startsWith(
          "/storage/v1/object/urblo-public-media/project-assets/7/",
        ) &&
        call.method === "GET"
      ) {
        return new Response(compensationSourceBlob, {
          status: 200,
          headers: { "Content-Type": "image/jpeg" },
        });
      }
      if (url.pathname === "/rest/v1/rpc/admin_project_aggregate") {
        return revisionConflictResponse("Reload before publishing.");
      }
      if (
        url.pathname === "/rest/v1/media_assets" &&
        url.searchParams.get("select") === "id"
      ) {
        return Response.json([], { status: 200 });
      }
      if (
        url.pathname === "/storage/v1/object/urblo-public-media" &&
        call.method === "DELETE"
      ) {
        return Response.json([], { status: 200 });
      }
      if (
        url.pathname === "/rest/v1/admin_audit_events" &&
        call.method === "POST"
      ) {
        return new Response(null, { status: 201 });
      }
      throw new Error(`Unexpected mocked Projects request: ${call.method} ${call.url}`);
    },
    async (calls) => {
      const response = await handleAdminProjectsRequest(
        adminProjectMutationRequest({
          action: "publish",
          projectId: 12,
          baseRevision: 1,
          baseUpdatedAt: "2026-07-19T00:00:00.000000+00:00",
          draft: compensationDraft,
        }),
        mockAdminEnvironment,
      );
      const body = await response.json();
      assert.equal(response.status, 409);
      assert.equal(body.error, "revision_conflict");
      assert.deepEqual(body.cleanup, {
        removedCount: 1,
        retainedCount: 0,
        auditRecorded: true,
      });

      const publicUpload = calls.find(
        (call) =>
          call.method === "POST" &&
          new URL(call.url).pathname.startsWith(
            "/storage/v1/object/urblo-public-media/project-assets/7/",
          ),
      );
      const aggregateRpc = calls.find(
        (call) =>
          new URL(call.url).pathname ===
          "/rest/v1/rpc/admin_project_aggregate",
      );
      const publicRemoval = calls.find(
        (call) =>
          call.method === "DELETE" &&
          new URL(call.url).pathname ===
            "/storage/v1/object/urblo-public-media",
      );
      const compensationAudit = calls.find(
        (call) =>
          call.method === "POST" &&
          new URL(call.url).pathname === "/rest/v1/admin_audit_events",
      );
      assert.ok(publicUpload, "Publish must create the mocked public copy first");
      assert.ok(aggregateRpc, "Publish must call the aggregate RPC");
      assert.ok(publicRemoval, "A failed RPC must remove its mocked public copy");
      assert.ok(
        compensationAudit,
        "A failed publish must record its mocked compensation audit",
      );
      assert.ok(calls.indexOf(publicUpload) < calls.indexOf(aggregateRpc));
      assert.ok(calls.indexOf(aggregateRpc) < calls.indexOf(publicRemoval));
      assert.ok(calls.indexOf(publicRemoval) < calls.indexOf(compensationAudit));

      const publicPathPrefix =
        "/storage/v1/object/urblo-public-media/";
      const uploadedPath = decodeURIComponent(
        new URL(publicUpload.url).pathname.slice(publicPathPrefix.length),
      );
      const removalBody = JSON.parse(String(publicRemoval.body));
      const rpcBody = JSON.parse(String(aggregateRpc.body));
      const auditBody = JSON.parse(String(compensationAudit.body));
      assert.deepEqual(removalBody.prefixes, [uploadedPath]);
      assert.equal(
        rpcBody.p_promotions[0].destinationPath,
        uploadedPath,
        "The compensated path must be the exact request-owned promotion path",
      );
      assert.equal(
        auditBody.action,
        "project.aggregate.publish_compensation",
      );
      assert.deepEqual(auditBody.metadata.removed, [uploadedPath]);
      assert.equal(auditBody.metadata.originalError.code, "revision_conflict");
    },
  );

});

test("media references are collected from every draft section and picker options merge fresh metadata", async () => {
  const referencedMediaDraft = createEmptyProjectAggregateDraft();
  referencedMediaDraft.project.heroMediaId = 701;
  referencedMediaDraft.project.coverMediaId = 702;
  referencedMediaDraft.materials = [{ mediaAssetId: 703 }];
  referencedMediaDraft.maps = [{ mediaAssetId: 704 }];
  referencedMediaDraft.blocks = [
    { key: "block:new:a", id: null, type: "image", sortOrder: 0, content: { mediaAssetId: 705, alt: "" } },
    { key: "block:new:b", id: null, type: "image", sortOrder: 1, content: { mediaAssetId: 701, alt: "" } },
    {
      key: "block:new:c",
      id: null,
      type: "gallery",
      sortOrder: 2,
      content: { items: [{ mediaAssetId: 707, alt: "" }, { mediaAssetId: 705, alt: "" }] },
    },
    {
      key: "block:new:d",
      id: null,
      type: "steps",
      sortOrder: 3,
      content: { items: [{ title: "One", body: "", mediaAssetId: 708, alt: "" }, { title: "Two", body: "" }] },
    },
    { key: "block:new:e", id: null, type: "hotspot_image", sortOrder: 4, content: { projectMaterialMapKey: "map:new:x" } },
  ];
  referencedMediaDraft.hotspots = [{ previewMediaId: 706 }];
  assert.deepEqual(
    collectProjectMediaAssetIds(referencedMediaDraft),
    [701, 702, 704, 705, 707, 708],
    "Project media fetches include image, gallery and step images and ignore retired material and hotspot image overrides",
  );

  const currentMediaOptions = [
    {
      id: 1,
      bucket: "urblo-admin-media",
      alt: "Older description",
      caption: null,
      objectPath: "projects/one.jpg",
      sourceUrl: null,
      sourceKind: "storage",
      mediaType: "image",
      status: "draft",
      previewUrl: "https://signed.example/one",
    },
    {
      id: 2,
      bucket: null,
      alt: "Picker image",
      caption: null,
      objectPath: null,
      sourceUrl: "/picker-two.jpg",
      sourceKind: "external_legacy",
      mediaType: "image",
      status: "published",
      previewUrl: "/picker-two.jpg",
    },
  ];
  const mergedMediaOptions = mergeProjectMediaOptions(currentMediaOptions, [
    {
      ...currentMediaOptions[0],
      alt: "Fresh description",
      previewUrl: null,
    },
    {
      id: 701,
      bucket: "urblo-admin-media",
      alt: "Referenced beyond picker cap",
      caption: null,
      objectPath: "projects/old-reference.jpg",
      sourceUrl: null,
      sourceKind: "storage",
      mediaType: "image",
      status: "draft",
      previewUrl: "https://signed.example/old-reference",
    },
  ]);
  assert.deepEqual(
    mergedMediaOptions.map((asset) => asset.id),
    [1, 2, 701],
    "Exact referenced media must merge without dropping or reordering the latest picker results",
  );
  assert.equal(mergedMediaOptions[0].alt, "Fresh description");
  assert.equal(
    mergedMediaOptions[0].previewUrl,
    "https://signed.example/one",
    "A transient signing failure must not discard an unexpired private preview",
  );

});

test("OPTIONS advertises GET, POST and OPTIONS", async () => {
  const optionsResponse = adminProjectsOptionsResponse();
  assert.equal(optionsResponse.status, 204);
  assert.equal(
    optionsResponse.headers.get("access-control-allow-methods"),
    "GET, POST, OPTIONS",
  );

});

// Shared behaviour fixture (no assertions): one complete draft and its preview context.
const behaviorDraft = createEmptyProjectAggregateDraft();
Object.assign(behaviorDraft.project, {
  title: "Aggregate preview proof",
  slug: "aggregate-preview-proof",
  lead: "Lead-only opening copy.",
  carbonStatus: "yes",
  carbonNote: "Measured project note.",
  claimReviewStatus: "approved",
  heroMediaId: 1,
  coverMediaId: 1,
});
behaviorDraft.materials.push({
  key: "material:new:proof",
  id: null,
  stoneGroupId: 1,
  stoneVariantId: 11,
  finishDefinitionId: 1,
  application: "Paving",
  note: "Material note",
  mediaAssetId: null,
  claimStatus: "approved",
  sortOrder: 0,
});
behaviorDraft.maps.push({
  key: "map:new:proof",
  id: null,
  mediaAssetId: 2,
  title: "Material placement",
  intro: "Map introduction",
  sortOrder: 0,
});
behaviorDraft.hotspots.push({
  key: "hotspot:new:proof",
  id: null,
  projectMaterialMapKey: "map:new:proof",
  projectMaterialKey: "material:new:proof",
  xPercent: 25,
  yPercent: 40,
  label: "Entry paving",
  application: "Paving",
  note: "Hotspot note",
  previewMediaId: null,
  sortOrder: 0,
});
const behaviorContext = {
  media: [
    {
      id: 1,
      bucket: null,
      alt: "Hero alt",
      caption: null,
      objectPath: null,
      sourceUrl: "/hero.jpg",
      sourceKind: "external_legacy",
      mediaType: "image",
      status: "published",
      previewUrl: "/hero.jpg",
    },
    {
      id: 2,
      bucket: null,
      alt: "Map alt",
      caption: null,
      objectPath: null,
      sourceUrl: "/map.jpg",
      sourceKind: "external_legacy",
      mediaType: "image",
      status: "published",
      previewUrl: "/map.jpg",
    },
    {
      id: 3,
      bucket: "urblo-public-media",
      alt: "Bluestone sawn finish",
      caption: null,
      objectPath: "stone-library/bluestone-sawn.jpg",
      sourceUrl: null,
      sourceKind: "storage",
      mediaType: "image",
      status: "published",
      previewUrl: "/bluestone-sawn.jpg",
    },
  ],
  stones: [
    { id: 1, key: "bluestone", label: "Bluestone", status: "published" },
  ],
  stoneVariants: [
    { id: 11, stoneGroupId: 1, key: "bluestone", label: "Standard", status: "published", sortOrder: 0 },
  ],
  finishes: [{ id: 1, key: "sawn", label: "Sawn", status: "published" }],
  finishCapabilities: [
    { stoneVariantId: 11, finishDefinitionId: 1, capability: "yes" },
  ],
  finishImages: [
    {
      stoneGroupId: 1,
      stoneVariantId: 11,
      finishDefinitionId: 1,
      mediaAssetId: 3,
      imageRole: "primary",
      status: "published",
      sortOrder: 0,
    },
  ],
};

test("draft editing keeps order, preview parity, material points on images and legacy map adoption", async () => {
  const orderDraft = structuredClone(behaviorDraft);
  orderDraft.facts = [
    {
      key: "fact:new:first",
      id: null,
      factLabel: "First fact",
      factValue: "A",
      factValueJson: null,
      claimStatus: "approved",
      sortOrder: 4,
    },
    {
      key: "fact:new:second",
      id: null,
      factLabel: "Second fact",
      factValue: "B",
      factValueJson: null,
      claimStatus: "approved",
      sortOrder: 9,
    },
  ];
  orderDraft.materials.push({
    ...orderDraft.materials[0],
    key: "material:new:second",
    application: "Steps",
    sortOrder: 9,
  });
  orderDraft.maps.push({
    ...orderDraft.maps[0],
    key: "map:new:second",
    title: "Second map",
    sortOrder: 9,
  });
  orderDraft.blocks = [
    imageBlock("block:new:first", 1, { title: "First image", label: "First" }, 4),
    imageBlock("block:new:second", 2, { title: "Second image", label: "Second" }, 9),
  ];
  orderDraft.hotspots = [
    orderDraft.hotspots[0],
    {
      ...orderDraft.hotspots[0],
      key: "hotspot:new:other-map",
      projectMaterialMapKey: "map:new:second",
      sortOrder: 7,
    },
    {
      ...orderDraft.hotspots[0],
      key: "hotspot:new:second",
      label: "Second point",
      sortOrder: 8,
    },
  ];

  let reorderedDraft = moveProjectDraftItem(
    orderDraft,
    "facts",
    "fact:new:second",
    "up",
  );
  reorderedDraft = moveProjectDraftItem(
    reorderedDraft,
    "materials",
    "material:new:second",
    "up",
  );
  reorderedDraft = moveProjectDraftItem(
    reorderedDraft,
    "maps",
    "map:new:second",
    "up",
  );
  reorderedDraft = moveProjectDraftItem(
    reorderedDraft,
    "blocks",
    "block:new:second",
    "up",
  );
  reorderedDraft = moveProjectDraftItem(
    reorderedDraft,
    "hotspots",
    "hotspot:new:second",
    "up",
  );
  assert.equal(reorderedDraft.facts[0].key, "fact:new:second");
  assert.equal(reorderedDraft.materials[0].key, "material:new:second");
  assert.equal(reorderedDraft.maps[0].key, "map:new:second");
  assert.equal(reorderedDraft.blocks[0].key, "block:new:second");
  assert.deepEqual(
    reorderedDraft.hotspots
      .filter(
        (hotspot) => hotspot.projectMaterialMapKey === "map:new:proof",
      )
      .map((hotspot) => hotspot.key),
    ["hotspot:new:second", "hotspot:new:proof"],
    "Hotspot reordering must stay within its selected material map",
  );
  for (const rows of [
    reorderedDraft.facts,
    reorderedDraft.materials,
    reorderedDraft.maps,
    reorderedDraft.blocks,
  ]) {
    assert.deepEqual(
      rows.map((row) => row.sortOrder),
      [0, 1],
      "Reordered public collections must receive contiguous sort positions",
    );
  }
  assert.deepEqual(
    reorderedDraft.hotspots
      .filter(
        (hotspot) => hotspot.projectMaterialMapKey === "map:new:proof",
      )
      .map((hotspot) => hotspot.sortOrder),
    [0, 1],
    "Reordered points must receive contiguous per-map sort positions",
  );
  assert.equal(
    moveProjectDraftItem(reorderedDraft, "facts", "fact:new:second", "up"),
    reorderedDraft,
    "A boundary reorder must be a no-op",
  );
  const reorderedPreview = draftToProjectData(reorderedDraft, behaviorContext);
  assert.equal(
    reorderedPreview.blocks?.[0]?.type === "image" && reorderedPreview.blocks[0].label,
    "Second",
    "Draft preview must follow the same normalized block order saved publicly",
  );

  const behaviorPreview = draftToProjectData(behaviorDraft, behaviorContext);
  assert.equal(
    behaviorPreview.listing.summary,
    undefined,
    "Lead-only drafts must not repeat the lead as story copy",
  );
  assert.equal(
    behaviorPreview.details["Carbon Offset"],
    "Yes — Measured project note.",
  );
  assert.deepEqual(
    behaviorPreview.images,
    ["/map.jpg"],
    "Hero/cover must not become duplicate media blocks",
  );
  assert.equal(
    behaviorPreview.blocks?.[0]?.type,
    "hotspot_image",
    "Unlinked material maps must render like the public adapter",
  );
  assert.equal(
    getProjectPublishBlockers(behaviorDraft, behaviorContext).length,
    0,
    "Complete aggregate behavior fixture must be publish-ready",
  );
  const blankHotspotLabelDraft = structuredClone(behaviorDraft);
  blankHotspotLabelDraft.hotspots[0].label = "";
  const blankHotspotLabelPreview = draftToProjectData(
    blankHotspotLabelDraft,
    behaviorContext,
  );
  assert.equal(
    blankHotspotLabelPreview.materialMap?.hotspots[0]?.title,
    undefined,
    "Blank hotspot labels must use the same stone-name fallback as the public renderer",
  );
  const duplicateVideoDraft = structuredClone(behaviorDraft);
  duplicateVideoDraft.blocks.push(
    videoBlock("block:new:video-one", "https://youtu.be/abcdefghijk", "One", 0),
    videoBlock("block:new:video-two", "https://youtu.be/lmnopqrstuv", "Two", 1),
  );
  assert.ok(
    getProjectPublishBlockers(duplicateVideoDraft, behaviorContext).some(
      (blocker) => blocker.id === "media-video-limit",
    ),
    "The aggregate must block more than one active YouTube video before the database unique index does",
  );
  const brokenReferenceDraft = structuredClone(behaviorDraft);
  brokenReferenceDraft.hotspots[0].projectMaterialKey = "material:new:missing";
  assert.ok(
    getProjectPublishBlockers(brokenReferenceDraft, behaviorContext).some(
      (blocker) => blocker.section === "body",
    ),
    "Missing child references must become a plain-language publish blocker on the image",
  );

  // Points live on media images: the map is a hidden child of its image block.
  const pointsDraft = createEmptyProjectAggregateDraft();
  pointsDraft.materials.push(structuredClone(behaviorDraft.materials[0]));
  pointsDraft.blocks.push(
    imageBlock("block:new:plain", 2, { title: "Entry view", label: "Context", caption: "Caption" }, 0),
  );
  const enabledPoints = enableBlockPoints(pointsDraft, "block:new:plain");
  const enabledBlock = enabledPoints.blocks[0];
  assert.equal(enabledBlock.type, "hotspot_image");
  assert.equal("mediaAssetId" in enabledBlock.content, false, "A points block must read its image from its map");
  assert.equal(enabledPoints.maps.length, 1);
  assert.equal(enabledPoints.maps[0].mediaAssetId, 2);
  assert.equal(enabledPoints.maps[0].title, "Entry view");
  assert.equal(enabledBlock.content.projectMaterialMapKey, enabledPoints.maps[0].key);
  assert.equal(blockImageId(enabledPoints, enabledBlock), 2);
  assert.equal(
    enableBlockPoints(enabledPoints, "block:new:plain"),
    enabledPoints,
    "Enabling points twice must be a no-op",
  );
  assert.doesNotThrow(
    () => validateDraftShape(normalizeProjectDraftForSave(enabledPoints)),
    "A points block created from an image must satisfy the server draft shape",
  );
  const withPoint = {
    ...enabledPoints,
    hotspots: [{
      key: "hotspot:new:on-image",
      id: null,
      projectMaterialMapKey: enabledPoints.maps[0].key,
      projectMaterialKey: "material:new:proof",
      xPercent: 30,
      yPercent: 70,
      label: "",
      application: "",
      note: "",
      previewMediaId: null,
      sortOrder: 0,
    }],
  };
  assert.deepEqual(hotspotsForBlock(withPoint, "block:new:plain").map((point) => point.key), ["hotspot:new:on-image"]);
  assert.equal(countHotspotsForMaterial(withPoint, "material:new:proof"), 1);
  assert.equal(countHotspotsForMaterial(withPoint, "material:new:missing"), 0);
  const replacedImage = setBlockImage(withPoint, "block:new:plain", 1);
  assert.equal(replacedImage.maps[0].mediaAssetId, 1, "Replacing a points image must change the map image");
  assert.deepEqual(
    [replacedImage.hotspots[0].xPercent, replacedImage.hotspots[0].yPercent],
    [30, 70],
    "Replacing a points image must keep point positions",
  );
  assert.equal(
    setBlockImage(pointsDraft, "block:new:plain", 1).blocks[0].content.mediaAssetId,
    1,
    "Replacing a plain image must change the block image",
  );
  assert.equal(
    setBlockImage(
      { ...pointsDraft, blocks: [imageBlock("block:new:plain", 2, { alt: "Old picture" }, 0)] },
      "block:new:plain",
      1,
      "New picture",
    ).blocks[0].content.alt,
    "New picture",
    "Replacing a plain image must replace the description that described the previous picture",
  );
  const disabledPoints = disableBlockPoints(withPoint, "block:new:plain");
  assert.deepEqual(
    disabledPoints.blocks,
    pointsDraft.blocks,
    "Turning points off must restore the original plain image block",
  );
  assert.equal(disabledPoints.maps.length, 0, "Turning points off must remove the hidden map");
  assert.equal(disabledPoints.hotspots.length, 0, "Turning points off must delete its points");
  const removedPointsBlock = removeBlock(withPoint, "block:new:plain");
  assert.deepEqual(
    [removedPointsBlock.blocks.length, removedPointsBlock.maps.length, removedPointsBlock.hotspots.length],
    [0, 0, 0],
    "Removing a points block must cascade to its map and points",
  );
  assert.equal(
    removeBlock(pointsDraft, "block:new:plain").blocks.length,
    0,
    "Removing a plain image block removes only that block",
  );
  const savedPoints = normalizeProjectDraftForSave({
    ...withPoint,
    maps: [{ ...withPoint.maps[0], title: "Old map title", intro: "Retired introduction" }],
    blocks: [{ ...withPoint.blocks[0], content: { ...withPoint.blocks[0].content, title: "" } }],
  });
  assert.equal(savedPoints.maps[0].title, "Stone and finish placement", "An untitled points image must save the public fallback title");
  assert.equal(savedPoints.maps[0].intro, "", "Save must clear the retired map introduction");
  assert.equal(
    normalizeProjectDraftForSave(withPoint).maps[0].title,
    "Entry view",
    "Save must copy the image block title to its map",
  );
  assert.equal(
    savedPoints.hotspots[0].application,
    "Paving",
    "An empty point use must inherit its material wording on Save",
  );
  const publishablePoints = normalizeProjectDraftForSave({
    ...withPoint,
    project: structuredClone(behaviorDraft.project),
  });
  assert.doesNotThrow(
    () => assertPublishDraft(publishablePoints),
    "A normalized points-on-image draft must satisfy server publish validation",
  );
  assert.equal(
    getProjectPublishBlockers(withPoint, behaviorContext).some((blocker) => blocker.id.startsWith("hotspot-")),
    false,
    "A point using its material wording must not block publishing",
  );
  const unplacedPoint = structuredClone(withPoint);
  unplacedPoint.hotspots[0].projectMaterialKey = null;
  assert.equal(
    getProjectBlockerSections(unplacedPoint, behaviorContext).has("body"),
    true,
    "A point without a material must mark the media section",
  );

  const legacyMapDraft = structuredClone(behaviorDraft);
  legacyMapDraft.maps.push({
    key: "map:new:linked",
    id: null,
    mediaAssetId: 1,
    title: "Linked map title",
    intro: "",
    sortOrder: 1,
  });
  legacyMapDraft.blocks.push({
    key: "block:new:linked",
    id: null,
    type: "hotspot_image",
    content: { projectMaterialMapKey: "map:new:linked", title: "", label: "", caption: "" },
    sortOrder: 0,
  });
  const adoptedDraft = adoptLegacyMaterialMaps(legacyMapDraft);
  assert.deepEqual(
    adoptedDraft.blocks.map((block) => [block.type, block.content.projectMaterialMapKey, block.content.title]),
    [
      ["hotspot_image", "map:new:linked", "Linked map title"],
      ["hotspot_image", "map:new:proof", "Material placement"],
    ],
    "Unlinked maps must be adopted as trailing points blocks and linked blocks keep their public title",
  );
  assert.equal(
    adoptLegacyMaterialMaps(adoptedDraft),
    adoptedDraft,
    "Adopting already linked maps must not change the draft",
  );
  assert.deepEqual(
    draftToProjectData(adoptedDraft, behaviorContext).blocks?.map((block) => block.type === "hotspot_image" ? block.title : block.type),
    draftToProjectData(legacyMapDraft, behaviorContext).blocks?.map((block) => block.type === "hotspot_image" ? block.title : block.type),
    "Adoption must not change the public media sequence or titles",
  );
  for (const draftUnderTest of [behaviorDraft, brokenReferenceDraft, unplacedPoint, legacyMapDraft]) {
    assert.equal(
      getProjectPublishBlockers(draftUnderTest, behaviorContext).some((blocker) => blocker.section === "maps"),
      false,
      "Publish blockers must never point at a separate maps section",
    );
  }

});

test("Save normalization, server draft validation and the read envelope contract", async () => {
  const editorBaseline = structuredClone(behaviorDraft);
  Object.assign(editorBaseline.project, { id: 20, status: "published" });
  editorBaseline.facts.push({
    key: "fact:21",
    id: 21,
    factLabel: "Area",
    factValue: "400 m²",
    factValueJson: null,
    claimStatus: "approved",
    sortOrder: 0,
  });
  Object.assign(editorBaseline.materials[0], { id: 22 });
  const legacyReviewDraft = structuredClone(editorBaseline);
  legacyReviewDraft.project.claimReviewStatus = "needs_review";
  legacyReviewDraft.facts[0].claimStatus = "deferred";
  legacyReviewDraft.materials[0].claimStatus = "needs_review";

  const normalizedClientDraft = normalizeProjectDraftForSave(legacyReviewDraft);
  assert.equal(normalizedClientDraft.project.claimReviewStatus, "approved");
  assert.ok(
    normalizedClientDraft.facts.every((row) => row.claimStatus === "approved"),
    "The single-editor Save path must mechanically normalize legacy fact review fields",
  );
  assert.ok(
    normalizedClientDraft.materials.every((row) => row.claimStatus === "approved"),
    "The single-editor Save path must mechanically normalize legacy material review fields",
  );

  const normalizedServerDraft = normalizeAutomaticClaimStatuses(legacyReviewDraft);
  assert.equal(normalizedServerDraft.project.claimReviewStatus, "approved");
  assert.ok(normalizedServerDraft.facts.every((row) => row.claimStatus === "approved"));
  assert.ok(normalizedServerDraft.materials.every((row) => row.claimStatus === "approved"));
  assert.equal(
    getProjectPublishBlockers(legacyReviewDraft, behaviorContext).some(
      (blocker) => blocker.id.includes("review"),
    ),
    false,
    "Legacy review fields must not create an editor-facing publish blocker",
  );
  assert.doesNotThrow(
    () => assertPublishDraft(normalizedServerDraft),
    "A complete single-editor draft must publish without a separate approval step",
  );

  const validServerDraft = structuredClone(editorBaseline);
  assert.doesNotThrow(() => validateDraftShape(validServerDraft));
  const invalidSortDraft = structuredClone(validServerDraft);
  invalidSortDraft.project.sortOrder = "0";
  assert.throws(
    () => validateDraftShape(invalidSortDraft),
    (error) => error?.status === 400 && error?.code === "invalid_draft_field",
    "String sort orders must be rejected before JSON reaches a list cast",
  );
  const invalidCoordinateDraft = structuredClone(validServerDraft);
  invalidCoordinateDraft.hotspots[0].xPercent = 101;
  assert.throws(
    () => validateDraftShape(invalidCoordinateDraft),
    (error) => error?.status === 400 && error?.code === "invalid_draft_field",
    "Out-of-range hotspot coordinates must be rejected on Save",
  );
  const duplicateChildIdDraft = structuredClone(validServerDraft);
  duplicateChildIdDraft.facts.push({
    ...duplicateChildIdDraft.facts[0],
    key: "fact:different-key-same-id",
  });
  assert.throws(
    () => validateDraftShape(duplicateChildIdDraft),
    (error) => error?.status === 400 && error?.code === "duplicate_draft_id",
    "Different browser keys must not update the same child id twice",
  );
  const semanticExtraDraft = structuredClone(validServerDraft);
  semanticExtraDraft.blocks.push({
    ...videoBlock("block:new:semantic-extra", "abcdefghijk", "Video"),
    content: { youtubeUrl: "abcdefghijk", title: "Video", mediaAssetId: 999 },
  });
  assert.throws(
    () => validateDraftShape(semanticExtraDraft),
    (error) => error?.status === 400 && error?.code === "invalid_block",
    "Unused media ids on a video block must be rejected instead of promoted",
  );
  const legacyShapeDraft = structuredClone(validServerDraft);
  delete legacyShapeDraft.schemaVersion;
  delete legacyShapeDraft.blocks;
  legacyShapeDraft.mediaBlocks = [];
  assert.throws(
    () => validateDraftShape(legacyShapeDraft),
    (error) => error?.status === 400 && error?.code === "invalid_draft",
    "validateDraftShape itself requires the block shape; parsePostInput upgrades older drafts first",
  );
  assert.throws(
    () =>
      assertPublishableMedia([
        {
          id: 99,
          status: "published",
          source_kind: "external_legacy",
          source_url: "/document.pdf",
          media_type: "document",
          alt: "Not an image",
        },
      ]),
    (error) => error?.status === 409 && error?.code === "publish_blocked",
    "Document/video assets must not enter image-only aggregate fields",
  );
  assert.throws(
    () =>
      assertPublishableMedia([
        {
          id: 100,
          status: "draft",
          source_kind: "storage",
          bucket: "urblo-admin-media",
          object_path: "project-editor/oversize.png",
          source_url: null,
          media_type: "image",
          mime_type: "image/png",
          size_bytes: 10 * 1024 * 1024 + 1,
          alt: "Oversize image",
        },
      ]),
    (error) => error?.status === 409 && error?.code === "publish_blocked",
    "Declared images over 10 MiB must be rejected before Storage download",
  );
  assert.throws(
    () =>
      assertPublishableMedia(
        Array.from({ length: 51 }, (_, index) => ({
          id: index + 1,
          status: "published",
          source_kind: "external_legacy",
          source_url: `/image-${index}.jpg`,
          media_type: "image",
          mime_type: "image/jpeg",
          size_bytes: 1,
          alt: `Image ${index + 1}`,
        })),
      ),
    (error) => error?.status === 409 && error?.code === "publish_blocked",
    "Projects over the unique image count budget must be rejected",
  );
  assert.throws(
    () =>
      assertPublishableMedia([
        {
          id: 101,
          status: "draft",
          source_kind: "storage",
          bucket: "urblo-admin-media",
          object_path: "project-editor/not-image.pdf",
          source_url: null,
          media_type: "image",
          mime_type: "application/pdf",
          size_bytes: 100,
          alt: "Masquerading document",
        },
      ]),
    (error) => error?.status === 409 && error?.code === "publish_blocked",
    "Storage documents must not pass by changing only media_type",
  );

  const readEnvelope = {
    projectId: 20,
    revision: 0,
    baseUpdatedAt: "2026-07-14T05:29:55.123456+00:00",
    status: "published",
    draft: validServerDraft,
  };
  assert.equal(
    isProjectApiResponse(readEnvelope),
    true,
    "GET envelopes may omit mutation copy",
  );
  assert.equal(
    isProjectApiResponse(readEnvelope, { requireMessage: true }),
    false,
    "Mutation envelopes must still contain a message",
  );
  assert.equal(
    isProjectApiResponse(
      { ...readEnvelope, message: "Project saved." },
      { requireMessage: true },
    ),
    true,
  );
  assert.equal(
    isProjectApiResponse(
      {
        ...readEnvelope,
        message: "Project published.",
        warnings: ["Cleanup warning one.", "Cleanup warning two."],
      },
      { requireMessage: true },
    ),
    true,
    "Mutation envelopes may carry every post-publish warning",
  );
  assert.equal(
    isProjectApiResponse({ ...readEnvelope, warnings: [null] }),
    false,
    "Malformed warning arrays must fail closed",
  );
  assert.equal(
    isProjectApiResponse({ ...readEnvelope, projectId: 0 }),
    false,
    "GET envelopes require a positive project id",
  );
  assert.equal(
    isProjectApiResponse({ ...readEnvelope, revision: -1 }),
    false,
    "GET envelopes require a non-negative integer revision",
  );
  assert.equal(
    isProjectApiResponse({ ...readEnvelope, baseUpdatedAt: null }),
    true,
    "Draft-only new Projects may return a null canonical token",
  );
  assert.equal(
    isProjectApiResponse({ ...readEnvelope, baseUpdatedAt: "not-a-timestamp" }),
    false,
    "Malformed canonical tokens must fail closed",
  );
  const missingBaseUpdatedAtEnvelope = { ...readEnvelope };
  delete missingBaseUpdatedAtEnvelope.baseUpdatedAt;
  assert.equal(
    isProjectApiResponse(missingBaseUpdatedAtEnvelope),
    false,
    "GET and mutation envelopes must always include a canonical token",
  );
  assert.equal(
    isProjectApiResponse({
      ...readEnvelope,
      draft: {
        project: [],
        facts: [null],
        materials: [],
        maps: [],
        schemaVersion: 2,
        blocks: [],
        hotspots: [],
      },
    }),
    false,
    "Malformed nested draft rows must fail closed before rendering",
  );

});

test("publish compensation disclosure and RPC error mapping", async () => {
  const compensationDisclosure = summarizePublishCompensation(
    {
      removed: ["/owned-copy-a"],
      retained: [{ path: "/owned-copy-b", reason: "remove_failed" }],
    },
    false,
  );
  assert.deepEqual(compensationDisclosure.summary, {
    removedCount: 1,
    retainedCount: 1,
    auditRecorded: false,
  });
  assert.match(compensationDisclosure.warning, /manual cleanup/i);
  assert.match(compensationDisclosure.warning, /cleanup record/i);
  assert.doesNotMatch(
    compensationDisclosure.warning,
    /bucket|storage|public|private/i,
  );
  const missingAuditDisclosure = summarizePublishCompensation(
    { removed: ["/owned-copy-a"], retained: [] },
    false,
  );
  assert.match(
    missingAuditDisclosure.warning,
    /cleanup record/i,
    "A failed durable compensation audit must remain visible even when cleanup succeeded",
  );

  const mappedRevisionConflict = mapRpcError(
    {
      code: "revision_conflict",
      message: "Reload before saving.",
      details: null,
    },
    409,
  );
  assert.equal(mappedRevisionConflict.status, 409);
  assert.equal(mappedRevisionConflict.code, "revision_conflict");
  assert.equal(mappedRevisionConflict.message, "Reload before saving.");

  const mappedActorRoleChange = mapRpcError(
    {
      code: "PGRST",
      message: JSON.stringify({
        code: "actor_role_changed",
        message: "Your Projects access changed. Reload the workspace before continuing.",
      }),
      details: JSON.stringify({
        status: 403,
        status_text: "Forbidden",
        headers: {},
      }),
    },
    400,
  );
  assert.equal(mappedActorRoleChange.status, 403);
  assert.equal(mappedActorRoleChange.code, "actor_role_changed");
  assert.match(mappedActorRoleChange.message, /access changed/i);
});

test("an older editor's mediaBlocks draft is upgraded before validation and reaches the RPC as blocks", async () => {
  const legacyDraft = createEmptyProjectAggregateDraft();
  delete legacyDraft.schemaVersion;
  delete legacyDraft.blocks;
  Object.assign(legacyDraft.project, { id: 12, title: "Legacy editor", slug: "legacy-editor" });
  legacyDraft.mediaBlocks = [{
    key: "media:31",
    id: 31,
    mediaRole: "normal_image",
    mediaAssetId: 4,
    projectMaterialMapKey: null,
    blockTitle: "",
    youtubeUrl: "",
    label: "Detail",
    caption: "Caption",
    sortOrder: 0,
  }];
  await withAdminProjectsFetchMock(
    (call) => {
      const identityResponse = mockAdminIdentity(call);
      if (identityResponse) return identityResponse;
      if (new URL(call.url).pathname === "/rest/v1/rpc/admin_project_aggregate") {
        return revisionConflictResponse("Reload before saving.");
      }
      throw new Error(`Unexpected mocked Projects request: ${call.method} ${call.url}`);
    },
    async (calls) => {
      await handleAdminProjectsRequest(
        adminProjectMutationRequest({
          action: "save",
          projectId: 12,
          baseRevision: 1,
          baseUpdatedAt: "2026-07-19T00:00:00.000000+00:00",
          draft: legacyDraft,
        }),
        mockAdminEnvironment,
      );
      const rpc = calls.find((call) => new URL(call.url).pathname === "/rest/v1/rpc/admin_project_aggregate");
      const sent = JSON.parse(rpc.body).p_draft;
      assert.equal(sent.schemaVersion, 2);
      assert.equal("mediaBlocks" in sent, false);
      assert.deepEqual(sent.blocks, [{
        key: "block:legacy:media:31",
        id: null,
        type: "image",
        sortOrder: 0,
        content: { mediaAssetId: 4, alt: "", title: "", label: "Detail", caption: "Caption", legacyProjectMediaId: 31 },
      }]);
    },
  );
});

test("body blocks map to the shared preview, block publication and validate on the server", () => {
  const draft = structuredClone(behaviorDraft);
  draft.blocks = [
    { key: "block:new:h", id: null, type: "heading", sortOrder: 0, content: { eyebrow: "Background", title: "Why stone", intro: "" } },
    { key: "block:new:t", id: null, type: "text", sortOrder: 1, content: { body: "Body copy" } },
    imageBlock("block:new:i", 1, { label: "Entry" }, 2),
    {
      key: "block:new:g",
      id: null,
      type: "gallery",
      sortOrder: 3,
      content: { items: [{ mediaAssetId: 1, alt: "" }, { mediaAssetId: 2, alt: "Own words" }] },
    },
    {
      key: "block:new:sc",
      id: null,
      type: "stone_cards",
      sortOrder: 4,
      content: { title: "", items: [{ stoneGroupId: 1, finishKey: "sawn", note: "" }] },
    },
    {
      key: "block:new:cta",
      id: null,
      type: "cta",
      sortOrder: 5,
      content: { title: "Ask", body: "", primary: { label: "Go", href: "javascript:alert(1)" }, secondary: { label: "Contact", href: "/contact" } },
    },
    { key: "block:new:hs", id: null, type: "hotspot_image", sortOrder: 6, content: { projectMaterialMapKey: "map:new:proof", title: "", label: "", caption: "" } },
  ];
  const preview = draftToProjectData(draft, behaviorContext);
  assert.deepEqual(preview.blocks.map((block) => block.type), ["heading", "text", "image", "gallery", "stone_cards", "cta", "hotspot_image"]);
  assert.deepEqual(preview.blocks[2], {
    id: "block:new:i", type: "image", src: "/hero.jpg", alt: "Hero alt", title: undefined, label: "Entry", caption: undefined,
  }, "An image without its own description shows the media description");
  assert.deepEqual(preview.blocks[3].items.map((item) => item.alt), ["Hero alt", "Own words"]);
  assert.deepEqual(preview.blocks[4].items, [{ stoneGroupId: "bluestone", finishKey: "sawn", note: undefined }]);
  assert.deepEqual([preview.blocks[5].primary, preview.blocks[5].secondary], [undefined, { label: "Contact", href: "/contact" }]);
  assert.equal(preview.blocks[6].title, "Material placement", "An untitled points block keeps its map title");
  assert.equal(
    getProjectPublishBlockers(draft, behaviorContext).some((blocker) => blocker.section === "body"),
    true,
    "The unsafe CTA link blocks publishing",
  );
  draft.blocks[5].content.primary.href = "/contact";
  assert.deepEqual(getProjectPublishBlockers(draft, behaviorContext), [], "A complete body is publish-ready");
  assert.doesNotThrow(() => validateDraftShape(normalizeProjectDraftForSave(draft)));
  assert.doesNotThrow(() => assertPublishDraft(normalizeProjectDraftForSave(draft)), "Media-backed empty descriptions wait for the media check");

  const emptyText = structuredClone(draft);
  emptyText.blocks[1].content.body = " ";
  assert.equal(
    getProjectPublishBlockers(emptyText, behaviorContext)[0]?.message,
    "Complete every required field in the page body.",
  );
  assert.throws(
    () => assertPublishDraft(normalizeProjectDraftForSave(emptyText)),
    (error) => error?.code === "publish_blocked" && error?.message === "Complete every required field in the page body.",
    "The server repeats the body completeness check",
  );

  const draftStone = structuredClone(draft);
  const draftStoneContext = { ...behaviorContext, stones: [{ id: 1, key: "bluestone", label: "Bluestone", status: "draft" }] };
  assert.ok(
    getProjectPublishBlockers(draftStone, draftStoneContext).some((blocker) => blocker.message === "Use only Live Stone Library stones in stone cards."),
  );

  const oversized = structuredClone(draft);
  oversized.blocks[1].content.body = "x".repeat(5001);
  assert.throws(
    () => validateDraftShape(normalizeProjectDraftForSave(oversized)),
    (error) => error?.status === 400 && error?.code === "invalid_block" && error?.details?.field === "blocks[1].content.body",
    "Block limits are enforced on Save",
  );

  const filled = fillDraftAltText(normalizeProjectDraftForSave(draft), [
    { id: 1, alt: "Hero alt" },
    { id: 2, alt: "Map alt" },
  ]);
  assert.equal(filled.blocks[2].content.alt, "Hero alt");
  assert.deepEqual(filled.blocks[3].content.items.map((item) => item.alt), ["Hero alt", "Own words"]);
});

test("body editing: insert, duplicate and remove blocks keep order and points ownership", () => {
  const draft = structuredClone(behaviorDraft);
  draft.blocks = [imageBlock("block:new:a", 1, { label: "A" }, 0)];
  const heading = createBlock("heading");
  assert.equal(heading.type, "heading");
  assert.match(heading.key, /^block:new:/);
  let next = insertBlocks(draft, 0, [heading]);
  assert.deepEqual(next.blocks.map((block) => [block.type, block.sortOrder]), [["heading", 0], ["image", 1]]);
  next = insertBlocks(next, 99, [createBlock("cta")]);
  assert.deepEqual(next.blocks.map((block) => block.type), ["heading", "image", "cta"], "An out-of-range position appends");

  const withPoints = enableBlockPoints(next, "block:new:a");
  withPoints.blocks[1].id = 44;
  withPoints.blocks[1].content.legacyProjectMediaId = 9;
  const copy = duplicateBlock(withPoints, "block:new:a", "Map alt");
  assert.deepEqual(
    { type: copy.type, id: copy.id, content: copy.content },
    { type: "image", id: null, content: { mediaAssetId: 1, alt: "Map alt", title: "", label: "A", caption: "" } },
    "A points image is duplicated as a plain image of the same picture without points or provenance",
  );
  assert.notEqual(copy.key, "block:new:a");
  const textCopy = duplicateBlock({ ...draft, blocks: [{ key: "block:9", id: 9, type: "text", sortOrder: 0, content: { body: "Hi" } }] }, "block:9");
  assert.deepEqual([textCopy.type, textCopy.id, textCopy.content], ["text", null, { body: "Hi" }]);
  assert.equal(duplicateBlock(draft, "block:missing"), null);
  const removed = removeBlock(withPoints, "block:new:a");
  assert.deepEqual(removed.blocks.map((block) => [block.type, block.sortOrder]), [["heading", 0], ["cta", 1]]);
});

test("adding an image with material points creates its hidden map so the image and points work at once", () => {
  const draft = createEmptyProjectAggregateDraft();
  const added = addBlock(draft, "hotspot_image", 0);
  const block = added.draft.blocks[0];
  assert.equal(block.key, added.key);
  assert.equal(block.type, "hotspot_image");
  assert.equal(added.draft.maps.length, 1);
  assert.equal(block.content.projectMaterialMapKey, added.draft.maps[0].key);
  const withImage = setBlockImage(added.draft, added.key, 7);
  assert.equal(blockImageId(withImage, withImage.blocks[0]), 7);
  const text = addBlock(withImage, "text", 0);
  assert.deepEqual(text.draft.blocks.map((entry) => entry.type), ["text", "hotspot_image"]);
});
