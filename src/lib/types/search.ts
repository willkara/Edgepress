export interface SearchIndexItem {
	slug: string;
	title: string;
	excerpt: string | null;
	published_at: string;
	reading_time: number | null;
	tags: string[];
}

export interface SearchResult extends SearchIndexItem {
	highlight?: string | null;
}
