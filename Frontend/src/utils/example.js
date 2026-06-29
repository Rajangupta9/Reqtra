// Replace your previous sendRequest with this full implementation inside AppProvider
const sendRequest = useCallback(async () => {
  if (!activeTabId || !activeTabData) return;

  dispatch({
    type: ActionTypes.SET_LOADING,
    payload: { tabId: activeTabId, loading: true },
  });

  const startTime = Date.now();

  // Helpers (sandbox + script runners) ------------------------------------------------
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  // Build pm sandbox that uses array-form env/globals and updates them in place
  function buildPmSandbox({ inMemoryEnvVars, inMemoryGlobalVars, log, sendSubRequest }) {
    // inMemoryEnvVars = [{key, value}, ...] — we mutate this array in-place (or reassign on unset)
    let testResults = [];

    // helper to find index
    const findIndex = (arr, key) => arr.findIndex(v => v.key === key);

    const pm = {
      environment: {
        get: (key) => inMemoryEnvVars.find(v => v.key === key)?.value,
        set: (key, value) => {
          log(`[ENV] set ${key} = ${value}`);
          const idx = findIndex(inMemoryEnvVars, key);
          if (idx >= 0) inMemoryEnvVars[idx].value = String(value);
          else inMemoryEnvVars.push({ key: String(key), value: String(value) });
        },
        unset: (key) => {
          log(`[ENV] unset ${key}`);
          const filtered = inMemoryEnvVars.filter(v => v.key !== key);
          // reassign outer var by copying content
          inMemoryEnvVars.length = 0;
          inMemoryEnvVars.push(...filtered);
        },
        all: () => deepClone(inMemoryEnvVars)
      },

      globals: {
        get: (key) => inMemoryGlobalVars.find(v => v.key === key)?.value,
        set: (key, value) => {
          log(`[GLOBAL] set ${key} = ${value}`);
          const idx = findIndex(inMemoryGlobalVars, key);
          if (idx >= 0) inMemoryGlobalVars[idx].value = String(value);
          else inMemoryGlobalVars.push({ key: String(key), value: String(value) });
        },
        unset: (key) => {
          log(`[GLOBAL] unset ${key}`);
          const filtered = inMemoryGlobalVars.filter(v => v.key !== key);
          inMemoryGlobalVars.length = 0;
          inMemoryGlobalVars.push(...filtered);
        },
        all: () => deepClone(inMemoryGlobalVars)
      },

      variables: {
        get: (k) => pm.environment.get(k) ?? pm.globals.get(k),
        set: (k, v) => pm.environment.set(k, v),
        // NOTE: basic replaceIn for strings only — rely on your prepareSingleRequestPayload for complex interpolation
        replaceIn: (str) => {
          if (typeof str !== 'string') return str;
          return str.replace(/\{\{(.+?)\}\}/g, (_, key) => {
            const k = key.trim();
            return pm.environment.get(k) ?? pm.globals.get(k) ?? '';
          });
        }
      },

      // sendSubRequest is provided from outer scope (uses Proxy)
      sendRequest: sendSubRequest,

      testResults,
      test: (name, fn) => {
        try {
          const result = fn();
          if (result && typeof result.then === 'function') {
            // async test -> wrap promise (we don't `await` here to keep interface, but record on resolution)
            result.then(() => {
              testResults.push({ name, pass: true });
              log(`[PASS] ${name}`);
            }).catch(err => {
              testResults.push({ name, pass: false, error: err?.message || String(err) });
              log(`[FAIL] ${name}: ${err?.message || String(err)}`);
            });
          } else {
            testResults.push({ name, pass: true });
            log(`[PASS] ${name}`);
          }
        } catch (err) {
          testResults.push({ name, pass: false, error: err?.message || String(err) });
          log(`[FAIL] ${name}: ${err?.message || String(err)}`);
        }
      },

      expect: (actual) => ({
        to: {
          include: (expected) => {
            if (!actual?.includes?.(expected)) throw new Error(`AssertionError: expected '${actual}' to include '${expected}'`);
          },
          eql: (expected) => {
            if (!deepEqual(actual, expected)) throw new Error(`AssertionError: expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`);
          },
          be: {
            below: (max) => {
              if (typeof actual !== 'number') throw new Error(`AssertionError: expected ${actual} to be a number`);
              if (actual >= max) throw new Error(`AssertionError: expected ${actual} to be below ${max}`);
            },
            oneOf: (arr) => {
              if (!Array.isArray(arr) || !arr.includes(actual)) throw new Error(`AssertionError: expected ${actual} to be one of [${arr.join(', ')}]`);
            }
          }
        }
      }),

      console: { log, warn: log, error: log },

      // will be set for post-script
      response: null
    };

    return pm;
  }

  // run pre-request script string (activeTabData.preScript) inside AsyncFunction scope
  async function runPreRequestScript(activeTabData, pm) {
    if (!activeTabData?.preScript) return;
    pm.console.log("Running pre-request script...");
    try {
      const fn = new AsyncFunction('pm', '"use strict";\n' + activeTabData.preScript);
      await fn(pm);
    } catch (err) {
      pm.console.error(`[Pre-Script Error] ${err?.message || err}`);
      throw err;
    }
  }

  // run post-request script with pm.response available
  async function runPostRequestScript(activeTabData, pm, response, duration) {
    if (!activeTabData?.postScript) return;

    const responseForSandbox = {
      _raw: response,
      status: response.responseInfo?.statusCode ?? response.status ?? 0,
      statusText: response.responseInfo?.statusText ?? '',
      headers: response.responseInfo?.headers ?? response.headers ?? [],
      responseTime: duration,
      body: response.body,
      json: () => (typeof response.body === 'string' ? JSON.parse(response.body) : response.body),
      text: () => (typeof response.body === 'string' ? response.body : JSON.stringify(response.body)),
      to: {
        have: {
          status: (expected) => {
            const actual = responseForSandbox.status;
            if (actual !== expected) throw new Error(`AssertionError: expected status ${expected} but got ${actual}`);
          },
          body: (expectedBody) => {
            const actualBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
            if (actualBody !== expectedBody) throw new Error(`AssertionError: expected body '${expectedBody}' but got '${actualBody}'`);
          },
          header: (name) => {
            const headers = responseForSandbox.headers || [];
            const found = Array.isArray(headers)
              ? headers.find(h => (h.key || h.name || '').toLowerCase() === name.toLowerCase() || (h.name || '').toLowerCase() === name.toLowerCase())
              : (headers[name] || headers[name.toLowerCase()]);
            if (!found) throw new Error(`AssertionError: expected header '${name}' to be present`);
            return found;
          }
        }
      }
    };

    pm.response = responseForSandbox;
    pm.console.log("Running post-request script...");

    try {
      const fn = new AsyncFunction('pm', 'response', 'tv4', '"use strict";\n' + activeTabData.postScript);
      const tv4Safe = (typeof window !== 'undefined' && window.tv4) ? window.tv4 : {};
      await fn(pm, responseForSandbox, tv4Safe);
    } catch (err) {
      pm.console.error(`[Post-Script Error] ${err?.message || err}`);
      // do not rethrow — keep going so tests/logs are captured
    }
  }

  // -------------------------------------------------------------------------
  // Prepare in-memory environment/global variables (array shape expected by backend)
  // -------------------------------------------------------------------------
  const activeEnv = allEnvironments.find(e => e.id === selectedEnvId);
  const originalEnvVars = deepClone(activeEnv?.variables || []);
  // Copy by value so scripts can mutate inMemoryEnvVars (array of {key, value})
  const inMemoryEnvVars = deepClone(originalEnvVars);

  // Global variables array in your app: assume globalVariables?.variables or empty array
  const originalGlobalVars = deepClone(globalVariables?.variables || []);
  const inMemoryGlobalVars = deepClone(originalGlobalVars);

  let scriptLogs = [];
  const log = (...args) => {
    const line = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    scriptLogs.push(line);
  };

  // sub-request handler (not required now, but present — executes Proxy as subrequest)
  const sendSubRequest = async (requestConfig) => {
    log(`[SCRIPT] Sending chained request to ${String(requestConfig?.url)}`);
    const subPayload = prepareSingleRequestPayload(
      {
        ...activeTabData,
        url: requestConfig.url,
        method: requestConfig.method || activeTabData.method,
        body: requestConfig.body ? { mode: 'raw', raw: requestConfig.body } : null,
        headers: requestConfig.headers || activeTabData.headers
      },
      inMemoryEnvVars,
      inMemoryGlobalVars
    );

    const subResult = await Proxy(subPayload, activeTabId, selectedEnvId, true);
    return {
      json: () => (typeof subResult.body === 'string' ? JSON.parse(subResult.body) : subResult.body),
      text: () => (typeof subResult.body === 'string' ? subResult.body : JSON.stringify(subResult.body)),
      status: subResult.responseInfo?.statusCode ?? 0,
    };
  };

  // create pm sandbox instance
  const pm = buildPmSandbox({
    inMemoryEnvVars,
    inMemoryGlobalVars,
    log,
    sendSubRequest
  });

  try {
    // Run pre-script (can mutate inMemoryEnvVars / inMemoryGlobalVars)
    await runPreRequestScript(activeTabData, pm);

    // Prepare payload for main request using mutated inMemory var arrays
    const payload = prepareSingleRequestPayload(activeTabData, inMemoryEnvVars, inMemoryGlobalVars);

    log(`Sending main request to ${payload.url}...`);
    const result = await Proxy(payload, activeTabId, selectedEnvId);
    const duration = Date.now() - startTime;

    // Run post-script with pm.response available
    await runPostRequestScript(activeTabData, pm, result, duration);

    // Save History (unchanged fields)
    try {
      await historyController.createHistory({
        userId: user?.id || "dummyUser",
        workspaceId: selectedWorkspace?.id,
        requestId: activeTabId,
        url: payload.url,
        method: payload.method,
        statusCode: result.responseInfo?.statusCode || 0,
        request: mapStateToApiRequest(activeTabData),
        response: result,
        duration: result?.timingInfo?.duration || `${duration}`,
        createdAt: Math.floor(Date.now() / 1000),
      });
    } catch (errHistory) {
      log('historyController.createHistory error: ' + (errHistory?.message || String(errHistory)));
    }

    // Dispatch success with test results and script logs
    dispatch({
      type: ActionTypes.SET_RESPONSE,
      payload: {
        tabId: activeTabId,
        response: result,
        testResults: pm.testResults,
        scriptLogs
      },
    });

    // Sync Changed Environment: compare original array to inMemory array
    if (!deepEqual(originalEnvVars, inMemoryEnvVars)) {
      log("Environment variables changed. Syncing to backend...");

      // Build updated environments array for backend: keep other environments unmodified
      const updatedEnvironments = allEnvironments.map(env => {
        if (env.id === selectedEnvId) {
          // we must send back variables in same array-of-{key,value} shape
          return {
            ...env,
            variables: inMemoryEnvVars.map(v => ({ key: String(v.key), value: String(v.value) }))
          };
        }
        return env;
      });

      // Build backend payload: workspaceId + environments with id,name,variables
      const updatePayload = {
        workspaceId: selectedWorkspace?.id,
        environments: updatedEnvironments.map(env => ({
          id: env.id,
          name: env.name,
          variables: env.variables,
          isNew: !!env.isNew || false
        }))
      };

      try {
        await updateEnvironmentsOnBackend(updatePayload);
        log("Backend sync complete.");
      } catch (errSync) {
        log("Failed to sync environments: " + (errSync?.message || String(errSync)));
      }
    }

  } catch (error) {
    // Error flow
    const duration = Date.now() - startTime;
    const statusCode = error.response?.status ?? (error.name === 'AssertionError' ? 'TEST_FAIL' : 0);
    const responseData = error.response?.data || { error: error.message };

    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        tabId: activeTabId,
        error: {
          type: error.name || "RequestError",
          message: error.message || "An unknown error occurred",
          details: error.stack || "",
          statusCode,
          response: responseData,
        },
        testResults: pm.testResults,
        scriptLogs
      },
    });

    try {
      // Attempt to save error history (best-effort)
      await historyController.createHistory({
        userId: user?.id || "dummyUser",
        workspaceId: selectedWorkspace?.id,
        requestId: activeTabId,
        url: activeTabData?.url || "N/A",
        method: activeTabData?.method || "GET",
        statusCode,
        request: mapStateToApiRequest(activeTabData),
        response: responseData,
        duration: `${duration}`,
        createdAt: Math.floor(Date.now() / 1000),
      });
    } catch (errHistory2) {
      log('historyController.createHistory (error) error: ' + (errHistory2?.message || String(errHistory2)));
    }
  } finally {
    dispatch({
      type: ActionTypes.SET_LOADING,
      payload: { tabId: activeTabId, loading: false },
    });
    refreshHistory();
  }
}, [
  activeTabId,
  activeTabData,
  selectedEnvId,
  allEnvironments,
  globalVariables,
  selectedWorkspace?.id,
  user?.id,
  Proxy,
  dispatch,
  historyController,
  refreshHistory,
  prepareSingleRequestPayload,
  updateEnvironmentsOnBackend,
  mapStateToApiRequest
]);
