# diffjam-vscode

This is a Visual Studio Code plugin for [DiffJam](https://github.com/diffjam/diffjam) - a tool for ratcheted builds.
With this plugin, DiffJam will provide live feedback while writing code inside the VS Code IDE based on the `diffjam.yaml` file in the current project repository.

## Usage

Write a `diffjam.yaml` file to capture the rules you'd like to enforce.
Example:
```yaml
policies:
  No TODOs:
    baseline: 129
    description: Don't add TODOS. DO IT NOW!
    filePattern: '**/*.ts'
    hiddenFromOutput: false
    search: TODO
```
_See DiffJam (https://github.com/diffjam/diffjam)_

Once this file is present in the root of the currently open VS Code project, the plugin will automatically start highlighting violations of the rules described in the config file.

## Installing the plugin

Install from the VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=DiffJam.diffjam-vscode&ssr=false#overview


# Development instructions

## Installation

Install the dependencies using yarn:
`yarn install`

## Running

Run the Run Extension target in the Debug View. This will:
* Start a task npm: watch to compile the code
* Run the extension in a new VS Code window

