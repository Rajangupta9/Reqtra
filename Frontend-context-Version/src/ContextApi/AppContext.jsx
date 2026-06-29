import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    useMemo,
    useState
} from 'react';
import { Proxy } from '../Controller/proxy';
import { prepareSingleRequestPayload } from './helper/preparedRequestPayload';
import { cloneInitialState } from './helper/initialState';
import { tabsInitialState, appReducer } from './helper/appReducer';
import { ActionTypes } from './helper/actionTypes';
import { envController } from '../Controller/Environment';
import { historyController } from '../Controller/history';
import { mapStateToApiRequest } from './helper/stateTopayload';
 import {  runPostRequestScript, runPreRequestScript } from './helper/runScripts';
import { buildPmSandbox} from './helper/ScripRunnerChai';
import { deepEqualEnvs } from '../utils/deepEqual';
import { deepClone } from '../utils/deepClone';
import ObjectID from 'bson-objectid';
import applyPreRequestModifications from './helper/applyPreRequestModifications';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, tabsInitialState);
    const { tabs, activeTabId } = state;


    // const [selItem, setSelItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedEnvId, setSelectedEnvId] = useState('');
    const [environments, setEnvironments] = useState([]);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);

    const [historyVersion, setHistoryVersion] = useState(0);
    const [history, setHistory] = useState([]);


    const refreshHistory = () => {
        setHistoryVersion(prevVersion => prevVersion + 1);
    };

    const user = JSON.parse(localStorage.getItem("user"))
    const activeTabData = useMemo(() => {
        const tab = tabs[activeTabId];
        if (!tab) return null;
        return tab.request ? { ...tab.request, id: tab.id } : tab;
    }, [tabs, activeTabId]);


    const addTab = useCallback((event, data = cloneInitialState(), id = ObjectID().toHexString()) => {
        dispatch({ type: ActionTypes.ADD_TAB, payload: { data, id } });
    }, []);

    const addRunnerTab = useCallback((data, requests) => {
        dispatch({ type: ActionTypes.ADD_RUNNER_TAB, payload: { data, requests } });
    }, []);

    const addRunnerResponse = useCallback((data, requests) => {
        dispatch({ type: ActionTypes.ADD_RUNNER_RESPONSE, payload: { data, requests } });
    }, []);

    const closeTab = useCallback((event, tabIdToClose) => {
        if (event) event.stopPropagation();
        dispatch({ type: ActionTypes.CLOSE_TAB, payload: tabIdToClose });
    }, []);

    const closeAllTabs = useCallback(() => {
        dispatch({ type: ActionTypes.CLOSE_ALL_TABS });
    }, []);

    const handleTabChange = useCallback((event, newValue) => {
        dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: newValue });


        const tab = state.tabs[newValue];

        if (tab) {
            setSelectedItem({
                id: tab.id,
                name: tab.request?.name || tab.name || "Untitled",
                type: "request",
                request: tab.request || null,
            });
        }
    }, [state.tabs]);

    // ADD THESE NEW FUNCTIONS
    const setPreRequestScript = useCallback((script) => {
        if (!activeTabId) return;
        dispatch({
            type: ActionTypes.SET_PRE_REQUEST_SCRIPT,
            payload: { tabId: activeTabId, value: script }
        });
    }, [activeTabId]);

    const setTestScript = useCallback((script) => {
        if (!activeTabId) return;
        dispatch({
            type: ActionTypes.SET_TEST_SCRIPT,
            payload: { tabId: activeTabId, value: script }
        });
    }, [activeTabId]);
    // END OF NEW FUNCTIONS


    const setRunnerIterations = useCallback((tabId, iterations) => {
        dispatch({ type: ActionTypes.SET_RUNNER_ITERATIONS, payload: { tabId, value: iterations } });
    }, []);

    const setRunnerDelay = useCallback((tabId, delay) => {
        dispatch({ type: ActionTypes.SET_RUNNER_DELAY, payload: { tabId, value: delay } });
    }, []);

    const setRunnerFileData = useCallback((tabId, fileData) => {
        dispatch({ type: ActionTypes.SET_RUNNER_FILE_DATA, payload: { tabId, value: fileData } });
    }, []);

    const setRunnerTestResults = useCallback((tabId, results) => {
        dispatch({ type: ActionTypes.SET_RUNNER_TEST_RESULTS, payload: { tabId, results } });
    }, []);

    const addRunnerTestResult = useCallback((tabId, result) => {
        dispatch({ type: ActionTypes.ADD_RUNNER_TEST_RESULT, payload: { tabId, result } });
    }, []);

    const setActiveTabRequests = useCallback((tabId, requests) => {
        dispatch({
            type: ActionTypes.UPDATE_ACTIVE_TAB_REQUESTS,
            payload: { tabId, requests },
        });
    }, []);

    
     
     const updateEnvironmentIfChanged = async (
        oldEnv,
        newEnv,
        selectedWorkspace,
        setGlobalEnvironments,
        envController
    ) => {
        try {
            if (deepEqualEnvs(oldEnv, newEnv)) {
                // console.log("No environment changes detected — skipping update.");
                return false;
            }

            // console.log(" Environment changes detected — updating backend...");

            //  Prepare payload for saving
            const payload = newEnv.map(env => ({
                id: env.id,
                name: env.name,
                variables: env.variables.filter(v => v.key.trim() !== ''),
                isNew: env.isNew || false,
            }));

            //  Call backend API
            await envController.save(selectedWorkspace.id, payload);

            //  Update frontend global state
            setGlobalEnvironments(newEnv);

            // console.log(" Environment successfully updated.");
            return true;
        } catch (error) {
            console.error(" Failed to update environment:", error);
            return false;
        }
    };


    const sendRequest = useCallback(async () => {
        if (!activeTabId || !activeTabData) return;

        dispatch({
            type: ActionTypes.SET_LOADING,
            payload: { tabId: activeTabId, loading: true },
        });

        const startTime = Date.now();

        try {
            const payload = prepareSingleRequestPayload(activeTabData);
            
            let selectedEnv = environments.find(env => env.id === selectedEnvId);
            

            if(selectedEnv===undefined){
               setSelectedEnvId(environments[0].id);
               selectedEnv = environments[0];
            }
            const clonedEnvironments = deepClone(environments)
            // console.log(clonedEnvironments, selectedEnv)
            
            const pm = buildPmSandbox({
                environments : clonedEnvironments,
                activeEnvName: selectedEnv.name,
                globalStore: {},
                response: null,
                sendSubRequest: async (req, callback) => {
                    console.log("Mock subrequest sent:", req);
                    callback({ status: 200, body: "success", headers: {} });
                },
                
            })
          

           const reqestchange =  await runPreRequestScript(payload, pm);
           console.log(reqestchange)
        //    console.log(payload);
            const PreEnv = pm._getAllEnvironments()
            
            // console.log(environments)
            await updateEnvironmentIfChanged(environments, PreEnv, selectedWorkspace, setEnvironments, envController);

            const newPaylod = applyPreRequestModifications(payload, reqestchange)
            const result = await Proxy(newPaylod, activeTabId, selectedEnvId);
            const duration = Date.now() - startTime;


            await runPostRequestScript(payload, pm, result, result.timingInfo.durationMs);
            // console.log("test Result" , pm._getTestResults());

            const PostEnv = pm._getAllEnvironments()
            
            await updateEnvironmentIfChanged(environments, PostEnv, selectedWorkspace, setEnvironments, envController);


            const testResult = pm._getTestResults();
            result.testResult = testResult;


            // Save successful request to history
            await historyController.createHistory({
                userId: user?.id || "dummyUser",
                workspaceId: selectedWorkspace?.id,
                requestId: activeTabId,
                url: payload.url,
                method: payload.method,
                statusCode: result.responseInfo.statusCode || 0,
                request: mapStateToApiRequest(activeTabData),
                response: result,
                duration: result?.timingInfo?.duration || `${duration}`,
                createdAt: Math.floor(Date.now() / 1000),
            });

            dispatch({
                type: ActionTypes.SET_RESPONSE,
                payload: { tabId: activeTabId, response: result },
            });
        } catch (error) {
            console.log(error)
            const duration = Date.now() - startTime;
            const statusCode = error.response?.status ?? 0;
            const responseData = error.response?.data
                ? error.response.data
                : { error: error.message };

            // Dispatch error to state
            dispatch({
                type: ActionTypes.SET_ERROR,
                payload: {
                    tabId: activeTabId,
                    error: {
                        type: error.name || "RequestError",
                        message: error.message || "An unknown error occurred",
                        details: error.stack || "",
                        statusCode,
                        response: responseData,
                    },
                },
            });

            // Save error request to history
            await historyController.createHistory({
                userId: user?.id || "dummyUser",
                workspaceId: selectedWorkspace?.id,
                requestId: activeTabId,
                url: activeTabData?.url || "https://example.com/dummy",
                method: activeTabData?.method || "GET",
                statusCode,
                request: mapStateToApiRequest(activeTabData),
                response: responseData,
                duration: result?.timingInfo?.duration || `${duration}`,
                createdAt: Math.floor(Date.now() / 1000),
            }).catch(console.error);
        } finally {
            dispatch({
                type: ActionTypes.SET_LOADING,
                payload: { tabId: activeTabId, loading: false },
            });
            refreshHistory()
        }
    }, [activeTabId, activeTabData, selectedEnvId]);



    useEffect(() => {
        const loadEnvs = async () => {
            if (!selectedWorkspace) return;
            try {
                const data = await envController.fetchAll(selectedWorkspace.id);
                setEnvironments(data);
                if (!selectedEnvId) {
                    setSelectedEnvId(data[0]?.id || '');
                }
            } catch (err) {
                console.error("Failed to load environments:", err);
            }
        };
        loadEnvs();
    }, [selectedWorkspace, selectedEnvId]);

    const contextValue = useMemo(() => ({
        tabs,
        activeTabId,
        activeTabData,
        selectedWorkspace,
        selectedEnvId,
        environments,

        dispatch,
        sendRequest,
        handleTabChange,
        addTab,
        closeTab,
        closeAllTabs,
        setSelectedWorkspace,
        setSelectedEnvId,
        setEnvironments,

        // ADD THE NEW FUNCTIONS TO THE CONTEXT VALUE
        setPreRequestScript,
        setTestScript,

        addRunnerTab,
        addRunnerResponse,
        setRunnerIterations,
        setRunnerDelay,
        setRunnerFileData,
        setRunnerTestResults,
        addRunnerTestResult,
        setActiveTabRequests,

        historyVersion,
        selectedItem, setSelectedItem,
        renameDialogOpen, setRenameDialogOpen,
        history, setHistory, 

        updateEnvironmentIfChanged
    }), [
        tabs,
        activeTabId,
        activeTabData,
        selectedWorkspace,
        selectedEnvId,
        environments,
        addTab,
        closeTab,
        closeAllTabs,
        handleTabChange,
        // ADD THE NEW FUNCTIONS TO THE DEPENDENCY ARRAY
        setPreRequestScript,
        setTestScript,
        history
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};


export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};