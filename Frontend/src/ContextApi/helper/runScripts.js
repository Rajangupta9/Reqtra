

function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (typeof a !== "object") return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
}


const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
// helper to recursively replace {{var}} placeholders
function replaceInString(str, lookup) {
    return str.replace(/\{\{(.+?)\}\}/g, (_, key) => {
        const k = key.trim();
        return lookup[k] ?? '';
    });
}
function deepReplace(obj, lookup) {
    if (typeof obj === "string") return replaceInString(obj, lookup);
    if (Array.isArray(obj)) return obj.map(item => deepReplace(item, lookup));
    if (obj && typeof obj === "object") {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = deepReplace(v, lookup);
        return out;
    }
    return obj;
}

export function buildPmSandbox({
    environments = [],
    activeEnvName = "Production",
    globalStore = {},
    response = null,
    sendSubRequest = null,
    externalLog = console.log
}) {
    const logs = [];
    const testResults = [];

    // --- Logging system ---
    const makeLogger = (level) => (...args) => {
        const message = args.map(String).join(' ');
        const entry = { level, time: new Date().toISOString(), message };
        logs.push(entry);
        externalLog(`[PM ${level.toUpperCase()}]`, message);
    };

    const log = makeLogger("info");

    // --- Environment Manager ---
    const environmentManager = {
        currentEnv: activeEnvName,

        setActive(name) {
            const found = environments.find((e) => e.name === name);
            if (found) {
                this.currentEnv = name;
                log(`✅ Active environment set to: ${name}`);
            } else {
                log(`⚠️ Environment '${name}' not found.`);
            }
        },

        createNewEnvironment(name) {
            const tempId = "bskdjlkfjdlksjlkfdjkfdk"
            const newEnv = { id: tempId, name, variables: [], isNew: true };
            environments.push(newEnv);
            log(`🆕 Created new environment: ${name}`);
            return newEnv;
        },

        getCurrentEnv() {
            let env = environments.find((e) => e.name === this.currentEnv);
            if (!env) env = this.createNewEnvironment(this.currentEnv);
            return env;
        },

        set(key, value) {
            const env = this.getCurrentEnv();

            // ✅ 1. Skip undefined, null, or empty string (optional)
            if (value === undefined || value === null || value === "") {
                log(`⚠️ Skipped setting '${key}' — invalid or missing value`);
                return;
            }

            const existing = env.variables.find(v => v.key === key);

            // ✅ 2. Update existing variable only if value changed
            if (existing) {
                if (existing.value !== String(value)) {
                    existing.value = String(value);
                    log(`✏️ Updated '${key}' in '${env.name}' → '${value}'`);
                } else {
                    log(`ℹ️ '${key}' already up to date in '${env.name}'`);
                }
            }
            // ✅ 3. Add only if new and has valid value
            else {
                env.variables.push({ key, value: String(value) });
                log(`➕ Added '${key}'='${value}' to '${env.name}'`);
            }
        }
        ,

        get(key) {
            const env = this.getCurrentEnv();
            const variable = env.variables.find((v) => v.key === key);
            return variable ? variable.value : null;
        },

        unset(key) {
            const env = this.getCurrentEnv();
            env.variables = env.variables.filter(v => v.key !== key);
            log(`🚮 Unset '${key}' from '${env.name}'`);
        },

        all() {
            const env = this.getCurrentEnv();
            return env.variables;
        },

        allEnvs() {
            return environments;
        }
    };

    // --- PM Object ---
    const pm = {
        // Environment API
        environment: {
            get: (k) => environmentManager.get(k),
            set: (k, v) => environmentManager.set(k, v),
            unset: (k) => environmentManager.unset(k),
            all: () => environmentManager.all(),
            allEnvs: () => environmentManager.allEnvs(),
            setActive: (n) => environmentManager.setActive(n),
        },

        // Globals API
        globals: {
            get: (k) => globalStore[k],
            set: (k, v) => {
                log(`[GLOBAL] set ${k} = ${v}`);
                globalStore[k] = String(v);
            },
            unset: (k) => {
                log(`[GLOBAL] unset ${k}`);
                delete globalStore[k];
            },
            all: () => ({ ...globalStore }),
        },

        // Variables API (resolve env > globals)
        variables: {
            get: (k) => pm.environment.get(k) ?? pm.globals.get(k),
            set: (k, v) => pm.environment.set(k, v),
            replaceIn: (input) => {
                const lookup = {
                    ...globalStore,
                    ...(environmentManager.getCurrentEnv()?.variables.reduce((acc, v) => {
                        acc[v.key] = v.value;
                        return acc;
                    }, {}) || {})
                };
                if (typeof input === "string") return replaceInString(input, lookup);
                return deepReplace(input, lookup);
            },
        },

        // Response API
        response: response
            ? {
                _raw: response,
                json: () => {
                    try {
                        return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
                    } catch (err) {
                        throw new Error('Invalid JSON in response.body');
                    }
                },
                text: () => (typeof response.body === 'string' ? response.body : JSON.stringify(response.body)),
                code: response.status,
                status: response.statusText,
                headers: response.headers || {},
                to: {
                    have: {
                        status: (expected) => {
                            if (response.status !== expected)
                                throw new Error(`Expected status ${expected} but got ${response.status}`);
                        },
                        header: (name) => {
                            const found =
                                (response.headers || {})[name] ||
                                (response.headers || {})[name.toLowerCase()];
                            if (found === undefined)
                                throw new Error(`Expected header ${name} to be present`);
                            return found;
                        },
                        body: (expectedString) => {
                            const text =
                                typeof response.body === 'string'
                                    ? response.body
                                    : JSON.stringify(response.body);
                            if (!text.includes(expectedString))
                                throw new Error(
                                    `Expected response body to include '${expectedString}'`
                                );
                        },
                    },
                },
            }
            : null,

        // sendRequest (for chaining)
        sendRequest: sendSubRequest,

        // Console wrapper
        console: {
            log: makeLogger('info'),
            warn: makeLogger('warn'),
            error: makeLogger('error'),
            _getLogs: () => logs.slice(),
        },

        // Tests + Assertions
        test: (name, fn) => {
            const started = Date.now();
            const record = {
                name,
                pass: false,
                duration: 0,
                error: null,
                timestamp: new Date().toISOString(),
            };
            try {
                const maybePromise = fn();
                if (maybePromise && typeof maybePromise.then === 'function') {
                    return maybePromise
                        .then(() => {
                            record.pass = true;
                            record.duration = Date.now() - started;
                            testResults.push(record);
                            // pm.console.log(`[PASS] ${name}`);
                        })
                        .catch((err) => {
                            record.pass = false;
                            record.duration = Date.now() - started;
                            record.error = err?.message || String(err);
                            testResults.push(record);
                            // pm.console.error(`[FAIL] ${name} — ${record.error}`);
                        });
                } else {
                    record.pass = true;
                    record.duration = Date.now() - started;
                    testResults.push(record);
                    // pm.console.log(`[PASS] ${name}`);
                }
            } catch (err) {
                record.pass = false;
                record.duration = Date.now() - started;
                record.error = err?.message || String(err);
                testResults.push(record);
                // pm.console.error(`[FAIL] ${name} — ${record.error}`);
            }
        },

        expect: (actual) => {
            const chain = (newActual = actual, negate = false) => ({
                // --- Chaining Getters ---
                get that() { return chain(newActual, negate); },
                get is() { return chain(newActual, negate); },
                get to() { return chain(newActual, negate); },
                get have() { return chain(newActual, negate); },
                get be() { return chain(newActual, negate); },
                get not() { return chain(newActual, !negate); }, // toggle negation flag!

                // --- Property assertion ---
                property: (propName) => {
                    if (typeof newActual !== 'object' || newActual === null) {
                        throw new Error(`AssertionError: expected ${newActual} to have property '${propName}' but it's not an object`);
                    }
                    const hasProp = propName in newActual;
                    if (!hasProp && !negate) {
                        throw new Error(`AssertionError: expected ${JSON.stringify(newActual)} to have property '${propName}'`);
                    }
                    if (hasProp && negate) {
                        throw new Error(`AssertionError: expected ${JSON.stringify(newActual)} to not have property '${propName}'`);
                    }
                    return chain(newActual[propName], negate);
                },

                // --- Empty assertion ---
                get empty() {
                    const isEmpty =
                        (Array.isArray(newActual) && newActual.length === 0) ||
                        (typeof newActual === 'string' && newActual.length === 0) ||
                        (typeof newActual === 'object' && newActual !== null && Object.keys(newActual).length === 0);

                    if (!negate && !isEmpty) {
                        throw new Error(`AssertionError: expected ${JSON.stringify(newActual)} to be empty`);
                    }
                    if (negate && isEmpty) {
                        throw new Error(`AssertionError: expected ${JSON.stringify(newActual)} to not be empty`);
                    }
                    return chain(newActual, negate);
                },

                // --- Equality ---
                eql: (expected) => {
                    const result = deepEqual(newActual, expected);
                    if (!negate && !result)
                        throw new Error(`AssertionError: expected ${JSON.stringify(newActual)} to deep equal ${JSON.stringify(expected)}`);
                    if (negate && result)
                        throw new Error(`AssertionError: expected ${JSON.stringify(newActual)} to not deep equal ${JSON.stringify(expected)}`);
                    return chain(newActual, negate);
                },

                // --- Inclusion ---
                include: (expected) => {
                    const result = String(newActual).includes(expected);
                    if (!negate && !result)
                        throw new Error(`AssertionError: expected '${newActual}' to include '${expected}'`);
                    if (negate && result)
                        throw new Error(`AssertionError: expected '${newActual}' to not include '${expected}'`);
                    return chain(newActual, negate);
                },

                // --- Numeric comparisons ---
                above: (n) => {
                    const ok = typeof newActual === 'number' && newActual > n;
                    if (!negate && !ok)
                        throw new Error(`AssertionError: expected ${newActual} to be above ${n}`);
                    if (negate && ok)
                        throw new Error(`AssertionError: expected ${newActual} to not be above ${n}`);
                    return chain(newActual, negate);
                },

                below: (n) => {
                    const ok = typeof newActual === 'number' && newActual < n;
                    if (!negate && !ok)
                        throw new Error(`AssertionError: expected ${newActual} to be below ${n}`);
                    if (negate && ok)
                        throw new Error(`AssertionError: expected ${newActual} to not be below ${n}`);
                    return chain(newActual, negate);
                },

                // --- oneOf ---
                oneOf: (arr) => {
                    const ok = Array.isArray(arr) && arr.includes(newActual);
                    if (!negate && !ok)
                        throw new Error(`AssertionError: expected ${newActual} to be one of [${arr.join(', ')}]`);
                    if (negate && ok)
                        throw new Error(`AssertionError: expected ${newActual} to not be one of [${arr.join(', ')}]`);
                    return chain(newActual, negate);
                },

                // --- Match ---
                match: (regex) => {
                    const ok = typeof newActual === 'string' && regex.test(newActual);
                    if (!negate && !ok)
                        throw new Error(`AssertionError: expected '${newActual}' to match ${regex}`);
                    if (negate && ok)
                        throw new Error(`AssertionError: expected '${newActual}' to not match ${regex}`);
                    return chain(newActual, negate);
                },
            });

            return chain(actual);
        },


        // Utils
        utils: {
            parseJsonSafely: (s) => {
                try { return JSON.parse(s); } catch { return null; }
            }
        },

        // Introspection
        _getTestResults: () => testResults.slice(),
        _getLogs: () => logs.slice(),
        _getAllEnvironments: () => environments,
    };

    pm.request = {
        url: "",
        method: "GET",
        headers: {},
        body: null,

        setUrl(url) {
            this.url = url;
        },
        setMethod(method) {
            this.method = method.toUpperCase();
        },
        setHeader(key, value) {
            this.headers[key] = value;
        },
        removeHeader(key) {
            delete this.headers[key];
        },
        setBody(body) {
            this.body = body;
        },
        getHeader(key) {
            return this.headers[key];
        },
        allHeaders() {
            return this.headers;
        },
        replaceIn(obj) {
            return pm.variables.replaceIn(obj);
        },
    };


    return pm;
}



