import { CliosError } from './error';
import { Option, OptionDefinition } from './option';
import { CliosOutput, CliosSchema } from './schema';
import { has, isUndefined } from 'lodash';
import { toBoolean } from './shared';

/**
 * @class
 */
export class CliosParser {
  static readonly of = (schemas: CliosSchema[]) => new CliosParser(schemas);
  static readonly REGULARS = {
    LOOKS_LIKE_MULTIPLE_SHORTCUTS: /^-[a-zA-Z][a-zA-Z].*$/,
    IS_MULTIPLE_SHORTCUTS: /^-[a-zA-Z]+$/,
    LOOKS_LIKE_SHORTCUT: /^-\w.*/,
    IS_SHORTCUT: /^-[a-zA-Z]$/,
    LOOKS_LIKE_OPTION: /^--.*$/,
    IS_LONG_OPTION: /^--((?:no-)?)([a-zA-Z](?:[\w-]*[\w])?)(?:=(.*))?$/,
  };

  definitions: OptionDefinition[];

  constructor(public schemas: CliosSchema[]) {
    this.definitions = schemas.map((item) => OptionDefinition.of(item));
  }

  private tryUnderstand = {
    asOptionGroup: (arg: string, strict: boolean) => {
      let result: any = {};
      // test if it looks like a multiple shortcuts
      if (!CliosParser.REGULARS.LOOKS_LIKE_MULTIPLE_SHORTCUTS.test(arg)) {
        return null;
      }
      // test if it looks correct as a multiple shortcuts
      if (!CliosParser.REGULARS.IS_MULTIPLE_SHORTCUTS.test(arg)) {
        if (!strict) return null;
        throw new Error(`Malformed argument: ${arg}`);
      }
      // parse each character as a 'true'
      for (let i = 1; i < arg.length; i++) {
        let short = arg.charAt(i);
        let def = this.definitions.find((d) => d.short === short);
        if (!def) {
          if (!strict) return null;
          throw CliosError.of(`Unrecognized argument: ${short} in ${arg}`);
        }
        let long = def.name;
        if (def.type !== 'boolean') {
          if (!strict) return null;
          throw CliosError.of(
            `Argument: ${short} in ${arg} (short for ${long}) can't be used this way because it needs a value. Use -${short} <value> or --${long}=<value> instead.`
          );
        }
        result[long] = true;
      }
      return result;
    },
    asOption: (arg: string, strict: boolean): Option | null => {
      return this.tryUnderstand.asShortOption(arg, strict) || this.tryUnderstand.asLongOption(arg, strict);
    },
    asShortOption: (arg: string, strict: boolean): Option | null => {
      if (!CliosParser.REGULARS.IS_SHORTCUT.test(arg)) return null;
      let short = arg.charAt(1);
      let def = this.definitions.find((d) => d.short === short);
      if (!def) {
        if (!strict) return null;
        throw CliosError.of(`Unrecognized argument: ${arg}`);
      }
      let option = Option.of(def);
      if (def.type === 'boolean') {
        option.set('true');
      }
      return option;
    },
    asLongOption: (arg: string, strict: boolean): Option | null => {
      if (!CliosParser.REGULARS.LOOKS_LIKE_OPTION.test(arg)) return null;
      let match = arg.match(CliosParser.REGULARS.IS_LONG_OPTION);
      if (!match) {
        if (!strict) return null;
        throw CliosError.of(`Malformed argument: ${arg}`);
      }
      let [opposite, name, value] = match.slice(1);
      let def = this.definitions.find((d) => d.name === name || d.aliases.includes(name));
      // check if `no-` prefix is part of name
      if (!def) {
        if (opposite) {
          name = opposite + name;
          opposite = '';
          def = this.definitions.find((d) => d.name === name || d.aliases.includes(name));
        }
      }
      // the definition still not found
      if (!def) {
        if (!strict) return null;
        throw CliosError.of(`Unrecognized argument: ${arg}`);
      }
      let option = Option.of(def);
      // set option value if need
      if (def.type === 'boolean') {
        if (isUndefined(value)) value = 'true';
        if (opposite) value = String(!toBoolean(value));
        option.set(value);
      } else if (!isUndefined(value)) {
        option.set(value);
      }
      return option;
    },
    asOptionValue: (option: Option, arg: string, strict: boolean) => {
      if (strict) {
        const { LOOKS_LIKE_MULTIPLE_SHORTCUTS, LOOKS_LIKE_OPTION, LOOKS_LIKE_SHORTCUT } = CliosParser.REGULARS;
        if (LOOKS_LIKE_MULTIPLE_SHORTCUTS.test(arg)) {
          throw CliosError.of(`Option '${option.definition.name}' is expecting a value but get other options: ${arg}`);
        }
        if (LOOKS_LIKE_SHORTCUT.test(arg) || LOOKS_LIKE_OPTION.test(arg)) {
          throw CliosError.of(`Option '${option.definition.name}' is expecting a value but get another option: ${arg}`);
        }
      }
      return arg;
    },
  };

  parse(args: string[], strict: boolean = false): CliosOutput {
    let arr = [...args];
    let defaultOptions = this.getDefaultOptions();
    let result: CliosOutput = { options: {}, values: [] };
    while (arr.length) {
      let current = arr.shift()!;
      // STEP 1: check if it's option group
      let values = this.tryUnderstand.asOptionGroup(current, strict);
      if (values) {
        // TODO check if ambiguity value set
        result.options = { ...result.options, ...values };
        continue;
      }
      // STEP 2: check if it's single option
      let option = this.tryUnderstand.asOption(current, strict);
      if (option) {
        let { type, key, name } = option.definition;
        if (isUndefined(option.value)) {
          if (!arr.length) {
            if (strict) {
              throw CliosError.of(`Option '${name}' is expecting a value`);
            }
          } else {
            let value = this.tryUnderstand.asOptionValue(option, arr.shift()!, strict);
            option.set(value);
          }
        }
        let value = option.value;
        if (!isUndefined(value)) {
          if (type === 'array') {
            result.options[key] = [...(result.options[key] || []), ...(option.value as string[])];
          } else {
            if (has(result.options, key) && result.options[key] !== value) {
              if (strict) {
                throw CliosError.of(`Option '${name}' set with ambiguity values: ${result.options[key]} ${value}`);
              }
            }
            result.options[key] = value;
          }
          continue;
        }
      }
      // STEP 3: add as value
      result.values.push(current);
    }
    // merge with default options
    result.options = { ...defaultOptions, ...result.options };
    return result;
  }

  getDefaultOptions = () => {
    return this.definitions.reduce((all, def) => {
      if (!isUndefined(def.defaultValue)) {
        all[def.key] = def.defaultValue;
      }
      return all;
    }, {} as any);
  };

  getHelpMeta = () => {
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
      let lines: [string, string, string, string?][] = [];
      let suffix = def.type === 'boolean' ? '' : '=<value>';
      lines.push([def.short, `${def.name}${suffix}`, def.description]);
      if (!isUndefined(def.defaultValue)) {
        lines[0].push(String(def.defaultValue));
      }
      def.aliases.forEach((alias) => {
        lines.push(['', `${alias}${suffix}`, `alias of ${def.name}`]);
      });
      return [...all, ...lines];
    }, [] as [string, string, string, string?][]);
    return { summaries, options };
  };
}
