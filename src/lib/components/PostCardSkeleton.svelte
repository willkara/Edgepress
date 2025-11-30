<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="rounded-lg border border-border/40 bg-card/50 p-6 mb-4">
	<!-- Meta line -->
	<div class="flex items-center gap-2 mb-2">
		<Skeleton class="h-3 w-24 animate-shimmer" />
		<Skeleton class="h-3 w-3 rounded-full animate-shimmer" />
		<Skeleton class="h-3 w-16 animate-shimmer" />
	</div>

	<!-- Title -->
	<Skeleton class="h-7 w-3/4 mb-3 rounded-md animate-shimmer" />

	<!-- Excerpt -->
	<div class="space-y-2">
		<Skeleton class="h-4 w-full animate-shimmer" />
		<Skeleton class="h-4 w-[90%] animate-shimmer" />
	</div>
</div>
