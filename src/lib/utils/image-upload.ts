/**
 * Image Upload Utilities
 *
 * Client-side utilities for uploading images to Cloudflare Images
 * with progress tracking and validation
 */

/**
 * Result from successful image upload to Cloudflare Images
 */
export interface UploadResult {
	/** Database media record ID */
	mediaId: string;
	/** Cloudflare Images ID */
	imageId: string;
	/** Content hash of the uploaded image */
	hash: string;
	/** Primary URL for accessing the image */
	url: string;
	/** Available image variants (thumbnail, hero, etc.) */
	variants?: string[];
	/** Original image width in pixels */
	width?: number;
	/** Original image height in pixels */
	height?: number;
	/** Original filename */
	filename: string;
}

/**
 * Upload progress tracking information
 */
export interface UploadProgress {
	/** Bytes uploaded so far */
	loaded: number;
	/** Total bytes to upload */
	total: number;
	/** Upload percentage (0-100) */
	percentage: number;
}

/**
 * Upload an image to Cloudflare Images via the API endpoint
 * @param file The image file to upload
 * @param onProgress Optional callback for upload progress updates
 * @returns Promise with upload result containing media ID and CF Images URL
 */
export async function uploadImageToCloudflare(
	file: File,
	onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
	if (!file.type.startsWith('image/')) {
		throw new Error('File must be an image');
	}

	const formData = new FormData();
	formData.append('file', file);

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		// Track upload progress
		xhr.upload.addEventListener('progress', (e) => {
			if (e.lengthComputable && onProgress) {
				const progress: UploadProgress = {
					loaded: e.loaded,
					total: e.total,
					percentage: Math.round((e.loaded / e.total) * 100)
				};
				onProgress(progress);
			}
		});

		// Handle completion
		xhr.addEventListener('load', () => {
			if (xhr.status === 200) {
				try {
					const result = JSON.parse(xhr.responseText) as UploadResult;
					resolve(result);
				} catch {
					reject(new Error('Invalid response from server'));
				}
			} else {
				try {
					const errorData = JSON.parse(xhr.responseText) as { message?: string };
					const message =
						errorData && typeof errorData.message === 'string' ? errorData.message : undefined;
					reject(new Error(message ?? `Upload failed: ${xhr.status}`));
				} catch {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			}
		});

		// Handle network errors
		xhr.addEventListener('error', () => {
			reject(new Error('Network error during upload'));
		});

		// Handle abort
		xhr.addEventListener('abort', () => {
			reject(new Error('Upload aborted'));
		});

		// Send request
		xhr.open('POST', '/api/admin/media/upload');
		xhr.send(formData);
	});
}

/**
 * Validate image file before upload
 * @param file The file to validate
 * @param options Validation options
 * @returns True if valid, throws error if invalid
 */
export function validateImageFile(
	file: File,
	options: {
		maxSize?: number; // in bytes
		allowedTypes?: string[]; // MIME types
	} = {}
): boolean {
	const {
		maxSize = 10 * 1024 * 1024, // 10MB default
		allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
	} = options;

	// Check if it's an image
	if (!file.type.startsWith('image/')) {
		throw new Error('File must be an image');
	}

	// Check allowed types
	if (!allowedTypes.includes(file.type)) {
		const allowed = allowedTypes.map((t) => t.replace('image/', '')).join(', ');
		throw new Error(`File type not allowed. Allowed types: ${allowed}`);
	}

	// Check file size
	if (file.size > maxSize) {
		const maxMB = Math.round(maxSize / (1024 * 1024));
		const fileMB = Math.round(file.size / (1024 * 1024));
		throw new Error(`File too large (${fileMB}MB). Maximum size: ${maxMB}MB`);
	}

	return true;
}

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) {
		return '0 Bytes';
	}

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
