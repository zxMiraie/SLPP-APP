import { Navigate } from "react-router-dom";

interface RoleRouteProps {
    children: JSX.Element;
    allowedRole: "petitioner" | "committee";
}

function RoleRoute({ children, allowedRole }: RoleRouteProps) {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== allowedRole) {
        if (userRole === "petitioner") {
            return <Navigate to="/dashboard" replace />;
        } else if (userRole === "committee") {
            return <Navigate to="/committee-dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }
    return children;
}

export default RoleRoute;