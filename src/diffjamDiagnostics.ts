import * as vscode from "vscode";
import { DIFFJAM_RULE_BREACH } from "./extension";
import { findBreachesInText } from "diffjam/lib/src/findBreachesInText";
import { Config } from "diffjam/lib/src/Config";
import { GitIgnore } from "diffjam/lib/src/GitIgnore";
import { LoggingService } from "./loggingService";
import { join } from "path";

const projectFolder = vscode.workspace.workspaceFolders?.map(
  (folder) => folder.uri.path
)[0] || "";

export const configFile = join(projectFolder, "diffjam.yaml");
export const gitignoreFile = join(projectFolder, ".gitignore");

let config: Config;
let gitignore: GitIgnore;

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
  if (!gitignore) await refreshGitIgnore();

  // run diffjam to find actual diagnostics

  // quick no-op if policy is empty
  if (config.getPolicyNames().length == 0) {
    return;
  }

  const fileName = document.fileName.replace(
    projectFolder ? `${projectFolder}/` : "",
    ""
  );
  const fileContents = document.getText();

  // we should be checking the filename matched the glob
  const breaches = findBreachesInText(fileName, fileContents, config, gitignore);

  const diagnostics: vscode.Diagnostic[] = breaches.map((breach) => {

    const range = new vscode.Range(
      breach.startLineNumber,
      breach.startColumn,
      breach.endLineNumber,
      breach.endColumn
    );
    const diagnostic = new vscode.Diagnostic(
      range,
      breach.message,
      breach.severity
    );
    diagnostic.source = "diffjam.yaml";
    diagnostic.code = DIFFJAM_RULE_BREACH;
    return diagnostic;
  });

  diagnosticCollection.set(document.uri, diagnostics);
}
