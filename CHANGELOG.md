## [Unreleased]

### Added

* Add `db:clean-orphaned-records` script to report and remove reference rows left behind by an incomplete delete

### Fixed

* Fix a blank home view when a project manager or board membership points at a project that no longer exists
* Fix endless list pagination returning an error for cursors Postgres cannot read as a timestamp
* Fix endless list pagination skipping and repeating cards when a search, member or label filter is active

## [2.2.1] - 2026-08-10

### Fixed

* Fix path traversal in the static file routes that allowed authenticated users to read arbitrary files from the server

## [2.2.0] - 2026-08-09

### ⚠️ Breaking changes

* OIDC/SSO has been removed and is now part of PLANKA Pro
* **All SSO-based users have been deactivated**, since they no longer have a password login — an admin can set a password for each of them and reactivate them
* Node.js 24 is now required for source and manual installations (Docker users are unaffected)

### Added

* Add two-factor authentication via TOTP, with recovery codes and admin reset
* Add configurable auto logout on inactivity, with a warning before sign-out
* Add trusted devices to skip two-factor authentication for a set period

### Changed

* Replace user edit popups in administration with a single modal
* Update dependencies and align CI with Node 24

### Removed

* Remove OIDC and SSO support (moved to PLANKA Pro)
* Remove armv7 Docker image builds

## [2.1.1] - 2026-04-18

### Added

* Allow admins to edit user avatars
* Add Pro features discovery banner

### Changed

* Remove global npm installation from Dockerfiles

### Fixed

* Fix Unicode and emoji characters in user avatar initials
* Fix S3 request checksum calculation
* Limit proxy file descriptors to prevent excessive memory allocation
* Improve security by fixing multiple dependency vulnerabilities

## [2.1.0] - 2026-03-19

### Added

* Support running under subpath
* Add ability to display card ages
* Allow exposing Swagger specification
* Configurable HTTP timeout for OIDC

## [2.0.3] - 2026-03-01

### Fixed

* Improve security by ensuring the outgoing proxy is not accessible from outside

## [2.0.2] - 2026-02-23

### Fixed

* Prevent dropzone from overflowing content
* Update Gravatar hash algorithm
* Improve backup and restore scripts
* Improve installation on Windows and containerized environments

## [2.0.1] - 2026-02-17

### Fixed

* Improve connection reliability after the app is idle
* Allow loading custom End User Terms of Service

## [2.0.0] - 2026-02-11

### Added

* Mention users in comments
* Add download button for file attachments
* Enable strikethrough for cards in closed lists
* Expand card descriptions
* Enable copy-to-clipboard for custom fields
* Include task assignees in member filters
* Link tasks to cards
* Open card actions menu on right-click
* Hide completed tasks
* Add dedicated button to make projects private
* Track navigation paths when switching cards
* Support OAuth callbacks for OIDC
* Display legal requirements in the app
* Track storage usage
* Move lists between boards
* Restore toggleable due dates
* Add Gravatar support for avatars
* Add board setting to expand task lists by default
* Configure and test SMTP via UI
* Add API key authentication
* Add create-board button on the open-board screen
* Support object-path mapping for OIDC attributes
* Add basic keyboard shortcuts for cards
* Enable copy/cut cards with keyboard shortcuts
* Enhance card actions menu with separators and action bar
* Display last updates in the About modal
* Allow unlinking SSO from user accounts
* Apply color to entire lists instead of only card bottoms

### Changed

* Move webhooks configuration to UI
* Parse dates as UTC without relying on TZ environment variable
* Move About and Terms into a separate modal
* Move infrequent card actions to a more-actions menu
* Improve error page display
* Enable favorites panel by default
* Improve login page appearance
* Enhance Markdown editor (colors, quote borders, disable fuzzy links)
* Improve PDF viewer compatibility across browsers
* Update background color for own comments
* Improve browser caching for public files and attachments
* Optimize and parallelize image processing tasks
* Re-stream static files from S3 with protected access
* Unify file storage directory
* Configure proxy for outgoing traffic to prevent SSRF

### Fixed

* Prevent editors from deleting other comments
* Handle escape actions in mentions input correctly
* Prevent text overflow in activities
* Prevent deactivated users from receiving notifications
* Preserve newlines in markdown with mentions
* Fix app crash when boards are added before their projects
* Enable spellcheck on all textareas
* Fix multiple UI, toolbar, and popup styling issues
* Limit attachment gallery content to prevent layout issues
* Correct translations for client, server, and Markdown editor
* Fix minor UI issues

---

## [2.0.0-rc.4] - 2025-09-04

### Fixed

* Prevent vulnerability where maliciously renamed file attachments could execute JavaScript in the gallery UI

---

## [2.0.0-rc.3] - 2025-05-28

### Added

* Notify users when they are added to a card
* Emphasize cards in colored and closed lists
* Track board activity log changes
* Display total number of comments on cards
* Add CSV attachment viewer
* Log actions when a user is removed from a card
* Log actions when task completion status changes
* Support Docker secrets

### Changed

* Improve notifications popup appearance
* Improve card content rendering and styling
* Limit attachment content display for clarity
* Increase maximum length of OIDC code challenge

### Fixed

* Fix disabled cards display
* Correct translations for client, server, and Markdown editor
* Fix minor UI issues

---

## [2.0.0-rc.2] - 2025-05-10

### Added

* Add global user roles and improve user management
* Enable user deactivation
* Support private and shared projects
* Search projects by name and project groups
* Add favorite projects with favorites panel
* Add project descriptions and background image gallery
* Add list types: Closed, Archive, Trash
* Add board views: List and Grid
* Add new Markdown editor
* Link attachments (attach URLs)
* Enable quick filter by current user
* Add board settings modal
* Subscribe to entire boards
* Assign users to tasks
* Support multiple task lists
* Add more label colors
* Always display card creator option
* Show notification badge for board tabs
* Display message about new version availability

### Changed

* Restrict access to users based on global roles
* Limit email visibility
* Make projects page responsive
* Redesign card appearance
* Show edit buttons only when needed
* Use time-ago format for dates
* Highlight recent cards
* Improve attachment viewers and syntax highlighting
* Restyle comments
* Restyle login page
* Enable user auto-subscription when commenting
* Navigate to adjacent cards using arrow keys
* Open same-site links in current tab
* Improve card deletion workflow
* Archive all cards in a closed list with one button
* Confirm deletion actions
* Close only active elements when clicking outside

### Fixed

* Prevent deleting the last project manager
* Prevent deleting projects with existing boards
