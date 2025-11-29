<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import { DragHandlePlugin } from '../extensions/drag-handle/index.js';

	interface Props {
		editor: Editor;
	}

	const { editor }: Props = $props();

	const pluginKey = 'globalDragHandle';

	$effect(() => {
		const plugin = DragHandlePlugin({
			pluginKey: pluginKey,
			dragHandleWidth: 20,
			scrollTreshold: 100,
			dragHandleSelector: '.drag-handle',
			excludedTags: ['pre', 'code', 'table p'],
			customNodes: []
		});
		editor.registerPlugin(plugin);
		return () => editor.unregisterPlugin(pluginKey);
	});
</script>

<div class="drag-handle">
	<GripVertical />
</div>
