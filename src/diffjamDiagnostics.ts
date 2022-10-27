import * as vscode from "vscode";
import { DIFFJAM_RULE_BREACH } from "./extension";
import { findBreachesInText } from "diffjam/lib/src/findBreachesInText";
import { Config } from "diffjam/lib/src/Config";
import { GitIgnore } from "diffjam/lib/src/GitIgnore";
import { LoggingService } from "./loggingService";
import { join } from "path";

const projectFolder = vscode.workspace.workspaceFolders?.map(
  (folder) => folder.uri.path
)[0];

export const configFile = join(projectFolder, "diffjam.yaml");
export const gitignoreFile = join(projectFolder, ".gitignore");

// interface FileBreach {
//   lineNumber: number; // the lineNumber, 1-indexed
//   found: string; // the match.  we can do squigglies based on its beginning/end
//   wholeLine: string; // the entire line that the match is in.  used for subsequent needles.
//   message: string; // the policy description.
// }

let config: Config;
let gitignore: GitIgnore

export async function refreshDiffJamConfig() {
  config = await Config.read(configFile);
}

export async function refreshGitIgnore() {
  gitignore = new GitIgnore(gitignoreFile);
  await gitignore.ready;
}

export async function runDiffJamOnDocument(
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection,
  logger?: LoggingService
) {
  if (!config) await refreshDiffJamConfig();
  // run diffjam to find actual diagnostics

  // quick no-op if policy is empty
  if (config.getPolicyNames().length == 0) {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const fileName = document.fileName.replace(
    projectFolder ? `${projectFolder}/` : "",
    ""
  );
  const fileContents = document.getText();

  // we should be checking the filename matched the glob
  const breaches = findBreachesInText(fileName, fileContents, config, gitignore)

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
}
