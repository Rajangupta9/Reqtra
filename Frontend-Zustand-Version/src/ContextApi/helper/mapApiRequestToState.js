import { initialState } from "./initialState";

export const mapApiRequestToState = (apiRequest, state = initialState) => {
  // Detect if it's your own format (already app-shaped)
  const isAppFormat = typeof apiRequest.url === "string" && apiRequest.authType;

  if (isAppFormat) {
    return {
      ...state,
      ...apiRequest, // merge everything directly
      params: apiRequest.params || [],
      headers: apiRequest.headers || [],
      formData: apiRequest.formData || [],
      urlEncodedData: apiRequest.urlEncodedData || [],
      authData: apiRequest.authData || state.authData,
      settings: apiRequest.settings || state.settings,
    };
  }

  // Otherwise treat it as Postman request
  return {
    ...state,
    name: apiRequest.name || "",
    description: apiRequest.description || "",
    method: apiRequest.method || "GET",
    url: apiRequest.url?.raw || "",
    params: (apiRequest.url?.query || []).map(q => ({
      key: q.key || "",
      value: q.value || "",
      description: q.description || "",
      enabled: true
    })),
    headers: (apiRequest.header || []).map(h => ({
      key: h.key || "",
      value: h.value || "",
      description: h.description || "",
      enabled: true
    })),
    authType: apiRequest.auth?.type
      ? apiRequest.auth.type === "bearer"
        ? "Bearer Token"
        : apiRequest.auth.type === "apikey"
          ? "API Key"
          : apiRequest.auth.type === "basic"
            ? "Basic Auth"
            : "No Auth"
      : "No Auth",
    authData: {
      apiKey: {
        key: apiRequest.auth?.apikey?.[0]?.key || "",
        value: apiRequest.auth?.apikey?.[0]?.value || "",
        addTo: apiRequest.auth?.apikey?.[0]?.in || "header"
      },
      bearerToken: apiRequest.auth?.bearer?.[0]?.value || "",
      basicAuth: {
        username: apiRequest.auth?.basic?.[0]?.username || "",
        password: apiRequest.auth?.basic?.[0]?.password || ""
      }
    },
    bodyType: apiRequest.body?.mode || "raw",
    rawBody: apiRequest.body?.raw || "{}",
    formData: apiRequest.body?.formdata?.map(f => ({
      key: f.key || "",
      value: f.value || "",
      type: f.type || "text",
      enabled: true,
      file: f.type === "file" ? f.src || null : null,
      filename: f.type === "file" ? f.filename || null : null
    })) || [],
    urlEncodedData: apiRequest.body?.urlencoded?.map(u => ({
      key: u.key || "",
      value: u.value || "",
      description: u.description || "",
      enabled: true
    })) || []
  };
};
