// testScript.js
import { buildPmSandbox, runPreRequestScript, runPostRequestScript } from "./runScripts.js";

// Example environment data
const environments = [
  {
    id: "1",
    name: "Production",
    variables: [
      { key: "baseUrl", value: "https://api.example.com" },
      { key: "token", value: "123abc" },
    ],
  },
];

// Example tab data (like a Postman request tab)
const activeTabData = {
  preScript: `
    pm.environment.setActive("dev")
    pm.environment.set("userId", "42");
    pm.environment.set("authHeader", "Bearer " + pm.environment.get("token"));
    pm.globals.set("globalVar", "HelloWorld");
    pm.console.log("Pre-request: base URL is", pm.environment.get("baseUrl"));
  `,
  postScript: `
    pm.test("Status code is 200", function () {
      pm.expect(pm.response.status).to.eql(200);
    });

    pm.test("Response contains success", function () {
      pm.expect(pm.response.text()).to.include("success");
    });

    pm.console.log("Post-script: userId =", pm.environment.get("userId"));
  `,
};

// Create pm sandbox instance
const pm = buildPmSandbox({
  environments,
  activeEnvName: "Production",
  globalStore: {},
  response: null,
  sendSubRequest: async (req, callback) => {
    console.log("Mock subrequest sent:", req);
    callback({ status: 200, body: "success", headers: {} });
  },
});

// ---- Run the pre-request script ----
await runPreRequestScript(activeTabData, pm);

// Simulated HTTP response
const fakeResponse = {
  status: 200,
  statusText: "OK",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ message: "success" }),
};

// ---- Run the post-request script ----
await runPostRequestScript(activeTabData, pm, fakeResponse, 120);

// ---- Show results ----
console.log("\n✅ Environment after scripts:", pm.environment.all());
console.log("✅ Global variables:", pm.globals.all());
console.log("✅ Test results:", pm._getTestResults());
console.log("✅ Logs:", pm._getLogs());
console.log("✅ All environments:", environments);


