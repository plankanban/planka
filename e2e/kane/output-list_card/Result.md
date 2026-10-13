---
test: ../list_card_test.md
status: passed
started: 2026-10-13T17:09:36.418Z
duration_s: 330
session_id: d7a57192-885a-4d94-ba0c-08a97bcea25c
---

# Add a list and a card to a board — Result

## Log in as the demo admin ✓ passed (46.4s)
md5: 9c6ea8cddf94dd512b081ff69fc3a0c1
Open http://localhost:3000/login.
Type "demo" into the "E-mail or username" field and "demo" into the "Password" field, then click the "Log in" button.
Wait for the page to finish loading.
Verify the URL does not contain "/login" and a "Create project" button is shown.

## Create a project with a board ✓ passed (138s)
md5: 386374af37a9073b81b5d82e1e42fa61
Click the first "Create project" button, type "Release Planning" into the "Title" field and click the "Create project" button in the dialog.
Wait for the project page to load, click the "Create board" button, type "Backlog" into the "Title" field and click the "Create board" button in the dialog.
Wait for the board to open. If a board settings dialog opens, press Escape to close it.
Verify the URL contains "/boards/" and an "Add list" button is shown.

## Add a list ✓ passed (49.2s)
md5: 99764e291e50b67b85fb0ca562af5cb8
Click the "Add list" button, type "To Do" into the "Enter list title..." field and press Enter, then press Escape.
Verify a list titled "To Do" is shown with an "Add card" button.

## Add a card to the list ✓ passed (51.2s)
md5: f333cf4609f2d5aae7d4181510d0579b
Click the "Add card" button in the "To Do" list, type "Write release notes" into the "Enter card title..." field and press Enter, then press Escape.
Verify a card titled "Write release notes" is shown in the "To Do" list.

## Open the card ✓ passed (40.6s)
md5: bd756e8b6f5f312dc2ffbe3bb180224f
Click the "Write release notes" card.
Wait for the card details to open.
Verify the URL contains "/cards/" and the card details show the title "Write release notes" and a "Description" section.
