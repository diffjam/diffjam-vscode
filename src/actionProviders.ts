import * as vscode from "vscode";
import { EMOJI_MENTION } from "./diagnostics";
import { COMMAND, TODO_MENTION } from "./extension";

/**
 * Provides code actions for converting :) to a smiley emoji.
 */
export class Emojizer implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] | undefined {
    if (!this.isAtStartOfSmiley(document, range)) {
      return;
    }

    const replaceWithSmileyCatFix = this.createFix(document, range, "😺");

    const replaceWithSmileyFix = this.createFix(document, range, "😀");
    // Marking a single fix as `preferred` means that users can apply it with a
    // single keyboard shortcut using the `Auto Fix` command.
    replaceWithSmileyFix.isPreferred = true;

    const replaceWithSmileyHankyFix = this.createFix(document, range, "💩");

    const commandAction = this.createCommand();

    return [
      replaceWithSmileyCatFix,
      replaceWithSmileyFix,
      replaceWithSmileyHankyFix,
      commandAction,
    ];
  }

  private isAtStartOfSmiley(
    document: vscode.TextDocument,
    range: vscode.Range
  ) {
    const start = range.start;
    const line = document.lineAt(start.line);
    const match = `${line.text[start.character]}${
      line.text[start.character + 1]
    }`;
    return match === ":)";
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
      "Learn more...",
      vscode.CodeActionKind.Empty
    );
    action.command = {
      command: COMMAND,
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    return action;
  }
}

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

  private isAtStartOfTODO(document: vscode.TextDocument, range: vscode.Range) {
    const start = range.start;
    const line = document.lineAt(start.line);
    const match = `${line.text[start.character]}${
      line.text[start.character + 1]
    }`;
    return match.toLowerCase() === "2do";
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

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Learn more...",
      vscode.CodeActionKind.QuickFix
    );
    action.command = {
      command: COMMAND,
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}

/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class Emojinfo implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    // for each diagnostic entry that has the matching `code`, create a code action command
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === EMOJI_MENTION)
      .map((diagnostic) => this.createCommandCodeAction(diagnostic));
  }

  private createCommandCodeAction(
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      "Learn more...",
      vscode.CodeActionKind.QuickFix
    );
    action.command = {
      command: COMMAND,
      title: "Learn more about emojis",
      tooltip: "This will open the unicode emoji page.",
    };
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    return action;
  }
}
