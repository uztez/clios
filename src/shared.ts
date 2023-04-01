import { isUndefined, padEnd, padStart } from 'lodash';

export const toBoolean = (() => {
  const IS_FALSE = /^(false|n(o)?)$/i;
  return (value: string): boolean => {
    if (!value) return false;
    return !IS_FALSE.test(value);
  };
})();

export const terminalBold = (str: string) => `${'\x1b[1m'}${str}${'\x1b[0m'}`;

export const getHelpText = ({
  meta: { summaries = [], options = [] },
  prefix = '<command>',
  suffix = '',
  shell = false,
}: {
  meta: { summaries?: string[]; options?: [string, string, string, string?][] };
  prefix?: string;
  suffix?: string;
  shell?: boolean;
}): string => {
  let summary = ['[-h | --help]', ...summaries].join(' ');
  options = [['h', 'help', 'display this help message'], ...options];
  options = options.map(([short, long, desc, val]) => [
    short ? `-${short}` : '',
    `--${long}`,
    isUndefined(val) ? desc : `${desc}. Default value is "${val}"`,
  ]);
  let shortWidth = `-h`.length;
  let longWidth = options.reduce((m, v) => Math.max(m, v[1].length), 0);
  return [
    [prefix, summary, suffix]
      .filter((s) => s)
      .map((s) => s.trim())
      .join(' '),
    'options:',
    ...options.map(([short, long, desc]) => {
      let shortText = padStart(short, shortWidth);
      if (shell) shortText = terminalBold(shortText);
      long = padEnd(long, longWidth);
      if (shell) long = terminalBold(long);
      let sep = short ? ',' : ' ';
      return `  ${shortText}${sep} ${long}  ${desc}`;
    }),
  ].join('\n');
};
