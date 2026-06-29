import deepClone from "./deepClone";
import deepEqual from "./deepEqual";

function replaceInString(str, lookup) {
  return String(str).replace(/\{\{(.+?)\}\}/g, (_, key) => {
    const k = key.trim();
    return lookup[k] != null ? lookup[k] : '';
  });
}

function deepReplace(obj, lookup) {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') return replaceInString(obj, lookup);
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((v) => deepReplace(v, lookup));
  const out = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = deepReplace(obj[k], lookup);
  }
  return out;
}

// --------- PM Sandbox builder ----------
function buildPmSandbox({ response, environment = {}, globals = {} }) {
  // internal stores (cloned so original static input stays unchanged)
  const envStore = deepClone(environment);
  const globalStore = deepClone(globals);
  const logs = [];
  const testResults = [];

  // logger (records to array and stdout)
  const makeLogger = (level) => (...args) => {
    const entry = { level, time: new Date().toISOString(), message: args.map(String).join(' ') };
    logs.push(entry);
    // also print to console for immediate visibility
    if (level === 'error') console.error('[PM]', entry.time, entry.message);
    else if (level === 'warn') console.warn('[PM]', entry.time, entry.message);
    else console.log('[PM]', entry.time, entry.message);
  };

  const pm = {
    environment: {
      get: (k) => envStore[k],
      set: (k, v) => {
        logs.push({ level: 'info', time: new Date().toISOString(), message: `[ENV] set ${k} = ${v}` });
        envStore[k] = String(v);
      },
      unset: (k) => {
        logs.push({ level: 'info', time: new Date().toISOString(), message: `[ENV] unset ${k}` });
        delete envStore[k];
      },
      all: () => ({ ...envStore }),
    },

    globals: {
      get: (k) => globalStore[k],
      set: (k, v) => {
        logs.push({ level: 'info', time: new Date().toISOString(), message: `[GLOBAL] set ${k} = ${v}` });
        globalStore[k] = String(v);
      },
      unset: (k) => {
        logs.push({ level: 'info', time: new Date().toISOString(), message: `[GLOBAL] unset ${k}` });
        delete globalStore[k];
      },
      all: () => ({ ...globalStore }),
    },

    variables: {
      // variable resolution: env first then global
      get: (k) => (envStore[k] != null ? envStore[k] : globalStore[k]),
      set: (k, v) => pm.environment.set(k, v),
      replaceIn: (input) => {
        const lookup = { ...globalStore, ...envStore };
        if (typeof input === 'string') return replaceInString(input, lookup);
        return deepReplace(input, lookup);
      },
    },

    console: {
      log: makeLogger('info'),
      warn: makeLogger('warn'),
      error: makeLogger('error'),
      _getLogs: () => logs.slice(),
    },

    _internal: { _logsArray: logs, _testResultsArray: testResults },

    response: {
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
      // helper assertion DSL on response (similar to pm.response.to.have)
      to: {
        have: {
          status: (expected) => {
            if (response.status !== expected) throw new Error(`Expected status ${expected} but got ${response.status}`);
          },
          header: (name) => {
            const found = (response.headers || {})[name] || (response.headers || {})[name.toLowerCase()];
            if (found === undefined) throw new Error(`Expected header ${name} to be present`);
            return found;
          },
          body: (expectedString) => {
            const text = (typeof response.body === 'string') ? response.body : JSON.stringify(response.body);
            if (!text.includes(expectedString)) throw new Error(`Expected response body to include '${expectedString}'`);
          },
        }
      }
    },

    // Test harness: supports sync or async callbacks
    test: (name, fn) => {
      const started = Date.now();
      const record = { name, pass: false, duration: 0, error: null, timestamp: new Date().toISOString() };
      try {
        const maybePromise = fn();
        if (maybePromise && typeof maybePromise.then === 'function') {
          // async test
          return maybePromise
            .then(() => {
              record.pass = true;
              record.duration = Date.now() - started;
              testResults.push(record);
              pm.console.log(`[PASS] ${name}`);
            })
            .catch((err) => {
              record.pass = false;
              record.duration = Date.now() - started;
              record.error = err && err.message ? err.message : String(err);
              testResults.push(record);
              pm.console.error(`[FAIL] ${name} — ${record.error}`);
            });
        } else {
          // sync test
          record.pass = true;
          record.duration = Date.now() - started;
          testResults.push(record);
          pm.console.log(`[PASS] ${name}`);
        }
      } catch (err) {
        record.pass = false;
        record.duration = Date.now() - started;
        record.error = err && err.message ? err.message : String(err);
        testResults.push(record);
        pm.console.error(`[FAIL] ${name} — ${record.error}`);
      }
    },

    expect: (actual) => ({
      to: {
        eql: (expected) => {
          if (!deepEqual(actual, expected)) throw new Error(`AssertionError: expected ${JSON.stringify(actual)} to deep equal ${JSON.stringify(expected)}`);
        },
        include: (expected) => {
          if (!String(actual).includes(expected)) throw new Error(`AssertionError: expected '${actual}' to include '${expected}'`);
        },
        above: (n) => {
          if (typeof actual !== 'number' || actual <= n) throw new Error(`AssertionError: expected ${actual} to be above ${n}`);
        },
        below: (n) => {
          if (typeof actual !== 'number' || actual >= n) throw new Error(`AssertionError: expected ${actual} to be below ${n}`);
        },
        oneOf: (arr) => {
          if (!Array.isArray(arr) || !arr.includes(actual)) throw new Error(`AssertionError: expected ${actual} to be one of [${arr.join(', ')}]`);
        }
      }
    }),

    // small util exposed
    utils: {
      parseJsonSafely: (s) => {
        try { return JSON.parse(s); } catch { return null; }
      }
    },

    // expose results getter for UI
    _getTestResults: () => testResults.slice(),
  };

  return pm;
}

