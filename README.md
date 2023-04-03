# Usage

```
import Clios from '@uztez/clios';
let clios = Clios.of([
    ['tags|tag*', 'the tags'],
    ['protocol=http', 'the protocol'],
    ['host=localhost', 'the host'],
    ['port(p)=1080', 'the port'],
    ['lazy(L)', 'load it lazily'],
    ['silence(s)', 'show no output'],
    ['no-proxy', 'use no proxy'],
  ],
  '--tag=win --tag=linux --tags=unix arg0 --host=foo.com -p 3090 -L arg1 --no-silence --no-proxy arg2'
);
let output = clios.parse();
console.log(output);
let help = clios.getHelpText();
console.log(help);
```

And the output will be:

```
{
  options: {
    protocol: 'http',
    host: 'foo.com',
    port: '3090',
    tags: [ 'win', 'linux', 'unix' ],
    lazy: true,
    silence: false,
    noProxy: true
  },
  values: [ 'arg0', 'arg1', 'arg2' ]
}
<command> [-h | --help] [--tags=<value>]* [--protocol=<value>] [--host=<value>] [-p <value> | --port=<value>] [-L | --lazy] [-s | --silence] [--no-proxy]
options:
  -h, --help              display this help message
      --tags=<value>      the tags
      --tag=<value>       alias of tags
      --protocol=<value>  the protocol. Default value is "http"
      --host=<value>      the host. Default value is "localhost"
  -p, --port=<value>      the port. Default value is "1080"
  -L, --lazy              load it lazily
  -s, --silence           show no output
      --no-proxy          use no proxy
```
