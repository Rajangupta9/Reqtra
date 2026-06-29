// import React from 'react';

// // Core store creation function
// export const create = (createState) => {
//     let state;
//     const listeners = new Set();

//     // Get current state
//     const getState = () => state;

//     // Set state and notify listeners
//     const setState = (partial, replace) => {
//         const nextState = typeof partial === 'function'
//             ? partial(state)
//             : partial;

//         if (!Object.is(nextState, state)) {
//             const previousState = state;
//             state = replace ?? typeof nextState !== 'object'
//                 ? nextState
//                 : Object.assign({}, state, nextState);

//             listeners.forEach((listener) => listener(state, previousState));
//         }
//     };

//     // Subscribe to state changes
//     const subscribe = (listener) => {
//         listeners.add(listener);
//         return () => listeners.delete(listener);
//     };

//     // Destroy store
//     const destroy = () => listeners.clear();

//     const api = { getState, setState, subscribe, destroy };

//     // Initialize state
//     state = createState(setState, getState, api);

//     // Return the hook function using useSyncExternalStore
//     const useStore = (selector, equalityFn = Object.is) => {
//         // Default selector returns entire state
//         const selectorFn = selector || ((state) => state);
        
//         // Store refs for selector and equality function
//         const selectorRef = React.useRef(selectorFn);
//         const equalityFnRef = React.useRef(equalityFn);
//         const erroredRef = React.useRef(false);
//         const currentSliceRef = React.useRef();

//         // Update refs when they change
//         React.useEffect(() => {
//             selectorRef.current = selectorFn;
//             equalityFnRef.current = equalityFn;
//         });

//         // Subscribe function for useSyncExternalStore
//         const subscribeToStore = React.useCallback((onStoreChange) => {
//             const listener = () => {
//                 try {
//                     const nextSlice = selectorRef.current(getState());
                    
//                     // Only trigger re-render if selected slice changed
//                     if (!equalityFnRef.current(currentSliceRef.current, nextSlice)) {
//                         currentSliceRef.current = nextSlice;
//                         onStoreChange();
//                     }
//                 } catch (error) {
//                     erroredRef.current = true;
//                     onStoreChange();
//                 }
//             };

//             return subscribe(listener);
//         }, []);

//         // Get snapshot function for useSyncExternalStore
//         const getSnapshot = React.useCallback(() => {
//             try {
//                 const nextSlice = selectorRef.current(getState());
                
//                 // Initialize on first call
//                 if (currentSliceRef.current === undefined) {
//                     currentSliceRef.current = nextSlice;
//                 }
                
//                 // Check if slice changed
//                 if (!equalityFnRef.current(currentSliceRef.current, nextSlice)) {
//                     currentSliceRef.current = nextSlice;
//                 }
                
//                 erroredRef.current = false;
//                 return currentSliceRef.current;
//             } catch (error) {
//                 erroredRef.current = true;
//                 throw error;
//             }
//         }, []);

//         // Server-side snapshot (same as client for simplicity)
//         const getServerSnapshot = React.useCallback(() => {
//             return selectorRef.current(getState());
//         }, []);

//         // Use React's useSyncExternalStore hook
//         return React.useSyncExternalStore(
//             subscribeToStore,
//             getSnapshot,
//             getServerSnapshot
//         );
//     };

//     // Attach API methods to the hook
//     Object.assign(useStore, api);

//     return useStore;
// };

// // Middleware: Immer-like immutable updates
// export const immer = (config) => (set, get, api) => {
//     return config(
//         (fn) => {
//             if (typeof fn === 'function') {
//                 set((state) => {
//                     // Create a draft that allows mutations
//                     const draft = Array.isArray(state) ? [...state] : { ...state };

//                     // Deep clone nested objects/arrays
//                     const deepClone = (obj, cloned = new WeakMap()) => {
//                         if (obj === null || typeof obj !== 'object') return obj;
//                         if (cloned.has(obj)) return cloned.get(obj);

//                         const clone = Array.isArray(obj) ? [] : {};
//                         cloned.set(obj, clone);

//                         for (const key in obj) {
//                             if (obj.hasOwnProperty(key)) {
//                                 clone[key] = deepClone(obj[key], cloned);
//                             }
//                         }
//                         return clone;
//                     };

//                     const fullyMutableDraft = deepClone(draft);
//                     fn(fullyMutableDraft);
//                     return fullyMutableDraft;
//                 });
//             } else {
//                 set(fn);
//             }
//         },
//         get,
//         api
//     );
// };

// // Middleware: Persist state to localStorage
// export const persist = (config, options) => (set, get, api) => {
//     const { name, storage = typeof window !== 'undefined' ? window.localStorage : null } = options;

