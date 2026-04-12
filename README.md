<div align="center">

  ![Logo](https://raw.githubusercontent.com/plankanban/planka/master/assets/logo.png)

  # PLANKA (Suveris Fork)

  _A fork of [PLANKA](https://github.com/plankanban/planka) with Trello-style keyboard shortcuts_

  ![Demo](https://raw.githubusercontent.com/plankanban/planka/master/assets/demo.gif)

</div>

> **This is a fork maintained by [Suveris IT](https://github.com/Suveris-IT).** The upstream project lives at [plankanban/planka](https://github.com/plankanban/planka). We track upstream and add keyboard-centric workflow enhancements on top.

## What This Fork Adds

### Trello-Style Keyboard Shortcuts

Planka ships with a handful of shortcuts. This fork extends them to match the keyboard-driven workflow Trello users expect:

| Key | Action |
|-----|--------|
| **N** | Add a new card to the hovered list |
| **D** | Edit due date on hovered card |
| **Space** | Assign/unassign yourself to hovered card |
| **Q** | Toggle "My Cards" filter |
| **S** | Open move card dialog |
| **?** | Show keyboard shortcuts help overlay |

These are in addition to the shortcuts already in upstream Planka (E/Enter to open, T to edit title, L for labels, M for members, V to archive, 1-9/0 for labels, Ctrl+C/X/V clipboard).

## Key Features

- **Collaborative Kanban Boards:** Create projects, boards, lists, cards, and manage tasks with an intuitive drag-and-drop interface
- **Real-Time Updates:** Instant syncing across all users, no refresh needed
- **Rich Markdown Support:** Write beautifully formatted card descriptions with a powerful markdown editor
- **Flexible Notifications:** Get alerts through 100+ providers, fully customizable to your workflow
- **Seamless Authentication:** Single sign-on with OpenID Connect integration
- **Multilingual & Easy to Translate:** Full internationalization support for a global audience

## How to Deploy

PLANKA is easy to install using multiple methods - learn more in the [installation guide](https://docs.planka.cloud/docs/welcome/).

For configuration and environment settings, see the [configuration section](https://docs.planka.cloud/docs/category/configuration/).

Interested in a hosted or [Pro version](https://planka.app/pro) of PLANKA? Check out the pricing on our [website](https://planka.app/pricing).

## Notes App

A testing version of the Notes app is now available on multiple platforms:

- **iOS:** Join the [TestFlight](https://testflight.apple.com/join/5eJqTaJW) to try the app
- **Windows & Android:** Download the app [here](https://planka-notes.hillerdaniel.de)

## Contact

For any security issues, please do not create a public issue on GitHub - instead, report it privately by emailing [security@planka.group](mailto:security@planka.group).

**Note:** We do NOT offer any public support via email, please use GitHub.

**Join our community:** Get help, share ideas, or contribute on our [Discord server](https://discord.gg/WqqYNd7Jvt).

## License

PLANKA is [fair-code](https://faircode.io) distributed under the [Fair Use License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Community%20License%20EN.md) and [PLANKA Pro/Enterprise License](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20Commercial%20License%20EN.md).

- **Source Available:** The source code is always visible
- **Self-Hostable:** Deploy and host it anywhere
- **Extensible:** Customize with your own functionality
- **Enterprise Licenses:** Available for additional features and support

For more details, check the [License Guide](https://github.com/plankanban/planka/blob/master/LICENSES/PLANKA%20License%20Guide%20EN.md).

## Syncing with Upstream

To pull in new changes from the original Planka repository:

```bash
git fetch upstream
git merge upstream/master
```

## Contributing

For issues specific to the keyboard shortcuts or this fork, please open an issue on [Suveris-IT/planka](https://github.com/Suveris-IT/planka/issues).

For general Planka bugs or features, contribute to the [upstream project](https://github.com/plankanban/planka). See their [Contributing Guide](https://github.com/plankanban/planka/blob/master/CONTRIBUTING.md) and [development docs](https://docs.planka.cloud/docs/category/development/).
