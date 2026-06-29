export function deepClone(value, weakMap = new WeakMap()) {
    // Handle primitives (string, number, boolean, null, undefined, symbol)
    if (value === null || typeof value !== 'object') return value;

    // Handle circular references
    if (weakMap.has(value)) return weakMap.get(value);

    // Handle Date
    if (value instanceof Date) return new Date(value.getTime());

    // Handle RegExp
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);

    // Handle Map
    if (value instanceof Map) {
        const clonedMap = new Map();
        weakMap.set(value, clonedMap);
        value.forEach((v, k) => {
            clonedMap.set(deepClone(k, weakMap), deepClone(v, weakMap));
        });
        return clonedMap;
    }

    // Handle Set
    if (value instanceof Set) {
        const clonedSet = new Set();
        weakMap.set(value, clonedSet);
        value.forEach((v) => {
            clonedSet.add(deepClone(v, weakMap));
        });
        return clonedSet;
    }

    // Handle Array
    if (Array.isArray(value)) {
        const clonedArray = [];
        weakMap.set(value, clonedArray);
        value.forEach((item, i) => {
            clonedArray[i] = deepClone(item, weakMap);
        });
        return clonedArray;
    }

    // Handle Object (including nested ones)
    const clonedObj = {};
    weakMap.set(value, clonedObj);
    Object.keys(value).forEach((key) => {
        clonedObj[key] = deepClone(value[key], weakMap);
    });

    return clonedObj;
}
