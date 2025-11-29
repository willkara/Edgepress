import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import Image, { type ImageOptions } from '@tiptap/extension-image';
import type { Component } from 'svelte';
import type { NodeViewProps, Node } from '@tiptap/core';

export const ImageExtended = (component: Component<NodeViewProps>): Node<ImageOptions, unknown> => {
	return Image.extend({
		addAttributes() {
			return {
				src: {
					default: null
				},
				srcset: {
					default: null,
					renderHTML: (attributes) => {
						if (!attributes.srcset) {
							return {};
						}
						return { srcset: attributes.srcset };
					}
				},
				sizes: {
					default: null,
					renderHTML: (attributes) => {
						if (!attributes.sizes) {
							return {};
						}
						return { sizes: attributes.sizes };
					}
				},
				loading: {
					default: 'lazy',
					renderHTML: (attributes) => {
						return { loading: attributes.loading || 'lazy' };
					}
				},
				alt: {
					default: null
				},
				title: {
					default: null
				},
				width: {
					default: '100%'
				},
				height: {
					default: null
				},
				align: {
					default: 'left'
				},
				'data-media-id': {
					default: null
				},
				'data-cf-image-id': {
					default: null
				}
			};
		},
		addNodeView: () => {
			return SvelteNodeViewRenderer(component);
		}
	}).configure({
		allowBase64: false
	});
};
