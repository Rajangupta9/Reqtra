



// export const mapApiRequestToState = (apiRequest, state) => ({
//     ...state,
//     name: apiRequest.name || "",
//     description: apiRequest.description || "",
//     method: apiRequest.method || "GET",
//     url: apiRequest.url?.raw || "",
//     params: (apiRequest.url?.query || []).map(q => ({
//         key: q.key || "",
//         value: q.value || "",
//         description: q.description || "",
//         enabled: true
//     })),
//     headers: (apiRequest.header || []).map(h => ({
//         key: h.key || "",
//         value: h.value || "",
//         description: h.description || "",
//         enabled: true
//     })),
//     authType: apiRequest.auth?.type
//         ? apiRequest.auth.type === "bearer"
//             ? "Bearer Token"
//             : apiRequest.auth.type === "apikey"
//                 ? "API Key"
//                 : apiRequest.auth.type === "basic"
//                     ? "Basic Auth"
//                     : "No Auth"
//         : "No Auth",
//     authData: {
//         apiKey: {
//             key: apiRequest.auth?.apikey?.[0]?.key || "",
//             value: apiRequest.auth?.apikey?.[0]?.value || "",
//             addTo: apiRequest.auth?.apikey?.[0]?.in || "header"
//         },
//         bearerToken: apiRequest.auth?.bearer?.[0]?.value || "",
//         basicAuth: {
//             username: apiRequest.auth?.basic?.[0]?.username || "",
//             password: apiRequest.auth?.basic?.[0]?.password || ""
//         }
//     },
//     bodyType: apiRequest.body?.mode || "raw",
//     rawBody: apiRequest.body?.raw || "{}",
//     formData: apiRequest.body?.formdata?.map(f => ({
//         key: f.key || "",
//         value: f.value || "",
//         type: f.type || "text",
//         enabled: true,
//         file: f.type === "file" ? f.src || null : null
//     })) || [],
//     urlEncodedData: apiRequest.body?.urlencoded?.map(u => ({
//         key: u.key || "",
//         value: u.value || "",
//         description: u.description || "",
//         enabled: true
//     })) || []
// });

export const mapApiRequestToState = (apiRequest, state) => {
    // Find the pre-request script from the event array
    const preRequestEvent = apiRequest.event?.find(e => e.listen === 'prerequest');
    const preRequestScript = preRequestEvent?.script?.exec?.join('\n') || "";

    // Find the test script from the event array
    const testEvent = apiRequest.event?.find(e => e.listen === 'test');
    const testScript = testEvent?.script?.exec?.join('\n') || "";

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
            file: f.type === "file" ? f.src || null : null
        })) || [],
        urlEncodedData: apiRequest.body?.urlencoded?.map(u => ({
            key: u.key || "",
            value: u.value || "",
            description: u.description || "",
            enabled: true
        })) || [],
        // Mapped scripts
        preRequestScript,
        testScript
    };
};

function normalizeKeyValueArray(array) {
  return array.reduce((acc, item) => {
    const key = item.Key;
    const value = item.Value;

    // If value is an array of Key/Value, recursively convert it
    if (Array.isArray(value) && value.every(v => v.Key && "Value" in v)) {
      acc[key] = normalizeKeyValueArray(value);
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});
}

export const mapHistoryResponseToState = (apiRequest, state) => {
    // Find the pre-request script from the event array
    const preRequestEvent = apiRequest.event?.find(e => e.listen === 'prerequest');
    const preRequestScript = preRequestEvent?.script?.exec?.join('\n') || "";

    // Find the test script from the event array
    const testEvent = apiRequest.event?.find(e => e.listen === 'test');
    const testScript = testEvent?.script?.exec?.join('\n') || "";

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
            enabled: true,
        })),
        headers: (apiRequest.header || []).map(h => ({
            key: h.key || "",
            value: h.value || "",
            description: h.description || "",
            enabled: true,
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
                addTo: apiRequest.auth?.apikey?.[0]?.in || "header",
            },
            bearerToken: apiRequest.auth?.bearer?.[0]?.value || "",
            basicAuth: {
                username: apiRequest.auth?.basic?.[0]?.username || "",
                password: apiRequest.auth?.basic?.[0]?.password || "",
            },
        },
        bodyType: apiRequest.body?.mode || "raw",
        rawBody: apiRequest.body?.raw || "{}",
        formData:
            apiRequest.body?.formdata?.map(f => ({
                key: f.key || "",
                value: f.value || "",
                type: f.type || "text",
                enabled: true,
                file: f.type === "file" ? f.src || null : null,
            })) || [],
        urlEncodedData:
            apiRequest.body?.urlencoded?.map(u => ({
                key: u.key || "",
                value: u.value || "",
                description: u.description || "",
                enabled: true,
            })) || [],
        response: normalizeKeyValueArray(apiRequest.response),
        // Mapped scripts
        preRequestScript,
        testScript
    };
};

// export const mapHistoryResponseToState = (apiRequest, state) => ({
//   ...state,

//   name: apiRequest.name || "",
//   description: apiRequest.description || "",
//   method: apiRequest.method || "GET",
//   url: apiRequest.url?.raw || "",

//   params: (apiRequest.url?.query || []).map(q => ({
//     key: q.key || "",
//     value: q.value || "",
//     description: q.description || "",
//     enabled: true,
//   })),

//   headers: (apiRequest.header || []).map(h => ({
//     key: h.key || "",
//     value: h.value || "",
//     description: h.description || "",
//     enabled: true,
//   })),

//   authType: apiRequest.auth?.type
//     ? apiRequest.auth.type === "bearer"
//       ? "Bearer Token"
//       : apiRequest.auth.type === "apikey"
//         ? "API Key"
//         : apiRequest.auth.type === "basic"
//           ? "Basic Auth"
//           : "No Auth"
//     : "No Auth",

//   authData: {
//     apiKey: {
//       key: apiRequest.auth?.apikey?.[0]?.key || "",
//       value: apiRequest.auth?.apikey?.[0]?.value || "",
//       addTo: apiRequest.auth?.apikey?.[0]?.in || "header",
//     },
//     bearerToken: apiRequest.auth?.bearer?.[0]?.value || "",
//     basicAuth: {
//       username: apiRequest.auth?.basic?.[0]?.username || "",
//       password: apiRequest.auth?.basic?.[0]?.password || "",
//     },
//   },

//   bodyType: apiRequest.body?.mode || "raw",
//   rawBody: apiRequest.body?.raw || "{}",

//   formData:
//     apiRequest.body?.formdata?.map(f => ({
//       key: f.key || "",
//       value: f.value || "",
//       type: f.type || "text",
//       enabled: true,
//       file: f.type === "file" ? f.src || null : null,
//     })) || [],

//   urlEncodedData:
//     apiRequest.body?.urlencoded?.map(u => ({
//       key: u.key || "",
//       value: u.value || "",
//       description: u.description || "",
//       enabled: true,
//     })) || [],

  
//   response: normalizeKeyValueArray(apiRequest.response)


// });
