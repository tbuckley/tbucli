---
name: google-docs
description: Read, create, and edit Google Docs and comments. Supports granular editing via API requests.
---

# Google Docs Skill

This skill allows you to interact with Google Docs to read content, create new documents, make granular edits, and manage comments.

## Prerequisites

1.  **Authentication**: The script requires a valid Google Cloud Access Token.
    - You can obtain one using the `gcloud` CLI: `gcloud auth print-access-token`.
    - Pass this token to the script via the `GCLOUD_ACCESS_TOKEN` environment variable.

## Capabilities

### 1. Read a Document

Retrieves the full JSON representation of a Google Doc, including body content, styles, and lists.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js read <DOC_ID>
```

### 2. Create a Document

Creates a new blank Google Doc with the specified title.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js create "<TITLE>"
```

### 3. Edit a Document (Granular Edits)

Performs batch updates on a document. You can insert text, delete text, apply styles, etc.
You must provide a valid JSON string representing the `requests` array for the `documents.batchUpdate` method.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js edit <DOC_ID> '<JSON_REQUESTS>'
```

**Example JSON Request (Insert Text):**
```json
[
  {
    "insertText": {
      "text": "Hello World",
      "location": {
        "index": 1
      }
    }
  }
]
```

**Note:** The JSON argument can be a single request object or an array of request objects.

**Important:** When using `insertText`, the `index` must be **strictly less than** the segment's end index. For example, if a paragraph ends at index 16, the maximum valid insertion index is 15. Attempting to insert at the end index (16) will result in an error.

### 4. Append to Document

To safely append text to the end of the document without calculating indices, use `endOfSegmentLocation`.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js edit <DOC_ID> '<JSON_REQUESTS>'
```

**Example JSON Request (Append):**
```json
[
  {
    "insertText": {
      "text": "\nAppended text.",
      "endOfSegmentLocation": {
        "segmentId": ""
      }
    }
  }
]
```
*   `segmentId`: Use `""` (empty string) for the main body.

### 5. Read Comments

Retrieves the list of comments for a specific document (or any Drive file).

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js comments <DOC_ID>
```

### 6. Create a Comment

Creates a new comment on a document.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js create_comment <DOC_ID> "<CONTENT>" [ANCHOR_JSON]
```

*   `ANCHOR_JSON`: Optional. A JSON string specifying the region of the document to comment on.

### 7. Reply to a Comment

Replies to an existing comment.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js reply_comment <DOC_ID> <COMMENT_ID> "<CONTENT>"
```

### 8. Resolve a Comment

Resolves a comment.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-docs/scripts/docs.js resolve_comment <DOC_ID> <COMMENT_ID>
```

## Example Workflow

User: "Read the doc with ID 12345"
Model:
1.  Run: `export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token) && node skills/google-docs/scripts/docs.js read 12345`

User: "Add 'Summary' to the beginning of doc 12345"
Model:
1.  Construct JSON: `[{"insertText": {"text": "Summary\n", "location": {"index": 1}}}]`
2.  Run: `export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token) && node skills/google-docs/scripts/docs.js edit 12345 '[{"insertText": {"text": "Summary\n", "location": {"index": 1}}}]'`
