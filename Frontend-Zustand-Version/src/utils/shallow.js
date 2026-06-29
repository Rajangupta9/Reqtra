
export function shallow(oldState, newState) {
  if (Object.is(oldState, newState)) {
    return true;
  }
  if (
    typeof oldState !== 'object' ||
    oldState === null ||
    typeof newState !== 'object' ||
    newState === null
  ) {
    return false;
  }
  const keysA = Object.keys(oldState);
  const keysB = Object.keys(newState);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(newState, keysA[i]) ||
      !Object.is(oldState[keysA[i]], newState[keysA[i]])
    ) {
      return false;
    }
  }
  return true;
}