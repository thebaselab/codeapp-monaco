// @ts-ignore-error
import { initVimMode } from "monaco-vim";
import { CodeStorage } from "./storage";

let vimMode: any | undefined = undefined;

class VimStatusBarAdpator {
  constructor(_node: any, _editor: any, _sanitizer: any) {
    (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
      Event: "vim.mode.change",
      newMode: "--NORMAL--",
    });
  }

  setMode(ev: any) {
    let mode = `--${ev.mode.toUpperCase()}--`;
    if (ev.mode === "visual") {
      if (ev.subMode === "linewise") {
        mode = "--VISUAL LINE--";
      } else if (ev.subMode === "blockwise") {
        mode = "--VISUAL BLOCK--";
      } else {
        mode = "--VISUAL--";
      }
    }
    (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
      Event: "vim.mode.change",
      newMode: mode,
    });
  }

  setKeyBuffer(key: any) {
    (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
      Event: "vim.keybuffer.set",
      buffer: key,
    });
  }

  toggleVisibility(isVisible: boolean) {
    (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
      Event: "vim.visible.set",
      isVisible: isVisible,
    });
  }

  closeInput() {
    (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
      Event: "vim.close.input",
    });
  }

  clear() {
    (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
      Event: "vim.clear",
    });
  }

  setSec(_text: any, _callback: any, _options: any) {
    // TODO: Handle prompt to enable ex commands and search
  }
}

export function toggleVimMode(enabled: boolean) {
  if (enabled) {
    if (vimMode) {
      return;
    }
    vimMode = initVimMode(
      CodeStorage.editor,
      document.getElementById("vim-status-bar"),
      VimStatusBarAdpator
    );
  } else {
    vimMode?.dispose();
    vimMode = null;
  }
}
