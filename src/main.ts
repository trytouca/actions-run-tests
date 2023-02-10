// Copyright 2023 Touca, Inc. Subject to Apache-2.0 License.

import { getBooleanInput, getInput, setFailed, summary } from '@actions/core'
import { exec } from '@actions/exec'
import { writeJobSummary } from './summary'

function getArgsExe() {
  const args = [getInput('executable')]
  if (getInput('version') !== '') {
    args.push('--revision', getInput('version'))
  }
  return args
}

function getArgsCli() {
  const args = ['touca', 'test']
  if (getInput('version') !== '') {
    args.push('--revision', getInput('version'))
  }
  if (getInput('directory') !== '') {
    args.push('--testdir', getInput('directory'))
  }
  return args
}

try {
  const args = getInput('executable') != '' ? getArgsExe() : getArgsCli()
  const stream = { out: '', err: '' }
  await exec(args[0], args.slice(1), {
    listeners: {
      stdout: (data: Buffer) => {
        stream.out += data.toString()
      },
      stderr: (data: Buffer) => {
        stream.err += data.toString()
      }
    }
  })
  if (getBooleanInput('job_summary')) {
    await writeJobSummary(stream.out, stream.err)
  }
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message)
  }
}
