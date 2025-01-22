import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPetitions, signPetition, checkThreshold, Petition } from "../apitest/api";

function PetitionerDashboard(): JSX.Element {
    const navigate = useNavigate();
    const [petitions, setPetitions] = useState<Petition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [thresholdStatus, setThresholdStatus] = useState<Record<number, boolean>>({});
    const [signing, setSigning] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        async function fetchPetitions() {
            try {
                const data = await getPetitions(token);
                setPetitions(data);
                setLoading(false);

                const thresholds = await Promise.all(
                    data.map((petition) =>
                        checkThreshold(token, petition.id)
                            .then((meetsThreshold) => ({
                                id: petition.id,
                                meetsThreshold,
                            }))
                            .catch((err) => {
                                console.error(`Error checking threshold for petition ${petition.id}: ${err}`);
                                return { id: petition.id, meetsThreshold: false };
                            })
                    )
                );

                const thresholdMap = thresholds.reduce((acc, curr) => {
                    acc[curr.id] = curr.meetsThreshold;
                    return acc;
                }, {} as Record<number, boolean>);

                setThresholdStatus(thresholdMap);
            } catch (err) {
                alert("Failed to load petitions: " + err);
                setLoading(false);
            }
        }

        fetchPetitions();
    }, [navigate]);

    const handleSign = async (petitionId: number) => {
        setSigning(petitionId);
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            await signPetition(token, petitionId);
            alert("Petition signed successfully!");
            const updated = await getPetitions(token);
            setPetitions(updated);

            checkThreshold(token, petitionId)
                .then((meetsThreshold) => {
                    setThresholdStatus((prevStatus) => ({
                        ...prevStatus,
                        [petitionId]: meetsThreshold,
                    }));
                })
                .catch((err) => console.error(`Error checking threshold for petition ${petitionId}: ${err}`));
        } catch (err) {
            alert("Signing failed: " + err);
        } finally {
            setSigning(null);
        }
    };

    const goToCreatePetition = () => {
        navigate("/create-petition");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="loader border-t-blue-500"></div>
                    <p className="mt-4 text-gray-600">Loading petitions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-4">Petitioner Dashboard</h2>
                <div className="text-center mb-6">
                    <button
                        onClick={goToCreatePetition}
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                    >
                        Create New Petition
                    </button>
                </div>
                <ul className="space-y-6">
                    {petitions.map((p) => (
                        <li
                            key={p.id}
                            className="bg-white p-6 rounded shadow-md border border-gray-200"
                        >
                            <h3 className="text-lg font-semibold">{p.title}</h3>
                            <p className="text-gray-700 mt-2">{p.content}</p>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Status: <span className="font-medium">{p.status}</span>
                                </p>
                                <p className="text-sm text-gray-500">
                                    Signatures: <span className="font-medium">{p.signatures_count}</span>
                                </p>
                                {p.response && (
                                    <p className="text-sm text-gray-500">
                                        Response: <span className="font-medium">{p.response}</span>
                                    </p>
                                )}
                            </div>
                            {p.status === "open" && (
                                <div className="mt-4">
                                    {p.already_signed === 1 ? (
                                        <p className="text-green-500 font-medium">
                                            You have already signed this petition.
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => handleSign(p.id)}
                                            disabled={thresholdStatus[p.id] || signing === p.id}
                                            className={`px-4 py-2 rounded text-white shadow ${
                                                thresholdStatus[p.id] || signing === p.id
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-blue-500 hover:bg-blue-600"
                                            }`}
                                        >
                                            {signing === p.id
                                                ? "Signing..."
                                                : thresholdStatus[p.id]
                                                    ? "Threshold Met"
                                                    : "Sign Petition"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PetitionerDashboard;
