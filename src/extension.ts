// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  commands,
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  Disposable,
  ExtensionContext,
  languages,
  Range,
  TextDocument,
  Uri,
  window,
  workspace,
} from "vscode";
import { Emojinfo, Emojizer, Greggizer } from "./actionProviders";
import { CodelensProvider } from "./CodelensProvider";
import { subscribeToDocumentChanges } from "./diagnostics";
import { onChangeFindTodo } from "./diffjamDiagnostics";

/** Code that is used to associate diagnostic entries with code actions. */
export const TODO_MENTION = "todo_mention";

export const COMMAND = "code-actions-sample.command";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
  const codelensProvider = new CodelensProvider();

  languages.registerCodeLensProvider("*", codelensProvider);

  disposables.push(commands.registerCommand("diffjam.enableDiffjam", () => {
    workspace.getConfiguration("diffjam").update("enableDiffjam", true, true);
  }));

  disposables.push(commands.registerCommand("diffjam.disableDiffjam", () => {
    workspace.getConfiguration("diffjam").update("enableDiffjam", false, true);
  }));

  disposables.push(commands.registerCommand("diffjam.diffjamAction", (args: any) => {
    window.showInformationMessage(`diffjam action clicked with args=${args}`);
  }));

  const emojiDiagnostics = vscode.languages.createDiagnosticCollection("emoji");
  disposables.push(emojiDiagnostics);
  context.subscriptions.push(emojiDiagnostics);
  subscribeToDocumentChanges(context, emojiDiagnostics);

  const todoDiagnostics = languages.createDiagnosticCollection("todo");
  disposables.push(todoDiagnostics);
  context.subscriptions.push(
    workspace.onDidOpenTextDocument((doc) =>
      onChangeFindTodo(doc, todoDiagnostics)
    )
  );
  // also run on active editor if already open - this will run everytime document comes
  // into focus I think
  if (vscode.window.activeTextEditor) {
    onChangeFindTodo(vscode.window.activeTextEditor.document, todoDiagnostics);
  }
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider("markdown", new Greggizer(), {
      providedCodeActionKinds: Greggizer.providedCodeActionKinds,
    })
  );


  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider("markdown", new Emojinfo(), {
      providedCodeActionKinds: Emojinfo.providedCodeActionKinds,
    })
  );
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider("markdown", new Emojizer(), {
      providedCodeActionKinds: Emojizer.providedCodeActionKinds,
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND, () =>
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://unicode.org/emoji/charts-12.0/full-emoji-list.html"
        )
      )
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
