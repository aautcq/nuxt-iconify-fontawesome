import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'pathe'
import chalk from 'chalk'
import { Presets, SingleBar } from 'cli-progress'
import { type IconPack, icon } from '@fortawesome/fontawesome-svg-core'
import {
  IconSet,
  SVG,
  cleanupSVG,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO,
} from '@iconify/tools'

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

// Export to IconifyJSON, convert to string
export function iconSetToJson(iconSet: IconSet) {
  return JSON.stringify(iconSet.export(), null, '  ')
}

export interface SaveIconSetOptions {
  enableLogs?: boolean
  outputFilename?: string
  outputDir?: string
}

export function saveIconSet(iconSet: IconSet, options?: SaveIconSetOptions) {
  const output = iconSetToJson(iconSet)

  // Create output directory
  try {
    mkdirSync(`./${options?.outputDir ?? 'dist'}`, { recursive: true })
  }
  catch (e) {
    //
  }

  // Save to file
  const target = `./${options?.outputDir ?? 'dist'}/${options?.outputFilename ?? iconSet.prefix}.json`
  writeFileSync(target, output, 'utf8')

  if (options?.enableLogs ?? true) {
    console.info(
      `${chalk.green(`Saved ${chalk.bold(iconSet.count())} icons to ${target}`)} ${chalk.dim(`(${output.length} bytes)`)}`,
    )
  }

  return {
    nbIcons: iconSet.count(),
    target,
    size: output.length,
  }
}

export function cleanUpIconifySVG(svg: SVG) {
  // cleanupSVG from @iconify/tools shoots warnings, suppress them ლ(ಠ益ಠლ)
  const consoleWarn = console.warn
  console.warn = () => {}

  // Clean up icon code
  cleanupSVG(svg)

  // Replace color with currentColor, add if missing
  parseColors(svg, {
    defaultColor: 'currentColor',
    callback: (_, colorStr, color) => {
      return !color || isEmptyColor(color) ? colorStr : 'currentColor'
    },
  })

  // Optimise
  runSVGO(svg)

  // Restore console.warn
  console.warn = consoleWarn

  return svg
}

export interface GenerateSetOptions {
  icons?: string[]
  outputFilename?: string
  outputDir?: string
}

export async function generateIconSet(
  prefix: string,
  source: string,
  options?: GenerateSetOptions,
) {
  // Import icons
  const iconSet = await importDirectory(source, { prefix })

  // Set info
  iconSet.info = JSON.parse(JSON.stringify({
    name: AUTHOR,
    author: { name: AUTHOR },
    height: 32,
  }))

  // Validate, clean up, fix palette and optimise
  iconSet.forEachSync((iconName, type) => {
    if (type !== 'icon') return

    if (
      options?.icons
      && options?.icons?.length > 0
      && !options?.icons?.includes(iconName)
    ) {
      iconSet.remove(iconName)
      return
    }

    // Get SVG instance for parsing
    const svg = iconSet.toSVG(iconName)
    if (!svg) {
      // Invalid icon
      iconSet.remove(iconName)
      return
    }

    // Clean up and optimise icons
    try {
      cleanUpIconifySVG(svg)
    }
    catch (e) {
      // Invalid icon
      console.error(chalk.red(`Error parsing ${iconName}:`), e)
      iconSet.remove(iconName)
      return
    }

    // Update icon from SVG instance
    iconSet.fromSVG(iconName, svg)
  })

  saveIconSet(
    iconSet,
    { outputFilename: options?.outputFilename, outputDir: options?.outputDir },
  )

  return iconSet
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
