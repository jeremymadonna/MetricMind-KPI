import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    console.log('MetricMind extension is now active!');

    let disposable = vscode.commands.registerCommand('metricmind.generate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const content = document.getText();

        // Ask for context
        const contextInput = await vscode.window.showInputBox({
            placeHolder: 'Enter business context (e.g., Monthly Sales Report)'
        });

        if (!contextInput) {
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating Dashboard...",
            cancellable: false
        }, async (progress) => {
            try {
                // Call local backend
                const response = await axios.post('http://localhost:8000/kpi/', {
                    context: contextInput,
                    schema: content // Sending full content as schema for now
                });

                const dashboardUrl = "http://localhost:3000";
                vscode.window.showInformationMessage(`Dashboard generated! View at ${dashboardUrl}`);

                // Open in browser
                vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));

            } catch (error) {
                vscode.window.showErrorMessage(`Error generating dashboard: ${error}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
