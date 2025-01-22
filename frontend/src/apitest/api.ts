export interface RegistrationData {
    email: string;
    full_name: string;
    date_of_birth: string;
    bio_id: string;
    password: string;
}

export interface LoginResponse {
    user: string;
    access: string;
    refresh: string;
    full_name: string;
    role: string;
}

export interface Petition {
    id: number;
    title: string;
    content: string;
    status: string;
    response: string | null;
    signatures_count: number;
    already_signed: number;
    creator_email: string;
}

export interface CreatePetitionData {
    title: string;
    content: string;
}

const baseURL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

// REGISTER
export async function registerUser(data: RegistrationData): Promise<void> {
    const res = await fetch(`${baseURL}/api/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Registration failed: ${err}`);
    }
}

// LOGIN
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Login failed: ${err}`);
    }
    return res.json();
}

// FETCH PETITIONS
export async function getPetitions(token: string | null): Promise<Petition[]> {
    const res = await authFetch(`${baseURL}/api/petitions/`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to fetch petitions: ${err}`);
    }
    return res.json();
}

// CREATE PETITION
export async function createPetition(token: string, data: CreatePetitionData): Promise<void> {
    const res = await authFetch(`${baseURL}/api/petitions/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Petition creation failed: ${err}`);
    }
}

// SIGN PETITION
export async function signPetition(token: string, petitionId: number): Promise<void> {
    const res = await authFetch(`${baseURL}/api/signatures/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ petition: petitionId }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Signing petition failed: ${err}`);
    }
}

//COMMITTEE

export async function getThreshold(): Promise<number> {
    const res = await authFetch(`${baseURL}/api/threshold/`, {
        method: "GET",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch threshold");
    }
    const data = await res.json();
    return data.threshold; // Assuming the response is { "threshold": <value> }
}

export async function updateThreshold(token: string, newThreshold: number): Promise<void> {
    const res = await authFetch(`${baseURL}/api/threshold/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threshold: newThreshold }),
    });
    if (!res.ok) {
        throw new Error("Failed to update threshold");
    }
}

export async function getAllPetitions(token: string) {
    const res = await authFetch("http://localhost:8000/api/petitions/", {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        throw new Error("Failed to load petitions");
    }
    return res.json();
}

export async function respondAndClosePetition(
    token: string,
    petitionId: number,
    responseText: string
) {
    const res = await authFetch(`http://localhost:8000/api/petitions/${petitionId}/respond_and_close/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ response: responseText })
    });
    if (!res.ok) {
        throw new Error("Failed to respond and close petition");
    }
}

export async function checkThreshold(token: string | null, petitionId: number): Promise<boolean> {
    const res = await authFetch(`${baseURL}/api/petitions/${petitionId}/check_threshold/`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error("Failed to check threshold");
    }
    const data = await res.json();
    return data.meets_threshold; // Returns true or false
}


//JWT TOKEN REFRESH
async function refreshAccessToken(): Promise<string | null> {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
        return null;
    }
    try {
        const res = await fetch(`${baseURL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.access);
            return data.access;
        } else {
            throw new Error("Failed to refresh token");
        }
    } catch (err) {
        console.error("Error refreshing token:", err);
        return null;
    }
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = localStorage.getItem("token");

    if (token) {
        options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        };
    }

    let response = await fetch(url, options);

    if (response.status === 401) {
        token = await refreshAccessToken();

        if (token) {

            options.headers = {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`,
            };
            response = await fetch(url, options);
        } else {

            localStorage.clear();
            throw new Error("Session expired. Please log in again.");
        }
    }

    return response;
}