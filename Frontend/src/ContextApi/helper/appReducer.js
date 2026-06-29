import { cloneInitialState } from './initialState';
import { mapApiRequestToState } from './mapApiRequestToState';
import { ActionTypes } from './actionTypes';

// --- Initial State ---
export const tabsInitialState = {
    tabs: {},       
    activeTabId: null,
};

// --- Helper Functions ---
const updateTabById = (tabs, tabId, updater) => {
    if (!tabs[tabId]) return tabs;
    return {
        ...tabs,
        [tabId]: updater(tabs[tabId]),
    };
};

const buildQueryString = (params) => {
    const enabledParams = params.filter(p => p.enabled && p.key);
    if (enabledParams.length === 0) return '';
    const queryParams = new URLSearchParams(
        enabledParams.map(p => [p.key, p.value || ''])
    ).toString();
    return `?${queryParams}`;
};

// --- Reducer ---
export const appReducer = (state, action) => {
    const { tabId } = action.payload || {};

    switch (action.type) {

        // ---------------- TAB MANAGEMENT ----------------
        case ActionTypes.ADD_TAB: {
            const { data, id } = action.payload;
            const existingTab = state.tabs[id];
            if (existingTab) return { ...state, activeTabId: id };

            const newTab = {
                id,
                name: data?.name || `Request ${Object.keys(state.tabs).length + 1}`,
                request: data || cloneInitialState(),
                
            };

            return {
                ...state,
                tabs: { ...state.tabs, [id]: newTab },
                activeTabId: id,
            };
        }

        case ActionTypes.ADD_RUNNER_TAB: {
            const { data, requests } = action.payload;
            const newTabId = data?.id || Date.now().toString();

            if (state.tabs[newTabId]) {
                return { ...state, activeTabId: newTabId };
            }

            const newTab = {
                id: newTabId,
                name: 'Runner',
                requests,
                iterations: 1,
                delay: 50,
                fileData: [],
            };

            return {
                ...state,
                tabs: { ...state.tabs, [newTabId]: newTab },
                activeTabId: newTabId,
            };
        }

        case ActionTypes.ADD_RUNNER_RESPONSE: {
            const { data, requests } = action.payload;
            const newTabId = "Res" + (data?.id || Date.now().toString());

            // If tab exists, update it
            if (state.tabs[newTabId]) {
                return {
                    ...state,
                    tabs: updateTabById(state.tabs, newTabId, tab => ({
                        ...tab,
                        data: requests,
                        iterations: data.iterations,
                        delay: data.delay,
                        fileData: data.fileData,
                        testResults: [],
                    })),
                    activeTabId: newTabId,
                };
            }

            // Otherwise create new tab
            const newTab = {
                id: newTabId,
                name: 'Test Result',
                data: requests,
                iterations: data.iterations,
                delay: data.delay,
                fileData: data.fileData,
                testResults: [],
            };

            return {
                ...state,
                tabs: { ...state.tabs, [newTabId]: newTab },
                activeTabId: newTabId,
            };
        }

        case ActionTypes.CLOSE_TAB: {
            const tabIdToClose = action.payload;
            const { [tabIdToClose]: _, ...remainingTabs } = state.tabs;

            const remainingIds = Object.keys(remainingTabs);
            const newActiveTabId =
                state.activeTabId === tabIdToClose
                    ? remainingIds.length > 0
                        ? remainingIds[remainingIds.length - 1]
                        : null
                    : state.activeTabId;

            return { ...state, tabs: remainingTabs, activeTabId: newActiveTabId };
        }

        case ActionTypes.CLOSE_ALL_TABS:
            return { ...state, tabs: {}, activeTabId: null };

        case ActionTypes.SET_ACTIVE_TAB:
            return { ...state, activeTabId: action.payload };

        // ---------------- RUNNER-SPECIFIC UPDATES ----------------
        case ActionTypes.SET_RUNNER_ITERATIONS:
        case ActionTypes.SET_RUNNER_DELAY:
        case ActionTypes.SET_RUNNER_FILE_DATA: {
            const { tabId, value } = action.payload;
            const fieldMap = {
                SET_RUNNER_ITERATIONS: 'iterations',
                SET_RUNNER_DELAY: 'delay',
                SET_RUNNER_FILE_DATA: 'fileData',
            };
            const field = fieldMap[action.type];
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({ ...tab, [field]: value })),
            };
        }

        case ActionTypes.SET_RUNNER_TEST_RESULTS: {
            const { tabId, results } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    testResults: results,
                })),
            };
        }

        case ActionTypes.ADD_RUNNER_TEST_RESULT: {
            const { tabId, result } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    testResults: [...(tab.testResults || []), result],
                })),
            };
        }

        case ActionTypes.UPDATE_ACTIVE_TAB_REQUESTS: {
            const { tabId, requests } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    flattenrequests: requests,
                })),
            };
        }

        // ---------------- GENERIC FIELD & ASYNC UPDATES ----------------
        case ActionTypes.SET_NAME:
        case ActionTypes.SET_METHOD:
        case ActionTypes.SET_URL:
        case ActionTypes.SET_BODY_TYPE:
        case ActionTypes.SET_RAW_BODY:
        case ActionTypes.SET_AUTH_TYPE:
        case ActionTypes.SET_REQUEST_ACTIVE_TAB:
        case ActionTypes.CLEAR_RESPONSE:
        case ActionTypes.SET_PRE_REQUEST_SCRIPT:
        case ActionTypes.SET_TEST_SCRIPT:{
            const fieldMap = {
                SET_NAME: 'name',
                SET_METHOD: 'method',
                SET_URL: 'url',
                SET_BODY_TYPE: 'bodyType',
                SET_RAW_BODY: 'rawBody',
                SET_AUTH_TYPE: 'authType',
                CLEAR_RESPONSE: 'response',
                SET_REQUEST_ACTIVE_TAB: 'activeRequestTab',
                SET_PRE_REQUEST_SCRIPT: 'preRequestScript',
                SET_TEST_SCRIPT: 'testScript',
            };

            const field = fieldMap[action.type];
            const value = action.type === 'CLEAR_RESPONSE' ? null : action.payload.value;

            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    name: field === 'name' ? value : tab.name,
                    request: { ...tab.request, [field]: value },
                })),
            };
        }

        case ActionTypes.SET_LOADING:
        case ActionTypes.SET_RESPONSE:
        case ActionTypes.SET_ERROR: {
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    request: {
                        ...tab.request,
                        loading: action.type === ActionTypes.SET_LOADING ? action.payload.loading : false,
                        response: action.type === ActionTypes.SET_RESPONSE
                            ? action.payload.response
                            : action.type === ActionTypes.SET_ERROR
                                ? null
                                : tab.request.response,
                        error: action.type === ActionTypes.SET_ERROR
                            ? action.payload.error
                            : action.type === ActionTypes.SET_RESPONSE
                                ? null
                                : tab.request.error,
                    },
                })),
            };
        }

        // ---------------- COMPLEX UPDATES (PARAMS, HEADERS, etc.) ----------------
        case ActionTypes.UPDATE_PARAMS:
        case ActionTypes.ADD_PARAM:
        case ActionTypes.REMOVE_PARAM: {
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => {
                    let newParams;
                    if (action.type === ActionTypes.ADD_PARAM) {
                        newParams = [...tab.request.params, { key: '', value: '', description: '', enabled: true }];
                    } else if (action.type === ActionTypes.REMOVE_PARAM) {
                        newParams = tab.request.params.filter((_, i) => i !== action.payload.index);
                    } else {
                        newParams = action.payload.params;
                    }

                    const qs = buildQueryString(newParams);
                    const baseUrl = tab.request.url.split('?')[0];
                    return { ...tab, request: { ...tab.request, params: newParams, url: `${baseUrl}${qs}` } };
                }),
            };
        }

        case ActionTypes.UPDATE_HEADERS:
        case ActionTypes.ADD_HEADER:
        case ActionTypes.REMOVE_HEADER: {
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => {
                    let newHeaders;
                    if (action.type === ActionTypes.ADD_HEADER) {
                        newHeaders = [...tab.request.headers, { key: '', value: '', description: '', enabled: true }];
                    } else if (action.type === ActionTypes.REMOVE_HEADER) {
                        newHeaders = tab.request.headers.filter((_, i) => i !== action.payload.index);
                    } else {
                        newHeaders = action.payload.headers;
                    }
                    return { ...tab, request: { ...tab.request, headers: newHeaders } };
                }),
            };
        }

        case ActionTypes.UPDATE_FORM_DATA:
        case ActionTypes.ADD_FORM_DATA:
        case ActionTypes.REMOVE_FORM_DATA: {
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => {
                    let newFormData;
                    if (action.type === ActionTypes.ADD_FORM_DATA) {
                        newFormData = [...tab.request.formData, { key: '', value: '', description: '', enabled: true, type: 'text', file: null }];
                    } else if (action.type === ActionTypes.REMOVE_FORM_DATA) {
                        newFormData = tab.request.formData.filter((_, i) => i !== action.payload.index);
                    } else {
                        newFormData = action.payload.formData;
                    }
                    return { ...tab, request: { ...tab.request, formData: newFormData } };
                }),
            };
        }

        case ActionTypes.UPDATE_URL_ENCODED_DATA:
        case ActionTypes.ADD_URL_ENCODED_DATA:
        case ActionTypes.REMOVE_URL_ENCODED_DATA: {
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => {
                    let newUrlEncodedData;
                    if (action.type === ActionTypes.ADD_URL_ENCODED_DATA) {
                        newUrlEncodedData = [...tab.request.urlEncodedData, { key: '', value: '', description: '', enabled: true }];
                    } else if (action.type === ActionTypes.REMOVE_URL_ENCODED_DATA) {
                        newUrlEncodedData = tab.request.urlEncodedData.filter((_, i) => i !== action.payload.index);
                    } else {
                        newUrlEncodedData = action.payload.urlEncodedData;
                    }
                    return { ...tab, request: { ...tab.request, urlEncodedData: newUrlEncodedData } };
                }),
            };
        }

        // ---------------- AUTH / SETTINGS ----------------
        case ActionTypes.UPDATE_AUTH_DATA: {
            const { data } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    request: {
                        ...tab.request,
                        authData: { ...tab.request.authData, ...data },
                    },
                })),
            };
        }

        case ActionTypes.UPDATE_SETTINGS: {
            const { data } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    request: {
                        ...tab.request,
                        settings: { ...tab.request.settings, ...data },
                    },
                })),
            };
        }

        // ---------------- LOADING DATA / RESET ----------------
        case ActionTypes.SET_REQUEST_DATA: {
            const { data } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    name: data.name || tab.name,
                    request: mapApiRequestToState(data, tab.request),
                })),
            };
        }

        case ActionTypes.UPDATE_STATE: {
            const { data } = action.payload;
            return {
                ...state,
                tabs: updateTabById(state.tabs, tabId, tab => ({
                    ...tab,
                    request: { ...tab.request, ...data },
                })),
            };
        }

        case ActionTypes.RESET_STATE: {
            const newTabId = Date.now().toString();
            return {
                tabs: { [newTabId]: { id: newTabId, name: 'Untitled request', request: cloneInitialState() } },
                activeTabId: newTabId,
                requestHistory: state.requestHistory,
                savedRequests: state.savedRequests,
            };
        }

        case ActionTypes.SET_INITIAL_DATA:
            return {
                ...state,
                requestHistory: action.payload.history,
                savedRequests: action.payload.saved,
            };

        default:
            return state;
    }
};
