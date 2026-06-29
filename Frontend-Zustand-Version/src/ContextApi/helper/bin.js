import { json } from '@codemirror/lang-json';
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


const deepProcessWithFaker = (data) => {
    if (data instanceof Blob || data === null || typeof data !== 'object') {
        return typeof data === 'string' ? processStringWithFaker(data) : data;
    }

    if (Array.isArray(data)) {
        return data.map(deepProcessWithFaker);
    }

    const newObj = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newObj[key] = deepProcessWithFaker(data[key]);
        }
    }
    return newObj;
};

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




export const prepareRequestPayload = (state) => {
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
    };

    return deepProcessWithFaker(initialPayload);
};
