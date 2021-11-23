import * as vscode from "vscode";
import { DIFFJAM_RULE_BREACH } from "./extension";
import { findBreachesInText } from "diffjam/lib/src/findBreachesInText";
import { getConfig, refresh } from "diffjam/lib/src/configFile";

const projectFolder = vscode.workspace.workspaceFolders?.map(
  (folder) => folder.uri.path
)[0];
export const configFile = `${projectFolder}/diffjam.yaml`;

// interface FileBreach {
//   lineNumber: number; // the lineNumber, 1-indexed
//   found: string; // the match.  we can do squigglies based on its beginning/end
//   wholeLine: string; // the entire line that the match is in.  used for subsequent needles.
//   message: string; // the policy description.
// }

export function refreshDiffJamConfig() {
  refresh(configFile);
}

export function runDiffJamOnDocument(
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  // run diffjam to find actual diagnostics
  getConfig(configFile).then((config) => {
    // quick no-op if policy is empty
    if (config.getPolicyNames().length == 0) {
      return;
    }
    const diagnostics: vscode.Diagnostic[] = [];
    const fileName = document.fileName;
    const fileContents = document.getText();

    // we should be checking the filename matched the glob
    findBreachesInText(fileName, fileContents, config).then((breaches) => {
      const errors = breaches.map((b) => {
        const startColumn = b.wholeLine.indexOf(b.found);
        const endColumn = startColumn + b.found.length;
        return {
          line: Math.max(b.lineNumber, 2),
          startColumn: Math.max(startColumn, 0),
          endColumn,
          msg: b.message,
          severity: vscode.DiagnosticSeverity.Warning,
        };
      });

      errors.forEach((error) => {
        const range = new vscode.Range(
          error.line - 1,
          error.startColumn,
          error.line - 1,
          error.endColumn
        );
        const diagnostic = new vscode.Diagnostic(
          range,
          error.msg,
          error.severity
        );
        diagnostic.source = "diffjam.yaml";
        diagnostic.code = DIFFJAM_RULE_BREACH;
        diagnostics.push(diagnostic);
      });

      diagnosticCollection.set(document.uri, diagnostics);
    });
  });
}
