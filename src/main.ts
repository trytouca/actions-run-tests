// Copyright 2023 Touca, Inc. Subject to Apache-2.0 License.

import { getInput, setFailed } from '@actions/core'
import { exec } from '@actions/exec'

async function run(): Promise<void> {
  try {
    await exec('touca', ['version'])
    const inputs: Partial<Record<'version' | 'directory', string>> =
      Object.fromEntries(
        ['version', 'directory']
          .map((k) => [k, getInput(k)])
          .filter(([_, v]) => v != '')
      )
    const args = []
    if (inputs.version) {
      args.push(`--revision=${inputs.version}`)
    }
    if (inputs.directory) {
      args.push(`--testdir=${inputs.directory}`)
    }
    await exec('touca', ['test', ...args])
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message)
    }
  }
}

run()
