import * as vscode from 'vscode';
import { handleSendMessage, hasOpenPanel, openWebviewPanel, refreshVisualization } from './webview';
import { consumePendingSelectionChangeIgnore, syncHighlightToSelection, updateEditor } from './editor';
import type { ExtensionToWebviewMessage } from './messages';
import { getOutputChannel } from './logging';

let refreshDebounceHandle: ReturnType<typeof setTimeout> | undefined;

/**
 * Activates the C# Flow Visualizer extension
 */
export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(getOutputChannel());
	registerCommands(context);
}

function isSupportedEditor(editor: vscode.TextEditor | undefined): editor is vscode.TextEditor {
	return editor?.document.uri.scheme === 'file' && editor.document.languageId === 'csharp';
}

function sendSelectionState(editor: vscode.TextEditor): void {
	const line = editor.selection.active.line;
	const highlightedRange = syncHighlightToSelection(editor);

	const lineMessage: ExtensionToWebviewMessage = {
		command: 'lineSelectionChanged',
		data: line + 1
	};

	const highlightMessage: ExtensionToWebviewMessage = {
		command: 'highlightedLinesChanged',
		data: highlightedRange
	};

	handleSendMessage(lineMessage);
	handleSendMessage(highlightMessage);
}

function scheduleAutoRefresh(editor: vscode.TextEditor | undefined): void {
	if (!hasOpenPanel() || !isSupportedEditor(editor)) {
		return;
	}

	if (refreshDebounceHandle) {
		clearTimeout(refreshDebounceHandle);
	}

	refreshDebounceHandle = setTimeout(async () => {
		await refreshVisualization();
		sendSelectionState(editor);
	}, 250);
}

/**
 * Registers extension commands
 */
export function registerCommands(context: vscode.ExtensionContext): void {
	const webviewCmd = vscode.commands.registerCommand('csharpFlowVisualizer.open', async () => {
		await openWebviewPanel(context);
	});

	const activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
		updateEditor(editor);
		scheduleAutoRefresh(editor);
	});

	const saveDisposable = vscode.workspace.onDidSaveTextDocument(document => {
		const activeEditor = vscode.window.activeTextEditor;

		if (!activeEditor || activeEditor.document.uri.toString() !== document.uri.toString()) {
			return;
		}

		updateEditor(activeEditor);
		scheduleAutoRefresh(activeEditor);
	});

	const disposable = vscode.window.onDidChangeTextEditorSelection(event => {
		updateEditor(event.textEditor);

		if (!hasOpenPanel()) {
			return;
		}

		if (consumePendingSelectionChangeIgnore()) {
			return;
		}

		sendSelectionState(event.textEditor);

	});

	context.subscriptions.push(webviewCmd);
	context.subscriptions.push(activeEditorDisposable);
	context.subscriptions.push(saveDisposable);
	context.subscriptions.push(disposable);
}

/**
 * Deactivates the extension
 */
export function deactivate(): void {
	if (refreshDebounceHandle) {
		clearTimeout(refreshDebounceHandle);
	}
}