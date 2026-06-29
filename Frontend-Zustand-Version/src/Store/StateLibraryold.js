import React from 'react';

// Core store creation function
export const create = (createState) => {
    let state;
    const listeners = new Set();

    // Get current state
    const getState = () => state;

    // Set state and notify listeners
    const setState = (partial, replace) => {
        const nextState = typeof partial === 'function'
            ? partial(state)
            : partial;

        if (!Object.is(nextState, state)) {
            const previousState = state;
            state = replace ?? typeof nextState !== 'object'
                ? nextState
                : Object.assign({}, state, nextState);

            listeners.forEach((listener) => listener(state, previousState));
        }
    };

    // Subscribe to state changes
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    // Destroy store
    const destroy = () => listeners.clear();

    const api = { getState, setState, subscribe, destroy };

    // Initialize state
    state = createState(setState, getState, api);

    // Return the hook function
    const useStore = (selector, equalityFn = Object.is) => {
        const [, forceUpdate] = React.useReducer((c) => c + 1, 0);

        // If no selector, return entire state
        if (!selector) {
            selector = getState;
        }

        const state = getState();
        const stateRef = React.useRef(state);
        const selectorRef = React.useRef(selector);
        const equalityFnRef = React.useRef(equalityFn);
        const erroredRef = React.useRef(false);

        const currentSliceRef = React.useRef();
        if (currentSliceRef.current === undefined) {
            currentSliceRef.current = selector(state);
        }

        let newStateSlice;
        let hasNewStateSlice = false;

        // Only recompute if selector or state changed
        if (
            stateRef.current !== state ||
            selectorRef.current !== selector ||
            equalityFnRef.current !== equalityFn ||
            erroredRef.current
        ) {
            newStateSlice = selector(state);
            hasNewStateSlice = !equalityFn(currentSliceRef.current, newStateSlice);
        }

        React.useEffect(() => {
            if (hasNewStateSlice) {
                currentSliceRef.current = newStateSlice;
            }
            stateRef.current = state;
            selectorRef.current = selector;
            equalityFnRef.current = equalityFn;
            erroredRef.current = false;
        });

        React.useEffect(() => {
            const listener = () => {
                try {
                    const nextState = getState();
                    const nextStateSlice = selectorRef.current(nextState);

                    if (!equalityFnRef.current(currentSliceRef.current, nextStateSlice)) {
                        stateRef.current = nextState;
                        currentSliceRef.current = nextStateSlice;
                        forceUpdate();
                    }
                } catch (error) {
                    erroredRef.current = true;
                    forceUpdate();
                }
            };

            const unsubscribe = subscribe(listener);
            listener(); // Call immediately in case state changed

            return unsubscribe;
        }, []);

        return hasNewStateSlice ? newStateSlice : currentSliceRef.current;
    };

    // Attach API methods to the hook
    Object.assign(useStore, api);

    return useStore;
};

// Middleware: Immer-like immutable updates
export const immer = (config) => (set, get, api) => {
    return config(
        (fn) => {
            if (typeof fn === 'function') {
                set((state) => {
                    // Create a draft that allows mutations
                    const draft = Array.isArray(state) ? [...state] : { ...state };

                    // Deep clone nested objects/arrays
                    const deepClone = (obj, cloned = new WeakMap()) => {
                        if (obj === null || typeof obj !== 'object') return obj;
                        if (cloned.has(obj)) return cloned.get(obj);

                        const clone = Array.isArray(obj) ? [] : {};
                        cloned.set(obj, clone);

                        for (const key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                clone[key] = deepClone(obj[key], cloned);
                            }
                        }
                        return clone;
                    };

                    const fullyMutableDraft = deepClone(draft);
                    fn(fullyMutableDraft);
                    return fullyMutableDraft;
                });
            } else {
                set(fn);
            }
        },
        get,
        api
    );
};

// Middleware: Persist state to localStorage
export const persist = (config, options) => (set, get, api) => {
    const { name, storage = typeof window !== 'undefined' ? window.localStorage : null } = options;

    if (!storage) {
        console.warn('Storage not available, persist middleware disabled');
        return config(set, get, api);
    }

    let state = config(
        (...args) => {
            set(...args);
            try {
                storage.setItem(name, JSON.stringify(get()));
            } catch (e) {
                console.error('Failed to save state:', e);
            }
        },
        get,
        api
    );

    // Load from storage
    try {
        const stored = storage.getItem(name);
        if (stored) {
            state = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to parse stored state:', e);
    }

    return state;
};

// Middleware: DevTools (simple logger)
export const devtools = (config, options = {}) => (set, get, api) => {
    const { name = 'Store', enabled = true } = options;

    if (!enabled) return config(set, get, api);

    return config(
        (...args) => {
            console.group(`${name} Update`);
            console.log('Previous State:', get());
            set(...args);
            console.log('Next State:', get());
            console.groupEnd();
        },
        get,
        api
    );
};

// Shallow equality comparison for better performance
export const shallow = (objA, objB) => {
    if (Object.is(objA, objB)) return true;

    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    ) {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        if (
            !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
            !Object.is(objA[keysA[i]], objB[keysA[i]])
        ) {
            return false;
        }
    }

    return true;
};

/* 
USAGE EXAMPLES:

// Basic usage
const useCountStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));

// In component - select specific state
const count = useCountStore(state => state.count);
const increment = useCountStore(state => state.increment);

// Or get entire state
const { count, increment } = useCountStore();

// With immer middleware
const useStore = create(immer((set) => ({
  user: { name: 'John', age: 30 },
  updateName: (name) => set(state => {
    state.user.name = name; // Direct mutation with immer
  })
})));

// Access outside React
useStore.getState() // Get current state
useStore.setState({ count: 5 }) // Update state
useStore.subscribe((state) => console.log(state)) // Listen to changes
*/