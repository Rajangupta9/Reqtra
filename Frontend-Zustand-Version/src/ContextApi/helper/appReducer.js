import { ActionTypes } from "../AppContext";
import { initialState } from "./initialState";
import { mapApiRequestToState } from "./mapApiRequestToState";


const buildQueryString = (params) => {
    const enabledParams = params.filter(param => param.enabled && param.key);
    if (enabledParams.length === 0) return '';
    const queryParams = new URLSearchParams(
        enabledParams.map(p => [p.key, p.value || ''])
    ).toString();
    return `?${queryParams}`;
};

export const appReducer = (state, action) => {

 

    switch (action.type) {
        case ActionTypes.SET_REQUEST_DATA:
            const apiRequestToState = mapApiRequestToState(action.payload, state);

            return apiRequestToState;


        case ActionTypes.SET_NAME:
            return {...state , name: action.payload}

        case ActionTypes.SET_METHOD:
            return { ...state, method: action.payload };
        case ActionTypes.SET_URL:
            return { ...state, url: action.payload };
        case ActionTypes.SET_ACTIVE_TAB:
            return { ...state, activeTab: action.payload };
        case ActionTypes.SET_LOADING:
            return { ...state, loading: action.payload, error: null };
        case ActionTypes.SET_RESPONSE:
            return {
                ...state,
                response: action.payload,
                error: null,
                loading: false
            };
        case ActionTypes.SET_ERROR:
            return { ...state,
                 error: action.payload, 
                 loading: false, response: null };

            
        case ActionTypes.CLEAR_RESPONSE:
            return { ...state, response: null, error: null };

        case ActionTypes.UPDATE_PARAMS: {
            const newParams = action.payload;
            const qs = buildQueryString(newParams);
            const baseUrl = state.url.split('?')[0];
            return { ...state, params: newParams, url: `${baseUrl}${qs}` };
        }
        case ActionTypes.ADD_PARAM:
            return { ...state, params: [...state.params, { key: '', value: '', description: '', enabled: true }] };
        case ActionTypes.REMOVE_PARAM: {
            const newParams = state.params.filter((_, i) => i !== action.payload);
            const qs = buildQueryString(newParams);
            const baseUrl = state.url.split('?')[0];
            return { ...state, params: newParams, url: `${baseUrl}${qs}` };
        }

        case ActionTypes.UPDATE_HEADERS:
            return { ...state, headers: action.payload };
        case ActionTypes.ADD_HEADER:
            return { ...state, headers: [...state.headers, { key: '', value: '', description: '', enabled: true }] };
        case ActionTypes.REMOVE_HEADER:
            return { ...state, headers: state.headers.filter((_, i) => i !== action.payload) };

        case ActionTypes.SET_AUTH_TYPE:
            return { ...state, authType: action.payload };
        case ActionTypes.UPDATE_AUTH_DATA:
            return { ...state, authData: { ...state.authData, ...action.payload } };

        case ActionTypes.SET_BODY_TYPE:
            return { ...state, bodyType: action.payload };
        case ActionTypes.SET_RAW_BODY:
            return { ...state, rawBody: action.payload };

        case ActionTypes.UPDATE_FORM_DATA:
            return { ...state, formData: action.payload };
        case ActionTypes.ADD_FORM_DATA:
            return { ...state, formData: [...state.formData, { key: '', value: '', type: 'text', enabled: true, file: null }] };
        case ActionTypes.REMOVE_FORM_DATA:
            return { ...state, formData: state.formData.filter((_, i) => i !== action.payload) };

        case ActionTypes.UPDATE_URL_ENCODED_DATA:
            return { ...state, urlEncodedData: action.payload };
        case ActionTypes.ADD_URL_ENCODED_DATA:
            return { ...state, urlEncodedData: [...state.urlEncodedData, { key: '', value: '', description: '', enabled: true }] };
        case ActionTypes.REMOVE_URL_ENCODED_DATA:
            return { ...state, urlEncodedData: state.urlEncodedData.filter((_, i) => i !== action.payload) };

        case ActionTypes.UPDATE_SETTINGS:
            return { ...state, settings: { ...state.settings, ...action.payload } };
        case ActionTypes.SET_INITIAL_DATA:
            return { ...state, requestHistory: action.payload.history, savedRequests: action.payload.saved };
        case ActionTypes.RESET_STATE:
            return initialState;
        case ActionTypes.UPDATE_STATE:
            return { ...state, ...action.payload }



        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};
