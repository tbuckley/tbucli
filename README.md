# tbucli

A Gemini CLI extension with commands and skills I find helpful.

It also adds notifications when Gemini requests permission or completes a task.

## Installation

```bash
gemini extensions install https://github.com/tbuckley/tbucli
```

To update the extension:

```bash
gemini extensions update tbucli
```

## Setup

The following environment variables are required for some skills:

- `GEMINI_API_KEY`: Required for `nanobanana` and `deep-research` skills.
- To use the `google-drive` and `google-docs` skills, `gcloud` must be installed and authenticated. See additional notes below if using a sandbox.

> **Note:** If you are running in a sandbox, you should allowlist the `export`, `gcloud`, and `node` commands to run the scripts.

## Commands

### `/dev` - Development Workflow

These commands help manage the lifecycle of a feature, from PRD to implementation.

- `/dev:init` - Run once to initialize your project, creating a `./docs` folder and `./docs/CHECKS.md` file
- `/dev:prd <feature>` - Create a new folder for your feature in `./docs`, then research and write a PRD for it.
- `/dev:tickets` - Generate a set of implementation tickets based on the PRD.
- `/dev:implement` - Step through and implement the tickets for a feature.
- `/dev:append <description>` - Append to the PRD/tickets with a new request.
- `/dev:bug <description>` - Research and fix a bug with a reproducible case.
- `/dev:check` - Run project checks and address any errors.
- `/dev:critique` - Review the current changes and suggest improvements based on best practices.
- `/dev:summarize` - Summarize the current changes between this branch and `main`.

## Skills

- **nanobanana** - Generate and edit images using Google's latest Gemini image models. Supports text-to-image and image-to-image variations.
- **deep-research** - Perform in-depth research tasks using the Gemini Deep Research API.
- **skill-creator** - Helper for creating new Gemini CLI skills.
- **google-drive** - Download and sync files from Google Drive.
- **google-docs** - Read, create, and edit Google Docs and comments. Supports granular editing via API requests.
- **ralph-loop** - Trigger a ralph loop when requested. Creates a `.gemini/ralph/state.json` file to track the loop. If experiencing issues, request to cancel the loop or delete this file to exit.

### Google Cloud Skills Sandbox Setup (Drive & Docs)

These skills require access to `~/.config/gcloud` to get your access token. You should include this directory when starting Gemini:

```bash
gemini --includeDirectories ~/.config/gcloud
```

_Note: Due to a potential bug in Gemini CLI's usage of the macOS Seatbelt sandbox, this might not be sufficient. You may need a custom sandbox configuration:_

1. Create `~/.gemini/sandbox-macos-gdrive.sb` (based on Gemini CLI's `permissive-open.sb`) and ensure it allows reading/writing `~/.config/gcloud`.
2. Run with: `SEATBELT_SANDBOX=gdrive gemini --sandbox`
