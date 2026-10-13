---
test: ../project_board_test.md
status: passed
started: 2026-10-13T17:06:15.876Z
duration_s: 176
session_id: 291816ad-f5a1-4737-ab6a-dbf30126ba02
---

# Create a project and a board — Result

## Log in as the demo admin ✓ passed (51s)
md5: 9c6ea8cddf94dd512b081ff69fc3a0c1
Open http://localhost:3000/login.
Type "demo" into the "E-mail or username" field and "demo" into the "Password" field, then click the "Log in" button.
Wait for the page to finish loading.
Verify the URL does not contain "/login" and a "Create project" button is shown.

## Create a project ✓ passed (56.9s)
md5: d408bb6b423f9f7bfc1eb03094c754bb
Click the first "Create project" button.
In the "Create Project" dialog, type "Website Redesign" into the "Title" field and click the "Create project" button in the dialog.
Wait for the page to finish loading.
Verify the URL contains "/projects/" and the header shows "Website Redesign".

## Create a board in the project ✓ passed (63.4s)
md5: c0eda8d9f4264ebc1ef172495068ede2
Click the "Create board" button.
In the "Create Board" dialog, type "Sprint 1" into the "Title" field and click the "Create board" button in the dialog.
Wait for the board to open. If a board settings dialog opens, press Escape to close it.
Verify the URL contains "/boards/" and the page shows "Sprint 1" and an "Add list" button.
