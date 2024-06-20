import chalk from 'chalk'
import { library } from '@fortawesome/fontawesome-svg-core'

// Free icons
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { generateIconSets } from '../index.js'

// Do stuff
(async function () {
  const faIcons = [fab, far, fas]

  library.add(...faIcons)
  generateIconSets(faIcons, { outputDir: 'dist' })
})().catch((e) => {
  console.error(chalk.red('An error occurred while generating the icon sets:'), e)
})
