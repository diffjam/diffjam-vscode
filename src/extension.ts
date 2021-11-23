// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  commands,
  Disposable,
  ExtensionContext,
  languages,
  window,
  workspace,
} from "vscode";
import { runDiffJamOnDocument } from "./diffjamDiagnostics";

/** Code that is used to associate diagnostic entries with code actions. */
export const DIFFJAM_RULE_BREACH = "DIFFJAM_RULE_BREACH";
export const COMMAND = "code-actions-sample.command";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
  registerCommands();
  registerDiffJamDiagnostics(context);
}

function registerDiffJamDiagnostics(context: vscode.ExtensionContext) {
  const diffJamDiagnostics = languages.createDiagnosticCollection("diffjam");
  disposables.push(diffJamDiagnostics);

  const diagnosticEventSubscriptions = [
    // run when document is opened
    workspace.onDidOpenTextDocument((doc: vscode.TextDocument) =>
      runDiffJamOnDocument(doc, diffJamDiagnostics)
    ),
    // run when the document changes
    workspace.onDidChangeTextDocument(
      (change: vscode.TextDocumentChangeEvent) =>
        runDiffJamOnDocument(change.document, diffJamDiagnostics)
    ),
  ];
  context.subscriptions.concat(diagnosticEventSubscriptions);

  // also run on active editor if already open - this will run everytime document comes
  // into focus
  if (vscode.window.activeTextEditor) {
    runDiffJamOnDocument(
      vscode.window.activeTextEditor.document,
      diffJamDiagnostics
    );
  }
}

function registerCommands() {
  disposables.push(
    commands.registerCommand("diffjam.enable", () => {
      workspace.getConfiguration("diffjam").update("enable", true, true);
    })
  );

  disposables.push(
    commands.registerCommand("diffjam.disable", () => {
      workspace.getConfiguration("diffjam").update("enable", false, true);
    })
  );

  disposables.push(
    commands.registerCommand("diffjam.Action", (args: any) => {
      window.showInformationMessage(`diffjam action clicked with args=${args}`);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
