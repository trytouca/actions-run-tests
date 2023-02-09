// Copyright 2023 Touca, Inc. Subject to Apache-2.0 License.

import { getInput, setFailed, summary } from '@actions/core'
import { exec } from '@actions/exec'

type Report = {
  suite: string
  version: string
  rows: Array<Record<'status' | 'name' | 'time', string>>
  link: string
}

function parseReports(output: string): Array<Report> {
  return [
    {
      suite: 'Students',
      version: 'v1.0',
      rows: [
        { status: 'SENT', name: 'alice', time: '251 ms' },
        { status: 'SENT', name: 'bob', time: '245 ms' },
        { status: 'SENT', name: 'charlie', time: '220 ms' }
      ],
      link: 'http://localhost:4200/~/acme/students_2/v1.0'
    }
  ]
}

async function printReport(report: Report) {
  await summary
    .addHeading('Comparison Results for {}/{}', 2)
    .addTable([
      ['', 'Status', 'Name', 'Runtime'].map((v) => ({
        data: v,
        header: true
      })),
      ...report.rows.map((v, i) => [
        (i + 1).toFixed(0),
        v.status,
        v.name,
        v.time
      ])
    ])
    .addLink('View comparison results on the Touca server', report.link)
    .write()
}

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
  await summary.addHeading('Regression Test Results').write()
  for (const report of parseReports(stream.out)) {
    printReport(report)
  }
}

try {
  await (getInput('executable') != '' ? runExe : runCli)()
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message)
  }
}
