import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, passwordStrength } from "../js/lockup.mjs";

test("correct password verifies", async () => {
  const h = await hashPassword("Hold-Fast-1963!");
  assert.ok(await verifyPassword("Hold-Fast-1963!", h));
});
test("wrong password fails", async () => {
  const h = await hashPassword("Hold-Fast-1963!");
  assert.equal(await verifyPassword("hold-fast-1963!", h), false);
});
test("same password gives different hashes (random salt)", async () => {
  assert.notEqual(await hashPassword("abc"), await hashPassword("abc"));
});
test("strength meter", () => {
  assert.equal(passwordStrength("abc"), "Very weak");
  assert.equal(passwordStrength("Correct-Horse-Battery-9"), "Excellent");
});
