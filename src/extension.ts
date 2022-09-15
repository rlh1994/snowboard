// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ThemeColor } from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "snowboard" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('snowboard.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from snowboarding!');
	});

	let micro = vscode.commands.registerCommand('snowboard.openMicro', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from snowboarding!');
		// vscode.open('https://localhost:9090/micro/all');
		let microUri = 'http://localhost:9090/micro/all';
		let success = vscode.commands.executeCommand('vscode.open', microUri, 1);

		// probably makes more sense to open this as a webview...

	});

	let newSchema = vscode.commands.registerCommand('snowboard.newSchema', () => {
		let success = vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	});

	let openDebugger = vscode.commands.registerCommand('snowboard.openMicroDebugger', () => {
		const panel = vscode.window.createWebviewPanel(
			'Micro Debugger',
			'Micro Debugger',
			vscode.ViewColumn.Two,
			{
				enableScripts: true
			}
		);
		panel.webview.html = '<iframe src="http://localhost:3000" style="border: medium none; width: 100%; height: 1000px;"></iframe>';
	});

	// command to create new untitled file
	// workbench.action.files.newUntitledFile


	const provider1 = vscode.languages.registerCompletionItemProvider('*', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			
			// TODO: enumerate schemas from local 'schemas' directory
			// in the future we could pull these manifests from remote repositories
			let fakeSchemas = [
				'com.poplindata/click/1-0-0',
				'com.poplindata/click/2-0-0',
				'com.poplindata/view/1-0-0',
				'com.google/recaptcha/1-0-0'
			];

			// new type of events?
			const schemaCompletion = new vscode.CompletionItem('iglu:');
			schemaCompletion.insertText = new vscode.SnippetString('iglu:${1|' + fakeSchemas.join(',') + '|}');
			schemaCompletion.documentation = new vscode.MarkdownString('Attempts to autocomplete an Iglu reference');
			schemaCompletion.kind = vscode.CompletionItemKind.Constant;
			schemaCompletion.command = {
				command: 'editor.action.triggerSuggest',
				title: 'Retrigger'
			};

			// return all completion items as array
			return [
				schemaCompletion
			];
		}
	});

	context.subscriptions.push(provider1);


	let x = vscode.commands.registerCommand('enrichments.editEnrichment', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('You are trying to edit an enrichment');
	});

	context.subscriptions.push(disposable);

	// vscode.window.createTreeView('snowplowEnvironments', {
	// 	treeDataProvider: new NodeDependenciesProvider('.'),
	// })

	vscode.window.createTreeView('schemas', {
		treeDataProvider: new SchemasProvider('.')
	});

	vscode.window.createTreeView('enrichments', {
		treeDataProvider: new EnrichmentsProvider('.')
	});

	// 123



}

// this method is called when your extension is deactivated
export function deactivate() {}

export class SchemasProvider implements vscode.TreeDataProvider<Schema> {
	// This needs major revision, UI works but data structure
	// does not really make any sense
	constructor(private workspaceRoot: string) {}

	// let schemas = {
	// 	'com.poplindata': {
	// 		'click': {
	// 			'1-0-0': 'filename?/path',
	// 			'1-0-1': 'filename?/path'
	// 		}
	// 	}
	// }

	getTreeItem(element: Schema): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Schema): Thenable<Schema[]> {

		if (element) {
			// get the schemas for this vendor

			if (element.type === 'vendor') {
				// get all events for this vendor
				var events = new Schema(
					'com.poplindata',
					'click',
					'1-0-0',
					'event',
					vscode.TreeItemCollapsibleState.Collapsed
				)
				return Promise.resolve([events]);
			}

			if (element.type === 'event') {
				// get all versions of this event
				var event = new Schema(
					'com.poplindata',
					'click',
					'1-0-0',
					'schema',
					vscode.TreeItemCollapsibleState.None
				)
				return Promise.resolve([event]);
			}

		} else {
			var x = new Schema(
				'com.poplindata',
				'click',
				'1-0-0',
				'vendor',
				vscode.TreeItemCollapsibleState.Collapsed
			)
			return Promise.resolve([x]);
		}
		return Promise.resolve([]);
	}
}

class Schema extends vscode.TreeItem {
	constructor(
		public readonly vendor: string,
		public readonly name: string,
		public readonly version: string,
		public readonly type: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {

		// if (type == 'vendor') {
		// 	super(vendor, collapsibleState);
		// } else if (type == 'event') {
		// 	super(name, collapsibleState);
		// }
		// super(name, collapsibleState);

		super(name, collapsibleState);

		if (type === 'vendor') {
			this.label = vendor;
			this.iconPath = new vscode.ThemeIcon('folder');
			this.description = '(n)';
		} else if (type === 'event') {
			this.label = name;
			this.iconPath = new vscode.ThemeIcon('folder');
			this.description = '(n)';
		} else {
			this.label = version;
			this.iconPath = new vscode.ThemeIcon('file')
		}

		this.tooltip = 'Hello tooltip';
		
		
	}
}


/// Todo: hookup to micro and allow easier debugging?

export class EnrichmentsProvider implements vscode.TreeDataProvider<Enrichment> {

	constructor(private workspaceRoot: string) {}

	getTreeItem(element: Enrichment): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Enrichment): Thenable<Enrichment[]> {
			// technically no children
			// but maybe consider displaying jsonschema props?
			var c = new Enrichment(
				'currency conversion',
				'1-0-0',
				false
			);
			var d = new Enrichment(
				'data enrichment',
				'1-0-0',
				true
			);
			return Promise.resolve([c, d]);
	}

	editEntry(element: Enrichment) {
		console.log('do not do anything');
	}
}

class Enrichment extends vscode.TreeItem {
	constructor(
		public readonly name: string,
		public readonly version: string,
		public readonly enabled: boolean
	) {
		super(name, vscode.TreeItemCollapsibleState.None);
		this.tooltip = 'Hello tooltip';
		this.description = this.version;
		if (this.enabled === true) {
			this.iconPath = new vscode.ThemeIcon('pass-filled', new ThemeColor('terminal.ansiGreen'));
		} else {
			this.iconPath = new vscode.ThemeIcon('debug-breakpoint-unverified', new ThemeColor('problemsWarningIcon.foreground'));
		}
		// command logic
		const command = {
			'command': 'enrichments.editEnrichment',
		}
		// this.command = command;
	}
	

}


