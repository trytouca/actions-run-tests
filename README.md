# GitHub Actions plugin for running Touca tests

Plugin that helps you run Touca tests as part of GitHub Actions CI.

## Inputs

### `version`

**Optional** Version of the code under test. When not provided, the built-in
test runner will query Touca server for the latest submitted version and a minor
version increment to that version.

### `directory`

**Optional** Directory where Touca tests are located. When not provided, Touca
CLI attempts to recursively find and run all Touca tests in the current working
directory. Assumes your tests are written using the Touca Python SDK.

### `executable`

**Optional** Test executable to use instead of Touca CLI. Useful for running
Touca tests written in C++ that cannot be run via the Touca CLI.

## Example usage

```yaml
uses: trytouca/actions-run-tests@v1
with:
  directory: ./examples/python/02_python_main_api
```
