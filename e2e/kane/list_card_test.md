---
mode: testing
url: http://localhost:3000/login
max_steps: 30
tags: [smoke, cards]
---

# Add a list and a card to a board

## Log in as the demo admin
Open http://localhost:3000/login.
Type "demo" into the "E-mail or username" field and "demo" into the "Password" field, then click the "Log in" button.
Wait for the page to finish loading.
Verify the URL does not contain "/login" and a "Create project" button is shown.

## Create a project with a board
Click the first "Create project" button, type "Release Planning" into the "Title" field and click the "Create project" button in the dialog.
Wait for the project page to load, click the "Create board" button, type "Backlog" into the "Title" field and click the "Create board" button in the dialog.
Wait for the board to open. If a board settings dialog opens, press Escape to close it.
Verify the URL contains "/boards/" and an "Add list" button is shown.

## Add a list
Click the "Add list" button, type "To Do" into the "Enter list title..." field and press Enter, then press Escape.
Verify a list titled "To Do" is shown with an "Add card" button.

## Add a card to the list
Click the "Add card" button in the "To Do" list, type "Write release notes" into the "Enter card title..." field and press Enter, then press Escape.
Verify a card titled "Write release notes" is shown in the "To Do" list.

## Open the card
Click the "Write release notes" card.
Wait for the card details to open.
Verify the URL contains "/cards/" and the card details show the title "Write release notes" and a "Description" section.
