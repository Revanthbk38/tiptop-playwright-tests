const { test, expect } = require('@playwright/test');

const BASE = 'https://d3pv22lioo8876.cloudfront.net/tiptop/';

// --------------------------
//  TEST CASE 1
// --------------------------
test('TC1 - Verify disabled input is disabled', async ({ page }) => {
  await page.goto(BASE);

  const disabled = page.locator("xpath=.//input[@name='my-disabled']");
  await expect(disabled).toBeDisabled();
});

// --------------------------
//  TEST CASE 2
// --------------------------
test('TC2 - Verify readonly input using XPath 1', async ({ page }) => {
  await page.goto(BASE);

  const ro1 = page.locator("xpath=.//input[@value='Readonly input']");
  await expect(ro1).toHaveAttribute('readonly', /|/);
});

test('TC3-debug - inspect readonly candidates', async ({ page }) => {
  await page.goto(BASE);

  // Candidate 1: label following input
  const cand1 = page.locator("xpath=.//label[contains(., 'Readonly input')]/following::input[1]");
  const c1count = await cand1.count();
  console.log('cand1 count =', c1count);
  for (let i = 0; i < c1count; i++) {
    console.log('cand1 outerHTML[' + i + ']:', await cand1.nth(i).evaluate(n => n.outerHTML));
    console.log('cand1 readonly attr[' + i + ']:', await cand1.nth(i).getAttribute('readonly'));
  }

  // Candidate 2: direct input with value
  const cand2 = page.locator("xpath=.//input[@value='Readonly input']");
  const c2count = await cand2.count();
  console.log('cand2 count =', c2count);
  for (let i = 0; i < c2count; i++) {
    console.log('cand2 outerHTML[' + i + ']:', await cand2.nth(i).evaluate(n => n.outerHTML));
    console.log('cand2 readonly attr[' + i + ']:', await cand2.nth(i).getAttribute('readonly'));
  }

  // Candidate 3: input by name (if exists)
  const cand3 = page.locator("xpath=.//input[@name='my-readonly']");
  const c3count = await cand3.count();
  console.log('cand3 count =', c3count);
  for (let i = 0; i < c3count; i++) {
    console.log('cand3 outerHTML[' + i + ']:', await cand3.nth(i).evaluate(n => n.outerHTML));
    console.log('cand3 readonly attr[' + i + ']:', await cand3.nth(i).getAttribute('readonly'));
  }
});


// --------------------------
//  TEST CASE 4
// --------------------------
test('TC4 - Verify dropdown has 8 elements using XPath 1', async ({ page }) => {
  await page.goto(BASE);

  const dropdown = page.locator("xpath=.//select[@name='my-select']");
  expect(await dropdown.locator('option').count()).toBe(8);
});

// --------------------------
//  TEST CASE 5
// --------------------------
test('TC5 - Verify dropdown has 8 elements using XPath 2', async ({ page }) => {
  await page.goto(BASE);

  const options = page.locator("xpath=.//select[@name='my-select']/option");
  expect(await options.count()).toBe(8);
});

// --------------------------
//  TEST CASE 6
// --------------------------
test('TC6 - Verify submit button disabled when Name is empty', async ({ page }) => {
  await page.goto(BASE);

  const submit = page.locator("xpath=.//button[@type='submit']");

  await page.fill("xpath=.//input[@name='my-name']", '');
  await page.fill("xpath=.//input[@name='my-password']", '');

  await expect(submit).toBeDisabled();
});

// --------------------------
//  TEST CASE 7
// --------------------------
test('TC7 - Verify submit button enabled and form submits successfully', async ({ page }) => {
  await page.goto(BASE);

  // Fill valid values
  await page.fill("xpath=.//input[@name='my-name']", 'testrevanth');
  await page.fill("xpath=.//input[@name='my-password']", 'testpassword');
  await page.selectOption("xpath=.//select[@name='my-select']", 'white');

  const submit = page.locator("xpath=.//button[@type='submit']");
  await expect(submit).toBeEnabled();

  // Submit
  await Promise.all([
    page.waitForNavigation(),
    submit.click()
  ]);

  // Check text
  const bodyText = await page.textContent("body");
  expect(bodyText.toLowerCase()).toContain("received");

  // Check URL parameters
  const url = page.url();
  expect(url).toContain("my-name=testrevanth");
  expect(url).toContain("my-password=testpassword");
  expect(url).toContain("my-readonly=Readonly+input");
  expect(url.toLowerCase()).toContain("my-select=white");
});
