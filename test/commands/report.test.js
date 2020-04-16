/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Command = require('../../src/commands/report')
const { stdout } = require('stdout-stderr')
const envinfo = require('envinfo')
const { cli } = require('cli-ux')

jest.mock('envinfo')

test('exports', async () => {
  expect(typeof Command).toEqual('function')
})

test('description', async () => {
  expect(Command.description).toBeDefined()
})

test('flags', async () => {
  expect(Command.flags).toBeDefined()
})

test('aliases', async () => {
  expect(Command.aliases).toBeDefined()
})

describe('instance methods', () => {
  let command

  beforeEach(() => {
    command = new Command([])
    envinfo.run.mockResolvedValue('ok')
    cli.open.mockResolvedValue('mkay')
  })

  describe('run', () => {
    test('exists', async () => {
      expect(command.run).toBeInstanceOf(Function)
    })

    test('calls envinfo.run for bug', () => {
      command.argv = []
      command.config = { pjson: { bugs: { url: 'some-link' } } }
      return command.run()
        .then(() => {
          expect(envinfo.run).toHaveBeenCalledWith(expect.objectContaining({
            'Binaries': expect.any(Array),
            'System': expect.any(Array),
            'Virtualization': expect.any(Array),
            'npmGlobalPackages': expect.any(Array),
          }), expect.objectContaining({
            'console': false
          }))
          expect(stdout.output).toMatch('')
          expect(cli.open).toHaveBeenCalled()
        })
    })

    test('does not call envinfo.run for feature', () => {
      command.argv = ['-f']
      command.config = { pjson: { bugs: { url: 'some-link' } } } 
      return command.run().then(() => {
        expect(envinfo.run).not.toHaveBeenCalled()
        expect(cli.open).toHaveBeenCalled()
        expect(stdout.output).toMatch('')
      })
    })

    test('outputs error if cli package.json does not define a bugs.url', (done) => {
      command.argv = []
      command.config = { pjson: { bugs: { } } }
      command.error = jest.fn(() => {throw new Error('Bang bang there goes your heart')})
      return command.run()
        .then(() => {
          done.fail('it should not reach here')
        }).catch(() => {
          expect(envinfo.run).not.toHaveBeenCalled()
          expect(stdout.output).toMatch('')
          expect(command.error).toHaveBeenCalled()
          expect(cli.open).not.toHaveBeenCalled()
          done()
        })
    })

  })
})  
