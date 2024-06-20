# @aautcq/nuxt-iconify-fontawesome

[![NPM version][npm-version-src]][npm-version-href]
[![NPM downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Converts Font Awesome icons to Iconify JSON data, allowing the use of popular Nuxt modules such as [Nuxt Icon](https://nuxt.com/modules/icon) or [NuxtUI](https://nuxt.com/modules/ui).

One icon set is generated per Font Awesome collection. Here are the corresponding Iconify prefixes for each Font Awesome set:

| Font Awesome set | Iconify prefix |
| ---------------- | -------------- |
| brands | `fab` |
| regular | `far` |
| solid | `fas` |

## Installation

Using NPM or whatever your preferred package manager is

```bash
npm i @aautcq/nuxt-iconify-fontawesome
```

Then you can get Iconify icon sets using the `getIconSubSet` function exposed by the package

```js
const myIconSet = getIconSubSet('<icon-set-name>', ['<icon-1>', '<icon-2>'])
```

## Examples

### Using Nuxt Icon

In your Nuxt config file, get an icon set and register it into Nuxt Icon

```ts
// nuxt.config.ts
import { getIconSubSet } from '@aautcq/nuxt-iconify-fontawesome'

const fasCollection = getIconSubSet('fas', ['check'])

export default defineNuxtConfig({
  modules: ['@nuxt/icon'],
  icon: {
    customCollections: [
      fasCollection.export(),
    ],
  },
})
```

Then, in your .vue files

```vue
<template>
  <Icon name="fas:check" />
</template>
```

### Using NuxtUI

In your Nuxt config file, get an icon set and register it into NuxtUI

```ts
// nuxt.config.ts
import { getIconSubSet } from '@aautcq/nuxt-iconify-fontawesome'

const fasCollection = getIconSubSet('fas', ['check'])

export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  ui: {
    icons: {
      collections: {
        [fasCollection.prefix]: fasCollection.export(),
      },
    },
  },
})
```

Then, in your .vue files

```vue
<template>
  <UIcon name="i-fas-check" />
</template>
```

## Create your own icon sets with the CLI

This package comes with a CLI to help build Iconify icon sets from SVG files locally hosted in your project source code. To use it, you can create a new script in your `package.json` file

```json
{
  "scripts": {
    "convert-icons": "nuxt-iconify-fontawesome -s=assets/icons/svgs -o=assets/icons/json"
  }
}
```

The `nuxt-iconify-fontawesome` command comes with the following options

| Option label | Description | Default value |
| ------------ | ----------- | ------------- |
| `-p`, `--prefix` | Icon set prefix | `'custom'` |
| `-s`, `--source` | Path to the folder hosting the SVG files | `'assets/icons/svgs'` |
| `-o`, `--output` | Path to the output folder for the JSON file | `'assets/icons/json'` |

To run the script and convert you SVG icons, run

```bash
npm run convert-icons
```

A JSON file containing the new icon set will be created in the output directory. It can then be used in Nuxt Icon or NuxtUI the same way as the examples above.

## Font Awesome pro and kits

You might have access to Font Awesome pro or a Font Awesome kit and need to generate Iconify icon sets for these. To do so, you can follow these steps:

- Fork this repository
- Uninstall the free Font Awesome icon packages and install the ones you need
- Update the `/src/scripts/convert-icons.ts` file to use the icon collections from the installed packages
- Run the `build` script to generate the Iconify icon sets in the `/dist` folder

## License

[MIT License](https://github.com/aautcq/nuxt-iconify-fontawesome/blob/master/LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@aautcq/nuxt-iconify-fontawesome/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@aautcq/nuxt-iconify-fontawesome

[npm-downloads-src]: https://img.shields.io/npm/dm/@aautcq/nuxt-iconify-fontawesome.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@aautcq/nuxt-iconify-fontawesome

[license-src]: https://img.shields.io/github/license/aautcq/nuxt-iconify-fontawesome.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/aautcq/nuxt-iconify-fontawesome/blob/master/LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
