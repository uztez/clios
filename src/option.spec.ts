import { Option, OptionDefinition } from './option';
import { camelCase } from 'lodash';

describe('OptionDefinition', () => {
  it('create with validate input', () => {
    const truthy = 'm,max,max-number,max-player-number,m11,m1-2-3,m-0'.split(',');
    truthy.forEach((v) => {
      let def: OptionDefinition | null = null;
      try {
        def = OptionDefinition.of([v]);
      } catch (e) {}
      expect(def).toBeTruthy();
      expect(def?.key).toBe(camelCase(v));
      expect(def?.name).toBe(v);
    });
  });
  it('create with invalidate input', () => {
    const falsy = '+a,&a,#,-,-m,m-,a-b-,0,0-1'.split(',');
    falsy.forEach((v) => {
      let def: OptionDefinition | null = null;
      try {
        def = OptionDefinition.of([v]);
      } catch (e) {}
      expect(def).toBeFalsy();
    });
  });
  it('create with no description', () => {
    let def: OptionDefinition = OptionDefinition.of(['a']);
    expect(def.description).toBe('');
  });
  it('create with aliases and short', () => {
    let def: OptionDefinition = OptionDefinition.of(['os|operating-system(o)=']);
    expect(def.name).toBe('os');
    expect(def.aliases).toEqual(['operating-system']);
    expect(def.short).toBe('o');
  });
  it('create with description', () => {
    let def = OptionDefinition.of(['a', 'description']);
    expect(def.description).toBe('description');
  });
  it('create as boolean', () => {
    let def = OptionDefinition.of(['lazy']);
    expect(def.type).toBe('boolean');
    expect(def.defaultValue).toBeUndefined();
  });
  it('create as string but value not given', () => {
    let def = OptionDefinition.of(['url=']);
    expect(def.type).toBe('string');
    expect(def.defaultValue).toBeUndefined();
    expect(def.description).toBe('');
  });
  it('create as string with value', () => {
    let def = OptionDefinition.of(['url=https://foo.com/']);
    expect(def.type).toBe('string');
    expect(def.defaultValue).toBe('https://foo.com/');
  });
  it('create as array', () => {
    let def = OptionDefinition.of(['tag*']);
    expect(def.type).toBe('array');
  });
});

describe('Option', () => {
  it('create from description with no value', () => {
    let def = OptionDefinition.of(['lazy']);
    let option = Option.of(def);
    expect(option.definition).toBe(def);
    expect(option.value).toBeUndefined();
  });
  it('create from description with value', () => {
    let def = OptionDefinition.of(['port=3000']);
    let option = Option.of(def, '5000');
    expect(option.definition).toBe(def);
    expect(option.value).toBe('5000');
  });
  it('create from array description with value', () => {
    let def = OptionDefinition.of(['tag*']);
    let option = Option.of(def, 'windows');
    expect(option.definition).toBe(def);
    expect(option.value).toEqual(['windows']);
  });
  it('strictly reset value', () => {
    let def = OptionDefinition.of(['lazy']);
    let option = Option.of(def, true);
    let exception: any = null;
    try {
      option.set('n', true);
    } catch (e) {
      exception = e;
    }
    expect(exception).toBeTruthy();
  });
  it('set value as boolean', () => {
    let def = OptionDefinition.of(['lazy']);
    let option = Option.of(def);
    try {
      option.set('yes');
    } catch (_e) {}
    expect(option.value).toBe(true);
  });
  it('reset value as string', () => {
    let def = OptionDefinition.of(['host=']);
    let option = Option.of(def, 'foo.com');
    try {
      option.set('bar.com');
    } catch (_e) {}
    expect(option.value).toBe('bar.com');
  });
  it('reset value as array', () => {
    let def = OptionDefinition.of(['tag*']);
    let option = Option.of(def);
    try {
      option.set('linux');
      option.set('unix', true);
    } catch (_e) {}
    expect(option.value).toEqual(['linux', 'unix']);
  });
});
