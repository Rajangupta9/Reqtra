
export const runBasicTests = (response) => {
        const tests = [];
        const statusCode = response.responseInfo?.statusCode || response.status;
        const responseBody = response.responseInfo?.body || response.data;
        const headers = response.responseInfo?.headers || response.headers;
        const timing = response.timingInfo?.durationMs || responseTime;

        if (statusCode) {
            tests.push({
                name: 'Status Code is 2xx',
                passed: statusCode >= 200 && statusCode < 300,
                description: `Expected 2xx, got ${statusCode}`,
                type: 'status'
            });

            tests.push({
                name: 'No Server Error (5xx)',
                passed: statusCode < 500,
                description: `Status code is ${statusCode}`,
                type: 'status'
            });
        }

        if (timing) {
            tests.push({
                name: 'Response Time is less than 5s',
                passed: timing < 5000,
                description: `Response time is ${timing}ms`,
                type: 'performance'
            });

            tests.push({
                name: 'Response Time is less than 1s',
                passed: timing < 1000,
                description: `Response time is ${timing}ms`,
                type: 'performance'
            });
        }

        if (responseBody) {
            tests.push({
                name: 'Response has a body',
                passed: !!responseBody,
                description: 'Response contains data',
                type: 'content'
            });

            try {
                if (typeof responseBody === 'string') {
                    JSON.parse(responseBody);
                }
                tests.push({
                    name: 'Response is valid JSON',
                    passed: true,
                    description: 'Response successfully parsed as JSON',
                    type: 'content'
                });
            } catch {
                // If parsing fails, it's not JSON but still valid content
            }
        }

        if (headers && headers['Content-Type']) {
            tests.push({
                name: 'Has Content-Type header',
                passed: true,
                description: `Content-Type: ${headers['Content-Type']}`,
                type: 'headers'
            });
        }

        return tests;
    };
