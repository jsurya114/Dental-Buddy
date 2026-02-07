import { useSelector } from "react-redux";
import { useMemo } from "react";

const usePermission = (resource, action) => {
    // Check both auth slices for backward compatibility
    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);

    // Use whichever user is available
    const user = authUser || clinicAdmin;
    const permissions = authUser?.permissions || clinicAdmin?.permissions;

    return useMemo(() => {
        // Not logged in
        if (!user) return false;

        // CLINIC_ADMIN has all permissions
        if (user.role === "CLINIC_ADMIN") return true;

        // Check specific permission
        if (!permissions || !permissions[resource]) return false;

        return permissions[resource].includes(action);
    }, [user, permissions, resource, action]);
};

export const usePermissions = () => {
    // Check both auth slices for backward compatibility
    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);

    // Use whichever user is available
    const user = authUser || clinicAdmin;
    const permissions = authUser?.permissions || clinicAdmin?.permissions;

    const can = useMemo(() => {
        return (resource, action) => {
            if (!user) return false;
            if (user.role === "CLINIC_ADMIN") return true;
            if (!permissions || !permissions[resource]) return false;
            return permissions[resource].includes(action);
        };
    }, [user, permissions]);

    const canAny = useMemo(() => {
        return (resource) => {
            if (!user) return false;
            if (user.role === "CLINIC_ADMIN") return true;
            if (!permissions || !permissions[resource]) return false;
            return permissions[resource].length > 0;
        };
    }, [user, permissions]);

    return { can, canAny, permissions };
};

export default usePermission;
