import * as vscode from "vscode";
import { TODO_MENTION } from "./extension";

export function onChangeFindTodo(
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  const diagnostics: vscode.Diagnostic[] = [];

  // example errors - run diffjam to find actual errors
  const errors = [
    {
      line: 10,
      startColumn: 3,
      endColumn: 10,
      msg: "no more todos",
      severity: vscode.DiagnosticSeverity.Error,
    },
  ];
  errors.forEach((error) => {
    const range = new vscode.Range(
      error.line - 1,
      error.startColumn,
      error.line - 1,
      error.endColumn
    );
    const diagnostic = new vscode.Diagnostic(range, error.msg, error.severity);
    diagnostic.source = "diffjam rule no 42";
    diagnostic.code = TODO_MENTION;
    diagnostics.push(diagnostic);
  });
  diagnosticCollection.set(document.uri, diagnostics);
}
