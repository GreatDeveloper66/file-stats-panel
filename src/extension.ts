import * as vscode from "vscode";
import { analyzeFile } from "./fileAnalyzer";
import { StatsPanel } from "./statsPanel";

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "file-stats-panel.showStats",   // Must match the command in package.json exactly
    () => {
      const editor = vscode.window.activeTextEditor;

      // Guard: no file open
      if (!editor) {
        vscode.window.showInformationMessage(
          "No file is currently open. Please open a file first."
        );
        return;
      }

      const document = editor.document;
      const content = document.getText();
      const fileName = document.fileName.split("/").pop() || document.fileName;
      const language = document.languageId;

      // Analyze and display
      const stats = analyzeFile(content, fileName, language);
      StatsPanel.createOrShow(context.extensionUri, stats);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // VS Code handles cleanup of subscriptions automatically
  // Add any manual cleanup here if needed in future steps
}



// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "file-stats-panel" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('file-stats-panel.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from File Stats Panel!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}