// --------- Script runner using AsyncFunction ----------
async function runScript(scriptCode, pm) {
  if (!scriptCode || !scriptCode.toString().trim()) return;
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  try {
    const fn = new AsyncFunction('pm', '"use strict";\n' + scriptCode);
    // run and await (so async scripts can use await)
    await fn(pm);
  } catch (err) {
    pm.console.error('Script execution error: ' + (err && err.stack ? err.stack : err.message || String(err)));
  }
}

// --------- Static demo data ----------
const environment = {
  token: 'ABC123',
  baseUrl: 'https://api.example.com',
  user: 'Rajan'
};

const globals = {
  session: 'S1'
};

// simulated response
const response = {
  status: 200,
  statusText: 'OK',
  body: JSON.stringify({ message: 'Hello Rajan!', userId: 99, meta: { roles: ['admin'] } }),
  headers: { 'content-type': 'application/json', 'x-request-id': 'req-1' }
};

// --------- Example advanced scripts ----------
const preRequestScript = `
// pre: show env, set a new env variable, and do a complex replace
pm.console.log("Pre: user =", pm.environment.get("user"));
pm.environment.set("authHeader", "Bearer " + pm.environment.get("token"));
pm.console.log("Pre: authHeader set");

const replaced = pm.variables.replaceIn({
  url: "{{baseUrl}}/users/{{user}}",
  headers: { Authorization: "{{authHeader}}" }
});
pm.console.log("Pre: replaced payload =>", JSON.stringify(replaced));
`;

const postRequestScript = `
// post: inspect response, run sync + async tests, use expect matchers
pm.console.log("Post: response status =", pm.response.code);
const data = pm.response.json();
pm.console.log("Post: response json", data);

// sync test
pm.test("status is 200", () => {
  pm.expect(pm.response.code).to.eql(200);
});

// async test (simulate some async validation)
pm.test("userId matches expected async", async () => {
  // pretend an async check
  await new Promise(r => setTimeout(r, 50));
  pm.expect(data.userId).to.eql(99);
});

// header check using response helper
pm.test("x-request-id present", () => {
  const header = pm.response.to.have.header("x-request-id");
  pm.expect(header).to.include("req");
});

// body contains message
pm.test("body contains Hello", () => {
  pm.response.to.have.body("Hello");
});
`;

// --------- Run the full flow ----------
(async () => {
  console.log("\n=== Advanced Sandbox Demo Starting ===\n");

  // Build sandbox
  const pm = buildPmSandbox({ response, environment, globals });

  // Run Pre-script
  console.log("\n--- Running Pre-Request Script ---");
  await runScript(preRequestScript, pm);

  // Simulate request (no network)
//   const resolvedUrl = pm.variables.replaceIn("{{baseUrl}}/hello");
//   console.log("\n[Simulated] Sending request to:", resolvedUrl);
//   console.log("[Simulated] Using header:", pm.environment.get("authHeader"));

  // Run Post-script
  console.log("\n--- Running Post-Request Script ---");
  await runScript(postRequestScript, pm);

  // Wait a short while for any async tests (they were awaited in pm.test)
  // (tests already awaited by runScript because pm.test returns promises when async)

  // Summary
  console.log("\n--- Summary ---");
  console.log("\n[Logs]");
  const rawLogs = pm.console._getLogs();
  rawLogs.forEach((l) => console.log(`${l.time} [${l.level.toUpperCase()}] ${l.message}`));

  console.log("\n[Test Results]");
  console.table(pm._getTestResults());

  console.log("\n[Final Environment]");
  console.log(pm.environment.all());

  console.log("\n[Final Globals]");
  console.log(pm.globals.all());

  console.log("\n=== Demo Finished ===\n");
})();
