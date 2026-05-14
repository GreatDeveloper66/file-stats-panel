import * as vscode from "vscode";
import { FileStats } from "./fileAnalyzer";

export class StatsPanel {
  public static currentPanel: StatsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  // Static factory method — creates or reveals the panel
  public static createOrShow(
    extensionUri: vscode.Uri,
    stats: FileStats
  ): void {
    const column = vscode.ViewColumn.Two;

    // If panel already exists, just update it
    if (StatsPanel.currentPanel) {
      StatsPanel.currentPanel._panel.reveal(column);
      StatsPanel.currentPanel._update(stats);
      return;
    }

    // Otherwise create a new panel
    const panel = vscode.window.createWebviewPanel(
      "fileStatsPanel",        // Internal identifier
      "File Stats",            // Title shown in the tab
      column,                  // Show in column two (side by side)
      {
        enableScripts: false,  // No JS needed in the webview for MVP
      }
    );

    StatsPanel.currentPanel = new StatsPanel(panel, stats);
  }

  private constructor(panel: vscode.WebviewPanel, stats: FileStats) {
    this._panel = panel;
    this._update(stats);

    // Clean up when the panel is closed by the user
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  // Call this when new stats come in
  public static update(stats: FileStats): void {
    if (StatsPanel.currentPanel) {
      StatsPanel.currentPanel._update(stats);
    }
  }

  private _update(stats: FileStats): void {
    this._panel.title = `Stats: ${stats.fileName}`;
    this._panel.webview.html = this._getHtmlContent(stats);
  }

  private _getHtmlContent(stats: FileStats): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File Stats</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
          }

          h1 {
            font-size: 1.2em;
            color: var(--vscode-textLink-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 8px;
            margin-bottom: 16px;
          }

          .stat-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .stat-card {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 6px;
            padding: 12px 16px;
          }

          .stat-label {
            font-size: 0.8em;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 1.6em;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
          }

          .language-badge {
            display: inline-block;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 0.85em;
            margin-bottom: 20px;
          }

          .unsupported {
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            font-size: 0.85em;
          }
        </style>
      </head>
      <body>
        <h1>📄 ${stats.fileName}</h1>
        <div class="language-badge">${stats.language}</div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">Total Lines</div>
            <div class="stat-value">${stats.totalLines}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Code Lines</div>
            <div class="stat-value">${stats.codeLines}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Blank Lines</div>
            <div class="stat-value">${stats.blankLines}</div>
          </div>
          <div class="stat-card">
          <div class="stat-label">Variables Detected[Top Level Declarations]</div>
          <div class="stat-value">${
            stats.variableCount >= 0
              ? stats.variableCount
              : '<span class="unsupported">N/A</span>'
          }</div>>
          </div>

          <div class="stat-card">
            <div class="stat-label">Functions Detected</div>
            <div class="stat-value">
              ${
                stats.functionCount >= 0
                  ? stats.functionCount
                  : '<span class="unsupported">N/A</span>'
              }
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Imports Detected</div>
            <div class="stat-value">
              ${
                stats.importCount >= 0
                  ? stats.importCount
                  : '<span class="unsupported">N/A</span>'
              }
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Exports Detected</div>
            <div class="stat-value">
              ${
                stats.exportCount >= 0
                  ? stats.exportCount
                  : '<span class="unsupported">N/A</span>'
              }
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public dispose(): void {
    StatsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}