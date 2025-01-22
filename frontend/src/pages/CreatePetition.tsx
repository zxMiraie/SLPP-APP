import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPetition } from "../apitest/api";

function CreatePetitionPage(): JSX.Element {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in.");
            navigate("/login");
            return;
        }
        try {
            await createPetition(token, { title, content });
            alert("Petition created successfully!");
            navigate("/dashboard");
        } catch (err) {
            alert("Creation failed: " + err);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Create a New Petition
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>


                    <div>
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Content
                        </label>
                        <textarea
                            id="content"
                            rows={5}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>


                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Create Petition
                        </button>
                    </div>
                </form>


                <div className="mt-4 text-center">
                    <button
                        className="text-blue-500 hover:underline"
                        onClick={() => navigate("/dashboard")}
                    >
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreatePetitionPage;
