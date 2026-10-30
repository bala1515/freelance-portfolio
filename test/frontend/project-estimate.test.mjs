import test from "node:test";
import assert from "node:assert/strict";
import { estimateTotal } from "../../app/frontend/lib/project-estimate.js";
for (const [scope, expected] of [["1–4 pages", 12000], ["5–8 pages", 14000], ["More than 8 pages", 20000]]) {
  test(`${scope} includes domain and deployment for ${expected}`, () => {
    assert.equal(estimateTotal({ type: "static", scope, domain: true, deployment: true }), expected);
    assert.equal(estimateTotal({ type: "static", scope, domain: false, deployment: true }), expected - 2000);
    assert.equal(estimateTotal({ type: "static", scope, domain: true, deployment: false }), expected - 5000);
  });
}
test("static development plus domain and deployment matches the approved 12000 estimate", () =>
  assert.equal(
    estimateTotal({ type: "static", domain: true, deployment: true }),
    12000,
  ));
test("existing domain removes only the 2000 domain cost", () =>
  assert.equal(
    estimateTotal({ type: "static", domain: false, deployment: true }),
    10000,
  ));
test("existing deployment removes only the 5000 deployment cost", () =>
  assert.equal(
    estimateTotal({ type: "static", domain: true, deployment: false }),
    7000,
  ));
test("development alone stays at 5000", () =>
  assert.equal(
    estimateTotal({ type: "static", domain: false, deployment: false }),
    5000,
  ));
test("custom applications are not assigned static website rates", () =>
  assert.equal(
    estimateTotal({ type: "app", domain: true, deployment: true }),
    null,
  ));
