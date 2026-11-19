import test from "node:test";
import assert from "node:assert/strict";
import { chooseImageAction, imageTaskSchema } from "./course-image-worker.ts";

test("PNG lesson art gets the wide classroom export", () => {
  const task = imageTaskSchema.parse({ tenantId: "t1", accountId: "a1", assetId: "cover", sourceImage: "img1", filename: "cover.PNG" });
  assert.deepEqual(chooseImageAction(task), { width: 1600, height: 900, format: "webp" });
});