//     if (!storage) {
//         console.warn('Storage not available, persist middleware disabled');
//         return config(set, get, api);
//     }

//     let state = config(
//         (...args) => {
//             set(...args);
//             try {
//                 storage.setItem(name, JSON.stringify(get()));
//             } catch (e) {
//                 console.error('Failed to save state:', e);
//             }
//         },
//         get,
//         api
//     );

//     // Load from storage
//     try {
//         const stored = storage.getItem(name);
//         if (stored) {
//             state = JSON.parse(stored);
//         }
//     } catch (e) {
//         console.error('Failed to parse stored state:', e);
//     }

//     return state;
// };

// // Middleware: DevTools (simple logger)
// export const devtools = (config, options = {}) => (set, get, api) => {
//     const { name = 'Store', enabled = true } = options;

//     if (!enabled) return config(set, get, api);

//     return config(
//         (...args) => {
//             console.group(`${name} Update`);
//             console.log('Previous State:', get());
//             set(...args);
//             console.log('Next State:', get());
//             console.groupEnd();
//         },
//         get,
//         api
//     );
// };

// // Shallow equality comparison for better performance
// export const shallow = (objA, objB) => {
//     if (Object.is(objA, objB)) return true;

//     if (
//         typeof objA !== 'object' ||
//         objA === null ||
//         typeof objB !== 'object' ||
//         objB === null
//     ) {
//         return false;
//     }

//     const keysA = Object.keys(objA);
//     const keysB = Object.keys(objB);

//     if (keysA.length !== keysB.length) return false;

//     for (let i = 0; i < keysA.length; i++) {
//         if (
//             !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
//             !Object.is(objA[keysA[i]], objB[keysA[i]])
//         ) {
//             return false;
//         }
//     }

//     return true;
// };

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

// With shallow comparison for objects
const { tabs, activeTabId } = useStore(
  state => ({ tabs: state.tabs, activeTabId: state.activeTabId }),
  shallow
);
*/


import { useSyncExternalStore } from 'react';

/**
 * Creates a store with state management capabilities
 * @param {Function} createStateFn - Function that initializes the state
 * @returns {Object} Store object with getState, setState, subscribe methods
 */
function createStore(createStateFn) {
    let state;
    let initialState;
    const listeners = new Set();

    const getState = () => state;

    const setState = (newStateOrFn) => {
        const nextState = typeof newStateOrFn === 'function'
            ? newStateOrFn(state)
            : newStateOrFn;

        state = { ...state, ...nextState };
        listeners.forEach((listener) => listener());
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    const destroy = () => listeners.clear();

    // Initialize state
    initialState = createStateFn(setState, getState);
    state = initialState;

    return { getState, setState, subscribe, destroy, initialState };
}

/**
 * Identity function - returns the same value passed to it
 * Used as default selector
 */
const identity = (arg) => arg;

/**
 * Creates a custom React hook for state management
 * @param {Function} createStateFn - Function that initializes the state
 * @returns {Function} useStore hook
 */
export function create(createStateFn) {
    const store = createStore(createStateFn);

    /**
     * Hook to subscribe to store state
     * @param {Function} selector - Optional function to select part of state
     * @returns Selected state value
     */
    function useStore(selector = identity) {
        return useSyncExternalStore(
            store.subscribe,
            () => selector(store.getState()),
            () => selector(store.initialState)
        );
    }

    // Attach store methods to the hook
    useStore.getState = store.getState;
    useStore.setState = store.setState;
    useStore.subscribe = store.subscribe;
    useStore.destroy = store.destroy;

    return useStore;
}

/**
 * Shallow equality comparison for objects
 * @param {*} objA - First object
 * @param {*} objB - Second object
 * @returns {boolean} True if objects are shallowly equal
 */
export function shallow(objA, objB) {
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
}

/**
 * Immer-like middleware for immutable updates with mutations
 * @param {Function} config - Store configuration function
 * @returns {Function} Wrapped configuration function
 */
export function immer(config) {
    return (set, get, api) => {
        const immerSet = (fn) => {
            if (typeof fn === 'function') {
                set((state) => {
                    // Deep clone helper
                    const deepClone = (obj, cloned = new WeakMap()) => {
                        if (obj === null || typeof obj !== 'object') return obj;
                        if (cloned.has(obj)) return cloned.get(obj);

                        const clone = Array.isArray(obj) ? [] : {};
                        cloned.set(obj, clone);

                        for (const key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                                clone[key] = deepClone(obj[key], cloned);
                            }
                        }
                        return clone;
                    };

                    const draft = deepClone(state);
                    fn(draft);
                    return draft;
                });
            } else {
                set(fn);
            }
        };

        return config(immerSet, get, api);
    };
}

