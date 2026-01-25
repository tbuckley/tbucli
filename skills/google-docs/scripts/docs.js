const https = require('https');
const url = require('url');

function makeRequest(method, requestUrl, headers, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(responseBody);
            resolve(json);
          } catch (e) {
            resolve(responseBody);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(body);
    }
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
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    if (command === 'read') {
      const docId = args[1];
      if (!docId) {
        console.error("Usage: node docs.js read <docId>");
        process.exit(1);
      }
      const requestUrl = `https://docs.googleapis.com/v1/documents/${docId}`;
      const data = await makeRequest('GET', requestUrl, headers);
      console.log(JSON.stringify(data, null, 2));

    } else if (command === 'create') {
      const title = args[1] || 'Untitled Document';
      const requestUrl = `https://docs.googleapis.com/v1/documents`;
      const body = JSON.stringify({ title: title });
      const data = await makeRequest('POST', requestUrl, headers, body);
      console.log(JSON.stringify(data, null, 2));

    } else if (command === 'edit') {
      const docId = args[1];
      const requestsJson = args[2];
      
      if (!docId || !requestsJson) {
        console.error("Usage: node docs.js edit <docId> <requests_json_string>");
        process.exit(1);
      }

      let requests;
      try {
        requests = JSON.parse(requestsJson);
        // If the user passed just the array, wrap it in the object expected by the API
        if (Array.isArray(requests)) {
            // It's just a list of requests, perfect.
        } else if (requests.requests && Array.isArray(requests.requests)) {
            requests = requests.requests;
        } else {
            // Assume it's a single request object if not an array
            requests = [requests];
        }
      } catch (e) {
        console.error("Error parsing requests JSON:", e.message);
        process.exit(1);
      }

      const requestUrl = `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`;
      const body = JSON.stringify({ requests: requests });
      const data = await makeRequest('POST', requestUrl, headers, body);
      console.log(JSON.stringify(data, null, 2));

    } else if (command === 'comments') {
      const docId = args[1];
      if (!docId) {
        console.error("Usage: node docs.js comments <docId>");
        process.exit(1);
      }
      // Comments are part of Drive API
      const requestUrl = `https://www.googleapis.com/drive/v3/files/${docId}/comments?fields=*`;
      const data = await makeRequest('GET', requestUrl, headers);
      console.log(JSON.stringify(data, null, 2));

    } else {
      console.error("Unknown command. Use 'read', 'create', 'edit', or 'comments'.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
