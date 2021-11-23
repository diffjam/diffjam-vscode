// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  commands,
  Disposable,
  ExtensionContext,
  languages,
  workspace,
} from "vscode";
import {
  configFile,
  refreshDiffJamConfig,
  runDiffJamOnDocument,
} from "./diffjamDiagnostics";
import { LoggingService } from "./loggingService";

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

  /**
   * Enable this to log during development
   */
  // const loggingService = new LoggingService();
  // loggingService.setOutputLevel("WARN");
  // loggingService.logInfo(`Extension Name: diffjam`);

  const diagnosticEventSubscriptions = [
    // run when document is opened
    workspace.onDidOpenTextDocument((doc: vscode.TextDocument) =>
      runDiffJamOnDocument(doc, diffJamDiagnostics)
    ),
    // run when the document changes
    workspace.onDidChangeTextDocument(
      (change: vscode.TextDocumentChangeEvent) => {
        if (change.document.fileName.startsWith("extension-output")) {
          return;
        }
        if (change.document.uri.toString() === `file://${configFile}`) {
          // diffjam yaml has been updated - first reload the config
          refreshDiffJamConfig();
        }
        runDiffJamOnDocument(change.document, diffJamDiagnostics);
      }
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
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
