import dayjs from "dayjs";
import setupDayjs from "./setupDayjs";

setupDayjs();

// God forgive these sins
// i forgive u bc i did worse -frosty
export const nextSundayServiceDefaultDateTime = (): Date => {
    const today = new Date();
    const targetDay = new Date();

    const day_offset = 0; //Set the day of the week here
    targetDay.setUTCDate(today.getUTCDate() + (day_offset + 7 - today.getUTCDay()) % 7);

    targetDay.setUTCHours(19);
    targetDay.setUTCMinutes(0);
    targetDay.setUTCSeconds(0);
    targetDay.setUTCMilliseconds(0);
    targetDay.getTimezoneOffset();

    const dateString = `${targetDay.toISOString().slice(0, 10)} 20:00`;
    const targetDate = dayjs.tz(dateString, "Europe/London").toDate();

    return targetDate;

}

// Maximum file size for lineup poster images (MB)
export const LINEUP_POSTER_MAX_FILE_SIZE_MB = 50;
const BYTES_PER_MB = 1024 * 1024;
export const LINEUP_POSTER_MAX_FILE_SIZE_BYTES = LINEUP_POSTER_MAX_FILE_SIZE_MB * BYTES_PER_MB;

// Allow common web image extensions only
const ALLOWED_LINEUP_POSTER_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

// Reasonable limit to avoid absurdly long filenames breaking downstream tooling/URLs
const LINEUP_POSTER_MAX_FILENAME_LENGTH = 200;

// Patterns that indicate a suspicious or potentially dangerous filename
const STINKY_FILENAME_PATTERNS: RegExp[] = [
    /\\/g, // backslashes (path separators on Windows)
    /\//g, // forward slashes (path separators on POSIX)
    /\.\./g, // directory traversal
    /^[.]/g, // hidden *nix-style files like .env, .gitignore
];

// Characters we explicitly do NOT want in uploaded filenames
const DISALLOWED_FILENAME_CHARS = /["'`<>|?*]/g;

export const validateLineupPosterFile = (file: File | null): { valid: boolean; errorMessage?: string } => {
    if (!file) {
        return { valid: true };
    }

    // Validate filename length
    if (file.name.length > LINEUP_POSTER_MAX_FILENAME_LENGTH) {
        return {
            valid: false,
            errorMessage: `Image filename is too long. Please use a shorter name (max ${LINEUP_POSTER_MAX_FILENAME_LENGTH} characters).`,
        };
    }

    const name = file.name;

    // Reject obviously suspicious patterns in the filename
    const hasStinkyPattern = STINKY_FILENAME_PATTERNS.some((re) => re.test(name));
    if (hasStinkyPattern) {
        return {
            valid: false,
            errorMessage: "Image filename contains unsupported or unsafe characters. Please rename the file and try again.",
        };
    }

    // Reject control characters without relying on regex ranges that embed them directly
    for (let i = 0; i < name.length; i++) {
        const code = name.charCodeAt(i);
        if ((code >= 0 && code <= 31) || code === 127) {
            return {
                valid: false,
                errorMessage: "Image filename contains control characters that are not allowed. Please rename the file and try again.",
            };
        }
    }

    // Reject disallowed special characters
    if (DISALLOWED_FILENAME_CHARS.test(name)) {
        return {
            valid: false,
            errorMessage: "Image filename contains special characters that are not allowed. Please use letters, numbers, dashes, and underscores only.",
        };
    }

    // Validate file extension if present
    const lowerName = name.toLowerCase();
    const hasAllowedExtension = ALLOWED_LINEUP_POSTER_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!hasAllowedExtension) {
        return {
            valid: false,
            errorMessage: `Unsupported image type. Allowed types: ${ALLOWED_LINEUP_POSTER_EXTENSIONS.join(", ")}.`,
        };
    }

    if (file.size > LINEUP_POSTER_MAX_FILE_SIZE_BYTES) {
        const fileSizeMB = (file.size / BYTES_PER_MB).toFixed(2);
        return {
            valid: false,
            errorMessage: `Image file is too large. Maximum file size is ${LINEUP_POSTER_MAX_FILE_SIZE_MB}MB. Your file is ${fileSizeMB}MB.`,
        };
    }

    return { valid: true };
};

