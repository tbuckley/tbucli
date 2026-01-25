---
name: google-drive
description: Download and sync files from Google Drive. Supports automatic format conversion for Docs, Sheets, and Slides.
---

# Google Drive Skill

This skill allows you to interact with Google Drive to download and update files using direct REST API calls.

## Prerequisites

1.  **Authentication**: The script requires a valid Google Cloud Access Token.
    - You can obtain one using the `gcloud` CLI: `gcloud auth print-access-token`.
    - Pass this token to the script via the `GCLOUD_ACCESS_TOKEN` environment variable.

## Capabilities

### 1. Download a File

Downloads a file from Google Drive.
- **Docs** are converted to Markdown (text/plain) or DOCX.
- **Sheets** are converted to CSV.
- **Slides** are converted to PDF.
- **Binary files** (images, PDFs) are downloaded as-is.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-drive/scripts/drive.js download <FILE_ID> [OPTIONAL_FORMAT]
```
*   `FILE_ID`: The ID of the file in Google Drive.
*   `OPTIONAL_FORMAT`: (Optional) Mime type to export to (e.g., `text/csv`, `application/pdf`).

**Output:**
The file will be saved as `Sanitized_Name.FILE_ID.ext`.

### 2. Refresh a File

Updates a local file with the latest version from Drive. It extracts the File ID from the filename.

**Usage:**
```bash
export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
node skills/google-drive/scripts/drive.js refresh <LOCAL_FILENAME>
```
*   `LOCAL_FILENAME`: The path to the local file (must follow the `Name.ID.ext` pattern).

## Example Workflow

User: "Download the file 1234abcd"
Model:
1.  Run: `export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token) && node skills/google-drive/scripts/drive.js download 1234abcd`

User: "Refresh Project_Plan.1234abcd.md"
Model:
1.  Run: `export GCLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token) && node skills/google-drive/scripts/drive.js refresh Project_Plan.1234abcd.md`