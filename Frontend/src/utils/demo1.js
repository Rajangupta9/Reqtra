// Run: node sandbox-environment-runner.js

import deepClone from "./deepClone.js";
import deepEqual from "./deepEqual.js";

// --- STEP 1: Static environments dataset ---
const allEnvironments = [
  {
    id: "68c80a2abea096c353b9cab7",
    workspace: "68c2795b9ae8b628c91afaa6",
    name: "Production1",
    variables: [
      { key: "baseURL", value: "https://dapi.egrowthengine.com/v1" },
      { key: "token", value: "PROD_TOKEN_123" },
      { key: "email", value: "faizan@tezminds.com" },
      { key: "pass", value: "Faizan@123" },
      { key: "workspaceId", value: "68c2795b9ae8b628c91afaa6" },
    ],
  },
  {
    id: "68d113839b233d7785529af5",
    workspace: "68c2795b9ae8b628c91afaa6",
    name: "dev",
    variables: [
      { key: "baseURL", value: "https://dev.egrowthengine.com/v1" },
      { key: "token", value: "DEV_TOKEN_999" },
      { key: "mode", value: "development" },
    ],
  },
  {
    id: "68fb258baf825ec3e117e367",
    workspace: "68c2795b9ae8b628c91afaa6",
    name: "rajan",
    variables: [],
  },
];

