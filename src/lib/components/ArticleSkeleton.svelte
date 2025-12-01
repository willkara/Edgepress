<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="relative mx-auto flex max-w-screen-xl px-4 py-8">
	<!-- Main Article Content Skeleton -->
	<div class="flex-1 min-w-0 max-w-prose mx-auto">
		<div class="mb-8">
			<!-- Back link -->
			<Skeleton class="h-4 w-24 mb-4 animate-shimmer" />

			<!-- Meta -->
			<div class="flex items-center gap-2 mb-3">
				<Skeleton class="h-3 w-32 animate-shimmer" />
				<Skeleton class="h-3 w-24 animate-shimmer" />
			</div>

			<!-- Title -->
			<Skeleton class="h-10 w-[85%] mb-6 rounded-lg animate-shimmer" />

			<!-- Excerpt -->
			<Skeleton class="h-5 w-full mb-2 animate-shimmer" />
			<Skeleton class="h-5 w-[95%] mb-8 animate-shimmer" />
		</div>

		<!-- Body Content -->
		<div class="space-y-4">
			<Skeleton class="h-4 w-full animate-shimmer" />
			<Skeleton class="h-4 w-[98%] animate-shimmer" />
			<Skeleton class="h-4 w-[95%] animate-shimmer" />
			<Skeleton class="h-4 w-[90%] animate-shimmer" />

			<!-- Mock Code Block or Image -->
			<Skeleton class="h-48 w-full my-8 rounded-xl animate-shimmer opacity-70" />

			<Skeleton class="h-4 w-full animate-shimmer" />
			<Skeleton class="h-4 w-[92%] animate-shimmer" />
			<Skeleton class="h-4 w-[96%] animate-shimmer" />
		</div>
	</div>

	<!-- TOC Sidebar Skeleton -->
	<aside class="toc-sidebar sticky top-20 hidden md:block w-60 pl-8">
		<Skeleton class="h-4 w-24 mb-4 animate-shimmer" />
		<div class="space-y-3 border-l border-border/30 pl-4">
			<Skeleton class="h-3 w-32 animate-shimmer" />
			<Skeleton class="h-3 w-24 animate-shimmer" />
			<Skeleton class="h-3 w-28 animate-shimmer ml-2" />
			<Skeleton class="h-3 w-20 animate-shimmer ml-2" />
			<Skeleton class="h-3 w-36 animate-shimmer" />
			<Skeleton class="h-3 w-24 animate-shimmer ml-2" />
		</div>
	</aside>
</div>
