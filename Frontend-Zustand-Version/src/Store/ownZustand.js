import { create } from './StateLibrary';
import { immer } from './StateLibrary';
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
    requests: [],
    filedata: [],
    iteration: [],
    delay: null,

    setRequests: (request) => set({ requests: request }),
    setFiledata: (filedata) => set({ filedata: filedata }),
    setDelay: (delay) => set({ delay: delay }),
    setIteration: (iteration) => set({ iteration: iteration }),

    // GETTERS / DERIVED STATE
    activeTabData: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId);
    },

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

    // Tab Management Actions
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
        const newTabId = data?.id || `Runner${Date.now()}`;
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
            requests: requests
        };
        
        set(state => {
            state.tabs.push(newTab);
            state.activeTabId = newTabId;
        });
    },

    addRunnerResponse: (data) => {
        // Fixed: Proper operator precedence
        const newTabId = data?.id ? `Res${data.id}` : `Res${Date.now()}`;
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
            name: 'Test Response',
            data: data
        };
        
        set(state => {
            state.tabs.push(newTab);
            state.activeTabId = newTabId;
        });
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
            if (activeTab && activeTab.request) {
                updater(activeTab.request);
            }
        });
    },

    // Request Actions
    sendRequest: async () => {
        const requestTabId = get().activeTabId;
        const selectedEnvId = get().selectedEnvId;
        const activeTab = get().activeTabData();

        if (!activeTab || !requestTabId) return;

        set(state => {
            const tabToUpdate = state.tabs.find(tab => tab.id === requestTabId);
            if (tabToUpdate && tabToUpdate.request) {
                tabToUpdate.request.loading = true;
                tabToUpdate.request.error = null;
            }
        });

        try {
            const payload = prepareSingleRequestPayload(activeTab.request);
            const result = await Proxy(payload, requestTabId, selectedEnvId);

            set(state => {
                const tabToUpdate = state.tabs.find(tab => tab.id === requestTabId);
                if (tabToUpdate && tabToUpdate.request) {
                    tabToUpdate.request.response = result;
                    tabToUpdate.request.loading = false;
                }
            });

        } catch (error) {
            console.error("Request Failed:", error);

            set(state => {
                const tabToUpdate = state.tabs.find(tab => tab.id === requestTabId);
                if (tabToUpdate && tabToUpdate.request) {
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

    // FIXED: Direct state update actions
    // These now use set() directly instead of calling get().updateActiveTabData()
    setActiveTab: (tab) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.activeTab = tab;
            }
        });
    },

    setName: (name) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.name = name;
            }
        });
    },

    setMethod: (method) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.method = method;
            }
        });
    },

    setUrl: (url) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.url = url;
            }
        });
    },

    setAuthType: (authType) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.authType = authType;
            }
        });
    },

    setBodyType: (bodyType) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.bodyType = bodyType;
            }
        });
    },

    setRawBody: (rawBody) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.rawBody = rawBody;
            }
        });
    },

    updateParams: (params) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                const qs = buildQueryString(params);
                const baseUrl = activeTab.request.url.split('?')[0];
                activeTab.request.params = params;
                activeTab.request.url = `${baseUrl}${qs}`;
            }
        });
    },

    updateHeaders: (headers) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.headers = headers;
            }
        });
    },

    updateAuthData: (authData) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.authData = { 
                    ...activeTab.request.authData, 
                    ...authData 
                };
            }
        });
    },

    updateFormData: (formData) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.formData = formData;
            }
        });
    },

    updateUrlEncodedData: (urlEncodedData) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.urlEncodedData = urlEncodedData;
            }
        });
    },

    updateSettings: (settings) => {
        const { activeTabId } = get();
        if (!activeTabId) return;
        
        set(state => {
            const activeTab = state.tabs.find(t => t.id === activeTabId);
            if (activeTab && activeTab.request) {
                activeTab.request.settings = { 
                    ...activeTab.request.settings, 
                    ...settings 
                };
            }
        });
    },

    // Initialize the first tab if none exist
    init: () => {
        const { tabs } = get();
        if (tabs.length === 0) {
            get().addTab();
        }
    },
})));

// REMOVED: Don't initialize immediately
// Instead, initialize in your App component with useEffect
// useAppStore.getState().init();

// Export init function to call from component
export const initializeStore = () => {
    useAppStore.getState().init();
};