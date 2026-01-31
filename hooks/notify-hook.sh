#!/bin/bash

# 1. Read Standard Input (stdin) into a variable
input=$(cat)

# Use first arg as the title, or default to 'Gemini CLI'
title=${1:-'Gemini CLI'}

# 2. Parse the JSON using Python 3
# We use Python to extract the message and sanitize quotes 
# so they don't break the AppleScript command.
message=$(echo "$input" | python3 -c "
import sys, json

fallback = 'See Gemini CLI'

try:
    data = json.load(sys.stdin)
    msg = data.get('message')
    
    if msg and isinstance(msg, str) and msg.strip():
        # Replace double quotes with single quotes to prevent AppleScript syntax errors
        print(msg.replace('\"', '\''))
    else:
        print(fallback)

except Exception:
    print(fallback)
")

# 3. Send the Notification via AppleScript
# We use 'Gemini CLI' as the title to match your fallback context.
osascript -e "display notification \"$message\" with title \"$title\" sound name \"Ping\""