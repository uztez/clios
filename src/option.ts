import { camelCase, isUndefined } from 'lodash';
import { CliosError } from './error';
import { toBoolean } from './shared';
import { CliosSchema } from './schema';

/**
 *
 * @class
 */
export class Option {
  static of = (definition: OptionDefinition, value: undefined | boolean | string | string[] = undefined) => new Option(definition, value);
  constructor(public definition: OptionDefinition, public value: undefined | boolean | string | string[] = undefined) {
    if (definition.type === 'array' && typeof value === 'string') this.value = [value];
  }
  set(value: string, strict: boolean = false) {
    if (this.definition.type !== 'array') {
      if (strict && !isUndefined(this.value)) {
        throw CliosError.of(`Option '${this.definition.name}' set with ambiguity values: ${this.value}, ${value}`);
      }
      if (this.definition.type === 'boolean') {
        this.value = toBoolean(value);
      } else {
        this.value = value;
      }
    } else {
      if (!this.value) {
        this.value = [value];
      } else {
        (this.value as string[]).push(value);
      }
    }
  }
}

/**
 *
 * @class
 */
export class OptionDefinition {
  static of = (schema: CliosSchema) => new OptionDefinition(schema);
  static readonly REGULARS = {
    DEFINITION: /^([a-zA-Z](?:[\w-]*[\w])?)((?:\|(?:[a-zA-Z](?:(?:[\w-]*[\w])?)))*)(?:\(([a-zA-Z_])\))?(\*|(?:=(.*))?)$/,
    SHORTCUT: /^([a-zA-Z])$/,
  };

  type: 'boolean' | 'string' | 'array';
  key: string;
  name: string;
  short: string;
  aliases: string[];
  description: string;
  defaultValue: boolean | string | undefined;

  constructor(public schema: CliosSchema) {
    let [definition, description] = schema;
    let match = definition.match(OptionDefinition.REGULARS.DEFINITION);
    if (!match) {
      throw CliosError.of(`Invalid argument definition: ${definition}`);
    }
    let [name, alias, short, val, value] = match.slice(1, 6);
    this.name = name;
    this.key = camelCase(name);
    this.aliases = alias ? alias.slice(1).split('|') : [];
    if (!short) {
      let candidates = [name, ...this.aliases];
      short = candidates.find((v) => OptionDefinition.REGULARS.SHORTCUT.test(v)) || '';
    }
    this.short = short;
    this.description = description || '';
    if (!val) {
      this.type = 'boolean';
      this.defaultValue = undefined;
    } else if (val === '*') {
      this.type = 'array';
      this.defaultValue = undefined;
    } else {
      this.type = 'string';
      this.defaultValue = value || undefined;
    }
  }
}
