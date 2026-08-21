# File Stats Panel

A lightweight VS Code extension that analyzes your current file and displays
useful statistics in a side panel — line counts, function detection, and
import analysis at a glance.

## Features

- Displays total line count, code lines, and blank lines
- Detects and counts function/method definitions
- Counts import statements and dependencies
- Supports JavaScript, TypeScript, Java, and Python

## Screenshot

![File Stats Panel](images/screenshot.jpg)

## How to Use

1. Open any code file in VS Code
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P` on Mac)
3. Type **"Show File Stats"** and press Enter
4. A panel opens to the right displaying your file analysis

## Planned Features

- Multi-file and full workspace analysis
- AI-powered code summaries
- Visual block diagram generation from codebase structure

## Release Notes

## [1.0.0]

- Initial release

## 1.0.1 - 2026-05-01

- Initial release

### Changed

- Update compiler options for new dependencies
- Install dev dependencies for jest, mocha and node
- Add publisher id to package.json
- update extension.ts

### Added

- Add File Analyzer
- Add statsPanel

## 1.0.2 - 2026-05-06

- Initial Release

### Added[2]

- Add counting variables functionality

## 2.0.0

- Initial Release

## 2.1.0 - 2026-08-21

### Added[3]

-Add finding names of imported modules functionality

-
