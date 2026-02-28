---
name: ralph-loop
description: Use when the user explicitly mentions "ralph-loop".
---

# Ralph Loop

The Ralph Loop is a process for developing features iteratively using an AI agent. Users may ask you to start the loop or to stop it. Follow the instructions below accordingly. If unclear from the request whether the user wants to start or stop the loop, clarify first.

## Starting the Ralph Loop

**Step 1: Initialization**
Run the setup script to initialize the loop state:

```bash
bash "/path/to/skills/ralph-loop/scripts/setup.sh" $ARGUMENTS
```

You should then immediately stop working so that the loop can begin.

**Supported Arguments for setup.sh:**

- `--max-iterations <N>`: Maximum number of loop iterations.
- `--completion-promise <TEXT>`: A text token that must be output to finish.
- `<PROMPT>` (REQUIRED): The prompt the user wants to use for the ralph loop.

**CRITICAL**: Pass the user's arguments **VERBATIM** to the script. Do not rename, reorder, or infer flags. If the user provides `--max-time`, pass `--max-time`.

**Step 2: Execution (Management)**
You are now in a **persistent, self-correcting loop**. You'll see your previous work in files, creating a self-referential loop where you iteratively improve on the same task. When you complete this turn, the **exact same prompt** (above) will be fed back to you automatically.

## Stopping the Ralph Loop

Run the cancel script to deactivate the stop hook and clean up state:

```bash
bash "/path/to/skills/ralph-loop/scripts/cancel.sh"
```
