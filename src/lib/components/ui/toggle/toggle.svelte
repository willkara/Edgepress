<script lang="ts" module>
        import { cn } from '$lib/utils';
        import { Toggle as TogglePrimitive } from 'bits-ui';
        import type { Snippet } from 'svelte';
        import { type VariantProps, tv } from 'tailwind-variants';

        const toggleVariants = tv({
                base: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground", 
                variants: {
                        variant: {
                                default: 'border border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
                                outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
                        },
                        size: {
                                default: 'h-9 px-3',
                                sm: 'h-8 px-2 text-xs',
                                lg: 'h-10 px-4'
                        }
                },
                defaultVariants: {
                        variant: 'default',
                        size: 'default'
                }
        });

        export type ToggleVariant = VariantProps<typeof toggleVariants>['variant'];
        export type ToggleSize = VariantProps<typeof toggleVariants>['size'];

        export interface ToggleProps extends TogglePrimitive.RootProps {
                children?: Snippet;
                variant?: ToggleVariant;
                size?: ToggleSize;
                class?: string;
        }
</script>

<script lang="ts">
        let {
                class: className,
                ref = $bindable(null),
                pressed = $bindable(false),
                variant = 'default' as ToggleVariant,
                size = 'default' as ToggleSize,
                children,
                ...restProps
        }: ToggleProps = $props();
</script>

<TogglePrimitive.Root
        bind:ref
        bind:pressed
        data-slot="toggle"
        class={cn(toggleVariants({ variant, size }), className)}
        {...restProps}
>
        {@render children?.()}
</TogglePrimitive.Root>
