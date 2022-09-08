import { assertStringIncludes, assert } from "testing/asserts.ts";
import { handler } from "../src/mod.ts";

Deno.test("Resolves root files", async () => {
  const request = new Request("https://deno.land/index.md", {
    headers: {
      accept: "text/html"
    }
  })

  const res = await handler(request, "tests/test-directory");

  assert(res.ok);
  assertStringIncludes(await res.text(), '<h1 id="index-file">')
});