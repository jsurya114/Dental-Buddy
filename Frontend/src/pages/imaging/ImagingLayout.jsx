import { Outlet } from "react-router-dom";

const ImagingLayout = () => {
    return (
        <div className="h-full flex flex-col">
            <Outlet />
        </div>
    );
};

export default ImagingLayout;
