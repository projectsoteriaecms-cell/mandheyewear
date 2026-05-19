declare global {
  interface Window {
    Word: {
      run: <T>(cb: (context: WordContext) => Promise<T>) => Promise<T>;
    };
  }
}

interface WordContext {
  document: {
    getSelection: () => WordRange;
    body: WordBody;
  };
  sync: () => Promise<void>;
}

interface WordRange {
  load: (props: string) => void;
  text: string;
  insertText: (text: string, location: string) => void;
}

interface WordBody {
  load: (props: string) => void;
  text: string;
  insertText: (text: string, location: string) => void;
}

export function useWordContent() {
  const getSelectedText = async (): Promise<string> => {
    return window.Word.run(async (ctx) => {
      const sel = ctx.document.getSelection();
      sel.load("text");
      await ctx.sync();
      return sel.text.trim();
    });
  };

  const getDocumentText = async (): Promise<string> => {
    return window.Word.run(async (ctx) => {
      const body = ctx.document.body;
      body.load("text");
      await ctx.sync();
      return body.text.trim();
    });
  };

  const insertText = async (
    text: string,
    mode: "replace" | "append" | "prepend" = "replace"
  ): Promise<void> => {
    await window.Word.run(async (ctx) => {
      if (mode === "replace") {
        const sel = ctx.document.getSelection();
        sel.insertText(text, "Replace");
      } else {
        const body = ctx.document.body;
        body.insertText(text, mode === "append" ? "End" : "Start");
      }
      await ctx.sync();
    });
  };

  return { getSelectedText, getDocumentText, insertText };
}
