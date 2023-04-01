import { isArray } from 'lodash';
import { CliosParser } from './parser';
import { CliosSchema } from './schema';
import { getHelpText } from './shared';

export class Clios {
  static of = (schemas: CliosSchema[], args: string | string[]) => {
    return new Clios(schemas, args);
  };

  parser: CliosParser;
  argv: string[];
  isHelp: boolean;

  constructor(public schemas: CliosSchema[], args: string | string[]) {
    if (isArray(args)) {
      args = args.map((s) => s.trim()).join(' ');
    }
    this.isHelp = args === '-h' || args === '--help';
    this.argv = (args as string).split(' ');
    this.parser = CliosParser.of(schemas);
  }

  parse = (strict: boolean = false) => this.parser.parse(this.argv, strict);
  getHelpMeta = () => this.parser.getHelpMeta();
  getHelpText = ({ prefix = '<command>', suffix = '', shell = false }: { prefix?: string; suffix?: string; shell?: boolean } = {}) =>
    getHelpText({ meta: this.getHelpMeta(), prefix, suffix, shell });
}