/**
 * Persist middleware - saves state to localStorage
 * @param {Function} config - Store configuration function
 * @param {Object} options - Persistence options
 * @param {string} options.name - Storage key name
 * @param {Object} options.storage - Storage object (default: localStorage)
 * @returns {Function} Wrapped configuration function
 */
export function persist(config, options) {
    return (set, get, api) => {
        const { name, storage = typeof window !== 'undefined' ? window.localStorage : null } = options;

        if (!storage) {
            console.warn('Storage not available, persist middleware disabled');
            return config(set, get, api);
        }

        const persistSet = (...args) => {
            set(...args);
            try {
                storage.setItem(name, JSON.stringify(get()));
            } catch (e) {
                console.error('Failed to save state:', e);
            }
        };

        // Load from storage
        let initialState = config(persistSet, get, api);
        
        try {
            const stored = storage.getItem(name);
            if (stored) {
                const parsedState = JSON.parse(stored);
                initialState = { ...initialState, ...parsedState };
            }
        } catch (e) {
            console.error('Failed to parse stored state:', e);
        }

        return initialState;
    };
}

/**
 * DevTools middleware - logs state changes
 * @param {Function} config - Store configuration function
 * @param {Object} options - DevTools options
 * @param {string} options.name - Store name for logging
 * @param {boolean} options.enabled - Enable/disable logging
 * @returns {Function} Wrapped configuration function
 */
export function devtools(config, options = {}) {
    return (set, get, api) => {
        const { name = 'Store', enabled = true } = options;

        if (!enabled) return config(set, get, api);

        const devtoolsSet = (...args) => {
            console.group(`${name} Update`);
            console.log('Previous State:', get());
            set(...args);
            console.log('Next State:', get());
            console.groupEnd();
        };

        return config(devtoolsSet, get, api);
    };
}

/* 
USAGE EXAMPLES:

// 1. Basic Counter Store
const useCounterStore = create((set, get) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
    double: () => set({ count: get().count * 2 })
}));

// In component
function Counter() {
    const count = useCounterStore(state => state.count);
    const increment = useCounterStore(state => state.increment);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
        </div>
    );
}

// 2. Bear Population Example (from article)
const useBearStore = create((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears) => set({ bears: newBears })
}));

function BearCounter() {
    const bears = useBearStore(state => state.bears);
    const increasePopulation = useBearStore(state => state.increasePopulation);
    const removeAllBears = useBearStore(state => state.removeAllBears);
    const updateBears = useBearStore(state => state.updateBears);
    
    return (
        <div>
            <h1>Bears: {bears}</h1>
            <button onClick={increasePopulation}>Increase Population</button>
            <button onClick={removeAllBears}>Remove All Bears</button>
            <input
                type="number"
                onChange={(e) => updateBears(Number(e.target.value))}
                placeholder="Update bear count"
            />
        </div>
    );
}

// 3. With Immer Middleware
const useUserStore = create(immer((set) => ({
    user: { name: 'John', age: 30, address: { city: 'NYC' } },
    updateName: (name) => set(draft => {
        draft.user.name = name; // Direct mutation
    }),
    updateCity: (city) => set(draft => {
        draft.user.address.city = city; // Deep mutation
    })
})));

// 4. With Persist Middleware
const useSettingsStore = create(
    persist(
        (set) => ({
            theme: 'light',
            language: 'en',
            toggleTheme: () => set(state => ({ 
                theme: state.theme === 'light' ? 'dark' : 'light' 
            }))
        }),
        { name: 'app-settings' }
    )
);

// 5. Multiple Middleware
const useAppStore = create(
    devtools(
        persist(
            immer((set) => ({
                todos: [],
                addTodo: (text) => set(draft => {
                    draft.todos.push({ id: Date.now(), text, done: false });
                })
            })),
            { name: 'todos-storage' }
        ),
        { name: 'TodoStore' }
    )
);

// 6. Using Shallow for Multiple Values
function MultipleValues() {
    const { count, loading } = useCounterStore(
        state => ({ count: state.count, loading: state.loading }),
        shallow
    );
    
    return <div>{count}</div>;
}

// 7. Outside React - Direct Access
// Get state
const currentCount = useCounterStore.getState().count;

// Update state
useCounterStore.setState({ count: 10 });

// Subscribe to changes
const unsubscribe = useCounterStore.subscribe((state) => {
    console.log('State changed:', state);
});

// Cleanup
unsubscribe();
*/