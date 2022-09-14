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
			<link rel="stylesheet" href="https://esm.sh/v94/normalize.css@8.0.1/es2022/normalize.css.css" />
			<style>
				* {
					margin: 0;
					padding: 0;
				}

				main {
					max-width: 800px;
					margin: 2rem auto;
					padding: 0 1rem;
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

export const handler = async (req: Request, directory: string): Promise<Response> => {
	const url = new URL(req.url);
	
	if (req.headers.get("accept")?.includes("text/html")) {
		return await handlePages(url, directory);
	}

	return new Response("Nothing to see here", { status: 400 })
}

/**
 * Serves files at in a specific folder
 * @param {string} path - Path of the folder to serve
 * @param {Options} options - Additional options
*/
export const serve = (path?: string, options?: Options) => {
	httpServe((req) => handler(req, path || ""), options)
}