// // run pre-request script string (activeTabData.preScript) inside AsyncFunction scope
// export async function runPreRequestScript(activeTabData, pm) {
//     if (!activeTabData?.preRequestScript || activeTabData.preRequestScript.length === 0) return;

//     // pm.console.log("⚙️ Running pre-request script...");

//     try {
//         // Create isolated async function with `pm` injected
//         const fn = new AsyncFunction('pm', '"use strict";\n' + activeTabData.preRequestScript);

//         // Execute the pre-request script
//         await fn(pm);

//         return {
//             url: pm.request.url,
//             method: pm.request.method,
//             headers: pm.request.headers,
//             body: pm.request.body,
//         };

//         // pm.console.log("✅ Pre-request script executed successfully.");
//     } catch (err) {
//         // pm.console.error(`[❌ Pre-Script Error] ${err?.message || err}`);
//         throw err; // stop execution if pre-script fails
//     }
// }


// function isLikelySchema(obj) {
//     if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
//     // A minimal JSON Schema usually has a "type" OR "properties" OR "$schema"
//     if ('type' in obj || 'properties' in obj || '$schema' in obj) return true;
//     // sometimes people pass an array of schemas (not supported here)
//     return false;
// }
// export async function runPostRequestScript(activeTabData, pm, response, duration) {
//     if (!activeTabData?.testScript || activeTabData.testScript.length === 0) {
//         pm.console?.log?.("ℹ️ No post-request script found for this tab.");
//         return;
//     }

