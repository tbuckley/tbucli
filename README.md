# tbucli

A Gemini CLI extension with commands and skills I find helpful.

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
- To use the `google-drive` skill, `gcloud` must be installed and authenticated. See additional notes below if using a sandbox.

## Commands

### `/dev` - Development Workflow

These commands help manage the lifecycle of a feature, from PRD to implementation.

- `/dev:prd <feature>` - Research and write a PRD for a new feature.
- `/dev:tickets <feature>` - Generate a set of implementation tickets based on a PRD.
- `/dev:implement <feature>` - Step through and implement the tickets for a feature.
- `/dev:bug <description>` - Research and fix a bug with a reproducible case.
- `/dev:critique` - Review the current changes and suggest improvements based on best practices.

## Skills

- **nanobanana** - Generate and edit images using Google's latest Gemini image models. Supports text-to-image and image-to-image variations.
- **deep-research** - Perform in-depth research tasks using the Gemini Deep Research API.
- **skill-creator** - Helper for creating new Gemini CLI skills.
- **google-drive** - Download and sync files from Google Drive.

### Google Drive Sandbox Setup

The skill requires access to `~/.config/gcloud` to get your access token. You should include this directory when starting Gemini:

```bash
gemini --includeDirectories ~/.config/gcloud
```

_Note: Due to a potential bug in Gemini CLI's usage of the macOS Seatbelt sandbox, this might not be sufficient. You may need a custom sandbox configuration:_

1. Create `~/.gemini/sandbox-macos-gdrive.sb` (based on Gemini CLI's `permissive-open.sb`) and ensure it allows reading/writing `~/.config/gcloud`.
2. Run with: `SEATBELT_SANDBOX=gdrive gemini --sandbox`
