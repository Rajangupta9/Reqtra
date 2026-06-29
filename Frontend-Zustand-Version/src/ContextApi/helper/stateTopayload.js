export const mapStateToApiRequest = (state) => {
  // build query params
  const query = state.params
    .filter(p => p.key && p.enabled)
    .map(p => ({
      key: p.key,
      value: p.value,
      description: p.description || ""
    }));

  // ✅ build headers
  const header = state.headers
    .filter(h => h.key && h.enabled)
    .map(h => ({
      key: h.key,
      value: h.value,
      description: h.description || ""
    }));

  // base url object
  let urlObj = {
    raw: state.url,
    protocol: "",
    host: [],
    path: [],
    query
  };

  try {
    // Works if state.url is a valid URL
    const parsed = new URL(state.url);

    urlObj.protocol = parsed.protocol.replace(":", "");
    urlObj.host = parsed.hostname.split(".");
    urlObj.path = parsed.pathname.split("/").filter(Boolean);

    if (query.length === 0 && parsed.searchParams) {
      urlObj.query = Array.from(parsed.searchParams.entries()).map(([key, value]) => ({
        key,
        value
      }));
    }
  } catch (e) {
    // ⚡ Fallback for variable-based URLs like {{baseURL}}/filemanager/getAsset
    const raw = state.url;

    // split by "/" → first part is host (could be {{baseURL}}), rest is path
    const parts = raw.split("/").filter(Boolean);

    if (parts.length > 0) {
      urlObj.host = [parts[0]]; // keep whole first part as host
      urlObj.path = parts.slice(1); // remaining parts are path
    }
  }

  // build auth
  let auth = {};
  switch (state.authType) {
    case "Bearer Token":
      auth = {
        type: "bearer",
        bearer: [
          { key: "token", value: state.authData.bearerToken, type: "string" }
        ]
      };
      break;
    case "API Key":
      auth = {
        type: "apikey",
        apikey: [
          {
            key: state.authData.apiKey.key || "api_key",
            value: state.authData.apiKey.value,
            type: "string",
            in: state.authData.apiKey.addTo || "header"
          }
        ]
      };
      break;
    case "Basic Auth":
      auth = {
        type: "basic",
        basic: [
          {
            username: state.authData.basicAuth.username,
            password: state.authData.basicAuth.password
          }
        ]
      };
      break;
    default:
      auth = {};
  }

  // build body
  let body = {};
  if (state.bodyType === "raw") {
    body = { mode: "raw", raw: state.rawBody };
  } else if (state.bodyType === "formdata") {
    body = {
      mode: "formdata",
      formdata: state.formData.map(f => ({
        key: f.key,
        value: f.value,
        type: f.type,
        enabled: f.enabled,
        filename: f.filename,
        src: f.type === "file" ? f.file : undefined
      }))
    };
  } else if (state.bodyType === "urlencoded") {
    body = {
      mode: "urlencoded",
      urlencoded: state.urlEncodedData.map(u => ({
        key: u.key,
        value: u.value,
        description: u.description || "",
        enabled: u.enabled
      }))
    };
  }

  return {
    name: state.name,
    description: state.description,
    method: state.method,
    url: urlObj,
    header,
    auth,
    body
  };
};
