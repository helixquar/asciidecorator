'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Settings } from './settings';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
import Workspace = vscode.workspace;


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    var settings = new Settings();

    if(!settings.Enabled)
    {
        console.log("The extension \"asciidecorator\" is disabled.");
        return;
    }

    context.subscriptions.push(vscode.commands.registerCommand('asciidecorator.replaceWithDefaultFont', replaceSelectionsWithDefaultFont));
    context.subscriptions.push(vscode.commands.registerCommand('asciidecorator.replaceWithSelectedFont', replaceSelectionWithSelectedFont));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function replaceSelectionsWithFont(font): void {
    var figlet = require('figlet');
    var settings = new Settings();

    let e = Window.activeTextEditor;
    let d = e.document;
    let sel = e.selections;

    processSelection(e, d, sel, figlet.textSync, [font]);
}

function replaceSelectionWithSelectedFont(): void {
    var figlet = require('figlet');
    var items: QuickPickItem[] = [];

    figlet.fontsSync().forEach(function (font) {
        items.push({ label: font, description: "Use the " + font + " font" });
    }, this);

    Window.showQuickPick(items).then(function (selection) {
        if (!selection) {
            return;
        }
        replaceSelectionsWithFont(selection.label);
    });
}


function replaceSelectionsWithDefaultFont(): void {
    var settings = new Settings();

    replaceSelectionsWithFont(settings.DefaultFont);
}

// This function takes a callback function for the text formatting 'formatCB', 
// if there are any args pass an array as 'argsCB'
function processSelection(e: TextEditor, d: TextDocument, sel: Selection[], formatCB, argsCB) {
    var replaceRanges: Selection[] = [];
    e.edit(function (edit) {
        // itterate through the selections
        for (var x = 0; x < sel.length; x++) {
            let txt: string = d.getText(new Range(sel[x].start, sel[x].end));
            if (argsCB.length > 0) {
                // in the case of figlet the params are test to change and font so this is hard coded
                // the idea of the array of parameters is to allow for a more general approach in the future
                txt = formatCB.apply(this, [txt, argsCB[0]]);
            } else {
                txt = formatCB(txt);
            }

            //replace the txt in the current select and work out any range adjustments
            edit.replace(sel[x], txt);
            let startPos: Position = new Position(sel[x].start.line, sel[x].start.character);
            let endPos: Position = new Position(sel[x].start.line + txt.split(/\r\n|\r|\n/).length - 1, sel[x].start.character + txt.length);
            replaceRanges.push(new Selection(startPos, endPos));
        }
    });
    e.selections = replaceRanges;
}