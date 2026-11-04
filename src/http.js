const BASE_URL = "https://jsonplaceholder.typicode.com";

// Custom error class
export class HttpError extends Error {
    constructor(status, message, data) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.data = data;
    }
}

// Reusable request function

export async function request(
    path, { method = "GET", body, headers, signal } = {}
) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 8000);

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method: method,
            signal: signal || controller.signal,

            headers: {
                Accept: "application/json",
                ...(body ? { "Content-Type": "application/json" } : {}),
                ...headers,
            },

            body: body ? JSON.stringify(body) : undefined,
        });

        const contentType = response.headers.get("content-type");

        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            let message = `Request failed (${response.status})`;

            if (data && data.message) {
                message = data.message;
            }

            throw new HttpError(response.status, message, data);
        }

        return data;

    } finally {
        clearTimeout(timeout);
    }
}


// API methods
export const api = {
    get: (path, opts) => request(path, opts),

    post: (path, body) =>
        request(path, { method: "POST", body }),

    patch: (path, body) =>
        request(path, { method: "PATCH", body }),

    del: (path) =>
        request(path, { method: "DELETE" }),
};