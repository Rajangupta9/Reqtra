import deepClone from "./deepClone";
import deepEqual from "./deepEqual";


// --- STEP 1: Define Async Sandbox ---

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

 //Builds the Postman-like pm sandbox for script execution.
function buildPmSandbox({
  inMemoryEnvVars,
  inMemoryGlobalVars,
  log,
  sendSubRequest
}) {
  let testResults = [];

  const pm = {
    // --- Environment Variables ---
    environment: {
      get: (key) => inMemoryEnvVars.find(v => v.key === key)?.value,
      set: (key, value) => {
        log(`[ENV] Setting "${key}" = "${value}"`);
        const existing = inMemoryEnvVars.find(v => v.key === key);
        if (existing) existing.value = String(value);
        else inMemoryEnvVars.push({ key: String(key), value: String(value) });
      },
      unset: (key) => {
        log(`[ENV] Unsetting "${key}"`);
        inMemoryEnvVars = inMemoryEnvVars.filter(v => v.key !== key);
      }
    },

    // --- Global Variables ---
    globals: {
      get: (key) => inMemoryGlobalVars.find(v => v.key === key)?.value,
      set: (key, value) => {
        log(`[GLOBAL] Setting "${key}" = "${value}"`);
        const existing = inMemoryGlobalVars.find(v => v.key === key);
        if (existing) existing.value = String(value);
        else inMemoryGlobalVars.push({ key: String(key), value: String(value) });
      },
      unset: (key) => {
        log(`[GLOBAL] Unsetting "${key}"`);
        inMemoryGlobalVars = inMemoryGlobalVars.filter(v => v.key !== key);
      }
    },

    // --- Variable Helper (prefers environment over globals) ---
    variables: {
      get: (key) => pm.environment.get(key) ?? pm.globals.get(key),
      set: (key, value) => pm.environment.set(key, value)
    },

    // --- sendRequest (sub-request chaining) ---
    sendRequest: sendSubRequest,

    // --- Test Harness ---
    testResults,
    test: (testName, callback) => {
      try {
        callback();
        testResults.push({ name: testName, pass: true });
        log(`[PASS] ${testName}`);
      } catch (error) {
        testResults.push({ name: testName, pass: false, error: error.message });
        log(`[FAIL] ${testName}: ${error.message}`);
      }
    },
    expect: (actual) => ({
      to: {
        include: (expected) => {
          if (!actual?.includes?.(expected))
            throw new Error(`AssertionError: expected '${actual}' to include '${expected}'`);
        },
        eql: (expected) => {
          if (!deepEqual(actual, expected))
            throw new Error(`AssertionError: expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`);
        },
        be: {
          below: (max) => {
            if (typeof actual !== 'number' || actual >= max)
              throw new Error(`AssertionError: expected ${actual} to be below ${max}`);
          },
          oneOf: (arr) => {
            if (!Array.isArray(arr) || !arr.includes(actual))
              throw new Error(`AssertionError: expected ${actual} to be one of [${arr.join(', ')}]`);
          }
        }
      }
    }),

    // --- Logging ---
    console: { log, warn: log, error: log },

    // --- Response Placeholder ---
    response: null
  };

  return pm;
}

// --- STEP 2: Pre-Request Script Execution ---
async function runPreRequestScript(activeTabData, pm) {
  if (!activeTabData?.preScript) return;

  pm.console.log("Running pre-request script...");
  try {
    const fn = new AsyncFunction('pm', '"use strict";\n' + activeTabData.preScript);
    await fn(pm);
  } catch (err) {
    pm.console.error(`[Pre-Script Error] ${err.message}`);
    throw err; // Stop request if pre-script fails
  }
}

