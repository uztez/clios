export const toBoolean = (() => {
  const IS_FALSE = /^(false|n(o)?)$/i;
  return (value: string): boolean => {
    if (!value) return false;
    return !IS_FALSE.test(value);
  };
})();

export const terminalBold = (str: string) => `${'\x1b[1m'}${str}${'\x1b[0m'}`;