//     pm.console?.log?.("⚙️ Preparing post-request script execution...");

//     const tv4Safe = (typeof window !== "undefined" && window.tv4) ? window.tv4 : {
//         validate: () => {
//             // pm.console.warn('tv4 is not loaded. Skipping schema validation.');
//             return true; // Default to true if tv4 is missing
//         },
//         error: null
//     };

//     try {
//         // Normalize response data from the full response object
//         const responseInfo = response.responseInfo || {};
//         const headersRaw = responseInfo.headers || response.headers || {};
//         const bodyRaw = responseInfo.body || response.body || "";
//         const statusCode = responseInfo.statusCode ?? response.status ?? 0;
//         const statusText = responseInfo.status ?? responseInfo.statusText ?? "";
//         const responseTime = duration || response.timingInfo?.durationMs || 0;

//         // Normalize headers (convert to lower-case map for easy lookup)
//         const headersMap = {};
//         if (Array.isArray(headersRaw)) {
//             headersRaw.forEach(h => {
//                 if (h.key) headersMap[h.key.toLowerCase()] = h.value;
//             });
//         } else {
//             Object.entries(headersRaw).forEach(([key, val]) => {
//                 headersMap[key.toLowerCase()] = val;
//             });
//         }

//         headersMap.get = (name) => headersMap[name.toLowerCase()];


