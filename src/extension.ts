// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace, window } from 'vscode';
import {CodelensProvider} from './CodelensProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed



let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensProvider = new CodelensProvider();

    languages.registerCodeLensProvider("*", codelensProvider);

    commands.registerCommand("diffjam.enableDiffjam", () => {
        workspace.getConfiguration("diffjam").update("enableDiffjam", true, true);
    });

    commands.registerCommand("diffjam.disableDiffjam", () => {
        workspace.getConfiguration("diffjam").update("enableDiffjam", false, true);
    });

    commands.registerCommand("diffjam.diffjamAction", (args: any) => {
        window.showInformationMessage(`diffjam action clicked with args=${args}`);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}