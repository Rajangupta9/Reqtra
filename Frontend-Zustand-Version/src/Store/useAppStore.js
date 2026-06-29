import { create } from 'zustand';
// import { create } from './StateLibrary';
import { immer } from 'zustand/middleware/immer';
// import { immer } from './StateLibrary';
import { cloneInitialState } from "../ContextApi/helper/initialState";
import { Proxy } from '../Controller/proxy';
import { envController } from '../Controller/Environment';
import { prepareSingleRequestPayload } from '../ContextApi/helper/preparedRequestPayload';
import { mapApiRequestToState } from '../ContextApi/helper/mapApiRequestToState';


const buildQueryString = (params) => {
    const enabledParams = params.filter(param => param.enabled && param.key);
    if (enabledParams.length === 0) return '';
    const queryParams = new URLSearchParams(
        enabledParams.map(p => [p.key, p.value || ''])
    ).toString();
    return `?${queryParams}`;
};

export const useAppStore = create(immer((set, get) => ({
    // STATE
    tabs: [],
    activeTabId: null,
    selItem: null,
    selectedWorkspace: null,
    selectedEnvId: '',
    environments: [],


    // GETTERS / DERIVED STATE
    activeTabData: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId);
    },
    // ACTIONS

    // Workspace & Environment Actions
    setSelectedWorkspace: async (workspace) => {
        set({ selectedWorkspace: workspace, environments: [], selectedEnvId: '' });
        try {
            if (!workspace) return;
            const data = await envController.fetchAll(workspace.id);
            set(state => {
                state.environments = data;
                state.selectedEnvId = data[0]?.id || '';
            });
        } catch (err) {
            console.error("Failed to load environments:", err);
        }
    },

    setSelectedEnvId: (envId) => set({ selectedEnvId: envId }),
    setSelItem: (selItem) => set({ selItem: selItem }),
    setEnvironments: (updater) => set(state => {
        if (typeof updater === 'function') {
            state.environments = updater(state.environments);
        } else {
            state.environments = updater;
        }
    }),


    addTab: (data) => {
        const newTabId = data?.id || Date.now().toString();
        const { tabs, activeTabId } = get();

        const existingTab = tabs.find(tab => tab.id === newTabId);

        if (existingTab) {
            if (activeTabId !== newTabId) {
                set({ activeTabId: newTabId });
            }
            return;
        }

        const newTab = {
            id: newTabId,
            name: data?.name || `Request ${tabs.length + 1}`,
            request: data ? mapApiRequestToState(data) : cloneInitialState(),
        };

        set(state => {
            state.tabs.push(newTab);
            state.activeTabId = newTab.id;
        });
    },

    addRunnerTab: (data, requests) => {
        const newTabId = data?.id || Date.now().toString();
        const { tabs, activeTabId } = get();

        const existingTab = tabs.find(tab => tab.id === newTabId);

        if (existingTab) {
            if (activeTabId !== newTabId) {
                set({ activeTabId: newTabId });
            }
            return;
        }

        const newTab = {
            id: newTabId,
            name: 'Runner',
            requests: requests,
            iterations: 1,
            delay: 50,
            fileData: []
        }
        set(state => {
            state.tabs.push(newTab);
            state.activeTabId = newTabId
        })
    },


    addRunnerResponse: (data, requests) => {

        const newTabId = "Res" + data?.id || Date.now().toString();
        const { tabs, activeTabId } = get();

        const existingTab = tabs.find(tab => tab.id === newTabId);

        if (existingTab) {
            if (activeTabId !== newTabId) {
                set({ activeTabId: newTabId });
            }
            return;
        }

        const newTab = {
            id: newTabId,
            name: 'test',
            data: requests,
            iterations: data.iterations,
            delay: data.delay,
            fileData: data.fileData,
            testResult: []
        }


        set(state => {
            state.tabs.push(newTab);
            state.activeTabId = newTabId
        })
    },

    closeTab: (tabIdToClose) => {
        const { tabs, activeTabId } = get();
        const tabIndexToClose = tabs.findIndex((tab) => tab.id === tabIdToClose);
        if (tabIndexToClose === -1) return;

        const newTabs = tabs.filter((tab) => tab.id !== tabIdToClose);

        if (activeTabId === tabIdToClose) {
            if (newTabs.length > 0) {
                const newActiveIndex = Math.max(0, tabIndexToClose - 1);
                const newActiveTabId = newTabs[newActiveIndex].id;
                set({ tabs: newTabs, activeTabId: newActiveTabId });
            } else {
                set({ tabs: [], activeTabId: null });
            }
        } else {
            set({ tabs: newTabs });
        }
    },

    closeAllTabs: () => set({ tabs: [], activeTabId: null }),

    updateRequests: (requests) => set({ requests: requests }),

    handleTabChange: (event, newTabId) => {
        if (get().tabs.some(tab => tab.id === newTabId)) {
            set({ activeTabId: newTabId });
        }
    },

    // Updates the state of the currently active tab
    updateActiveTabData: (updater) => {
        const { activeTabId } = get();
        if (!activeTabId) return;

        set(state => {
            const activeTab = state.tabs.find(tab => tab.id === activeTabId);
            if (activeTab) {
                updater(activeTab.request);
            }
        });
    },

    setRunnerRequests: (tabId, requests) => set(state => {
        const tab = state.tabs.find(t => t.id === tabId);
        if (tab && tab.name === 'Runner') tab.requests = requests;
    }),

    setRunnerIterations: (tabId, iterations) => set(state => {
        const tab = state.tabs.find(t => t.id === tabId);
        if (tab && tab.name === 'Runner') tab.iterations = iterations;
    }),

    setRunnerDelay: (tabId, delay) => set(state => {
        const tab = state.tabs.find(t => t.id === tabId);
        if (tab && tab.name === 'Runner') tab.delay = delay;
    }),

    setRunnerFileData: (tabId, fileData) => set(state => {
        const tab = state.tabs.find(t => t.id === tabId);
        if (tab && tab.name === 'Runner') tab.fileData = fileData;
    }),

    setRunnerTestResults: (tabId, results) =>
        set(state => ({
            tabs: state.tabs.map(tab =>
                tab.id === tabId 
                    ? { ...tab, testResults: results } // Replace all results
                    : tab
            )
        })),

    addRunnerTestResult: (tabId, result) =>
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.id === tabId 
                    ? { ...tab, testResults: [...(tab.testResults || []), result] }
                    : tab
            ),
        })),




    // Request Actions
    sendRequest: async () => {
        // Capture the tab ID at the beginning of the request
        const requestTabId = get().activeTabId;
        const selectedEnvId = get().selectedEnvId;
        const activeTab = get().activeTabData();

        if (!activeTab || !requestTabId) return;

        // Set loading state for the specific tab that initiated the request
        set(state => {
            const tabToUpdate = state.tabs.find(tab => tab.id === requestTabId);
            if (tabToUpdate) {
                tabToUpdate.request.loading = true;
                tabToUpdate.request.error = null;
            }
        });

        try {
            const payload = prepareSingleRequestPayload(activeTab.request);
            const result = await Proxy(payload, requestTabId, selectedEnvId);

            // After the request is complete, update the original tab's data
            // This works even if the user has switched to a different tab
            set(state => {
                const tabToUpdate = state.tabs.find(tab => tab.id === requestTabId);
                if (tabToUpdate) {
                    tabToUpdate.request.response = result;
                    tabToUpdate.request.loading = false;
                }
            });

        } catch (error) {
            console.error("Request Failed:", error);

            // If an error occurs, update the original tab's error state
            set(state => {
                const tabToUpdate = state.tabs.find(tab => tab.id === requestTabId);
                if (tabToUpdate) {
                    tabToUpdate.request.error = {
                        type: error.name || "RequestError",
                        message: error.message || "An unknown error occurred.",
                        details: error.stack || "No additional details.",
                    };
                    tabToUpdate.request.response = null;
                    tabToUpdate.request.loading = false;
                }
            });
        }
    },

    // Direct state update actions (replaces reducer cases)
    setActiveTab: (tab) => get().updateActiveTabData(draft => { draft.activeTab = tab; }),
    setName: (name) => get().updateActiveTabData(draft => { draft.name = name; }),
    setMethod: (method) => get().updateActiveTabData(draft => { draft.method = method; }),
    setUrl: (url) => get().updateActiveTabData(draft => { draft.url = url; }),
    setAuthType: (authType) => get().updateActiveTabData(draft => { draft.authType = authType; }),
    setBodyType: (bodyType) => get().updateActiveTabData(draft => { draft.bodyType = bodyType; }),
    setRawBody: (rawBody) => get().updateActiveTabData(draft => { draft.rawBody = rawBody; }),

    updateParams: (params) => get().updateActiveTabData(draft => {
        const qs = buildQueryString(params);
        const baseUrl = draft.url.split('?')[0];
        draft.params = params;
        draft.url = `${baseUrl}${qs}`;
    }),

    updateHeaders: (headers) => get().updateActiveTabData(draft => { draft.headers = headers; }),
    updateAuthData: (authData) => get().updateActiveTabData(draft => { draft.authData = { ...draft.authData, ...authData }; }),
    updateFormData: (formData) => get().updateActiveTabData(draft => { draft.formData = formData; }),
    updateUrlEncodedData: (urlEncodedData) => get().updateActiveTabData(draft => { draft.urlEncodedData = urlEncodedData; }),
    updateSettings: (settings) => get().updateActiveTabData(draft => { draft.settings = { ...draft.settings, ...settings }; }),





    // Initialize the first tab if none exist
    init: () => {
        if (get().tabs.length === 0) {
            get().addTab();
        }
    },
})));

// Initialize the store by adding the first tab
useAppStore.getState().init();


