import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../apitest/api";
import Cookies from "js-cookie";

function LoginPage(): JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.access);
            // @ts-ignore
            localStorage.setItem("full_name", data.user.full_name);
            // @ts-ignore
            localStorage.setItem("userRole", data.user.role);
            Cookies.set("lastUsername", email, { expires: 7 });

            // @ts-ignore
            if (data.user.role === "committee") {
                navigate("/committee-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedUsername = Cookies.get("lastUsername");
        if (savedUsername) {
            setEmail(savedUsername); // Pre-fill the email input
        }
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200 shadow-md rounded">
            <div className="w-full max-w-md p-6 bg-gray-100 rounded">
                <h2 className="text-2xl font-extrabold mb-4 text-center">Login</h2>
                {error && (
                    <div className="bg-red-100 text-red-600 p-2 rounded mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleLogIn} className="space-y-4">
                    <div>
                        <label className="block">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-gray-800"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-2 bg-blue-400 text-white rounded ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Don’t have an account?{" "}
                    <a href="/register" className="text-yellow-800 hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;