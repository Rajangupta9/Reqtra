const scriptTemplates = [


  {
    name: "Set Dynamic Timestamp",
    type: "pre",
    code: `pm.variables.set("timestamp", Date.now());
console.log("Timestamp:", pm.variables.get("timestamp"));`,
  },

  {
    name: "Generate Random Email",
    type: "pre",
    code: `const email = \`user_\${Date.now()}@example.com\`;
pm.environment.set("randomEmail", email);
console.log("Random email:", email);`,
  },

  {
    name: "Generate Random Username",
    type: "pre",
    code: `pm.environment.set("username", "user_" + Math.floor(Math.random() * 100000));
console.log("Username:", pm.environment.get("username"));`,
  },

  {
    name: "Generate UUID",
    type: "pre",
    code: `pm.environment.set("uuid", crypto.randomUUID());
console.log("UUID:", pm.environment.get("uuid"));`,
  },

//   {
//     name: "Add Bearer Token to Headers",
//     type: "pre",
//     code: `const token = pm.environment.get("authToken");
// if (token) {
//   pm.request.headers.add({ key: "Authorization", value: \`Bearer \${token}\` });
//   console.log("Authorization header added");
// } else {
//   console.warn("No auth token found");
// }`,
//   },

  {
    name: "Setup API Base URL",
    type: "pre",
    code: `const base = pm.environment.get("baseURL") || "https://api.example.com";
pm.variables.set("apiBase", base);
console.log("Using Base URL:", base);`,
  },

//   {
//     name: "Add Common Headers",
//     type: "pre",
//     code: `pm.request.headers.add({ key: "X-Client", value: "Postman-Auto" });
// pm.request.headers.add({ key: "X-Request-ID", value: crypto.randomUUID() });`,
//   },

  {
    name: "Set Workspace ID",
    type: "pre",
    code: `pm.variables.set("workspaceID", pm.environment.get("workspaceID") || "default");
console.log("Workspace ID set:", pm.variables.get("workspaceID"));`,
  },

//   {
//     name: "Hash Password Before Sending",
//     type: "pre",
//     code: `const crypto = require('crypto-js');
// const hashed = crypto.SHA256(pm.environment.get("password")).toString();
// pm.environment.set("hashedPassword", hashed);
// console.log("Password hashed");`,
//   },

//   {
//     name: "Add Timestamp & Signature Headers",
//     type: "pre",
//     code: `const timestamp = Date.now();
// const secret = pm.environment.get("apiSecret") || "defaultSecret";
// const signature = CryptoJS.HmacSHA256(timestamp.toString(), secret).toString();
// pm.request.headers.add({ key: "x-timestamp", value: timestamp.toString() });
// pm.request.headers.add({ key: "x-signature", value: signature });`,
//   },

//   {
//     name: "Conditional Token Injection",
//     type: "pre",
//     code: `if (!pm.request.url.includes("/login")) {
//   const token = pm.environment.get("authToken");
//   if (token) pm.request.headers.add({ key: "Authorization", value: \`Bearer \${token}\` });
// }`,
//   },

  {
    name: "Set Random Numbers",
    type: "pre",
    code: `pm.environment.set("randomInt", Math.floor(Math.random() * 10000));
pm.environment.set("randomFloat", Math.random().toFixed(4));`,
  },

//   {
//     name: "Dynamic Environment Switch",
//     type: "pre",
//     code: `const env = pm.environment.get("env") || "dev";
// pm.variables.set("baseURL", env === "prod" ? "https://api.prod.com" : "https://api.dev.com");
// console.log("Environment:", env);`,
//   },

  {
    name: "Chain Previous Response ID",
    type: "pre",
    code: `const lastID = pm.environment.get("lastCreatedID");
if (lastID) pm.variables.set("resourceID", lastID);
console.log("Using Resource ID:", lastID);`,
  },

//   {
//     name: "Reset Variables Before Run",
//     type: "pre",
//     code: `pm.variables.unset("errorMsg");
// pm.variables.unset("statusCode");
// console.log("Variables reset before request");`,
//   },

//   {
//     name: "Dynamic JSON Body",
//     type: "pre",
//     code: `const body = {
//   email: pm.environment.get("randomEmail"),
//   name: "Auto User",
//   timestamp: Date.now(),
// };
// pm.request.body.raw = JSON.stringify(body, null, 2);`,
//   },

//   {
//     name: "Log All Request Details",
//     type: "pre",
//     code: `console.log("Request URL:", pm.request.url.toString());
// console.log("Method:", pm.request.method);
// console.log("Headers:", pm.request.headers.toJSON());
// console.log("Body:", pm.request.body ? pm.request.body.raw : "No body");`,
//   },

  // ===========================================================
  // 🔹 POST-REQUEST SCRIPTS (Executed after response is received)
  // ===========================================================

  {
    name: "Check Status 200",
    type: "post",
    code: `pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});`,
  },

//   {
//     name: "Check Success Flag",
//     type: "post",
//     code: `pm.test("Response contains success=true", function () {
//   const res = pm.response.json();
//   pm.expect(res.success).to.eql(true);
// });`,
//   },

  {
    name: "Check Response Time < 1000ms",
    type: "post",
    code: `pm.test("Response time < 1000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});`,
  },

//   {
//     name: "Validate JSON Structure",
//     type: "post",
//     code: `pm.test("Response is JSON", function () {
//   pm.response.to.be.json;
// });`,
//   },

  {
    name: "Validate Required Keys",
    type: "post",
    code: `const res = pm.response.json();
pm.test("Response has expected fields", function () {
  pm.expect(res).to.have.property("data");
  pm.expect(res).to.have.property("message");
});`,
  },

  {
    name: "Extract Token",
    type: "post",
    code: `const res = pm.response.json();
if (res.token) {
  pm.environment.set("authToken", res.token);
  console.log("Token saved");
}`,
  },

//   {
//     name: "Extract User ID",
//     type: "post",
//     code: `const res = pm.response.json();
// if (res.data && res.data.userId) pm.environment.set("userId", res.data.userId);`,
//   },

//   {
//     name: "Extract Resource ID",
//     type: "post",
//     code: `const res = pm.response.json();
// if (res.data && res.data._id) pm.environment.set("lastCreatedID", res.data._id);`,
//   },

//   {
//     name: "Check Error Message Exists",
//     type: "post",
//     code: `pm.test("Error message exists when failed", function () {
//   if (pm.response.code !== 200) {
//     pm.expect(pm.response.json().message).to.exist;
//   }
// });`,
//   },

  {
    name: "Save Entire Response",
    type: "post",
    code: `pm.environment.set("lastResponse", pm.response.text());
console.log("Response saved");`,
  },

  {
    name: "Check Content-Type Header",
    type: "post",
    code: `pm.test("Content-Type is JSON", function () {
  pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});`,
  },

  {
    name: "Log Full Response",
    type: "post",
    code: `console.log("Status:", pm.response.status);
console.log("Headers:", pm.response.headers);
console.log("Body:", pm.response.text());`,
  },

  {
    name: "Check Authorization Error",
    type: "post",
    code: `if (pm.response.code === 401) {
  console.warn("Unauthorized access detected. Token may have expired.");
}`,
  },

//   {
//     name: "Save Pagination Token",
//     type: "post",
//     code: `const res = pm.response.json();
// if (res.nextPageToken) pm.environment.set("nextPageToken", res.nextPageToken);`,
//   },

  {
    name: "Validate Non-empty Array",
    type: "post",
    code: `const res = pm.response.json();
pm.test("Data array is not empty", function () {
  pm.expect(res.data.length).to.be.above(0);
});`,
  },

  {
    name: "Check Specific Status Code",
    type: "post",
    code: `pm.test("Status is 201 Created", function () {
  pm.expect(pm.response.code).to.eql(201);
});`,
  },

//   {
//     name: "Validate Schema",
//     type: "post",
//     code: `const schema = {
//   type: "object",
//   required: ["data", "success"],
// };
// pm.test("Response schema valid", function () {
//   pm.expect(tv4.validate(pm.response.json(), schema)).to.be.true;
// });`,
//   },

  {
    name: "Response Body Includes Text",
    type: "post",
    code: `pm.test("Body contains keyword", function () {
  pm.expect(pm.response.text()).to.include("success");
});`,
  },

  {
    name: "Check Response Headers",
    type: "post",
    code: `pm.test("Header includes Date", function () {
  pm.expect(pm.response.headers.has("Date")).to.be.true;
});`,
  },
];

export default scriptTemplates;