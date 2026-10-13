---
mode: testing
url: http://localhost:3000/login
max_steps: 25
tags: [smoke, projects]
---

# Create a project and a board

## Log in as the demo admin
Open http://localhost:3000/login.
Type "demo" into the "E-mail or username" field and "demo" into the "Password" field, then click the "Log in" button.
Wait for the page to finish loading.
Verify the URL does not contain "/login" and a "Create project" button is shown.

## Create a project
Click the first "Create project" button.
In the "Create Project" dialog, type "Website Redesign" into the "Title" field and click the "Create project" button in the dialog.
Wait for the page to finish loading.
Verify the URL contains "/projects/" and the header shows "Website Redesign".

## Create a board in the project
Click the "Create board" button.
In the "Create Board" dialog, type "Sprint 1" into the "Title" field and click the "Create board" button in the dialog.
Wait for the board to open. If a board settings dialog opens, press Escape to close it.
Verify the URL contains "/boards/" and the page shows "Sprint 1" and an "Add list" button.
