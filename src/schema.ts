/**
 * [arg-definition, description]
 *
 * arg-definition:
 * 1. boolean: `name|alias(n)`
 * 1. value: `name|alias(n)=<default-value>`
 * 1. multi-values: `name|alias(n)*`
 *
 * Comment:
 * 1. alias, n(short name), default-value are optional
 * 1. alias could be multiple
 * 1. name will be recognized also as shortcut if it's single char
 * 1. the default of multi-values is `undefined`, not empty array
 * 1. for boolean option, `--no-(name)` will be handled as value `false`,
 *    e.g., `--enable` ==> { enable: true }; `--no-enable` ==> { enable: false }
 *
 * Examples:
 * 1. `keep-alive|keep(k)` a boolean value with an alias and a shortcut
 * 1. `keep-alive(k)`
 * 1. `k|keep|keep-alive`
 * 1. `-m` invalid
 * 1. `m-` invalid
 * 1. `port=80` default value will be string `'80'`
 * 1. `port=` default value will be `undefined`
 *
 * @type CliasSchema
 */
export type CliosSchema = [string, string?];

export type CliosHelpMetaOption = [string, string, string, string?];

export type CliosHelpMeta = {
  summaries?: string[];
  options?: CliosHelpMetaOption[];
};

export type CliosOutput = {
  options: { [k: string]: any };
  values: string[];
};
