import * as vscode from "vscode";
import { TODO_MENTION } from "./extension";
import { findBreachesInText } from "diffjam/lib/src/findBreachesInText";
import { getConfig } from "diffjam/lib/src/configFile";

const projectFolder = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
// console.log("projectFolder: ", projectFolder);
const configFile = `${projectFolder}/diffjam.yaml`;
// console.log("configFile: ", configFile);

// interface FileBreach {
//   lineNumber: number; // the lineNumber, 1-indexed
//   found: string; // the match.  we can do squigglies based on its beginning/end
//   wholeLine: string; // the entire line that the match is in.  used for subsequent needles.
//   message: string; // the policy description.
// }

export function onChangeFindTodo(
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  const diagnostics: vscode.Diagnostic[] = [];
    // const projectFolder = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0];
    // console.log("projectFolder: ", projectFolder);
    
    // console.log("folders: ", 
  //  vscode.workspace.workspaceFolders?.map(folder => folder.uri.path)[0]
  // );

  // example errors - run diffjam to find actual errors
  const fileContents = document.getText();
  // console.log("document: ", document.fileName);
  // console.log("document: ", document.uri);
  
  getConfig(configFile).then((config) => {

    // we should be checking the filename matched the glob
  findBreachesInText(document.fileName, fileContents, config).then((breaches) => {
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
      diagnostic.source = "diffjam rule no 42";
      diagnostic.code = TODO_MENTION;
      diagnostics.push(diagnostic);
    });
    diagnosticCollection.set(document.uri, diagnostics);
  });
  });
}
