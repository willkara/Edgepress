import { InputRule } from '@tiptap/core';
import { InlineMath } from '@tiptap/extension-mathematics';

export const InlineMathReplacer = InlineMath.extend({
	name: 'inlineMathReplacer',
	addInputRules() {
		return [
			new InputRule({
				find: /\$\$([^$]+)\$\$/,
				handler: ({ state, range, match, commands }: any) => {
					const latex = match[1];
					// Insert the inline math node with the LaTeX content
					commands.insertInlineMath({
						latex
					});
				}
			})
		];
	}
});
