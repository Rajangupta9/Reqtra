import { PublicClientApplication } from "@azure/msal-browser"


 const msalConfig = {
    auth: {
        clientId: "4f97b659-88fb-4601-8e9e-c16f389b1e4d",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
}

export const msalInstance = new PublicClientApplication(msalConfig);