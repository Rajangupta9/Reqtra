import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { Proxy } from '../Controller/proxy';
import { prepareRequestPayload  } from './helper/preparedRequestPayload';
import { cloneInitialState, initialState } from './helper/initialState';
import { appReducer } from './helper/appReducer';
import { envController } from '../Controller/Environment';

export const ActionTypes = {
    SET_NAME: 'SET_NAME',
    SET_METHOD: 'SET_METHOD',
    SET_REQUEST_DATA: "SET_REQUEST_DATA",
    SET_URL: 'SET_URL',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    SET_LOADING: 'SET_LOADING',
    SET_RESPONSE: 'SET_RESPONSE',
    SET_ERROR: 'SET_ERROR',
    CLEAR_RESPONSE: 'CLEAR_RESPONSE',
    UPDATE_PARAMS: 'UPDATE_PARAMS',
    ADD_PARAM: 'ADD_PARAM',
    REMOVE_PARAM: 'REMOVE_PARAM',
    UPDATE_HEADERS: 'UPDATE_HEADERS',
    ADD_HEADER: 'ADD_HEADER',
    REMOVE_HEADER: 'REMOVE_HEADER',
    SET_AUTH_TYPE: 'SET_AUTH_TYPE',
    UPDATE_AUTH_DATA: 'UPDATE_AUTH_DATA',
    SET_BODY_TYPE: 'SET_BODY_TYPE',
    SET_RAW_BODY: 'SET_RAW_BODY',
    UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
    ADD_FORM_DATA: 'ADD_FORM_DATA',
    REMOVE_FORM_DATA: 'REMOVE_FORM_DATA',
    UPDATE_URL_ENCODED_DATA: 'UPDATE_URL_ENCODED_DATA',
    ADD_URL_ENCODED_DATA: 'ADD_URL_ENCODED_DATA',
    REMOVE_URL_ENCODED_DATA: 'REMOVE_URL_ENCODED_DATA',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    SET_INITIAL_DATA: 'SET_INITIAL_DATA',
    RESET_STATE: 'RESET_STATE',
    UPDATE_STATE: 'UPDATE_STATE',
};

const AppContext = createContext();

export const updateTabById = (tabs, tabId, updater) => {
    return tabs.map(tab =>
        tab.id === tabId ? updater(tab) : tab
    );
};


