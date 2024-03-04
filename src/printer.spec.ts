import { OptionDefinition } from './option';
import { CliosPrinter } from './printer';
import { CliosSchema } from './schema';

describe('CliosPrinter', () => {
  describe('getHelpMeta', () => {
    let definitions: OptionDefinition[];
    let printer!: CliosPrinter;
    beforeEach(() => {
      let options: CliosSchema[] = [
        ['tags|tag*', 'the tags'],
        ['host|hosts=localhost', 'the host'],
        ['port(p)=1080', 'the port'],
        ['lazy(L)', 'load it lazily'],
        ['silence(s)', 'show no output'],
        ['no-proxy', 'use no proxy'],
      ];
      definitions = options.map(OptionDefinition.of);
      printer = CliosPrinter.of(definitions);
    });
    it('contains all help detail', () => {
      let meta = printer.getHelpMeta();
      expect(meta).toEqual({
        summaries: ['[--tags=<value>]*', '[--host=<value>]', '[-p <value> | --port=<value>]', '[-L | --lazy]', '[-s | --silence]', '[--no-proxy]'],
        options: [
          ['', 'tags=<value>', 'the tags'],
          ['', 'tag=<value>', 'alias of tags'],
          ['', 'host=<value>', 'the host', 'localhost'],
          ['', 'hosts=<value>', 'alias of host'],
          ['p', 'port=<value>', 'the port', '1080'],
          ['L', 'lazy', 'load it lazily'],
          ['s', 'silence', 'show no output'],
          ['', 'no-proxy', 'use no proxy'],
        ],
      });
    });
  });
  describe('getHelpText', () => {
    let printer!: CliosPrinter;
    beforeEach(() => {
      printer = CliosPrinter.of([]);
    });
    it('generate blank', () => {
      jest.spyOn(printer, 'getHelpMeta').mockReturnValue({});
      let helpText = printer.getHelpText();
      expect(helpText).toBe(['<command> [-h | --help]', 'options:', '  -h, --help  display this help message'].join('\n'));
    });
    it('generate blank with shell', () => {
      jest.spyOn(printer, 'getHelpMeta').mockReturnValue({});
      let helpText = printer.getHelpText({ shell: true });
      expect(helpText).toBe(
        ['<command> [-h | --help]', 'options:', '  \x1b[1m-h\x1b[0m, \x1b[1m--help\x1b[0m  display this help message'].join('\n')
      );
    });
    it('generate blank with suffix and prefix', () => {
      jest.spyOn(printer, 'getHelpMeta').mockReturnValue({});
      let helpText = printer.getHelpText({ prefix: 'ls', suffix: 'args' });
      expect(helpText).toBe(['ls [-h | --help] args', 'options:', '  -h, --help  display this help message'].join('\n'));
    });
    it('generate with options', () => {
      jest.spyOn(printer, 'getHelpMeta').mockReturnValue({
        summaries: ['[-p <value> | --port=<value>]'],
        options: [
          ['p', 'port=<value>', 'port to use', '3000'],
          ['', 'lazy', 'lazy call'],
        ],
      });
      let helpText = printer.getHelpText();
      expect(helpText).toBe(
        [
          '<command> [-h | --help] [-p <value> | --port=<value>]',
          'options:',
          '  -h, --help          display this help message',
          '  -p, --port=<value>  port to use. Default value is "3000"',
          '      --lazy          lazy call',
        ].join('\n')
      );
    });
  });
  describe('print', () => {
    let printer!: CliosPrinter;
    beforeEach(() => {
      printer = CliosPrinter.of([]);
    });
    it('print text', () => {
      // spys
      let log = jest.spyOn(global.console, 'log').mockImplementation();
      let getHelpText = jest.spyOn(printer, 'getHelpText').mockReturnValue('xxx');
      // call print
      printer.print();
      // tests
      expect(getHelpText).toHaveBeenCalledWith({ prefix: '<command>', suffix: '', shell: false });
      expect(log).toHaveBeenCalledWith('xxx');
      // release
      log.mockRestore();
    });
    it('get help text with no arg set', () => {
      // spys
      let log = jest.spyOn(global.console, 'log').mockImplementation();
      let getHelpText = jest.spyOn(printer, 'getHelpText').mockReturnValue('xxx');
      // call print
      printer.print({ prefix: 'servez', suffix: 'dirs', shell: true });
      // tests
      expect(getHelpText).toHaveBeenCalledWith({ prefix: 'servez', suffix: 'dirs', shell: true });
      expect(log).toHaveBeenCalledWith('xxx');
      // release
      log.mockRestore();
    });
  });
});
