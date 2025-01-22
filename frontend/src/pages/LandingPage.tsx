import { Link } from "react-router-dom";

function LandingPage(): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold mb-4">
                    Shangri-La Petition Platform
                </h1>
                <p className="text-lg font-light mb-6">
                    Please register or log in to continue. Make sure to have your BioID handy!
                </p>
                <div className="space-x-4">
                    <Link
                        to="/register"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Register
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
