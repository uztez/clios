# Usage

```
import Clios from '@uztez/clios';
let clios = Clios.of([
    ['tags|tag*', 'the tags'],
    ['host=localhost', 'the host'],
    ['port(p)=1080', 'the port'],
    ['lazy(L)', 'load it lazily'],
    ['silence(s)', 'show no output'],
    ['no-proxy', 'use no proxy'],
  ],
  '--tag=win --tag=linux arg0 --host=foo.com -p 3090 -L arg1 --silence --no-proxy arg2'
);
let output = clios.parse();
console.log(output);
```

And the output will be:

```
{
  options: {
    host: 'foo.com',
    port: '3090',
    tags: [ 'win', 'linux' ],
    lazy: true,
    silence: true,
    noProxy: true
  },
  values: [ 'arg0', 'arg1', 'arg2' ]
}
```
