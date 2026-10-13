import testmu, { resolveVar, setVar } from '@testmuai/playwright-bindings';
import { expect } from '@playwright/test';

testmu.configure({
  "build": "ce9cdd9c-8f91-4d60-bd3b-1d4de545b420",
  "name": "Create Project and Board",
  "tcId": "TC-176",
  "network": (process.env.NETWORK ?? "false").toLowerCase() === "true",
  "autoHealVersion": "AH2",
  "defaultActionTimeoutMs": 10000,
  "defaultNavigationTimeoutMs": 60000,
  "kaneRunV4": true
});

testmu.test("Create Project and Board", async (page) => {
  let element_0, element_1, element_4, element_5, element_2, element_7, element_8, element_3, element_10;
  await testmu.step("Navigate to http://localhost:3000/login", { instructionId: "01779948-a872-4854-9969-923b414c93ec" }, async () => {
    await page.goto("http://localhost:3000/login");
  });
  
  await testmu.step("Waiting for the next step to load", { instructionId: "a7e32de0-fe39-448c-99f4-d30771c1e6fc" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Type \"demo\" into \"textbox\"", { instructionId: "3e109079-8bb9-4279-87aa-cba8e41db967" }, async () => {
    element_0 = page.locator("input[name=\"emailOrUsername\"]");
    await element_0.click();
    await element_0.fill("demo");
  });
  
  await testmu.step("Type \"demo\" into \"textbox\"", { instructionId: "30de22d4-0a7d-41d8-afb7-41d25d3a47b2" }, async () => {
    element_1 = page.locator("input[name=\"password\"]");
    await element_1.click();
    await element_1.fill("demo");
  });
  
  await testmu.step("Clicking the Log in button below the password input", { instructionId: "6009fd64-5edf-46ed-a56b-44da4fe7ded0" }, async () => {
    element_4 = page.locator("internal:role=button[name=\"Log in\"i]");
    await element_4.click();
  });
  
  await testmu.step("Waiting for the projects page to finish loading", { instructionId: "0d6a85ea-0659-48b2-b3f6-b2507db6acad" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Reading the current page URL", { instructionId: "b8da1c9b-34c0-4a3d-9ec6-250f3ff02fb1" }, async () => {
    setVar("url_not_login_check", page.url());
  });
  
  await testmu.step("Checking whether the Create project button is present", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("create_project_button_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {16: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (!!el(16) && !el(16).hidden && el(16).getAttribute('aria-hidden') !== 'true');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Create project\"i] >> nth=0"], query: "whether a Create project button is present", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "a \"Create project\" button is shown." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "d4d3d23e-141b-4a41-b9a4-1bddf02aa728" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "the URL does not contain \"/login\".", "passed": true, "operator": "not_contains", "transforms": [], "json_path": null, "expected": "/login", "extracted_value": "{{url_not_login_check}}", "store_key": "url_not_login_check", "variable_refs": {"{{url_not_login_check}}": "http://localhost:3000/"}}, {"description": "a \"Create project\" button is shown.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{create_project_button_visible}}", "store_key": "create_project_button_visible", "variable_refs": {"{{create_project_button_visible}}": "true"}}], "sub_checks": [{"description": "the URL does not contain \"/login\".", "store_key": "url_not_login_check", "expected_value": "/login", "extracted_value": "{{url_not_login_check}}", "operator": "not_contains", "transforms": []}, {"description": "a \"Create project\" button is shown.", "store_key": "create_project_button_visible", "expected_value": "true", "extracted_value": "{{create_project_button_visible}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "the URL does not contain \"/login\" and a \"Create project\" button is shown."});
  });
  
  await testmu.step("Clicking the Create project button in the My Own section", { instructionId: "8389ea97-7a50-4ca5-b3f6-4b42dba0e2e4" }, async () => {
    element_5 = page.locator("internal:role=button[name=\"Create project\"i] >> nth=0");
    await element_5.click();
  });
  
  await testmu.step("Typing Website Redesign", { instructionId: "614c714c-3c30-4d98-97b1-bd2b0dbfc683" }, async () => {
    element_2 = page.locator("input[name=\"name\"]");
    await element_2.click();
    await element_2.fill("Website Redesign");
  });
  
  await testmu.step("Clicking Create project submit button", { instructionId: "3eedee9d-429d-495b-8068-371b048cd228" }, async () => {
    element_7 = page.locator("form >> internal:role=button[name=\"Create project\"i]");
    await element_7.click();
  });
  
  await testmu.step("Waiting for the project page to finish loading", { instructionId: "dfced0cb-a3cd-40f1-985d-64b36370799e" }, async () => {
    await page.waitForTimeout(1500);
  });
  
  await testmu.step("Reading the current page URL", { instructionId: "dadfe9bc-8af2-4960-b5d5-bb3852f9cb32" }, async () => {
    setVar("projects_url_check", page.url());
  });
  
  await testmu.step("Reading the current page title", { instructionId: "c4a75a6b-1136-42a5-b43b-76aa3a47a8c5" }, async () => {
    setVar("website_redesign_header_check", await page.title());
  });
  
  await testmu.step("Assertion check", { instructionId: "9da352ed-3f71-4eb4-a4a1-7fc3d0dd1ff9" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "The URL contains \"/projects/\".", "passed": true, "operator": "contains", "transforms": [], "json_path": null, "expected": "/projects/", "extracted_value": "{{projects_url_check}}", "store_key": "projects_url_check", "variable_refs": {"{{projects_url_check}}": "http://localhost:3000/projects/1885085210538673155"}}, {"description": "The header shows \"Website Redesign\".", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "Website Redesign", "extracted_value": "{{website_redesign_header_check}}", "store_key": "website_redesign_header_check", "variable_refs": {"{{website_redesign_header_check}}": "Website Redesign"}}], "sub_checks": [{"description": "The URL contains \"/projects/\".", "store_key": "projects_url_check", "expected_value": "/projects/", "extracted_value": "{{projects_url_check}}", "operator": "contains", "transforms": []}, {"description": "The header shows \"Website Redesign\".", "store_key": "website_redesign_header_check", "expected_value": "Website Redesign", "extracted_value": "{{website_redesign_header_check}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "the URL contains \"/projects/\" and the header shows \"Website Redesign\""});
  });
  
  await testmu.step("Clicking Create board button", { instructionId: "141888f0-1611-4f8c-98ff-bcdda809ec21" }, async () => {
    element_8 = page.locator("internal:role=button[name=\"Create board\"i]");
    await element_8.click();
  });
  
  await testmu.step("Typing Sprint 1 into board title input", { instructionId: "667d5b78-8f07-4e3e-a077-c297f11cb9da" }, async () => {
    element_3 = page.locator("internal:role=textbox");
    await element_3.click();
    await element_3.fill("Sprint 1");
  });
  
  await testmu.step("Clicking Create board button", { instructionId: "0950b99c-df3c-451b-91ac-acbf04e4722e" }, async () => {
    element_10 = page.locator("form >> internal:role=button[name=\"Create board\"i]");
    await element_10.click();
  });
  
  await testmu.step("Waiting for the new board to finish opening", { instructionId: "da0d3d57-f35c-47ed-b976-78a453007190" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("whether the board settings dialog is visible", { instructionId: "b0d65018-082d-4a56-8b40-bb77d4564659" }, async () => {
    setVar("cp_1", await testmu.visionQuery(page, "whether the board settings dialog is visible", ""));
  });
  
  if (await testmu.evaluateBranch([{"description": "a board settings dialog opens", "store_key": "cp_1", "expected_value": "true", "stored_value": "{{cp_1}}", "operator": "equals", "transforms": []}], "and")) {
    await testmu.step("Pressing the Escape key", { instructionId: "72a3292f-cb8d-473d-b960-6c3897490ab4" }, async () => {
      await page.keyboard.press("Escape");
    });
  }
  
  await testmu.step("Reading the current page URL", { instructionId: "d8b13534-51eb-48f7-bef8-4f3b927b4245" }, async () => {
    setVar("boards_url_check", page.url());
  });
  
  await testmu.step("Checking whether the Sprint 1 board link is present", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("sprint_1_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {14: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(14).textContent.trim() === 'Sprint 1');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=link[name=\"Sprint\"i]"], query: "whether the Sprint 1 board link is present", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "the page shows \"Sprint 1\"" }));
  });
  
  await testmu.step("Checking whether the Add list button is present", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("add_list_button_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {29: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(29).textContent.trim() === 'Add list');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Add list\"i]"], query: "whether the Add list button is present", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "an \"Add list\" button is shown" }));
  });
  
  await testmu.step("Assertion check", { instructionId: "9c6ab29d-6d4f-4c61-84af-7e7a24645dac" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "the URL contains \"/boards/\"", "passed": true, "operator": "contains", "transforms": [], "json_path": null, "expected": "/boards/", "extracted_value": "{{boards_url_check}}", "store_key": "boards_url_check", "variable_refs": {"{{boards_url_check}}": "http://localhost:3000/boards/1885085573102699525"}}, {"description": "the page shows \"Sprint 1\"", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{sprint_1_visible}}", "store_key": "sprint_1_visible", "variable_refs": {"{{sprint_1_visible}}": "true"}}, {"description": "an \"Add list\" button is shown", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{add_list_button_visible}}", "store_key": "add_list_button_visible", "variable_refs": {"{{add_list_button_visible}}": "true"}}], "sub_checks": [{"description": "the URL contains \"/boards/\"", "store_key": "boards_url_check", "expected_value": "/boards/", "extracted_value": "{{boards_url_check}}", "operator": "contains", "transforms": []}, {"description": "the page shows \"Sprint 1\"", "store_key": "sprint_1_visible", "expected_value": "true", "extracted_value": "{{sprint_1_visible}}", "operator": "equals", "transforms": []}, {"description": "an \"Add list\" button is shown", "store_key": "add_list_button_visible", "expected_value": "true", "extracted_value": "{{add_list_button_visible}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "the URL contains \"/boards/\" and the page shows \"Sprint 1\" and an \"Add list\" button"});
  });
});

testmu.run();