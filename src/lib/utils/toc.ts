// src/lib/utils/toc.ts

export interface TocItem {
	id: string;
	text: string;
	level: number; // 2 for h2, 3 for h3
}

export interface TocResult {
	toc: TocItem[];
	html: string;
}

/**
 * Extracts h2 and h3 headings from an HTML string and generates a Table of Contents.
 * Assigns a slug-like ID to headings that don't have one.
 * @param htmlString The HTML content of the article.
 * @returns An object containing the TOC array and modified HTML string.
 */
export function extractToc(htmlString: string): TocResult {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, 'text/html');
	const headings = doc.querySelectorAll('h2, h3');
	const toc: TocItem[] = [];

	headings.forEach((heading) => {
		const level = parseInt(heading.tagName.substring(1)); // 'H2' -> 2, 'H3' -> 3
		let id = heading.id;

		if (!id) {
			// Generate a slug-like ID if not present
			id = heading.textContent
				?.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars
				.trim()
				.replace(/\s+/g, '-') // Replace spaces with -
				.replace(/-+/g, '-'); // Collapse multiple dashes

			// Ensure ID is unique (simple check, could be more robust for edge cases)
			let uniqueId = id;
			let count = 1;
			while (doc.getElementById(uniqueId)) {
				uniqueId = `${id}-${count++}`;
			}
			heading.id = uniqueId; // Assign the ID back to the DOM element
			id = uniqueId;
		}

		if (id && heading.textContent) {
			toc.push({ id, text: heading.textContent, level });
		}
	});

	return { toc, html: doc.body.innerHTML };
}
