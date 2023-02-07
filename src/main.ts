// Copyright 2023 Touca, Inc. Subject to Apache-2.0 License.

import { getInput, setFailed } from '@actions/core'
import { exec } from '@actions/exec'

async function run(): Promise<void> {
  try {
    await exec('touca', ['version'])
    const inputs: Partial<
      Record<'version' | 'directory' | 'executable', string>
    > = Object.fromEntries(
      ['version', 'directory', 'executable']
        .map((k) => [k, getInput(k)])
        .filter(([_, v]) => v != '')
    )
    const args = inputs.executable ? [inputs.executable] : ['touca', 'test']
    if (inputs.version) {
      args.push('--revision', inputs.version)
    }
    if (!inputs.executable && inputs.directory) {
      args.push('--testdir', inputs.directory)
    }
    await exec(args[0], args.slice(1))
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    }
  }
}

run()
