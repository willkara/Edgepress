import { format, formatDistanceToNow, parseISO } from 'date-fns';

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {return error.message;}
	return String(error);
}

/**
 * Format a date string (ISO 8601) to a human-readable string relative to now.
 * Example: "2 days ago", "about 1 hour ago"
 * Handles timezone conversion automatically as parseISO treats 'Z' as UTC.
 */
export function formatDateRelative(dateString: string): string {
	if (!dateString) {
		return '';
	}
	try {
		const date = parseISO(dateString);
		return formatDistanceToNow(date, { addSuffix: true });
	} catch (error) {
		console.error('Error formatting relative date:', getErrorMessage(error));
		return dateString;
	}
}

/**
 * Format a date string (ISO 8601) to a standard display format.
 * Example: "Oct 27, 2023"
 */
export function formatDateStandard(dateString: string): string {
	if (!dateString) {
		return '';
	}
	try {
		const date = parseISO(dateString);
		return format(date, 'MMM dd, yyyy');
	} catch (error) {
		console.error('Error formatting standard date:', getErrorMessage(error));
		return dateString;
	}
}

/**
 * Format a date string (ISO 8601) to a full timestamp with timezone abbreviation.
 * Example: "Oct 27, 2023, 2:30 PM UTC" (or local equivalent if desired, but UTC is safer for edge)
 */
export function formatDateFull(dateString: string): string {
	if (!dateString) {
		return '';
	}
	try {
		const date = parseISO(dateString);
		// Using Intl.DateTimeFormat for robust timezone handling if needed,
		// but date-fns format is often sufficient.
		// Let's stick to a clear, readable format.
		return format(date, 'PPpp'); // Oct 29, 2023, 9:46 AM
	} catch (error) {
		console.error('Error formatting full date:', getErrorMessage(error));
		return dateString;
	}
}
