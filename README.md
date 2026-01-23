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