export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [tabs, setTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [selItem, setSelItem] = useState(null)
    
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedEnvId, setSelectedEnvId] = useState('');
    const [environments, setEnvironments] = useState([]);


    const activeTabData = useMemo(() => {
        const activeTab = tabs.find(tab => tab.id === activeTabId);
        if (!activeTab) return initialState;

        return {
            ...activeTab.request,
            id: activeTab.id,
            name: activeTab.name,
        };
    }, [tabs, activeTabId]);




    useEffect(() => {
        if (!activeTabId || !state?.name) return;

        setTabs(prevTabs =>
            prevTabs.map(tab =>
                tab.id === activeTabId
                    ? {
                        ...tab,
                        name: state.name,
                        request: { ...tab.request, ...state }
                    }
                    : tab
            )
        );
    }, [activeTabId, state]);



    const setTabResponse = (tabs, tabId, response) => {
        return updateTabById(tabs, tabId, tab => ({
            ...tab,
            request: {
                ...tab.request,
                response,
                loading: false,
                error: null,
            },
        }));
    };

    const setTabLoading = (tabs, tabId) => {
        return updateTabById(tabs, tabId, tab => ({
            ...tab,
            request: {
                ...tab.request,
                loading: true
            }
        }))
    }


    const setTabError = (tabs, tabId, error) => {
        return updateTabById(tabs, tabId, tab => ({
            ...tab,
            request: {
                ...tab.request,
                response: null,
                loading: false,
                error,
            },
        }));
    };


    const activeTabIdRef = useRef(activeTabId);
    useEffect(() => {
        activeTabIdRef.current = activeTabId;
    }, [activeTabId]);

    const sendRequest = async () => {

        if (!activeTabId) return;
        setTabs(prevTabs => setTabLoading(prevTabs, activeTabId))

        if (activeTabId === activeTabIdRef.current) {
            dispatch({ type: ActionTypes.SET_LOADING, payload: true })
        }



        try {
            const payload = prepareRequestPayload(state);
            console.log("Payload sent for tab:", activeTabId, payload);

            const result = await Proxy(payload, activeTabId, selectedEnvId);
            console.log("Response received:", result);


            setTabs(prevTabs => setTabResponse(prevTabs, activeTabId, result));

            if (result.activeTabId == activeTabIdRef.current) {
                dispatch({
                    type: ActionTypes.SET_RESPONSE,
                    payload: result,
                });

            }


        } catch (error) {
            console.error("Request Failed:", error);

            setTabs(prevTabs => setTabError(prevTabs, activeTabId, error));

            if (activeTabId === activeTabIdRef.current) {
                dispatch({
                    type: ActionTypes.SET_ERROR,
                    payload: {
                        type: error.name || "RequestError",
                        message: error.message || "An unknown error occurred.",
                        details: error.stack || "No additional details available.",
                    },
                });

            }
        }

    }


    const handleTabChange = (event, newValue) => {
        const activeTab = tabs.find((tab) => tab.id === newValue);
        if (activeTab) {
            setActiveTabId(newValue);
            dispatch({ type: ActionTypes.UPDATE_STATE, payload: activeTab.request });
        }
    };

    const addTab = (event, data = cloneInitialState(), iD = Date.now().toString()) => {

        const newTab = {
            id: iD,
            name: data.name || `Request ${tabs.length + 1}`,
            request: data
        };

        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        if (activeTabId !== newTab.id) {

            dispatch({ type: ActionTypes.UPDATE_STATE, payload: data });
        }
    };

    const closeTab = (event, tabIdToClose) => {
        event.stopPropagation();

        const tabIndexToClose = tabs.findIndex((tab) => tab.id === tabIdToClose);
        if (tabIndexToClose === -1) return;

        const newTabs = tabs.filter((tab) => tab.id !== tabIdToClose);
        setTabs(newTabs);

        if (activeTabId === tabIdToClose) {
            if (newTabs.length > 0) {

                const newActiveIndex = Math.max(0, tabIndexToClose - 1);
                const newActiveTab = newTabs[newActiveIndex];
                setActiveTabId(newActiveTab.id);
                dispatch({ type: ActionTypes.UPDATE_STATE, payload: newActiveTab.request });
            } else {

                setActiveTabId(null);
                dispatch({ type: ActionTypes.RESET_STATE, payload: cloneInitialState() });
            }
        }
    };

    const closeAllTabs = () => {
        setTabs([]);
        setActiveTabId(null);
        dispatch({ type: ActionTypes.RESET_STATE, payload: cloneInitialState() });
    };


    useEffect(() => {
        if (!activeTabId) return;

        setTabs(prevTabs =>
            prevTabs.map(tab =>
                tab.id === activeTabId
                    ? { ...tab, request: state }
                    : tab
            )
        );
    }, [state, activeTabId]);


    useEffect(() => {
        if (tabs.length === 0) {
            addTab();
        }
    }, []);

    useEffect(() => {
        const loadEnvs = async () => {
            try {
                if (!selectedWorkspace) return;
                const data = await envController.fetchAll(selectedWorkspace.id);
                setEnvironments(data);

                if (selectedEnvId === '') {
                    setSelectedEnvId(data[0]?.id || '');
                }
            } catch (err) {
                console.error("Failed to load environments:", err);
            }
        };

        loadEnvs();
    }, [selectedWorkspace]);




    const contextValue = {
        state,
        dispatch,
        sendRequest,
        tabs,
        activeTabId,
        setActiveTabId,
        handleTabChange,
        addTab,
        closeTab,
        closeAllTabs,
        activeTabData, setSelItem, selItem,
        selectedWorkspace, setSelectedWorkspace,
        selectedEnvId, setSelectedEnvId,
        environments, setEnvironments
    };

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