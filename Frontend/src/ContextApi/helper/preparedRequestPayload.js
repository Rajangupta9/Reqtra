import { faker } from '@faker-js/faker';

const processStringWithFaker = (str) => {
    if (typeof str !== 'string') return str;

    const fakerRegex = /{{\s*\$faker\.([a-zA-Z0-9_.]+)\s*}}/g;

    return str.replace(fakerRegex, (match, path) => {
        try {
            const func = path.split('.').reduce((obj, key) => obj[key], faker);
            return typeof func === 'function' ? func() : func;
        } catch (error) {
            console.error(`Error resolving faker path "${path}":`, error);
            return match;
        }
    });
};

const processStringWithCSV = (str, csvRowData, csvHeaders) => {
    if (typeof str !== 'string' || !csvRowData || !csvHeaders) return str;

    // Match {{headerName}} but not {{$faker...}}
    const csvRegex = /{{\s*(?!\$faker)([a-zA-Z0-9_.-]+)\s*}}/g;

    return str.replace(csvRegex, (match, headerName) => {
        const trimmedHeader = headerName.trim();
        const headerIndex = csvHeaders.findIndex(
            h => h.trim().toLowerCase() === trimmedHeader.toLowerCase()
        );

        if (headerIndex !== -1 && csvRowData[headerIndex] !== undefined) {
            return csvRowData[headerIndex];
        }

        console.warn(`CSV header "${trimmedHeader}" not found in CSV data`);
        return match; // Keep original if not found
    });
};

const deepProcessWithReplacements = (data, csvRowData, csvHeaders) => {
    if (data instanceof Blob || data === null || typeof data !== 'object') {
        if (typeof data === 'string') {
            // First process CSV placeholders, then faker
            let processed = processStringWithCSV(data, csvRowData, csvHeaders);
            processed = processStringWithFaker(processed);
            return processed;
        }
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => deepProcessWithReplacements(item, csvRowData, csvHeaders));
    }

    const newObj = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newObj[key] = deepProcessWithReplacements(data[key], csvRowData, csvHeaders);
        }
    }
    return newObj;
};

/**
 * Filter and clean array items
 */
const filterAndClean = (arr) =>
    arr
        .filter((item) => item.enabled && item.key)
        .map(({ enabled, ...rest }) => {
            if (rest.type === 'file') {
                return {
                    ...rest,
                    value: rest.value || null
                };
            }
            return rest;
        });

export const prepareSingleRequestPayload = (state, csvRowData = null, csvHeaders = null) => {
    let auth = { type: 'none' };

    switch (state.authType) {
        case 'API Key':
            if (state.authData.apiKey.key && state.authData.apiKey.value) {
                auth = {
                    type: 'apikey',
                    apikey: [
                        {
                            key: state.authData.apiKey.key,
                            value: state.authData.apiKey.value,
                            type: 'string',
                            in: state.authData.apiKey.addTo,
                        },
                    ],
                };
            }
            break;

        case 'Bearer Token':
            if (state.authData.bearerToken) {
                auth = {
                    type: 'bearer',
                    bearer: [
                        { key: 'token', value: state.authData.bearerToken, type: 'string' },
                    ],
                };
            }
            break;

        case 'Basic Auth':
            if (state.authData.basicAuth.username) {
                auth = {
                    type: 'basic',
                    basic: [
                        { key: 'username', value: state.authData.basicAuth.username, type: 'string' },
                        { key: 'password', value: state.authData.basicAuth.password, type: 'string' },
                    ],
                };
            }
            break;

        default:
            auth = { type: 'none' };
            break;
    }

    const initialPayload = {
        method: state.method,
        url: state.url,
        header: filterAndClean(state.headers),
        auth,
        body: {
            mode: state.bodyType,
            raw: state.rawBody,
            formdata: filterAndClean(state.formData),
            urlencoded: filterAndClean(state.urlEncodedData),
        },
        // Integrate scripts into the payload
        preRequestScript: state.preRequestScript,
        testScript: state.testScript,
    };

    return deepProcessWithReplacements(initialPayload, csvRowData, csvHeaders);
};

export const prepareRequestPayload = (state, csvData = null) => {
    if (!csvData || csvData.length === 0 || !csvData[0].data || csvData[0].data.length === 0) {
        // Return a single payload in an array for consistency
        const singlePayload = prepareSingleRequestPayload(state);
        return [{
            rowIndex: 0,
            payload: singlePayload,
            rowData: {}
        }];
    }

    const csvFile = csvData[0];
    const { headers, data: rows } = csvFile;

    // Generate payload for each CSV row
    const payloads = rows.map((rowData, index) => {
        const payload = prepareSingleRequestPayload(state, rowData, headers);
        return {
            rowIndex: index,
            payload,
            rowData: rowData.reduce((acc, value, idx) => {
                acc[headers[idx]] = value;
                return acc;
            }, {})
        };
    });

    return payloads;
};

export const hasCSVPlaceholders = (state) => {
    const csvRegex = /{{\s*(?!\$faker)([a-zA-Z0-9_.-]+)\s*}}/;
    
    const checkString = (str) => {
        return typeof str === 'string' && csvRegex.test(str);
    };

    const checkObject = (obj) => {
        if (typeof obj === 'string') return checkString(obj);
        if (obj === null || typeof obj !== 'object') return false;
        
        if (Array.isArray(obj)) {
            return obj.some(checkObject);
        }
        
        return Object.values(obj).some(checkObject);
    };

    return (
        checkString(state.url) ||
        checkString(state.rawBody) ||
        checkObject(state.headers) ||
        checkObject(state.formData) ||
        checkObject(state.urlEncodedData) ||
        checkObject(state.authData) ||
        // Check scripts for placeholders
        checkString(state.preRequestScript) ||
        checkString(state.testScript)
    );
};

export const getCSVPlaceholders = (state) => {
    const csvRegex = /{{\s*(?!\$faker)([a-zA-Z0-9_.-]+)\s*}}/g;
    const placeholders = new Set();

    const extractFromString = (str) => {
        if (typeof str !== 'string') return;
        let match;
        while ((match = csvRegex.exec(str)) !== null) {
            placeholders.add(match[1].trim());
        }
    };

    const extractFromObject = (obj) => {
        if (typeof obj === 'string') {
            extractFromString(obj);
            return;
        }
        if (obj === null || typeof obj !== 'object') return;
        
        if (Array.isArray(obj)) {
            obj.forEach(extractFromObject);
        } else {
            Object.values(obj).forEach(extractFromObject);
        }
    };

    extractFromString(state.url);
    extractFromString(state.rawBody);
    extractFromObject(state.headers);
    extractFromObject(state.formData);
    extractFromObject(state.urlEncodedData);
    extractFromObject(state.authData);
    // Extract placeholders from scripts
    extractFromString(state.preRequestScript);
    extractFromString(state.testScript);

    return Array.from(placeholders);
};

export const validateCSVData = (state, csvData) => {
    const placeholders = getCSVPlaceholders(state);
    
    if (placeholders.length === 0) {
        return { valid: true, missingHeaders: [], availableHeaders: [] };
    }

    if (!csvData || csvData.length === 0 || !csvData[0].headers) {
        return { 
            valid: false, 
            missingHeaders: placeholders,
            availableHeaders: []
        };
    }

    const csvHeaders = csvData[0].headers.map(h => h.trim().toLowerCase());
    const missingHeaders = placeholders.filter(
        placeholder => !csvHeaders.includes(placeholder.toLowerCase())
    );

    return {
        valid: missingHeaders.length === 0,
        missingHeaders,
        availableHeaders: csvData[0].headers
    };
};