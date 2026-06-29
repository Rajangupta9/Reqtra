
export const initialState = {
    name: "Untitled request",
    description: "",
    method: 'GET',
    url: '',
    activeRequestTab: 0,
    loading: false,
    response: null,
    error: null,
    params: [{ key: '', value: '', description: '', enabled: false }],
    headers: [{ key: 'Content-Type', value: 'application/json', description: '', enabled: true }],
    authType: 'No Auth',
    authData: {
        apiKey: { key: '', value: '', addTo: 'header' },
        bearerToken: '',
        basicAuth: { username: '', password: '' },
    },
    bodyType: 'raw',
    rawBody: '{}',
    formData: [{ key: '', value: '', type: 'text', enabled: false, file: null }],
    urlEncodedData: [{ key: '', value: '', description: '', enabled: false }],
    settings: {
        followRedirects: true,
        validateSSL: true,
        timeout: 30000,
        maxRedirects: 5
    },
    preRequestScript: '', 
    testScript: ''        
};


export const filledState = {
  name: "getAsset",
  description: "Request to fetch an asset file from the filemanager service",
  method: "GET",

  // full raw URL
  url: "{{baseURL}}/filemanager/getAsset?id={{asset_id}}",

  activeTab: 0,
  loading: false,
  response: "No response yet",
  error: "No error",

  // query params (1 param provided)
  params: [
    {
      key: "id",
      value: "{{asset_id}}",
      description: "Asset ID to fetch",
      enabled: true
    }
  ],

  // headers (explicitly filled even if empty in API request)
  headers: [
    {
      key: "Authorization",
      value: "Bearer {{token}}",
      description: "Bearer authentication token",
      enabled: true
    },
    {
      key: "Content-Type",
      value: "application/json",
      description: "Request content type",
      enabled: true
    }
  ],

  // auth (bearer)
  authType: "Basic Auth",
  authData: {
    apiKey: { key: "api_key", value: "sample_api_key", addTo: "header" },
    bearerToken: "{{token}}",
    basicAuth: { username: "admin", password: "password123" }
  },

  // body (formdata mode, force fill with values)
  bodyType: "formdata",
  rawBody: "{ \"sample\": true }",
  formData: [
    {
      key: "file",
      value: "sample.txt",
      type: "file",
      enabled: true,
      file: "/path/to/sample.txt"
    },
    {
      key: "description",
      value: "Asset file to upload",
      type: "text",
      enabled: true,
      file: null
    }
  ],

  // urlencoded (force fill too)
  urlEncodedData: [
    {
      key: "exampleKey",
      value: "exampleValue",
      description: "Example urlencoded param",
      enabled: true
    }
  ],

  // settings
  settings: {
    followRedirects: true,
    validateSSL: true,
    timeout: 30000,
    maxRedirects: 5
  },
};




export const cloneInitialState = () => JSON.parse(JSON.stringify(initialState));


// https://jsonplaceholder.typicode.com/posts/1