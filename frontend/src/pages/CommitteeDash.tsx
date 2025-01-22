import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAllPetitions,
    getThreshold,
    updateThreshold,
    Petition,
    respondAndClosePetition,
} from "../apitest/api.ts";

function CommitteeDashboard(): JSX.Element {
    const navigate = useNavigate();
    const [threshold, setThreshold] = useState<number>(5);
    const [petitions, setPetitions] = useState<Petition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        if (!token || role !== "committee") {
            navigate("/login");
            return;
        }

        Promise.all([getThreshold(), getAllPetitions(token)])
            .then(([thresholdValue, petitionsList]) => {
                setThreshold(thresholdValue);
                setPetitions(petitionsList);
            })
            .catch((err) => alert(`Error loading data: ${err}`))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleThresholdSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await updateThreshold(token, threshold);
            alert("Threshold updated successfully!");
        } catch (err) {
            alert("Failed to update threshold: " + err);
        }
    };

    const handleRespond = async (petitionId: number) => {
        const responseText = prompt("Enter official response:");
        if (!responseText) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await respondAndClosePetition(token, petitionId, responseText);
            alert("Petition responded and closed!");
            const updatedPetitions = await getAllPetitions(token);
            setPetitions(updatedPetitions);
        } catch (err) {
            alert("Error responding: " + err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold">Loading Committee Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-6">Committee Dashboard</h2>


            <div className="bg-gray-100 p-4 rounded shadow mb-6">
                <h3 className="text-lg font-semibold">Global Signature Threshold</h3>
                <div className="flex items-center mt-2">
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="p-2 border rounded w-32"
                    />
                    <button
                        onClick={handleThresholdSubmit}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Update Threshold
                    </button>
                </div>
            </div>


            <h3 className="text-xl font-semibold mb-4">All Petitions</h3>
            {petitions.length > 0 ? (
                <ul className="space-y-4">
                    {petitions.map((p) => (
                        <li
                            key={p.id}
                            className="p-4 border rounded shadow bg-white hover:bg-gray-50"
                        >
                            <h4 className="text-lg font-bold">{p.title}</h4>
                            <p className="text-sm text-gray-600">
                                Creator: <span className="font-medium">{p.creator_email}</span>
                            </p>
                            <p className="text-sm text-gray-600">Status: {p.status}</p>
                            <p className="mt-2">Content: {p.content}</p>
                            <p className="mt-2">Signatures: {p.signatures_count}</p>
                            {p.response && (
                                <p className="mt-2 text-green-700 font-semibold">
                                    Response: {p.response}
                                </p>
                            )}
                            {p.status === "open" && (
                                <button
                                    onClick={() => handleRespond(p.id)}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Respond & Close
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-600">
                    No petitions available at the moment.
                </p>
            )}
        </div>
    );
}

export default CommitteeDashboard;