//         const responseBodyJson = (() => {
//             try {
//                 return typeof bodyRaw === "string" ? JSON.parse(bodyRaw) : bodyRaw;
//             } catch (e) {
//                 return null; // Store null if parsing fails
//             }
//         })();

//         // Build response sandbox like in Postman
//         const responseForSandbox = {
//             _raw: response,
//             code: statusCode,
//             status: statusCode,
//             statusText,
//             headers: headersMap,
//             responseTime,
//             body: bodyRaw,

//             json: () => {
//                 try {
//                     return typeof bodyRaw === "string" ? JSON.parse(bodyRaw) : bodyRaw;
//                 } catch (e) {
//                     throw new Error("Invalid JSON in response body");
//                 }
//             },

//             text: () => (typeof bodyRaw === "string" ? bodyRaw : JSON.stringify(bodyRaw)),

//             to: {
//                 // --- NEW: `not` chain ---
//                 get not() {
//                     return {
//                         have: {
//                             // --- NEW: `not.have.jsonBody` ---
//                             jsonBody: (propName) => {
//                                 const body = responseForSandbox.json();
//                                 if (body && typeof body === 'object' && propName in body) {
//                                     throw new Error(`AssertionError: expected response body to not have property '${propName}'`);
//                                 }
//                                 // pm.console?.log?.(`✅ Body does not contain property: ${propName}`);
//                             }
//                             // ... other 'not' assertions as needed
//                         }
//                     };
//                 },
//                 have: {
//                     status: (expected) => {
//                         if (statusCode !== expected) {
//                             throw new Error(`AssertionError: expected status ${expected} but got ${statusCode}`);
//                         }
//                         // pm.console?.log?.(`✅ Status matched: ${expected}`);
//                     },
//                     body: (expectedBody) => {
//                         const actual = typeof bodyRaw === "string" ? bodyRaw : JSON.stringify(bodyRaw);
//                         if (!actual.includes(expectedBody)) {
//                             throw new Error(`AssertionError: expected body to include '${expectedBody}'`);
//                         }
//                         // pm.console?.log?.(`✅ Body contains expected text.`);
//                     },
//                     header: (name) => {
//                         const val = headersMap.get(name); // Use the new .get()
//                         if (!val)
//                             throw new Error(`AssertionError: expected header '${name}' to be present`);
//                         // pm.console?.log?.(`✅ Header '${name}' found: ${val}`);
//                         return val;
//                     },
//                     // --- NEW: `jsonBody` assertion ---
//                     jsonBody: (propName) => {
//                         const body = responseForSandbox.json();
//                         if (body === null || typeof body !== 'object' || !(propName in body)) {
//                             throw new Error(`AssertionError: expected response body to have property '${propName}'`);
//                         }
//                         // pm.console?.log?.(`✅ Body has property: ${propName}`);
//                     },
//                     // --- NEW: `jsonSchema` assertion ---
//                     jsonSchema: (schema) => {
//                         // 1) Basic validation of shape
//                         if (!isLikelySchema(schema)) {
//                             throw new Error(
//                                 `Invalid JSON schema passed to jsonSchema(): expected an object with 'type' or 'properties' or '$schema'. Received: ${typeof schema}`
//                             );
//                         }

