export default function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== "object") return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}


// Helper: create a deterministic, comparable representation of environments
const normalizeEnvironments = (envs = []) => {
  // Ensure we always return environments sorted by id (or name)
  return envs
    .map((env) => {
      const normalizedVars =
        Array.isArray(env.variables)
          ? env.variables
              // ignore empty keys & any transient fields on variables
              .filter((v) => v && String(v.key).trim() !== "")
              // normalize each variable
              .map((v) => ({
                key: String(v.key).trim(),
                // stringify value to avoid undefined differences; keep booleans/numbers
                value: v.value === undefined || v.value === null ? "" : v.value,
                // keep only essential fields if you need them (e.g., enabled)
                enabled: !!v.enabled,
              }))
              // sort by key to make order deterministic
              .sort((a, b) => a.key.localeCompare(b.key))
          : [];

      return {
        // keep only fields that matter to equality check
        id: env.id,
        name: env.name,
        // other stable metadata you want to compare (exclude lastModified, isNew, transient flags)
        variables: normalizedVars,
      };
    })
    // sort envs by id (or name) so order doesn't matter
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
};

// Deep-equal via JSON compare of normalized structures
export const deepEqualEnvs = (a, b) => {
  try {
    const na = normalizeEnvironments(a);
    const nb = normalizeEnvironments(b);
    return JSON.stringify(na) === JSON.stringify(nb);
  } catch (err) {
    // fallback conservative behavior
    console.error("Normalization or comparison failed", err);
    return false;
  }
};
