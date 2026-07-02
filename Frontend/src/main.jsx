import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import "./index.css";
import App from "./App.jsx";
import { loader } from "@monaco-editor/react";

// Configure monaco-editor to load locally from the public/vs static folder
loader.config({ paths: { vs: "/vs" } });

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);
