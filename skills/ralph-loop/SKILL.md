---
name: ralph-loop
description: Use when the user explicitly mentions "ralph-loop".
---

# Ralph Loop

The Ralph Loop is a process for developing features iteratively using an AI agent. Users may ask you to start the loop or to stop it. Follow the instructions below accordingly. If unclear from the request whether the user wants to start or stop the loop, clarify.

## Starting the Ralph Loop

**Step 1: Initialization**
Run the setup script to initialize the loop state:

```bash
bash "/path/to/skills/ralph-loop/scripts/setup.sh" $ARGUMENTS
```

**Supported Arguments for setup.sh:**

- `--max-iterations <N>`: Maximum number of loop iterations.
- `--completion-promise <TEXT>`: A text token that must be output to finish.
- `<PROMPT>` (REQUIRED): The prompt the user wants to use for the ralph loop.

**CRITICAL**: Pass the user's arguments **VERBATIM** to the script. Do not rename, reorder, or infer flags. If the user provides `--max-time`, pass `--max-time`.

**Step 2: Execution (Management)**
You are now in a **persistent, self-correcting development loop**. You'll see your previous work in files, creating a
self-referential loop where you iteratively improve on the same task. When you complete this turn, the **exact same prompt** (above) will be fed back to you automatically.

**Loop Constraints:**

- **Iteration Count**: Monitor `"current_iteration"` in `.gemini/ralph/state.json`. If `"max_iterations"` (if > 0) is reached, you must stop. **DO NOT** increment this count yourself; the Ralph loop mechanism handles this automatically after each turn.
- **Completion Promise**: If a `"completion_promise"` is defined in `.gemini/ralph/state.json`, you must output `<promise>PROMISE_TEXT</promise>` when the task is genuinely complete.
- **Stop Hook**: A hook is active. If you try to exit before completion, you will be forced to continue.

## Stopping the Ralph Loop

Run the cancel script to deactivate the stop hook and clean up state:

```bash
bash "/path/to/skills/ralph-loop/scripts/cancel.sh"
```
