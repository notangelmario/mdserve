import { join } from "path";
import { serve as httpServe } from "server";
import { CSS, render } from "gfm";
import { splitPath } from "./utils.ts";
import { Options } from "./types.ts";

const handlePages = async (url: URL, directory: string): Promise<Response> => {
	let fileContent = "";

	const path = await Deno.lstat(join(directory, ...splitPath(url.pathname)));

	try {
		if (path.isDirectory) {
			fileContent = await Deno.readTextFile(join(directory, ...splitPath(url.pathname), "index.md"));
		} else {
			fileContent = await Deno.readTextFile(join(directory, ...splitPath(url.pathname)));
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

const handler = async (req: Request, directory: string): Promise<Response> => {
	const url = new URL(req.url);
	
	if (req.headers.get("accept")?.startsWith("text/html")) {
		return await handlePages(url, directory);
	}

	return new Response("Nothing to see here", { status: 400 })
}

export const serve = (path?: string, options?: Options) => {
	httpServe((req) => handler(req, path || ""), options)
}