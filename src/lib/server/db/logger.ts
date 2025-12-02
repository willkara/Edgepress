/* eslint-disable no-console */
/**
 * Database query performance monitoring for EdgePress
 * Logs slow queries and tracks execution times
 */

import type { D1Database, D1Result, D1Response } from '@cloudflare/workers-types';

export type QueryBindingValue = string | number | boolean | null | undefined;

export interface QueryMetrics {
	query: string;
	duration: number;
	timestamp: string;
	params?: QueryBindingValue[];
}

/**
 * Threshold in milliseconds for logging slow queries
 * Queries slower than this will be logged to console
 */
const SLOW_QUERY_THRESHOLD_MS = 100;

/**
 * Lightweight logger for request-scoped database operations
 */
export async function withRequestLogging<T>(
	requestId: string | undefined,
	operation: string,
	fn: () => Promise<T>
): Promise<T> {
	const startTime = performance.now();

	try {
		const result = await fn();
		const duration = performance.now() - startTime;

		console.info(`[DB] ${operation} completed in ${duration.toFixed(2)}ms`, {
			requestId
		});

		return result;
	} catch (error) {
		const duration = performance.now() - startTime;
		console.error(`[DB] ${operation} failed after ${duration.toFixed(2)}ms`, {
			requestId,
			error
		});
		throw error;
	}
}

/**
 * Track query execution time and log if slow
 */
export async function trackQuery<T>(
	queryName: string,
	queryFn: () => Promise<T>,
	params?: QueryBindingValue[]
): Promise<T> {
	const startTime = performance.now();

	try {
		const result = await queryFn();
		const duration = performance.now() - startTime;

		// Log slow queries
		if (duration > SLOW_QUERY_THRESHOLD_MS) {
			console.warn(`[SLOW QUERY] ${queryName} took ${duration.toFixed(2)}ms`, {
				params,
				threshold: SLOW_QUERY_THRESHOLD_MS
			});
		}

		return result;
	} catch (error) {
		const duration = performance.now() - startTime;
		console.error(`[QUERY ERROR] ${queryName} failed after ${duration.toFixed(2)}ms`, {
			error,
			params
		});
		throw error;
	}
}

/**
 * Wrapper for D1 prepare().all() with performance tracking
 */
export async function trackedAll<T>(
	db: D1Database,
	query: string,
	params: QueryBindingValue[] = [],
	queryName?: string
): Promise<D1Result<T>> {
	return trackQuery(
		queryName || 'D1 Query',
		async () => {
			const stmt = db.prepare(query);
			return params.length > 0 ? stmt.bind(...params).all<T>() : stmt.all<T>();
		},
		params
	);
}

/**
 * Wrapper for D1 prepare().first() with performance tracking
 */
export async function trackedFirst<T>(
	db: D1Database,
	query: string,
	params: QueryBindingValue[] = [],
	queryName?: string
): Promise<T | null> {
	return trackQuery(
		queryName || 'D1 Query',
		async () => {
			const stmt = db.prepare(query);
			return params.length > 0 ? stmt.bind(...params).first<T>() : stmt.first<T>();
		},
		params
	);
}

/**
 * Wrapper for D1 prepare().run() with performance tracking
 */
export async function trackedRun(
	db: D1Database,
	query: string,
	params: QueryBindingValue[] = [],
	queryName?: string
): Promise<D1Response> {
	return trackQuery(
		queryName || 'D1 Query',
		async () => {
			const stmt = db.prepare(query);
			return params.length > 0 ? stmt.bind(...params).run() : stmt.run();
		},
		params
	);
}

/**
 * Simple in-memory metrics collector for request-level tracking
 */
export class RequestMetrics {
	private queries: QueryMetrics[] = [];
	private startTime: number;

	constructor() {
		this.startTime = performance.now();
	}

	/**
	 * Add a query to the metrics
	 */
	addQuery(queryName: string, duration: number, params?: QueryBindingValue[]): void {
		this.queries.push({
			query: queryName,
			duration,
			timestamp: new Date().toISOString(),
			params
		});
	}

	/**
	 * Get total request duration
	 */
	getTotalDuration(): number {
		return performance.now() - this.startTime;
	}

	/**
	 * Get query count
	 */
	getQueryCount(): number {
		return this.queries.length;
	}

	/**
	 * Get total time spent in queries
	 */
	getTotalQueryTime(): number {
		return this.queries.reduce((sum, q) => sum + q.duration, 0);
	}

	/**
	 * Get slowest queries
	 */
	getSlowestQueries(limit = 5): QueryMetrics[] {
		return [...this.queries].sort((a, b) => b.duration - a.duration).slice(0, limit);
	}

	/**
	 * Build performance headers for HTTP response
	 */
	getPerformanceHeaders(): Record<string, string> {
		const totalDuration = this.getTotalDuration();
		const queryCount = this.getQueryCount();
		const queryTime = this.getTotalQueryTime();

		return {
			'Server-Timing': [
				`total;dur=${totalDuration.toFixed(2)}`,
				`db;dur=${queryTime.toFixed(2)}`,
				`db-count;desc="${queryCount}"`
			].join(', ')
		};
	}

	/**
	 * Log performance summary
	 */
	logSummary(route: string): void {
		const totalDuration = this.getTotalDuration();
		const queryCount = this.getQueryCount();
		const queryTime = this.getTotalQueryTime();

		console.log(`[PERF] ${route}`, {
			total_ms: totalDuration.toFixed(2),
			db_queries: queryCount,
			db_time_ms: queryTime.toFixed(2),
			db_percentage: ((queryTime / totalDuration) * 100).toFixed(1) + '%'
		});

		// Log slow queries if any
		const slowQueries = this.getSlowestQueries(3);
		if (slowQueries.length > 0 && slowQueries[0].duration > SLOW_QUERY_THRESHOLD_MS) {
			console.warn(`[PERF] Slow queries detected:`, slowQueries);
		}
	}
}

/**
 * Create a request metrics instance and attach to platform context
 */
export function initRequestMetrics(platform: Record<string, unknown>): RequestMetrics {
	const metrics = new RequestMetrics();
	platform.metrics = metrics;
	return metrics;
}

/**
 * Get request metrics from platform context
 */
export function getRequestMetrics(platform: Record<string, unknown>): RequestMetrics | undefined {
	const metrics = platform?.metrics;
	return metrics instanceof RequestMetrics ? metrics : undefined;
}