//                         // 2) Ensure tv4 exists and has a validate function
//                         if (!tv4Safe || typeof tv4Safe.validate !== 'function') {
//                             // Decide behavior: either throw, or warn and skip validation.
//                             // I choose to throw to avoid silent false-positives.
//                             throw new Error(
//                                 "Schema validation unavailable: 'tv4' is not loaded or does not expose 'validate'. " +
//                                 "Include tv4 (e.g., tv4.min.js) or provide a schema validator in the environment."
//                             );
//                         }

//                         // 3) Run validation and produce helpful message on failure
//                         try {
//                             const valid = tv4Safe.validate(responseForSandbox.json(), schema);
//                             if (!valid) {
//                                 // tv4Safe.error usually contains information about failure
//                                 const tv4err = tv4Safe.error || {};
//                                 const msg = (tv4err && (tv4err.message || tv4err.dataPath))
//                                     ? `Schema validation failed: ${tv4err.message || JSON.stringify(tv4err)} at ${tv4err.dataPath || '/'}`
//                                     : 'Schema validation failed (no details provided by tv4).';
//                                 // log the tv4 error for debugging
//                                 // pm.console?.error?.('tv4 error details: ' + JSON.stringify(tv4err, null, 2));
//                                 throw new Error(msg);
//                             }
//                             // pm.console?.log?.('✅ JSON schema validation passed.');
//                         } catch (err) {
//                             // rethrow to be caught by outer try/catch in runPostRequestScript
//                             throw err;
//                         }
//                     }
//                 },
//             },
//         };

//         // Attach response to pm
//         pm.response = responseForSandbox;

//         // pm.console.log("🚀 Running post-request script...");

//         // Execute user test script safely
//         const fn = new AsyncFunction(
//             "pm",
//             "response",
//             "tv4",
//             `"use strict";\n${activeTabData.testScript}`
//         );

//         await fn(pm, responseForSandbox, tv4Safe);

//         // pm.console.log("✅ Post-request script executed successfully.");
//     } catch (err) {
//         // pm.console.error(`❌ Post-Script Error: ${err?.message || err}`);
//     }
// }


export async function runPreRequestScript(activeTabData, pm) {
    if (!activeTabData?.preRequestScript || activeTabData.preRequestScript.length === 0) return;
    try {
        const fn = new AsyncFunction('pm', '"use strict";\n' + activeTabData.preRequestScript);
        await fn(pm);
        return JSON.parse(JSON.stringify({
            url: pm.request.url,
            method: pm.request.method,
            headers: pm.request.headers,
            body: pm.request.body,
        }));
    } catch (err) {
        throw err;
    }
}

function isLikelySchema(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    if ('type' in obj || 'properties' in obj || '$schema' in obj) return true;
    return false;
}

