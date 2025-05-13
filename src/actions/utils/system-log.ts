import type { Files } from '@adobe/aio-sdk';

/**
 * Appends a timestamped log entry to a file for an action request and response
 * @param files - The files object
 * @param filePath - The path to the file
 * @param request - The request object
 * @param response - The response object
 */
export async function appendTimestampedLog(
    files: Files.Files,
    filePath: string,
    request: unknown,
    response: unknown
) {
    const timestamp = new Date().toISOString();

    const existingBuffer = await files.read(filePath);

    const newBuffer = Buffer.from(
        JSON.stringify({
            timestamp,
            request,
            response,
        })
    );

    await files.write(filePath, Buffer.concat([existingBuffer, newBuffer]));
}

/**
 * Generates a presigned URL for reading a file
 * @param files - The files object
 * @param filePath - The path to the file
 * @returns The presigned URL
 */
export async function getLogURL(files: Files.Files, filePath: string) {
    return await files.generatePresignURL(filePath, {
        expiryInSeconds: 60,
        permissions: 'r',
        urlType: 'external',
    });
}
