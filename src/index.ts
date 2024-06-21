import { readFileSync } from 'node:fs'
import path from 'pathe'
import chalk from 'chalk'
import { Presets, SingleBar } from 'cli-progress'
import { type IconPack, icon } from '@fortawesome/fontawesome-svg-core'
import { IconSet, SVG } from '@iconify/tools'
import { cleanUpIconifySVG, saveIconSet } from '@aautcq/svg-to-iconify'

const AUTHOR = 'Font Awesome'

export function createEmptyIconSet(prefix: string) {
  return new IconSet({
    prefix,
    info: JSON.parse(JSON.stringify({
      name: AUTHOR,
      author: { name: AUTHOR },
      height: 32,
    })),
    icons: {},
  })
}

export interface GenerateSetsOptions {
  sets?: string[]
  outputDir?: string
  enableLogs?: boolean
}

export function generateIconSets(
  iconSets: IconPack[],
  options?: GenerateSetsOptions,
) {
  const progress = new SingleBar(
    { stopOnComplete: true, clearOnComplete: true },
    Presets.shades_classic,
  )

  const filteredSets = iconSets.filter((set) => {
    const prefix = set[Object.keys(set)[0]].prefix
    return !options?.sets?.length || (options.sets.includes(prefix))
  })

  const nbIcons = filteredSets.reduce((acc, pack) => acc + Object.keys(pack).length, 0)
  progress.start(nbIcons, 0)

  const savedData = {}

  for (const set of filteredSets) {
    const prefix = set[Object.keys(set)[0]].prefix
    // Create an empty icon set
    const iconSet = createEmptyIconSet(prefix)

    // Add all icons from the set
    for (const iconKey in set) {
      const { prefix, iconName } = set[iconKey]
      const iconData = icon({ prefix, iconName })
      if (iconData) {
        try {
          const svg = new SVG(iconData.html[0])
          cleanUpIconifySVG(svg)
          iconSet.fromSVG(iconName, svg)
        }
        catch (e) {
          console.error(chalk.red(`Error parsing ${iconName}:`), e)
        }
      }
      progress.increment()
    }

    // Save the icon set to the dist folder
    const { nbIcons, target, size } = saveIconSet(
      iconSet,
      { outputFilename: iconSet.prefix, outputDir: options?.outputDir, enableLogs: false },
    )
    savedData[prefix] = { nbIcons, target, size }
  }

  if (options?.enableLogs ?? true) {
    console.info(chalk.green('Saved the following icon sets:'))
    for (const dataKey in savedData) {
      const { nbIcons, target, size } = savedData[dataKey]
      console.info(
        `${chalk.green('+')} ${chalk.bold(nbIcons)} icons to ${target} ${chalk.dim(`(${size} bytes)`)}`,
      )
    }
  }

  return savedData
}

export function getIconSubSet(name: string, icons: string[]) {
  // Read data, parse JSON
  const rawData = JSON.parse(readFileSync(path.join(__dirname, `${name}.json`), 'utf8'))

  // Create new IconSet instance
  const iconSet = new IconSet(rawData)

  iconSet.forEachSync((iconName, type) => {
    if (type !== 'icon') return
    if (!icons.includes(iconName)) {
      iconSet.remove(iconName)
    }
  })

  return iconSet
}