// --- STEP 3: Post-Request Script Execution ---
async function runPostRequestScript(activeTabData, pm, response, duration) {
  if (!activeTabData?.postScript) return;

  const responseForSandbox = {
    _raw: response,
    status: response.responseInfo.statusCode,
    statusText: response.responseInfo.statusText,
    headers: response.responseInfo.headers,
    responseTime: duration,
    body: response.body,
    json: () => (typeof response.body === 'string' ? JSON.parse(response.body) : response.body),
    text: () => (typeof response.body === 'string' ? response.body : JSON.stringify(response.body)),
    to: {
      have: {
        status: (expectedStatus) => {
          if (response.responseInfo.statusCode !== expectedStatus)
            throw new Error(`AssertionError: expected status ${expectedStatus} but got ${response.responseInfo.statusCode}`);
        },
        body: (expectedBody) => {
          const actualBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
          if (actualBody !== expectedBody)
            throw new Error(`AssertionError: expected body '${expectedBody}' but got '${actualBody}'`);
        },
        header: (headerName) => {
          const hasHeader = response.responseInfo.headers.some(
            h => h.key.toLowerCase() === headerName.toLowerCase()
          );
          if (!hasHeader)
            throw new Error(`AssertionError: expected header '${headerName}' to be present`);
        }
      }
    }
  };

  pm.response = responseForSandbox;
  pm.console.log("Running post-request script...");

  try {
    const fn = new AsyncFunction('pm', 'response', 'tv4', '"use strict";\n' + activeTabData.postScript);
    const tv4Safe = typeof window !== "undefined" && window.tv4 ? window.tv4 : {};
    await fn(pm, responseForSandbox, tv4Safe);
  } catch (err) {
    pm.console.error(`[Post-Script Error] ${err.message}`);
  }
}

// --- STEP 4: Main sendRequest Handler ---
const sendRequest = useCallback(async () => {
  if (!activeTabId || !activeTabData) return;

  dispatch({
    type: ActionTypes.SET_LOADING,
    payload: { tabId: activeTabId, loading: true },
  });

  const startTime = Date.now();
  const activeEnv = allEnvironments.find(e => e.id === selectedEnvId);

  // Create deep copies
  const originalEnvVars = deepClone(activeEnv?.variables || []);
  const inMemoryEnvVars = deepClone(originalEnvVars);
  const inMemoryGlobalVars = deepClone(globalVariables?.variables || []);

  let scriptLogs = [];
  const log = (...args) => scriptLogs.push(args.map(String).join(' '));

  // Sub-request handler
  const sendSubRequest = async (requestConfig) => {
    log(`[SCRIPT] Sending chained request to ${requestConfig.url}`);

    const subPayload = prepareSingleRequestPayload(
      {
        ...activeTabData,
        url: requestConfig.url,
        method: requestConfig.method,
        body: requestConfig.body ? { mode: 'raw', raw: requestConfig.body } : null
      },
      inMemoryEnvVars,
      inMemoryGlobalVars
    );

    const subResult = await Proxy(subPayload, activeTabId, selectedEnvId, true);

    return {
      json: () => (typeof subResult.body === 'string' ? JSON.parse(subResult.body) : subResult.body),
      text: () => (typeof subResult.body === 'string' ? subResult.body : JSON.stringify(subResult.body)),
      status: subResult.responseInfo.statusCode,
    };
  };

  const pm = buildPmSandbox({
    inMemoryEnvVars,
    inMemoryGlobalVars,
    log,
    sendSubRequest
  });

  try {
    // --- Run Pre-Script ---
    await runPreRequestScript(activeTabData, pm);

    // --- Prepare Main Request ---
    const payload = prepareSingleRequestPayload(activeTabData, inMemoryEnvVars, inMemoryGlobalVars);

    log(`Sending main request to ${payload.url}...`);
    const result = await Proxy(payload, activeTabId, selectedEnvId);
    const duration = Date.now() - startTime;

    // --- Run Post-Script ---
    await runPostRequestScript(activeTabData, pm, result, duration);

    // --- Save History ---
    await historyController.createHistory({
      userId: user?.id || "dummyUser",
      workspaceId: selectedWorkspace?.id,
      requestId: activeTabId,
      url: payload.url,
      method: payload.method,
      statusCode: result.responseInfo.statusCode || 0,
      request: mapStateToApiRequest(activeTabData),
      response: result,
      duration: result?.timingInfo?.duration || `${duration}`,
      createdAt: Math.floor(Date.now() / 1000),
    });

    // --- Dispatch Success ---
    dispatch({
      type: ActionTypes.SET_RESPONSE,
      payload: {
        tabId: activeTabId,
        response: result,
        testResults: pm.testResults,
        scriptLogs
      },
    });

    // --- Sync Changed Environment ---
    if (!deepEqual(originalEnvVars, inMemoryEnvVars)) {
      log("Environment variables changed. Syncing to backend...");

      const updatedEnvironments = allEnvironments.map(env =>
        env.id === selectedEnvId
          ? { ...env, variables: inMemoryEnvVars }
          : env
      );

      const updatePayload = {
        workspaceId: selectedWorkspace?.id,
        environments: updatedEnvironments.map(env => ({
          id: env.id,
          name: env.name,
          variables: env.variables,
          isNew: false
        }))
      };

      await updateEnvironmentsOnBackend(updatePayload);
      log("Backend sync complete.");
    }

  } catch (error) {
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
