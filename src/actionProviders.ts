import * as vscode from "vscode";
import { COMMAND } from "./extension";

/**
 * Provides code actions for imparting Greggisms.
 */
export class Greggizer implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] | undefined {
    const replaceWithDoNowFix = this.createFix(
      document,
      range,
      "I-AM-DOING-THIS-NOW:😺"
    );

    const replaceWithDeleteNowFix = this.createFix(
      document,
      range,
      "I-AM-DELETING-THIS-NOW:😀"
    );
    // Marking a single fix as `preferred` means that users can apply it with a
    // single keyboard shortcut using the `Auto Fix` command.
    replaceWithDoNowFix.isPreferred = true;

    const replaceWithSmileyHankyFix = this.createFix(
      document,
      range,
      "Sigh, 2DO: 💩"
    );

    const commandAction = this.createCommand();

    return [
      replaceWithDoNowFix,
      replaceWithDeleteNowFix,
      replaceWithSmileyHankyFix,
      commandAction,
    ];
  }

  private createFix(
    document: vscode.TextDocument,
    range: vscode.Range,
    emoji: string
  ): vscode.CodeAction {
    const fix = new vscode.CodeAction(
      `Convert to ${emoji}`,
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(
      document.uri,
      new vscode.Range(range.start, range.start.translate(0, 2)),
      emoji
    );
    return fix;
  }

  private createCommand(): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Learn why TODO makes Gregg sleepless",
      vscode.CodeActionKind.Empty
    );
    action.command = {
      command: COMMAND,
      title: "Learn more about the art of zero TODOs",
      tooltip: "This will call Gregg and tell him you've been a todo-ist",
    };
    return action;
  }
}