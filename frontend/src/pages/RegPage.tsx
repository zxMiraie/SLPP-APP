import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, RegistrationData } from "../apitest/api.ts";

function RegisterPage(): JSX.Element {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [bioId, setBioId] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState<string | null>(null);
    const [bioIdError, setBioIdError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (email) {
            const timeout = setTimeout(async () => {
                try {
                    const response = await fetch("http://127.0.0.1:8000/api/check-email/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    });
                    if (!response.ok) {
                        setEmailError("Email is already in use.");
                    } else {
                        setEmailError(null);
                    }
                } catch {
                    setEmailError("Error validating email.");
                }
            }, 500);
            return () => clearTimeout(timeout);
        } else {
            setEmailError(null);
        }
    }, [email]);


    useEffect(() => {
        if (bioId) {
            const timeout = setTimeout(async () => {
                try {
                    const response = await fetch("http://127.0.0.1:8000/api/check-bioid/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bio_id: bioId }),
                    });
                    if (!response.ok) {
                        setBioIdError("BioID is already in use or invalid.");
                    } else {
                        setBioIdError(null);
                    }
                } catch {
                    setBioIdError("Error validating BioID.");
                }
            }, 500);
            return () => clearTimeout(timeout);
        } else {
            setBioIdError(null);
        }
    }, [bioId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (emailError || bioIdError) {
            alert("Please fix errors before submitting.");
            return;
        }

        setIsSubmitting(true);
        const payload: RegistrationData = {
            email,
            full_name: fullName,
            date_of_birth: dateOfBirth,
            bio_id: bioId,
            password,
        };
        try {
            await registerUser(payload);
            alert("Registration successful! Please log in.");
            navigate("/login");
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200 shadow-md rounded">
            <div className="w-full max-w-md p-6 bg-gray-100 rounded">
                <h2 className="text-2xl font-extrabold mb-4 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full p-2 border rounded focus:ring ${
                                emailError ? "border-red-800" : "border-gray-800"
                            }`}
                        />
                        {emailError && <p className="text-red-800 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div>
                        <label className="block">Full Name:</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block">Date of Birth:</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring border-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block">BioID (10 digits):</label>
                        <input
                            type="text"
                            value={bioId}
                            onChange={(e) => setBioId(e.target.value)}
                            maxLength={10}
                            required
                            className={`w-full p-2 border rounded focus:ring ${
                                bioIdError ? "border-red-800" : "border-gray-800"
                            }`}
                        />
                        {bioIdError && <p className="text-red-800 text-sm mt-1">{bioIdError}</p>}
                    </div>
                    <div>
                        <label className="block">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring border-gray-800"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full p-2 bg-blue-400 text-white rounded ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-yellow-800 hover:underline">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;