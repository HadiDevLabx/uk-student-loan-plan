// Runnable check for the plan finder. Extracts the real script out of
// index.html so the test cannot drift from what ships.
//
// Run: node test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const stubEl = { value: "england", textContent: "", innerHTML: "", addEventListener() {} };
const document = {
  getElementById: () => ({ innerHTML: "", addEventListener() {}, querySelector: () => stubEl }),
  querySelector: () => stubEl,
};
const fetch = () => Promise.reject(new Error("offline in test"));

const { planFor, PLANS } = new Function(
  "document", "fetch",
  src + "\nreturn { planFor: planFor, PLANS: PLANS };"
)(document, fetch);

const ug = (nation, when) => planFor(nation, when, "ug");
const pg = (nation) => planFor(nation, "post2023", "pg");

// --- England: the only nation that reaches Plan 5 ---------------------------
assert.equal(ug("england", "pre2012"), "plan1");
assert.equal(ug("england", "2012to2023"), "plan2");
assert.equal(ug("england", "post2023"), "plan5");

// --- Wales did NOT follow England onto Plan 5 -------------------------------
// This is the rule most finders get wrong. A Welsh student starting in
// September 2023 is Plan 2, not Plan 5.
assert.equal(ug("wales", "pre2012"), "plan1");
assert.equal(ug("wales", "2012to2023"), "plan2");
assert.equal(ug("wales", "post2023"), "plan2", "Wales stays on Plan 2 after Aug 2023");

// --- Scotland is Plan 4 in every year ---------------------------------------
// Scottish borrowers moved across in April 2021, so the start date is
// irrelevant — the nation alone decides it.
for (const when of ["pre2012", "2012to2023", "post2023"]) {
  assert.equal(ug("scotland", when), "plan4", `Scotland ${when}`);
}

// --- Northern Ireland never left Plan 1 -------------------------------------
for (const when of ["pre2012", "2012to2023", "post2023"]) {
  assert.equal(ug("ni", when), "plan1", `NI ${when}`);
}

// --- Postgraduate: England and Wales only, and date-independent -------------
assert.equal(pg("england"), "postgrad");
assert.equal(pg("wales"), "postgrad");
assert.equal(pg("scotland"), null, "no PGL payroll plan in Scotland");
assert.equal(pg("ni"), null, "no PGL payroll plan in Northern Ireland");
// A postgraduate answer must not depend on when the course started.
for (const when of ["pre2012", "2012to2023", "post2023"]) {
  assert.equal(planFor("england", when, "pg"), "postgrad");
}

// --- the claim the page makes in prose --------------------------------------
// "Plan 5 has the lowest threshold of the lot" and "Plan 4 the highest" are
// asserted in the copy, so they are asserted here too against the fallback
// figures. If a future year breaks this, the test fails rather than the page
// quietly lying.
const ugPlans = ["plan1", "plan2", "plan4", "plan5"];
const lowest = ugPlans.reduce((a, b) => (PLANS[a].threshold <= PLANS[b].threshold ? a : b));
const highest = ugPlans.reduce((a, b) => (PLANS[a].threshold >= PLANS[b].threshold ? a : b));
assert.equal(lowest, "plan5", "page claims Plan 5 has the lowest threshold");
assert.equal(highest, "plan4", "page claims Plan 4 has the highest threshold");

// Postgraduate is the only plan not at 9%.
assert.equal(PLANS.postgrad.rate, 0.06);
for (const k of ugPlans) assert.equal(PLANS[k].rate, 0.09, `${k} rate`);

console.log("plan finder: all assertions passed");
