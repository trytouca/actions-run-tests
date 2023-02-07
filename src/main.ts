// Copyright 2023 Touca, Inc. Subject to Apache-2.0 License.

import { getInput, setFailed } from '@actions/core'
import { exec } from '@actions/exec'

async function runExe() {
  const args = [getInput('executable')]
  if (getInput('version') !== '') {
    args.push('--revision', getInput('version'))
  }
  await exec(args[0], args.slice(1))
}

async function runCli() {
  await exec('touca', ['version'])

  const args = ['touca', 'test']
  if (getInput('version') !== '') {
    args.push('--revision', getInput('version'))
  }
  if (getInput('directory') !== '') {
    args.push('--testdir', getInput('directory'))
  }
  await exec(args[0], args.slice(1))
}

try {
  await (getInput('executable') != '' ? runExe : runCli)()
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message)
  }
}
