# Which UK student loan plan am I on?

Three questions — where you lived when you applied, when your course started,
and what you studied — and it tells you which of Plan 1, 2, 4, 5 or
Postgraduate you repay on, with the threshold and rate.

**Live:** <https://uk-student-loan-plan.vercel.app/>

One static page, no framework, no dependencies, no tracking. Thresholds are
fetched from [uk-tax-rates](https://github.com/HadiDevLabx/uk-tax-rates) at
load, with fallback figures so it works offline.

## The rules most plan finders get wrong

**Wales did not follow England onto Plan 5.** A Welsh student starting in
September 2023 is Plan 2. Plan 5 is England only.

**Scotland is Plan 4 in every year**, regardless of start date — Scottish
borrowers moved across in April 2021.

**Northern Ireland never left Plan 1.**

**A Postgraduate Loan does not replace an undergraduate one.** If you have
both, both are deducted, each against its own threshold.

**Plan 5 has the lowest threshold of all the plans**, so it starts taking
money earlier than Plan 2 despite being the newest.

All five have assertions in [`test.mjs`](test.mjs), which extracts the real
script out of `index.html` so the test cannot drift from what ships.

```bash
node test.mjs
```

The test also asserts the claims the page makes in prose — Plan 5 lowest,
Plan 4 highest — so a future year's figures break the test rather than quietly
making the page lie.

## Take it further

This tells you the plan. The
[student loan repayment calculator](https://truetakehome.co.uk/student-loan-repayment-calculator/)
puts a salary against it, and the
[take-home pay calculator](https://truetakehome.co.uk/) shows it alongside
tax, National Insurance and pension.

**A guide, not a determination.** The Student Loans Company and your online
repayment account are authoritative for your own loan.

MIT licensed.
