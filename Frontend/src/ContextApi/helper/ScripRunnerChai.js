import ObjectID from "bson-objectid";
import * as chai from "chai";

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

  const makeLogger = (level) => (...args) => {
    const message = args.map(String).join(' ');
    const entry = { level, time: new Date().toISOString(), message };
    logs.push(entry);
    externalLog(`[PM ${level.toUpperCase()}]`, message);
  };
  const log = makeLogger("info");

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
      const tempId = ObjectID().toHexString();
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

  const pm = {
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

    sendRequest: sendSubRequest,
    console: {
      log: makeLogger('info'),
      warn: makeLogger('warn'),
      error: makeLogger('error'),
      _getLogs: () => logs.slice(),
    },
    test: (name, fn) => {
      const started = Date.now();
      const record = { name, pass: false, duration: 0, error: null, timestamp: new Date().toISOString() };
      try {
        fn();
        record.pass = true;
      } catch (err) {
        record.pass = false;
        record.error = err.message;
      }
      record.duration = Date.now() - started;
      testResults.push(record);
    },

    //  Real Chai integration
    expect: chai.expect,
    assert: chai.assert,
    should: chai.should(),

    utils: {
      parseJsonSafely: (s) => {
        try { return JSON.parse(s); } catch { return null; }
      },
    },

    _getTestResults: () => testResults.slice(),
    _getLogs: () => logs.slice(),
    _getAllEnvironments: () => environments,
  };

  pm.request = {
    url: null,
    method: null,
    headers: {},
    body: null,
    setUrl(url) { this.url = url; },
    setMethod(method) { this.method = method.toUpperCase(); },
    setHeader(key, value) { this.headers[key] = value; },
    removeHeader(key) { delete this.headers[key]; },
    setBody(body) { this.body = body; },
    getHeader(key) { return this.headers[key]; },
    allHeaders() { return this.headers; },
    replaceIn(obj) { return pm.variables.replaceIn(obj); },
  };

  return pm;
}
