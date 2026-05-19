declare global {
  interface Window {
    Excel: {
      run: <T>(cb: (context: ExcelContext) => Promise<T>) => Promise<T>;
    };
  }
}

interface ExcelContext {
  workbook: {
    getSelectedRange: () => ExcelRange;
    worksheets: {
      getActiveWorksheet: () => ExcelWorksheet;
    };
  };
  sync: () => Promise<void>;
}

interface ExcelRange {
  load: (props: string | string[]) => void;
  values: (string | number | boolean)[][];
  formulas: (string | number | boolean)[][];
  address: string;
}

interface ExcelWorksheet {
  load: (props: string) => void;
  name: string;
}

export function useExcelContent() {
  const getSelectedRange = async (): Promise<string> => {
    return window.Excel.run(async (ctx) => {
      const range = ctx.workbook.getSelectedRange();
      range.load(["values", "address"]);
      await ctx.sync();

      const rows = range.values
        .map((row) => row.join("\t"))
        .join("\n");

      return `Selected range: ${range.address}\n\nData:\n${rows}`;
    });
  };

  const getActiveSheetName = async (): Promise<string> => {
    return window.Excel.run(async (ctx) => {
      const ws = ctx.workbook.worksheets.getActiveWorksheet();
      ws.load("name");
      await ctx.sync();
      return ws.name;
    });
  };

  const insertFormulaInSelection = async (formula: string): Promise<void> => {
    await window.Excel.run(async (ctx) => {
      const range = ctx.workbook.getSelectedRange();
      range.formulas = [[formula.startsWith("=") ? formula : `=${formula}`]];
      await ctx.sync();
    });
  };

  return { getSelectedRange, getActiveSheetName, insertFormulaInSelection };
}
