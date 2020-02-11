const vscode = require("vscode");
const fs = require("fs");
const {
  window: { showErrorMessage }
} = vscode;

const NOTES_FORMAT = "md";

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const CONFIG = vscode.workspace.getConfiguration("gkeep");
  const defaultNotesRootDirectory = `${context.globalStoragePath}/notes`;
  const notesRootDirectory =
    CONFIG.notesRootDirectory || defaultNotesRootDirectory;

  // Create the defaultNotesRootDirectory only once
  fs.exists(context.globalStoragePath, exists => {
    if (exists) {
      return;
    }

    fs.mkdirSync(context.globalStoragePath);
    fs.mkdirSync(defaultNotesRootDirectory);
  });

  let createNoteCommand = vscode.commands.registerCommand(
    "gkeep.createNote",
    async () => {
      const rawTitle = await vscode.window.showInputBox({
        placeHolder: "Enter a note title..."
      });

      const title = rawTitle.trim();

      if (title === "") {
        showErrorMessage("The note title cannot be empty");
        return;
      }

      let newFilePath = `${notesRootDirectory}/${title}.${NOTES_FORMAT}`;

      fs.open(newFilePath, "w", async error => {
        if (error) {
          showErrorMessage(`The file "${title}" couldn't be created: ${error}`);
          return;
        }

        const doc = await vscode.workspace.openTextDocument(
          vscode.Uri.file(newFilePath)
        );

        vscode.window.showTextDocument(doc);
      });
    }
  );

  let searchNote = vscode.commands.registerCommand(
    "gkeep.searchNotes",
    async () => {
      const fileTuples = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(notesRootDirectory)
      );

      const noteFiles = fileTuples
        .filter(([_, type]) => type === vscode.FileType.File)
        .map(([name, _]) => name)
        .filter(name => name.endsWith(NOTES_FORMAT));

      const selectedFileName = await vscode.window.showQuickPick(noteFiles, {
        placeHolder: "Enter note title...",
        canPickMany: false
      });

      if (!selectedFileName) {
        return;
      }

      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(`${notesRootDirectory}/${selectedFileName}`)
      );
      vscode.window.showTextDocument(doc);
    }
  );

  context.subscriptions.push(createNoteCommand);
  context.subscriptions.push(searchNote);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
