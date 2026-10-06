import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { useAppDispatch } from "../hooks/redux";
import { fetchCurrentUser } from "../features/auth/authSlice";
import { storage } from "../utils/storage";

const App = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (storage.getToken()) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch]);

    return <RouterProvider router={router} />;
};

export default App;
