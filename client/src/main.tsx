import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { SearchProvider } from "./shared/search/SearchContext";
import "./app/global.scss";
import { ThemeProvider } from "./shared/theme/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <SearchProvider>
          <App />
        </SearchProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
