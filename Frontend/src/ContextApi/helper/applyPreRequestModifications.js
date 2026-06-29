function applyPreRequestModifications(originalPayload, preResult) {
  const updated = { ...originalPayload };

  // 1️⃣ Update URL and Method
  if (preResult?.url) updated.url = preResult.url;
  if (preResult?.method) updated.method = preResult.method;

  // 2️⃣ Merge headers (convert array <-> object)
  const headerMap = {};
  if (Array.isArray(originalPayload.header)) {
    for (const h of originalPayload.header) headerMap[h.key] = h.value;
  }

  if (preResult?.headers) {
    for (const [key, value] of Object.entries(preResult.headers)) {
      headerMap[key] = value;
    }
  }

  // Convert back to array format expected by your request system
  updated.header = Object.entries(headerMap).map(([key, value]) => ({
    key,
    value,
  }));

  // 3️⃣ Update body
  if (preResult?.body !== undefined && preResult?.body !== null) {
    updated.body = {
      mode: "raw",
      raw: preResult.body,
    };
  }

  return updated;
}

export default applyPreRequestModifications;