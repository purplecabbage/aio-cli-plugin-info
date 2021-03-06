/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command, flags } = require('@oclif/command')
const envinfo = require('envinfo')
const chalk = require('chalk')
const yaml = require('js-yaml')

class InfoCommand extends Command {
  async run () {
    const { flags } = this.parse(InfoCommand)

    try {
      const resInfo = await envinfo.run({
        System: ['OS', 'CPU', 'Memory', 'Shell'],
        Binaries: ['Node', 'Yarn', 'npm'],
        Virtualization: ['Docker'],
        npmGlobalPackages: [this.config.pjson.name]
      }, {
        json: flags.json || flags.yml,
        console: false,
        showNotFound: true
      })

      const plugins = this.config.plugins.filter(p => !p.parent)

      if (flags.json || flags.yml) {
        // format plugin info as json/yml
        const resObj = JSON.parse(resInfo)
        resObj['CLI Plugins'] = plugins.map(p => {
          return { name: p.name, version: p.version, type: p.type }
        })
        if (flags.yml) {
          this.log(yaml.safeDump(resObj))
        } else {
          this.log(JSON.stringify(resObj, 2))
        }
      } else {
        this.log(resInfo + '  CLI plugins:')
        for (const plugin of plugins) {
          this.log(`    ${plugin.name} ` + chalk.gray(`${plugin.version} (${plugin.type})`))
        }
      }
    } catch (e) {
      this.error(e)
    }
  }
}

InfoCommand.flags = {
  json: flags.boolean({
    char: 'j',
    description: 'output raw json',
    default: false
  }),
  yml: flags.boolean({
    char: 'y',
    description: 'output yml',
    default: false,
    exclusive: ['json']
  })
}

InfoCommand.description = 'Display dev environment version information'

module.exports = InfoCommand
