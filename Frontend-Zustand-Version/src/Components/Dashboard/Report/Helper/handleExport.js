export const handleExport = () => {
    if (testResults.length === 0) return;

    // Define CSV headers
    const headers = [
        "ID",
        "Name",
        "Description",
        "Method",
        "URL",
        "Auth Type",
        "Bearer Token",
        "Body Type",
        "Form Data",
        "Headers",
        "Params",
        "Status",
        "Code",
        "Response Data",
        "Error Code",
        "Error Message",
        "Time (ms)"
    ].join(",");

    // Map test results to CSV rows
    const csvRows = testResults.map(t => {
        // Serialize objects like headers, formData, params
        const headersStr = t.headers?.map(h => `${h.key}:${h.value}`).join("|") || "";
        const paramsStr = t.params?.map(p => `${p.key}:${p.value}`).join("|") || "";
        const formDataStr = t.formData?.map(f => `${f.key}:${f.value}`).join("|") || "";
        const bearerToken = t.authData?.bearerToken || "";

        return [
            t.id,
            `"${t.name}"`,
            `"${t.description}"`,
            t.method,
            t.url,
            t.authType,
            bearerToken,
            t.bodyType,
            `"${formDataStr}"`,
            `"${headersStr}"`,
            `"${paramsStr}"`,
            t.status,
            t.code,
            `"${JSON.stringify(t.response?.data || "")}"`,
            t.response?.errorCode ?? "",
            `"${t.response?.errorMsg || ""}"`,
            t.time
        ].join(",");
    });

    // Combine headers and rows
    const csvString = headers + "\n" + csvRows.join("\n");

    // Create CSV blob and download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
        "download",
        `api-test-results-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