export async function runPostRequestScript(activeTabData, pm, response, duration) {
    if (!activeTabData?.testScript || activeTabData.testScript.length === 0) return;
    const tv4Safe = (typeof window !== "undefined" && window.tv4) ? window.tv4 : {
        validate: () => true,
        error: null
    };
    try {
        const responseInfo = response.responseInfo || {};
        const headersRaw = responseInfo.headers || response.headers || {};
        const bodyRaw = responseInfo.body ?? response.body ?? "";
        const statusCode = responseInfo.statusCode ?? response.status ?? 0;
        const statusText = responseInfo.status ?? responseInfo.statusText ?? "";
        const responseTime = duration ?? response.timingInfo?.durationMs ?? 0;
        const headersMap = {};
        if (Array.isArray(headersRaw)) {
            headersRaw.forEach(h => {
                if (h && h.key) headersMap[h.key.toLowerCase()] = h.value;
            });
        } else if (headersRaw && typeof headersRaw === 'object') {
            Object.entries(headersRaw).forEach(([key, val]) => {
                headersMap[key.toLowerCase()] = val;
            });
        }
        headersMap.get = (name) => headersMap[name.toLowerCase()];
        const responseBodyParsed = (() => {
            try {
                return typeof bodyRaw === "string" ? JSON.parse(bodyRaw) : bodyRaw;
            } catch (e) {
                return null;
            }
        })();
        const responseForSandbox = {
            _raw: response,
            code: statusCode,
            status: statusCode,
            statusText,
            headers: headersMap,
            responseTime,
            body: bodyRaw,
            json: () => {
                try {
                    return typeof bodyRaw === "string" ? JSON.parse(bodyRaw) : bodyRaw;
                } catch (e) {
                    throw new Error("Invalid JSON in response body");
                }
            },
            text: () => (typeof bodyRaw === "string" ? bodyRaw : JSON.stringify(bodyRaw)),
            to: {
                get not() {
                    return {
                        have: {
                            jsonBody: (propName) => {
                                const body = responseForSandbox.json();
                                if (body && typeof body === 'object' && propName in body) {
                                    throw new Error(`AssertionError: expected response body to not have property '${propName}'`);
                                }
                            }
                        }
                    };
                },
                have: {
                    status: (expected) => {
                        if (statusCode !== expected) throw new Error(`AssertionError: expected status ${expected} but got ${statusCode}`);
                    },
                    body: (expectedBody) => {
                        const actual = typeof bodyRaw === "string" ? bodyRaw : JSON.stringify(bodyRaw);
                        if (!actual.includes(expectedBody)) throw new Error(`AssertionError: expected body to include '${expectedBody}'`);
                    },
                    header: (name) => {
                        const val = headersMap.get(name);
                        if (!val) throw new Error(`AssertionError: expected header '${name}' to be present`);
                        return val;
                    },
                    jsonBody: (propName) => {
                        const body = responseForSandbox.json();
                        if (body === null || typeof body !== 'object' || !(propName in body)) {
                            throw new Error(`AssertionError: expected response body to have property '${propName}'`);
                        }
                    },
                    jsonSchema: (schemaInput) => {
                        let schema = schemaInput;
                        if (typeof schemaInput === 'string') {
                            try {
                                schema = JSON.parse(schemaInput);
                            } catch (e) {
                                throw new Error('Invalid JSON schema string provided to jsonSchema()');
                            }
                        }
                        if (!isLikelySchema(schema)) throw new Error('Invalid JSON schema passed to jsonSchema()');
                        if (!tv4Safe || typeof tv4Safe.validate !== 'function') {
                            throw new Error("Schema validation unavailable: 'tv4' is not loaded or does not expose 'validate'.");
                        }
                        const data = responseBodyParsed !== null ? responseBodyParsed : (() => {
                            try { return typeof bodyRaw === "string" ? JSON.parse(bodyRaw) : bodyRaw; } catch { return null; }
                        })();
                        const valid = tv4Safe.validate(data, schema);
                        if (!valid) {
                            const tv4err = tv4Safe.error || {};
                            const details = tv4err.message ? `${tv4err.message}` : JSON.stringify(tv4err);
                            throw new Error(`Schema validation failed: ${details}`);
                        }
                    }
                }
            }
        };
        pm.response = responseForSandbox;
        const fn = new AsyncFunction("pm", "response", "tv4", '"use strict";\n' + activeTabData.testScript);
        await fn(pm, responseForSandbox, tv4Safe);
    } catch (err) {
        throw err;
    }
}

