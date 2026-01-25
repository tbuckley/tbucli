const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

// Mime Type mappings for Google Workspace files
const EXPORT_MIME_MAP = {
  'application/vnd.google-apps.document': {
    default: 'text/markdown', 
    map: {
      'text/markdown': 'text/plain', 
      'application/pdf': 'application/pdf',
      'text/plain': 'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf': 'application/rtf',
      'text/html': 'text/html'
    }
  },
  'application/vnd.google-apps.spreadsheet': {
    default: 'text/csv',
    map: {
      'text/csv': 'text/csv',
      'application/pdf': 'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  },
  'application/vnd.google-apps.presentation': {
    default: 'application/pdf',
    map: {
      'application/pdf': 'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain': 'text/plain'
    }
  }
};

const EXTENSION_MAP = {
  'text/markdown': '.md',
  'text/plain': '.txt',
  'application/pdf': '.pdf',
  'text/csv': '.csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/html': '.html',
  'application/zip': '.zip',
  'application/rtf': '.rtf'
};

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

function makeRequest(method, requestUrl, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle Redirects (Simple implementation)
        resolve(makeRequest(method, res.headers.location, headers));
        return;
      }

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (e) {
            // If response isn't JSON, return raw body
            resolve(body);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

function downloadStream(requestUrl, headers, destinationPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: headers
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
         // Follow redirect
         downloadStream(res.headers.location, headers, destinationPath)
           .then(resolve)
           .catch(reject);
         return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Download failed with status code ${res.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destinationPath);
      res.pipe(file);

      file.on('finish', () => {
        file.close(() => resolve());
      });

      file.on('error', (err) => {
        fs.unlink(destinationPath, () => reject(err)); // Delete file on error
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const token = process.env.GCLOUD_ACCESS_TOKEN;
  
  if (!token) {
    console.error("Error: GCLOUD_ACCESS_TOKEN environment variable is required.");
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  if (command === 'download') {
    const fileId = args[1];
    let requestedFormat = args[2];

    if (!fileId) {
      console.error("Usage: node drive.js download <fileId> [format]");
      process.exit(1);
    }

    await downloadFile(fileId, requestedFormat, null, headers);

  } else if (command === 'refresh') {
    const filePath = args[1];
    if (!filePath) {
      console.error("Usage: node drive.js refresh <filePath>");
      process.exit(1);
    }
    
    const basename = path.basename(filePath);
    const parts = basename.split('.');
    if (parts.length < 3) {
      console.error("Error: Filename does not match the expected format 'Name.ID.ext'. Cannot refresh.");
      process.exit(1);
    }

    const ext = '.' + parts.pop();
    const id = parts.pop();
    
    console.log(`Refreshing file with ID: ${id}`);
    await downloadFile(id, null, filePath, headers);

  } else {
    console.error("Unknown command. Use 'download' or 'refresh'.");
    process.exit(1);
  }
}

async function downloadFile(fileId, requestedFormat, targetPathOverride, headers) {
  try {
    // 1. Get Metadata
    const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`;
    const meta = await makeRequest('GET', metaUrl, headers);
    
    const { name, mimeType } = meta;
    let downloadUrl;
    let extension = '';
    let exportMimeType = null;

    // 2. Determine download URL
    if (EXPORT_MIME_MAP[mimeType]) {
      const mapping = EXPORT_MIME_MAP[mimeType];
      let targetFormat = requestedFormat || mapping.default;
      
      exportMimeType = mapping.map[targetFormat];
      if (!exportMimeType) {
        console.warn(`Format '${targetFormat}' not supported for this file type. Falling back to default.`);
        targetFormat = mapping.default;
        exportMimeType = mapping.map[targetFormat];
      }

      extension = EXTENSION_MAP[targetFormat] || '';
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
      
      if (targetFormat === 'text/markdown') {
          console.log("Note: Exporting Google Doc as text/plain to simulate Markdown.");
      }

    } else {
      // Binary file
      extension = EXTENSION_MAP[mimeType] || path.extname(name) || '';
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }

    // 3. Construct Filename
    let finalPath;
    if (targetPathOverride) {
      finalPath = targetPathOverride;
    } else {
      const sanitized = sanitizeFilename(name);
      finalPath = `${sanitized}.${fileId}${extension}`;
    }

    console.log(`Downloading '${name}' (${fileId}) to '${finalPath}'...`);

    // 4. Download
    await downloadStream(downloadUrl, headers, finalPath);
    console.log("Download complete.");

  } catch (error) {
    console.error("Error downloading file:", error.message);
    process.exit(1);
  }
}

main();