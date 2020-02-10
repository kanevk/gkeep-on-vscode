// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");

// TODO: Use user-specific config(https://github.com/kanevk/gkeep-on-vscode/projects/1#card-32891433)
const CONFIG = {
  notes_root: "/Users/kkanev/vsnotes",
  notes_format: "md"
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log(
    'Congratulations, your extension "gkeep-on-vscode" is now active!'
  );

  let createNoteCommand = vscode.commands.registerCommand(
    "gkeep.createNote",
    async () => {
      const rawTitle = await vscode.window.showInputBox({
        placeHolder: "Enter a note title..."
      });

      const title = rawTitle.trim();

      if (title === "") {
        vscode.window.showErrorMessage("The note title cannot be empty");
        return;
      }

      vscode.window.showInformationMessage(`I will create note - ${title}`);

      let newFilePath = `${CONFIG.notes_root}/${title}.${CONFIG.notes_format}`;

      fs.open(newFilePath, "w", async error => {
        if (error) {
          vscode.window.showErrorMessage(
            `The file "${title}" couldn't be created: ${error}`
          );
          return;
        }

        const doc = await vscode.workspace.openTextDocument(
          vscode.Uri.file(newFilePath)
        );

        vscode.window.showTextDocument(doc);
      });
    }
  );

  context.subscriptions.push(createNoteCommand);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