// --- STEP 2: Helpers ---
function replaceInString(str, lookup) {
  return String(str).replace(/\{\{(.+?)\}\}/g, (_, key) => {
    const k = key.trim();
    return lookup[k] != null ? lookup[k] : "";
  });
}
function deepReplace(obj, lookup) {
  if (obj === null || typeof obj !== "object") {
    if (typeof obj === "string") return replaceInString(obj, lookup);
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((v) => deepReplace(v, lookup));
  const out = {};
  for (const k in obj) out[k] = deepReplace(obj[k], lookup);
  return out;
}

// --- STEP 3: Build pm sandbox ---
function buildPmSandbox({ response, allEnvData, activeEnvName, globals = {} }) {
  const logs = [];
  const testResults = [];

  // Store each environment as a full object (with id, workspace, name, vars)
  const environmentStores = {};
  allEnvData.forEach((env) => {
    const map = {};
    env.variables.forEach((v) => (map[v.key] = v.value));
    environmentStores[env.name] = {
      id: env.id,
      workspace: env.workspace,
      name: env.name,
      variables: deepClone(map),
    };
  });

  const makeLogger = (level) => (...args) => {
    const entry = { level, time: new Date().toISOString(), message: args.map(String).join(" ") };
    logs.push(entry);
    console.log(`[PM]`, entry.time, `[${level.toUpperCase()}]`, entry.message);
  };

  const pm = {
    // --- ENVIRONMENT API ---
    environment: {
      get: (k) => environmentStores[activeEnvName]?.variables[k],
      set: (k, v) => {
        makeLogger("info")(`[ENV:${activeEnvName}] set ${k} = ${v}`);
        environmentStores[activeEnvName].variables[k] = String(v);
      },
      unset: (k) => {
        makeLogger("info")(`[ENV:${activeEnvName}] unset ${k}`);
        delete environmentStores[activeEnvName].variables[k];
      },
      all: () => ({ ...environmentStores[activeEnvName].variables }),
      setInEnv: (envName, key, val) => {
        if (!environmentStores[envName]) throw new Error(`Env ${envName} not found`);
        makeLogger("info")(`[ENV:${envName}] set ${key} = ${val}`);
        environmentStores[envName].variables[key] = String(val);
      },
      allEnvs: () => deepClone(environmentStores),
    },

    // --- GLOBALS API ---
    globals: {
      get: (k) => globals[k],
      set: (k, v) => {
        makeLogger("info")(`[GLOBAL] set ${k} = ${v}`);
        globals[k] = String(v);
      },
      unset: (k) => {
        makeLogger("info")(`[GLOBAL] unset ${k}`);
        delete globals[k];
      },
      all: () => ({ ...globals }),
    },

    // --- VARIABLE HELPER API ---
    variables: {
      get: (k) =>
        environmentStores[activeEnvName]?.variables[k] ?? globals[k],
      set: (k, v) => pm.environment.set(k, v),
      replaceIn: (input) => {
        const lookup = {
          ...globals,
          ...environmentStores[activeEnvName].variables,
        };
        if (typeof input === "string") return replaceInString(input, lookup);
        return deepReplace(input, lookup);
      },
    },

    // --- RESPONSE MOCK ---
    response: {
      json: () => JSON.parse(response.body || "{}"),
      code: response.status,
      status: response.statusText,
      headers: response.headers || {},
    },

    // --- TEST & EXPECT ---
    test: (name, fn) => {
      const start = Date.now();
      const record = { name, pass: false, error: null, duration: 0 };
      try {
        const res = fn();
        if (res instanceof Promise) {
          return res
            .then(() => {
              record.pass = true;
              record.duration = Date.now() - start;
              testResults.push(record);
              makeLogger("info")(`✅ PASS: ${name}`);
            })
            .catch((err) => {
              record.error = err.message;
              testResults.push(record);
              makeLogger("error")(`❌ FAIL: ${name} — ${err.message}`);
            });
        }
        record.pass = true;
        record.duration = Date.now() - start;
        testResults.push(record);
        makeLogger("info")(`✅ PASS: ${name}`);
      } catch (err) {
        record.error = err.message;
        testResults.push(record);
        makeLogger("error")(`❌ FAIL: ${name} — ${err.message}`);
      }
    },

    expect: (val) => ({
      to: {
        eql: (exp) => {
          if (!deepEqual(val, exp))
            throw new Error(
              `Expected ${JSON.stringify(val)} to equal ${JSON.stringify(exp)}`
            );
        },
      },
    }),

    console: {
      log: makeLogger("info"),
      warn: makeLogger("warn"),
      error: makeLogger("error"),
      _getLogs: () => logs.slice(),
    },

    _getTestResults: () => testResults.slice(),
    _getAllEnvStores: () => deepClone(environmentStores),
  };

  return pm;
}

// --- STEP 4: Async script runner ---
async function runScript(script, pm) {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const fn = new AsyncFunction("pm", '"use strict";\n' + script);
  await fn(pm);
}

// --- STEP 5: Response and scripts ---
const response = {
  status: 200,
  statusText: "OK",
  body: JSON.stringify({ message: "Welcome Rajan!", userId: 42 }),
  headers: { "content-type": "application/json" },
};

const preRequestScript = `
pm.console.log("Pre-Request Script Running...");
pm.environment.set("authHeader", "Bearer " + pm.environment.get("token"));
pm.environment.setInEnv("dev", "newDevToken", "DEV_NEW_777");
`;

const postRequestScript = `
pm.console.log("Post-Request Script Running...");
const data = pm.response.json();
pm.test("status should be 200", () => pm.expect(pm.response.code).to.eql(200));
pm.test("message should be Welcome Rajan!", () => pm.expect(data.message).to.eql("Welcome Rajan!"));
pm.environment.set("lastMessage", data.message);
`;

// --- STEP 6: Execute full flow ---
(async () => {
  console.log("\n=== 🌍 Environment Sandbox Demo ===\n");

  const activeEnvName = "Production1";
  const globals = { session: "GLOBAL_SESSION_1" };

  const pm = buildPmSandbox({
    response,
    allEnvData: allEnvironments,
    activeEnvName,
    globals,
  });

  await runScript(preRequestScript, pm);
  await runScript(postRequestScript, pm);

  console.log("\n--- ✅ Test Results ---");
  console.table(pm._getTestResults());

  console.log("\n--- 🌱 All Environments After Update ---");
  console.dir(pm._getAllEnvStores(), { depth: null });

  // --- STEP 7: Build backend update payload ---
  const finalAllEnv = pm._getAllEnvStores();
  const backendPayload = Object.values(finalAllEnv).map((env) => ({
    id: env.id,
    workspace: env.workspace,
    name: env.name,
    variables: Object.entries(env.variables).map(([key, value]) => ({
      key,
      value,
    })),
  }));

  console.log("\n--- 📦 Final Backend Payload ---");
  console.dir(backendPayload, { depth: null });
})();
