import {Routes, Route, Navigate} from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import RegisterPage from "./pages/RegPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import PetitionerDashboard from "./pages/Dashboard";
import CreatePetitionPage from "./pages/CreatePetition.tsx";
import CommitteeDashboard from "./pages/CommitteeDash.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import RoleRoute from "./components/RoleRoute.tsx";

function App(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRole="petitioner">
                            <PetitionerDashboard />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />

            <Route
                path="/committee-dashboard"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRole="committee">
                            <CommitteeDashboard />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />

            <Route
                path="/create-petition"
                element={
                    <PrivateRoute>
                        <RoleRoute allowedRole="petitioner">
                            <CreatePetitionPage />
                        </RoleRoute>
                    </PrivateRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
