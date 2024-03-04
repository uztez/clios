import { isUndefined, padEnd, padStart } from 'lodash';
import { CliosHelpMeta, CliosHelpMetaOption } from './schema';
import { OptionDefinition } from './option';
import { terminalBold } from './shared';

export class CliosPrinter {
  static of = (definitions: OptionDefinition[]) => new CliosPrinter(definitions);
  constructor(public definitions: OptionDefinition[]) {}

  getHelpMeta = (): CliosHelpMeta => {
    let summaries = this.definitions.reduce((all, def) => {
      let summary;
      if (def.type === 'boolean') {
        if (def.short) {
          summary = `[-${def.short} | --${def.name}]`;
        } else {
          summary = `[--${def.name}]`;
        }
      } else {
        if (def.short) {
          summary = `[-${def.short} <value> | --${def.name}=<value>]`;
        } else {
          summary = `[--${def.name}=<value>]`;
        }
        if (def.type === 'array') {
          summary += '*';
        }
      }
      return [...all, summary];
    }, [] as string[]);
    let options = this.definitions.reduce((all, def) => {
      let lines: CliosHelpMetaOption[] = [];
      let suffix = def.type === 'boolean' ? '' : '=<value>';
      lines.push([def.short, `${def.name}${suffix}`, def.description]);
      if (!isUndefined(def.defaultValue)) {
        lines[0].push(String(def.defaultValue));
      }
      def.aliases.forEach((alias) => {
        lines.push(['', `${alias}${suffix}`, `alias of ${def.name}`]);
      });
      return [...all, ...lines];
    }, [] as CliosHelpMetaOption[]);
    return { summaries, options };
  };

  getHelpText = ({ prefix = '<command>', suffix = '', shell = false }: { prefix?: string; suffix?: string; shell?: boolean } = {}): string => {
    let { summaries = [], options = [] } = this.getHelpMeta();
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

  print = ({ prefix = '<command>', suffix = '', shell = false }: { prefix?: string; suffix?: string; shell?: boolean } = {}) => {
    console.log(this.getHelpText({ prefix, suffix, shell }));
  };
}
