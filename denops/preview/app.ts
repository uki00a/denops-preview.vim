import { ensureArray, ensureNumber, main } from "./deps.ts";

// TODO: Refactor code
main(async ({ vim }) => {
  function getMarkdownPreviewer(): string {
    return "mdcat";
  }

  function buildTerminalCommand(executable: string, file: string): string {
    return `:terminal ${executable} ${file}`;
  }

  vim.register({
    async preview(bufnr: unknown) {
      ensureNumber(bufnr);
      const lines = await vim.call("getbufline", bufnr, 1, "$");
      ensureArray(lines);
      const file = await Deno.makeTempFile({ prefix: "denops-preview-" });
      try {
        const contents = lines.join("\n");
        await Deno.writeTextFile(file, contents);
        await vim.execute([
          "vsplit",
          buildTerminalCommand(getMarkdownPreviewer(), file),
        ]);
      } finally {
        // FIXME: Waiting for mdcat to complete...
        setTimeout(() => Deno.remove(file), 3000);
      }
    },
  });

  await vim.execute(
    `command! DenopsPreview call denops#notify("${vim.name}", "preview", [bufnr("%")])`,
  );
});
