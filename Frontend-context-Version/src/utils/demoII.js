
import deepClone from "./deepClone";
import deepEqual from "./deepEqual";


// --------- ENVIRONMENT MANAGER ----------
function ObjectID() {
  return {
    toHexString: () => Math.random().toString(16).substring(2, 26),
  };
}

// Initial environments (like backend structure)
let environments = [
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
    ],
  },
];

// Postman-like Environment Manager
const environmentManager = {
  currentEnv: "Production1",

  setActive(name) {
    const found = environments.find((e) => e.name === name);
    if (found) {
      this.currentEnv = name;
      console.log(`✅ Active environment set to: ${name}`);
    } else {
      console.log(`⚠️ Environment '${name}' not found.`);
    }
  },

  createNewEnvironment(name) {
    const tempId = new ObjectID().toHexString();
    const newEnv = {
      id: tempId,
      name,
      variables: [],
      isNew: true,
    };
    environments.push(newEnv);
    console.log(`🆕 Created new environment: ${name}`);
    return newEnv;
  },

  set(key, value) {
    let env = environments.find((e) => e.name === this.currentEnv);
    if (!env) env = this.createNewEnvironment(this.currentEnv);

    const existingVar = env.variables.find((v) => v.key === key);
    if (existingVar) {
      existingVar.value = value;
      console.log(`✏️ Updated '${key}' in '${env.name}' → '${value}'`);
    } else {
      env.variables.push({ key, value });
      console.log(`➕ Added '${key}'='${value}' to '${env.name}'`);
    }
  },

  get(key) {
    const env = environments.find((e) => e.name === this.currentEnv);
    if (!env) return null;
    const variable = env.variables.find((v) => v.key === key);
    return variable ? variable.value : null;
  },

  showAll() {
    console.log("\n--- 🌍 All Environments ---");
    console.dir(environments, { depth: null });
  },
};

// --------- REPLACE HELPERS ----------
function replaceInString(str, lookup) {
  return String(str).replace(/\{\{(.+?)\}\}/g, (_, key) => {
    const k = key.trim();
    return lookup[k] != null ? lookup[k] : '';
  });
}

// --------- PM SANDBOX BUILDER ----------
function buildPmSandbox({ response }) {
  const logs = [];
  const testResults = [];

  const makeLogger = (level) => (...args) => {
    const entry = { level, time: new Date().toISOString(), message: args.map(String).join(' ') };
    logs.push(entry);
    console.log(`[PM ${level}]`, entry.message);
  };

  const pm = {
    environment: {
      get: (k) => environmentManager.get(k),
      set: (k, v) => environmentManager.set(k, v),
      setActive: (name) => environmentManager.setActive(name),
      all: () => {
        const env = environments.find((e) => e.name === environmentManager.currentEnv);
        return env ? env.variables : [];
      },
    },

    console: {
      log: makeLogger('info'),
      warn: makeLogger('warn'),
      error: makeLogger('error'),
      _getLogs: () => logs.slice(),
    },

    response: {
      _raw: response,
      json: () => (typeof response.body === 'string' ? JSON.parse(response.body) : response.body),
      code: response.status,
      status: response.statusText,
      headers: response.headers || {},
    },

    test: (name, fn) => {
      const record = { name, pass: false, error: null };
      try {
        fn();
        record.pass = true;
        pm.console.log(`[PASS] ${name}`);
      } catch (err) {
        record.pass = false;
        record.error = err.message;
        pm.console.error(`[FAIL] ${name} — ${err.message}`);
      }
      testResults.push(record);
    },

    expect: (actual) => ({
      to: {
        eql: (expected) => {
          if (!deepEqual(actual, expected))
            throw new Error(`Expected ${actual} to eql ${expected}`);
        },
      },
    }),

    _getTestResults: () => testResults.slice(),
  };

  return pm;
}

// --------- SCRIPT RUNNER ----------
async function runScript(scriptCode, pm) {
  if (!scriptCode || !scriptCode.toString().trim()) return;
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  try {
    const fn = new AsyncFunction('pm', '"use strict";\n' + scriptCode);
    await fn(pm);
  } catch (err) {
    pm.console.error('Script error: ' + err.message);
  }
}

// --------- DEMO ---------
const response = {
  status: 200,
  statusText: 'OK',
  body: JSON.stringify({ msg: "Hello Rajan" }),
  headers: { 'content-type': 'application/json' },
};

const preScript = `
pm.console.log("🟡 Pre-request running...");
pm.environment.set("authHeader", "Bearer " + pm.environment.get("token"));
pm.environment.setActive("dev");
pm.environment.set("authHeader", "Bearer " + pm.environment.get("token"));
pm.console.log("Auth header created for:", pm.environment.get("authHeader"));
`;

const postScript = `
pm.console.log("🟢 Post-request running...");
const data = pm.response.json();
pm.test("status is 200", () => {
  pm.expect(pm.response.code).to.eql(200);
});
pm.test("message exists", () => {
  pm.expect(data.msg).to.eql("Hello Rajan");
});
pm.dev.set("lastMessage", data.msg);
`;

// --------- RUN FULL FLOW ----------
(async () => {
  console.log("\n=== SANDBOX TEST START ===\n");

  const pm = buildPmSandbox({ response });

  await runScript(preScript, pm);
  await runScript(postScript, pm);

  console.log("\n--- ✅ FINAL OUTPUT ---");
  console.log("\n[Logs]");
  pm.console._getLogs().forEach(l => console.log(`${l.time} [${l.level}] ${l.message}`));

  console.log("\n[Test Results]");
  console.table(pm._getTestResults());

  console.log("\n[All Environments]");
  environmentManager.showAll();

  console.log("\n=== END ===");
})();
