<script lang="ts">
	import {
		EditorView,
		keymap,
		lineNumbers,
		highlightActiveLineGutter,
		highlightSpecialChars,
		drawSelection,
		dropCursor,
		rectangularSelection,
		crosshairCursor,
		highlightActiveLine
	} from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import {
		syntaxHighlighting,
		defaultHighlightStyle,
		bracketMatching,
		foldGutter,
		foldKeymap
	} from '@codemirror/language';
	import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
	import {
		autocompletion,
		completionKeymap,
		closeBrackets,
		closeBracketsKeymap
	} from '@codemirror/autocomplete';
	import { lintKeymap } from '@codemirror/lint';
	import { html } from '@codemirror/lang-html';
	import { css } from '@codemirror/lang-css';
	import { javascript } from '@codemirror/lang-javascript';

	interface Props {
		value?: string;
		disabled?: boolean;
		lang?: 'html' | 'css' | 'javascript';
	}

	let { value = $bindable(''), disabled = false, lang = 'html' }: Props = $props();

	let editorContainer = $state<HTMLDivElement | undefined>();
	let editorView = $state<EditorView | null>(null);

	// Get language extension based on lang prop
	function getLanguageExtension() {
		switch (lang) {
			case 'css':
				return css();
			case 'javascript':
				return javascript();
			case 'html':
			default:
				return html();
		}
	}

	// Initialize editor on mount and cleanup on destroy
	$effect(() => {
		if (!editorContainer) return;

		const startState = EditorState.create({
			doc: value,
			extensions: [
				lineNumbers(),
				highlightActiveLineGutter(),
				highlightSpecialChars(),
				history(),
				foldGutter(),
				drawSelection(),
				dropCursor(),
				EditorState.allowMultipleSelections.of(true),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				rectangularSelection(),
				crosshairCursor(),
				highlightActiveLine(),
				highlightSelectionMatches(),
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...searchKeymap,
					...historyKeymap,
					...foldKeymap,
					...completionKeymap,
					...lintKeymap
				]),
				getLanguageExtension(),
				EditorView.editable.of(!disabled),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						value = update.state.doc.toString();
					}
				}),
				EditorView.theme({
					'&': {
						fontSize: '14px',
						border: '1px solid hsl(var(--border))',
						borderRadius: '0.375rem'
					},
					'.cm-content': {
						fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
						minHeight: '200px'
					},
					'.cm-gutters': {
						backgroundColor: 'hsl(var(--muted) / 0.3)',
						color: 'hsl(var(--muted-foreground))',
						border: 'none'
					},
					'.cm-activeLineGutter': {
						backgroundColor: 'hsl(var(--muted) / 0.5)'
					},
					'.cm-activeLine': {
						backgroundColor: 'hsl(var(--muted) / 0.2)'
					},
					'.cm-selectionBackground, ::selection': {
						backgroundColor: 'hsl(var(--primary) / 0.2)'
					},
					'.cm-focused .cm-selectionBackground': {
						backgroundColor: 'hsl(var(--primary) / 0.3)'
					}
				})
			]
		});

		editorView = new EditorView({
			state: startState,
			parent: editorContainer
		});

		// Cleanup when effect is destroyed
		return () => {
			if (editorView) {
				editorView.destroy();
				editorView = null;
			}
		};
	});

	// Update editor when disabled state changes
	$effect(() => {
		if (editorView) {
			editorView.dispatch({
				effects: (EditorView.editable as any).reconfigure(EditorView.editable.of(!disabled))
			});
		}
	});

	// Update editor when value changes externally
	$effect(() => {
		if (editorView) {
			const currentValue = editorView.state.doc.toString();
			if (currentValue !== value) {
				editorView.dispatch({
					changes: { from: 0, to: currentValue.length, insert: value }
				});
			}
		}
	});
</script>

<div class="warning">
	<strong>Heads up:</strong> Injected code (including scripts/styles) runs on public pages. Only add content
	you fully trust.
</div>

<div bind:this={editorContainer} class="code-editor"></div>

<style>
	.warning {
		margin-bottom: 0.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid hsl(var(--destructive) / 0.4);
		border-radius: 0.375rem;
		background: hsl(var(--destructive) / 0.08);
		color: hsl(var(--destructive));
		font-size: 0.9rem;
	}

	.code-editor {
		width: 100%;
	}

	.code-editor :global(.cm-editor) {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.code-editor :global(.cm-focused) {
		outline: none;
		border-color: hsl(var(--primary));
	}
</style>
