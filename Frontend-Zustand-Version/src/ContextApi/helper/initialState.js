
export const initialState = {
    name: "Untitled request",
    description: "",
    method: 'GET',
    url: '',
    activeTab: 0,
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
    }
};






export const cloneInitialState = () => JSON.parse(JSON.stringify(initialState));


// https://jsonplaceholder.typicode.com/posts/1