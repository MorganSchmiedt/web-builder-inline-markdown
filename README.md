## Web Builder Module - Inline Markdown files

This module allows the [@deskeen/web-builder](https://github.com/deskeen/web-builder) engine to inline Markdown files.

It uses the [@deskeen/markdown](https://github.com/deskeen/markdown) parser under the hood to parse the text.


## Install

```
npm install @deskeen/web-builder
npm install @deskeen/web-builder-inline-markdown
```


### Usage

And add the module to the list of modules: 

```javascript
const builder = require('@deskeen/web-builder')
const builder.build([
  source: [
    // List of files or directories that include
    // {{inlineMD:file.md}} tags
  ],
  modules: [
    [
      '@deskeen/web-builder-inline-markdown',
      {
        assets: [
          // List of directories that include
          // the markdown files included in the tags
        ],
        parserOptions: {
          // See https://github.com/deskeen/markdown
          // for a complete list of options
        }
      }
    ]
  ]
])
```


## Contact

You can reach me at {my_firstname}@{my_name}.fr


## Licence

MIT Licence - Copyright (c) Morgan Schmiedt