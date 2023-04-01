import { getHelpText, terminalBold, toBoolean } from './shared';

describe('shared', () => {
  describe('toBoolean', () => {
    it('understand trusy string', () => {
      let trues = 'yes,y,true,_any_non-falsy:value'.split(',');
      trues.forEach((v) => {
        let result = toBoolean(v);
        expect(result).toBe(true);
      });
    });
    it('understand falsy string', () => {
      let falses = ',N,n,no,false'.split(',');
      falses.forEach((v) => {
        let result = toBoolean(v);
        expect(result).toBe(false);
      });
    });
  });
  describe('terminalBold', () => {
    it('enable shell bold font', () => {
      let result = terminalBold('hello');
      expect(result).toBe('\x1b[1mhello\x1b[0m');
    });
  });
  describe('getHelpText', () => {
    it('generate blank', () => {
      let blankHelp = getHelpText({ meta: {} });
      expect(blankHelp).toBe(['<command> [-h | --help]', 'options:', '  -h, --help  display this help message'].join('\n'));
    });
    it('generate blank with shell', () => {
      let blankHelp = getHelpText({ meta: {}, shell: true });
      expect(blankHelp).toBe(
        ['<command> [-h | --help]', 'options:', '  \x1b[1m-h\x1b[0m, \x1b[1m--help\x1b[0m  display this help message'].join('\n')
      );
    });
    it('generate blank with suffix and prefix', () => {
      let blankHelp = getHelpText({ meta: {}, prefix: 'ls', suffix: 'args' });
      expect(blankHelp).toBe(['ls [-h | --help] args', 'options:', '  -h, --help  display this help message'].join('\n'));
    });
    it('generate with options', () => {
      let blankHelp = getHelpText({
        meta: {
          summaries: ['[-p <value> | --port=<value>]'],
          options: [
            ['p', 'port=<value>', 'port to use', '3000'],
            ['', 'lazy', 'lazy call'],
          ],
        },
      });
      expect(blankHelp).toBe(
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
});
