import { useNavigate } from "react-router-dom";

function NavBar(): JSX.Element {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const full_name = localStorage.getItem("full_name");
    const userRole = localStorage.getItem("userRole");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("full_name");
        localStorage.removeItem("userRole");
        navigate("/");
    };

    const OnClick = () => {
        if (!token) {
            navigate("/");
        } else if (userRole === "committee") {
            navigate("/committee-dashboard");
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="bg-stone-800 text-white flex items-center justify-between px-6 py-4 shadow-md">
            <div
                className="text-3xl font-bold cursor-pointer hover:text-red-200"
                onClick={OnClick}
            >
                SLPP
            </div>
            <div className="flex items-center space-x-4">
                {token ? (
                    <>
                        <span>
                            Hello, <strong>{full_name || "Petitioner"}</strong>{" "}
                            <span className="text-sm">({userRole})</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                    </>
                )}
            </div>
        </div>
    );
}

export default NavBar;
