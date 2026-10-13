import testmu, { resolveVar, setVar } from '@testmuai/playwright-bindings';
import { expect } from '@playwright/test';

testmu.configure({
  "build": "29ee4ade-8e8d-4e31-9246-83545302617b",
  "name": "Create Project with Board, List, and Card",
  "tcId": "TC-177",
  "network": (process.env.NETWORK ?? "false").toLowerCase() === "true",
  "autoHealVersion": "AH2",
  "defaultActionTimeoutMs": 10000,
  "defaultNavigationTimeoutMs": 60000,
  "kaneRunV4": true
});

testmu.test("Create Project with Board, List, and Card", async (page) => {
  let element_0, element_1, element_6, element_7, element_2, element_9, element_10, element_3, element_12, element_13, element_4, element_15, element_5, element_17;
  await testmu.step("Navigate to http://localhost:3000/login", { instructionId: "29381d6c-d681-4f08-895a-8f099a3be93a" }, async () => {
    await page.goto("http://localhost:3000/login");
  });
  
  await testmu.step("Waiting for queued plan steps to complete", { instructionId: "6b696e44-5387-431d-a667-3daf4f0b7080" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Type \"demo\" into \"textbox\"", { instructionId: "b7d13fdd-59bf-4b73-8d4b-edbd58b16f70" }, async () => {
    element_0 = page.locator("input[name=\"emailOrUsername\"]");
    await element_0.click();
    await element_0.fill("demo");
  });
  
  await testmu.step("Type \"demo\" into \"textbox\"", { instructionId: "60bdaccd-2b27-4b5a-8fb4-73b92eb0ae1e" }, async () => {
    element_1 = page.locator("input[name=\"password\"]");
    await element_1.click();
    await element_1.fill("demo");
  });
  
  await testmu.step("Clicking Log in button in Log In form", { instructionId: "4f461670-217d-41ef-9119-dd9408fa30cd" }, async () => {
    element_6 = page.locator("internal:role=button[name=\"Log in\"i]");
    await element_6.click();
  });
  
  await testmu.step("Waiting for the projects page to finish loading", { instructionId: "376f44dc-7779-4bb7-9968-d75bb4004fdb" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Reading the current page URL", { instructionId: "b0bd1a77-6628-46f1-ab7d-1f3a724b0ec5" }, async () => {
    setVar("url_not_login_check", page.url());
  });
  
  await testmu.step("Checking whether the Create project button is visible", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("create_project_button_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {19: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (!!el(19) && el(19).getClientRects().length > 0 && getComputedStyle(el(19)).visibility !== 'hidden' && getComputedStyle(el(19)).display !== 'none');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Create project\"i] >> nth=0"], query: "whether the Create project button is visible", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "A \"Create project\" button is shown." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "071504dd-3d02-41bd-9dc3-6beff2238908" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "The URL does not contain \"/login\".", "passed": true, "operator": "not_contains", "transforms": [], "json_path": null, "expected": "/login", "extracted_value": "{{url_not_login_check}}", "store_key": "url_not_login_check", "variable_refs": {"{{url_not_login_check}}": "http://localhost:3000/"}}, {"description": "A \"Create project\" button is shown.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{create_project_button_visible}}", "store_key": "create_project_button_visible", "variable_refs": {"{{create_project_button_visible}}": "true"}}], "sub_checks": [{"description": "The URL does not contain \"/login\".", "store_key": "url_not_login_check", "expected_value": "/login", "extracted_value": "{{url_not_login_check}}", "operator": "not_contains", "transforms": []}, {"description": "A \"Create project\" button is shown.", "store_key": "create_project_button_visible", "expected_value": "true", "extracted_value": "{{create_project_button_visible}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "the URL does not contain \"/login\" and a \"Create project\" button is shown."});
  });
  
  await testmu.step("Clicking the Create project button", { instructionId: "7da03faa-f5a9-4e3c-87a7-8e952a1d61e3" }, async () => {
    element_7 = page.locator("internal:role=button[name=\"Create project\"i] >> nth=0");
    await element_7.click();
  });
  
  await testmu.step("Typing Release Planning in the project Title field", { instructionId: "d7aec85d-a800-485b-bc5b-0f4dccf18c6f" }, async () => {
    element_2 = page.locator("input[name=\"name\"]");
    await element_2.click();
    await element_2.fill("Release Planning");
  });
  
  await testmu.step("Clicking Create project submit button in the Create Project dialog", { instructionId: "ac21fdfd-0d14-4240-9525-a8fea8dc3824" }, async () => {
    element_9 = page.locator("form >> internal:role=button[name=\"Create project\"i]");
    await element_9.click();
  });
  
  await testmu.step("Clicking Create board button", { instructionId: "19e8f91b-00ec-4075-b784-99dee026b6e7" }, async () => {
    element_10 = page.locator("internal:role=button[name=\"Create board\"i]");
    await element_10.click();
  });
  
  await testmu.step("Waiting for the Create board button to appear", { instructionId: "4fe17e97-7b12-4bfe-bb6f-03d956acbe4e" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Type \"Backlog\" into \"textbox\"", { instructionId: "bd050d8a-e2dc-44ae-b09a-637712f8a76d" }, async () => {
    element_3 = page.locator("internal:role=textbox");
    await element_3.click();
    await element_3.fill("Backlog");
  });
  
  await testmu.step("Click \"Create board\"", { instructionId: "4e85d183-1277-475f-a2cc-493d163f8382" }, async () => {
    element_12 = page.locator("form >> internal:role=button[name=\"Create board\"i]");
    await element_12.click();
  });
  
  await testmu.step("Waiting for the backlog board to finish opening", { instructionId: "45dc5eb8-2ffb-4fb5-8268-33141371f120" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Checking whether the board settings dialog is open", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("board_settings_dialog_open", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {31: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (Boolean(el(31).querySelector('h4') && el(31).querySelector('a')));\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["div >> internal:has-text=\"GeneralPreferencesNotificationsDefault ViewKanbanVisual task management with\"i >> nth=1"], query: "whether the board settings dialog is open", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "A board settings dialog opens." }));
  });
  
  if (await testmu.evaluateBranch([{"description": "A board settings dialog opens.", "store_key": "board_settings_dialog_open", "expected_value": "true", "stored_value": "{{board_settings_dialog_open}}", "operator": "equals", "transforms": []}], "and")) {
    await testmu.step("Pressing the Escape key", { instructionId: "d03f3fbb-99bb-4b9b-a5ac-14bdbf46cbef" }, async () => {
      await page.keyboard.press("Escape");
    });
  }
  
  await testmu.step("Reading the current board URL", { instructionId: "b6516495-2c45-4b61-9b9b-ddb0425337e3" }, async () => {
    setVar("board_url_check", page.url());
  });
  
  await testmu.step("Checking whether the Add list button is visible", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("add_list_button_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {29: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(29).getBoundingClientRect().width > 0 && el(29).getBoundingClientRect().height > 0 && getComputedStyle(el(29)).visibility !== 'hidden' && getComputedStyle(el(29)).display !== 'none');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Add list\"i]"], query: "whether the Add list button is visible", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "An \"Add list\" button is shown." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "3315d684-a5dc-444d-a578-230168f60a52" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "The URL contains \"/boards/\".", "passed": true, "operator": "contains", "transforms": [], "json_path": null, "expected": "/boards/", "extracted_value": "{{board_url_check}}", "store_key": "board_url_check", "variable_refs": {"{{board_url_check}}": "http://localhost:3000/boards/1885087166065804300"}}, {"description": "An \"Add list\" button is shown.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{add_list_button_visible}}", "store_key": "add_list_button_visible", "variable_refs": {"{{add_list_button_visible}}": "true"}}], "sub_checks": [{"description": "The URL contains \"/boards/\".", "store_key": "board_url_check", "expected_value": "/boards/", "extracted_value": "{{board_url_check}}", "operator": "contains", "transforms": []}, {"description": "An \"Add list\" button is shown.", "store_key": "add_list_button_visible", "expected_value": "true", "extracted_value": "{{add_list_button_visible}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "the URL contains \"/boards/\" and an \"Add list\" button is shown"});
  });
  
  await testmu.step("Clicking Add list button", { instructionId: "a6f9f081-8ab4-407c-9a2f-28989a6410e5" }, async () => {
    element_13 = page.locator("internal:role=button[name=\"Add list\"i]");
    await element_13.click();
  });
  
  await testmu.step("Typing the new list title in the input field", { instructionId: "f97ccb81-ba39-419f-b473-79cfc8bbb806" }, async () => {
    element_4 = page.locator("internal:role=textbox[name=\"Enter list title...\"i]");
    await element_4.click();
    await element_4.fill("To Do");
  });
  
  await testmu.step("Pressing the Enter key", { instructionId: "ca3960bf-2336-45dd-8032-ad6189544945" }, async () => {
    await page.keyboard.press("Enter");
  });
  
  await testmu.step("Pressing the Escape key", { instructionId: "7acd4433-19ed-4720-8175-689bd065610f" }, async () => {
    await page.keyboard.press("Escape");
  });
  
  await testmu.step("Checking whether the To Do list is shown", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("to_do_list_shown", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {31: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(31).textContent.trim() === 'To Do');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"To Do\"i]"], query: "whether the list titled To Do is shown", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "A list titled \"To Do\" is shown." }));
  });
  
  await testmu.step("Checking whether the To Do list has an Add card button", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("to_do_add_card_button", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {33: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(33).textContent.trim() === 'Add card');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Add card\"i]"], query: "whether the To Do list has an Add card button", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "The list titled \"To Do\" has an \"Add card\" button." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "c2bdb3dd-ea9b-4c9d-8f1e-20a71c630241" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "A list titled \"To Do\" is shown.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{to_do_list_shown}}", "store_key": "to_do_list_shown", "variable_refs": {"{{to_do_list_shown}}": "true"}}, {"description": "The list titled \"To Do\" has an \"Add card\" button.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{to_do_add_card_button}}", "store_key": "to_do_add_card_button", "variable_refs": {"{{to_do_add_card_button}}": "true"}}], "sub_checks": [{"description": "A list titled \"To Do\" is shown.", "store_key": "to_do_list_shown", "expected_value": "true", "extracted_value": "{{to_do_list_shown}}", "operator": "equals", "transforms": []}, {"description": "The list titled \"To Do\" has an \"Add card\" button.", "store_key": "to_do_add_card_button", "expected_value": "true", "extracted_value": "{{to_do_add_card_button}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "a list titled \"To Do\" is shown with an \"Add card\" button"});
  });
  
  await testmu.step("Clicking Add card button in To Do list", { instructionId: "860c78de-61a6-4822-bbb0-fa746155170c" }, async () => {
    element_15 = page.locator("internal:role=button[name=\"Add card\"i]");
    await element_15.click();
  });
  
  await testmu.step("Typing release notes into card title input", { instructionId: "03f3f92a-50ee-45a3-83c7-fdfaa959b8b8" }, async () => {
    element_5 = page.locator("internal:role=textbox[name=\"Enter card title...\"i]");
    await element_5.click();
    await element_5.fill("Write release notes");
  });
  
  await testmu.step("Pressing the Enter key", { instructionId: "f58b16e1-6080-4c35-8c9b-a683a2a43cba" }, async () => {
    await page.keyboard.press("Enter");
  });
  
  await testmu.step("Pressing the Escape key", { instructionId: "1df6292b-31db-44f5-a444-683abf20c910" }, async () => {
    await page.keyboard.press("Escape");
  });
  
  await testmu.step("Checking for the Write release notes card in the To Do list", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("to_do_card_write_release_notes_visible", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {32: 0};\n  const el = (i) => els[__m[i]];\n  const __v = ((el(32).textContent || '').trim() === 'Write release notes');\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=button[name=\"Write release notes\"i]"], query: "whether the \"Write release notes\" card is present in the \"To Do\" list", expectedValue: "true", needsUnitConversion: false, operator: "equals", transforms: [], condition: "A card titled \"Write release notes\" is shown in the \"To Do\" list." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "8767ec4d-3248-44cc-ba1d-e318610e088b" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "A card titled \"Write release notes\" is shown in the \"To Do\" list.", "passed": true, "operator": "equals", "transforms": [], "json_path": null, "expected": "true", "extracted_value": "{{to_do_card_write_release_notes_visible}}", "store_key": "to_do_card_write_release_notes_visible", "variable_refs": {"{{to_do_card_write_release_notes_visible}}": "true"}}], "sub_checks": [{"description": "A card titled \"Write release notes\" is shown in the \"To Do\" list.", "store_key": "to_do_card_write_release_notes_visible", "expected_value": "true", "extracted_value": "{{to_do_card_write_release_notes_visible}}", "operator": "equals", "transforms": []}], "composite_operator": "and", "claim": "a card titled \"Write release notes\" is shown in the \"To Do\" list"});
  });
  
  await testmu.step("Clicking Write release notes in the To Do list", { instructionId: "803e2783-844f-4fb6-ad60-7a124ae3e3df" }, async () => {
    element_17 = page.locator("internal:role=button[name=\"Write release notes\"i]");
    await element_17.click();
  });
  
  await testmu.step("Waiting for the Write release notes card details dialog to settle", { instructionId: "66675829-6572-418a-b39d-c3b8d54646ad" }, async () => {
    await page.waitForTimeout(1000);
  });
  
  await testmu.step("Reading the current card URL", { instructionId: "024d190c-bd03-433d-918e-0618d556b06f" }, async () => {
    setVar("card_url_check", page.url());
  });
  
  await testmu.step("Reading the card title from the details panel", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("card_title_check", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {42: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (el(42).value);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:role=textbox >> internal:has-text=\"Write release notes\"i"], query: "the card title in the card details", expectedValue: "Write release notes", needsUnitConversion: false, operator: "equals", transforms: ["strip"], condition: "The card details show the title \"Write release notes\"." }));
  });
  
  await testmu.step("Reading the Description section heading", async () => {
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
    setVar("description_section_check", await testmu.textualAnalyzer(page, { wrappedJs: "(els) => {\n  const __m = {45: 0};\n  const el = (i) => els[__m[i]];\n  const __v = (Array.from(el(45).querySelectorAll('*')).find(e => e.textContent.trim() === 'Description')?.textContent.trim() ?? null);\n  return (typeof __v === 'boolean' ? String(__v) : __v);\n}", locators: ["internal:text=\"DescriptionAdd more detailed\"i"], query: "the Description section heading in the card details", expectedValue: "Description", needsUnitConversion: false, operator: "equals", transforms: ["strip"], condition: "The card details show a \"Description\" section." }));
  });
  
  await testmu.step("Assertion check", { instructionId: "4ade308b-bdf7-4f55-aac7-2ba30d214d60" }, async () => {
    await testmu.verifyAssertion(page, "Assertion check", {"operator": ["equals"], "assertion_operands": [], "left_operand": null, "right_operand": null, "operands": [], "sub_results": [{"description": "The URL contains \"/cards/\".", "passed": true, "operator": "contains", "transforms": [], "json_path": null, "expected": "/cards/", "extracted_value": "{{card_url_check}}", "store_key": "card_url_check", "variable_refs": {"{{card_url_check}}": "http://localhost:3000/cards/1885088344212243473"}}, {"description": "The card details show the title \"Write release notes\".", "passed": true, "operator": "equals", "transforms": ["strip"], "json_path": null, "expected": "Write release notes", "extracted_value": "{{card_title_check}}", "store_key": "card_title_check", "variable_refs": {"{{card_title_check}}": "Write release notes"}}, {"description": "The card details show a \"Description\" section.", "passed": true, "operator": "equals", "transforms": ["strip"], "json_path": null, "expected": "Description", "extracted_value": "{{description_section_check}}", "store_key": "description_section_check", "variable_refs": {"{{description_section_check}}": "Description"}}], "sub_checks": [{"description": "The URL contains \"/cards/\".", "store_key": "card_url_check", "expected_value": "/cards/", "extracted_value": "{{card_url_check}}", "operator": "contains", "transforms": []}, {"description": "The card details show the title \"Write release notes\".", "store_key": "card_title_check", "expected_value": "Write release notes", "extracted_value": "{{card_title_check}}", "operator": "equals", "transforms": ["strip"]}, {"description": "The card details show a \"Description\" section.", "store_key": "description_section_check", "expected_value": "Description", "extracted_value": "{{description_section_check}}", "operator": "equals", "transforms": ["strip"]}], "composite_operator": "and", "claim": "the URL contains \"/cards/\" and the card details show the title \"Write release notes\" and a \"Description\" section"});
  });
});

testmu.run();