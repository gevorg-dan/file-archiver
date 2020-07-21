import React from "react";

export function useBoolean(
  initValue: boolean
): [boolean, () => void, () => void] {
  const [state, setState] = React.useState(initValue);
  return [state, () => setState(true), () => setState(false)];
}
