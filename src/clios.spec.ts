import { CliosParser } from './parser';
import { getHelpText } from './shared';
import { Clios } from './clios';

jest.mock('./shared');

describe('Clios', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it('create with parser', () => {
    jest.spyOn(CliosParser, 'of');
    Clios.of([], []);
    expect(CliosParser.of).toHaveBeenCalled();
  });
  it('parse', () => {
    let clios = Clios.of([['all']], '--all');
    jest.spyOn(clios.parser, 'parse').mockImplementation();
    clios.parse(true);
    expect(clios.parser.parse).toHaveBeenCalledWith(['--all'], true);
  });
  it('parse with no strict set', () => {
    let clios = Clios.of([['all']], '--all');
    jest.spyOn(clios.parser, 'parse').mockImplementation();
    clios.parse();
    expect(clios.parser.parse).toHaveBeenCalledWith(['--all'], false);
  });
  it('get help text', () => {
    jest.spyOn(CliosParser, 'of').mockReturnValue(new CliosParser([]));
    let clios = Clios.of([], '-h');
    expect(clios.isHelp).toBe(true);
    jest.spyOn(clios.parser, 'getHelpMeta');
    clios.getHelpText({ prefix: 'app', suffix: 'args', shell: true });
    expect(getHelpText).toBeCalled();
    expect(clios.parser.getHelpMeta).toBeCalled();
  });
  it('get help text with no arg set', () => {
    jest.spyOn(CliosParser, 'of').mockReturnValue(new CliosParser([]));
    let clios = Clios.of([], '-h');
    expect(clios.isHelp).toBe(true);
    jest.spyOn(clios.parser, 'getHelpMeta').mockReturnValue({ summaries: [], options: [] });
    clios.getHelpText();
    expect(clios.parser.getHelpMeta).toBeCalled();
    expect(getHelpText).toBeCalledWith({ meta: { summaries: [], options: [] }, prefix: '<command>', suffix: '', shell: false });
  });
});
