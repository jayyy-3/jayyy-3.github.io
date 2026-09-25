import { test } from "vitest";
import assert from "node:assert/strict";
import {
  adoptLegacyMaterialMaps,
  collectProjectMediaAssetIds,
  countHotspotsForMaterial,
  createEmptyProjectAggregateDraft,
  disableMediaBlockPoints,
  draftToProjectData,
  enableMediaBlockPoints,
  getProjectBlockerSections,
  getProjectPublishBlockers,
  hotspotsForBlock,
  mediaBlockImageId,
  mergeProjectMediaOptions,
  moveProjectDraftItem,
  normalizeProjectDraftForSave,
  removeMediaBlock,
  setMediaBlockImage,
} from "../src/features/projects/projectAggregate.ts";
import {
  assertPublishDraft,
  assertPublishableMedia,
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
  referencedMediaDraft.mediaBlocks = [
    { mediaAssetId: 705 },
    { mediaAssetId: 701 },
  ];
  referencedMediaDraft.hotspots = [{ previewMediaId: 706 }];
  assert.deepEqual(
    collectProjectMediaAssetIds(referencedMediaDraft),
    [701, 702, 704, 705],
    "Project media fetches must ignore retired material and hotspot image overrides",
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
  orderDraft.mediaBlocks = [
    {
      key: "media:new:first",
      id: null,
      mediaRole: "normal_image",
      mediaAssetId: 1,
      projectMaterialMapKey: null,
      blockTitle: "First image",
      youtubeUrl: "",
      label: "",
      caption: "",
      sortOrder: 4,
    },
    {
      key: "media:new:second",
      id: null,
      mediaRole: "normal_image",
      mediaAssetId: 2,
      projectMaterialMapKey: null,
      blockTitle: "Second image",
      youtubeUrl: "",
      label: "",
      caption: "",
      sortOrder: 9,
    },
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
    "mediaBlocks",
    "media:new:second",
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
  assert.equal(reorderedDraft.mediaBlocks[0].key, "media:new:second");
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
    reorderedDraft.mediaBlocks,
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
    reorderedPreview.mediaBlocks?.[0]?.title,
    "Second image",
    "Draft preview must follow the same normalized media order saved publicly",
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
    behaviorPreview.mediaBlocks?.[0]?.type,
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
  duplicateVideoDraft.mediaBlocks.push(
    {
      key: "media:new:video-one",
      id: null,
      mediaRole: "youtube_video",
      mediaAssetId: null,
      projectMaterialMapKey: null,
      blockTitle: "One",
      youtubeUrl: "https://youtu.be/abcdefghijk",
      label: "",
      caption: "",
      sortOrder: 0,
    },
    {
      key: "media:new:video-two",
      id: null,
      mediaRole: "youtube_video",
      mediaAssetId: null,
      projectMaterialMapKey: null,
      blockTitle: "Two",
      youtubeUrl: "https://youtu.be/lmnopqrstuv",
      label: "",
      caption: "",
      sortOrder: 1,
    },
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
      (blocker) => blocker.section === "media",
    ),
    "Missing child references must become a plain-language publish blocker on the image",
  );

  // Points live on media images: the map is a hidden child of its image block.
  const pointsDraft = createEmptyProjectAggregateDraft();
  pointsDraft.materials.push(structuredClone(behaviorDraft.materials[0]));
  pointsDraft.mediaBlocks.push({
    key: "media:new:plain",
    id: null,
    mediaRole: "normal_image",
    mediaAssetId: 2,
    projectMaterialMapKey: null,
    blockTitle: "Entry view",
    youtubeUrl: "",
    label: "Context",
    caption: "Caption",
    sortOrder: 0,
  });
  const enabledPoints = enableMediaBlockPoints(pointsDraft, "media:new:plain");
  const enabledBlock = enabledPoints.mediaBlocks[0];
  assert.equal(enabledBlock.mediaRole, "hotspot_image");
  assert.equal(enabledBlock.mediaAssetId, null, "A points block must read its image from its map");
  assert.equal(enabledPoints.maps.length, 1);
  assert.equal(enabledPoints.maps[0].mediaAssetId, 2);
  assert.equal(enabledPoints.maps[0].title, "Entry view");
  assert.equal(enabledBlock.projectMaterialMapKey, enabledPoints.maps[0].key);
  assert.equal(mediaBlockImageId(enabledPoints, enabledBlock), 2);
  assert.equal(
    enableMediaBlockPoints(enabledPoints, "media:new:plain"),
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
  assert.deepEqual(hotspotsForBlock(withPoint, "media:new:plain").map((point) => point.key), ["hotspot:new:on-image"]);
  assert.equal(countHotspotsForMaterial(withPoint, "material:new:proof"), 1);
  assert.equal(countHotspotsForMaterial(withPoint, "material:new:missing"), 0);
  const replacedImage = setMediaBlockImage(withPoint, "media:new:plain", 1);
  assert.equal(replacedImage.maps[0].mediaAssetId, 1, "Replacing a points image must change the map image");
  assert.deepEqual(
    [replacedImage.hotspots[0].xPercent, replacedImage.hotspots[0].yPercent],
    [30, 70],
    "Replacing a points image must keep point positions",
  );
  assert.equal(
    setMediaBlockImage(pointsDraft, "media:new:plain", 1).mediaBlocks[0].mediaAssetId,
    1,
    "Replacing a plain image must change the block image",
  );
  const disabledPoints = disableMediaBlockPoints(withPoint, "media:new:plain");
  assert.deepEqual(
    disabledPoints.mediaBlocks,
    pointsDraft.mediaBlocks,
    "Turning points off must restore the original plain image block",
  );
  assert.equal(disabledPoints.maps.length, 0, "Turning points off must remove the hidden map");
  assert.equal(disabledPoints.hotspots.length, 0, "Turning points off must delete its points");
  const removedPointsBlock = removeMediaBlock(withPoint, "media:new:plain");
  assert.deepEqual(
    [removedPointsBlock.mediaBlocks.length, removedPointsBlock.maps.length, removedPointsBlock.hotspots.length],
    [0, 0, 0],
    "Removing a points block must cascade to its map and points",
  );
  assert.equal(
    removeMediaBlock(pointsDraft, "media:new:plain").mediaBlocks.length,
    0,
    "Removing a plain image block removes only that block",
  );
  const savedPoints = normalizeProjectDraftForSave({
    ...withPoint,
    maps: [{ ...withPoint.maps[0], title: "Old map title", intro: "Retired introduction" }],
    mediaBlocks: [{ ...withPoint.mediaBlocks[0], blockTitle: "" }],
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
    getProjectBlockerSections(unplacedPoint, behaviorContext).has("media"),
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
  legacyMapDraft.mediaBlocks.push({
    key: "media:new:linked",
    id: null,
    mediaRole: "hotspot_image",
    mediaAssetId: null,
    projectMaterialMapKey: "map:new:linked",
    blockTitle: "",
    youtubeUrl: "",
    label: "",
    caption: "",
    sortOrder: 0,
  });
  const adoptedDraft = adoptLegacyMaterialMaps(legacyMapDraft);
  assert.deepEqual(
    adoptedDraft.mediaBlocks.map((block) => [block.mediaRole, block.projectMaterialMapKey, block.blockTitle]),
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
    draftToProjectData(adoptedDraft, behaviorContext).mediaBlocks?.map((block) => block.type === "hotspot_image" ? block.title : block.type),
    draftToProjectData(legacyMapDraft, behaviorContext).mediaBlocks?.map((block) => block.type === "hotspot_image" ? block.title : block.type),
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
  semanticExtraDraft.mediaBlocks.push({
    key: "media:new:semantic-extra",
    id: null,
    mediaRole: "youtube_video",
    mediaAssetId: 999,
    projectMaterialMapKey: null,
    blockTitle: "Video",
    youtubeUrl: "abcdefghijk",
    label: "",
    caption: "",
    sortOrder: 0,
  });
  assert.throws(
    () => validateDraftShape(semanticExtraDraft),
    (error) => error?.status === 400 && error?.code === "invalid_draft_field",
    "Unused YouTube media ids must be rejected instead of promoted",
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
        mediaBlocks: [],
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
