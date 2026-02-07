import usePermission from "../hooks/usePermission";

const PermissionGate = ({ resource, action, children, fallback = null }) => {
    const hasPermission = usePermission(resource, action);

    if (!hasPermission) {
        return fallback;
    }

    return children;
};

export default PermissionGate;
