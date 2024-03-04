import { terminalBold, toBoolean } from './shared';

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
});
