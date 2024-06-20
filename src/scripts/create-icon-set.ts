#! /usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { generateIconSet } from '../index.js'

const { p, s, o } = await yargs(hideBin(process.argv))
  .usage('Create Iconify icon sets from SVG files\n\nUsage: nuxt-iconify-fontawesome -p <prefix> -s <source> -o <output>\n')
  .option('p', {
    alias: 'prefix',
    describe: 'Icon set prefix',
    type: 'string',
    demandOption: false,
    default: 'custom',
  })
  .option('s', {
    alias: 'source',
    describe: 'Path to the folder hosting the SVG files',
    type: 'string',
    demandOption: false,
    default: 'assets/icons/svgs',
  })
  .option('o', {
    alias: 'output',
    describe: 'Path to the output folder for the JSON file',
    type: 'string',
    demandOption: false,
    default: 'assets/icons/json',
  })
  .help(true)
  .argv

console.info(chalk.white('Generating icon set...'))

try {
  await generateIconSet(p, s, { outputDir: o })
  process.exit(0)
}
catch (e) {
  console.error(chalk.red('An error occurred while generating the icon set:'), e)
  process.exit(1)
}
