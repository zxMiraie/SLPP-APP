import { Navigate } from "react-router-dom";

interface Props {
    children: JSX.Element;
}

function PrivateRoute({ children }: Props) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default PrivateRoute;
