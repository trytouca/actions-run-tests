// Copyright 2023 Touca, Inc. Subject to Apache-2.0 License.

import { summary } from '@actions/core'

type Report = {
  slugs: string
  rows: Array<Record<'status' | 'name' | 'time', string>>
  link: string
}

export async function writeJobSummary(output: string, error: string) {
  if (error) {
    summary.addBreak()
    summary.addHeading('Error', 3)
    summary.addCodeBlock(error)
  } else {
    parseReports(output).forEach(printReport)
  }
  await summary.write()
}

function parseReports(output: string): Array<Report> {
  if (
    !['Touca Test Runner', 'Ran all test suites'].every((v) =>
      output.includes(v)
    )
  ) {
    return []
  }
  const lines = output
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => v !== '')
  const reports: Array<Report> = []
  while (true) {
    const head = lines.findIndex((v) => v.startsWith('Suite'))
    const tail = lines.findIndex((v) => v.startsWith('Link'))
    if (head === -1 || tail === -1) {
      break
    }
    const block = lines.splice(head, tail - head + 1)
    const slugs = block.at(0)?.split(/\s+/).at(1)
    const link = block.at(-1)?.split(/\s+/).at(1)
    if (!slugs || !link) {
      break
    }
    const rows: Report['rows'] = []
    for (const line of block.slice(1, -3)) {
      const items = line.match(/\s*\d+\.\s+(\w+)\s+(.+)\s+\((.+)\)/)
      if (!items) {
        continue
      }
      rows.push({
        status: items[1],
        name: items[2],
        time: items[3]
      })
    }
    if (rows.length !== 0) {
      reports.push({ slugs, rows, link })
    }
  }
  return reports
}

function printReport(report: Report) {
  summary
    .addHeading(`Comparison Results for ${report.slugs}`, 2)
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
}
