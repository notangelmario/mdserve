import { CSS, render } from "https://deno.land/x/gfm@0.1.24/mod.ts";
import { serve } from "https://deno.land/std@0.154.0/http/server.ts";

const addSlashes = (string: string) => string.replace(/^\/?([^\/]+(?:\/[^\/]+)*)\/?$/, '/$1/') || '/';

const handlePages = async (url: URL): Promise<Response> => {
	let fileContent = "";

	const path = await Deno.lstat(`notes${url.pathname}`);

	try {
		if (path.isDirectory) {
			fileContent = await Deno.readTextFile(`notes${addSlashes(url.pathname)}index.md`);
		} else {
			fileContent = await Deno.readTextFile(`notes${url.pathname}`);
		}
	} catch (e) {
		console.log(e);
	}

	if (!fileContent) {
		return new Response("Not found", { status: 404 })
	}

	const body = render(fileContent)

	const html = `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<style>
				main {
					max-width: 800px;
					margin: 2rem auto;
				}
				${CSS}
			</style>
		</head>
		<body>
			<main data-color-mode="light" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
				${body}
			</main>
		</body>
	</html>
`;

	return new Response(html, {
		headers: {
			"Content-Type": "text/html"
		}
	});
}

const handler = async (req: Request): Promise<Response> => {
	const url = new URL(req.url);
	
	if (req.headers.get("accept")?.startsWith("text/html")) {
		return await handlePages(url);
	}

	return new Response("Nothing to see here", { status: 400 })
}

serve(handler, {
	port: 8080
})