import { Routes, Route, Navigate } from "react-router-dom";
import { ListingsPage } from "../pages/ListingsPage/ListingsPage";
import { ListingDetailsPage } from "../pages/ListingDetailsPage/ListingDetailsPage";
import { StatsPage } from "../pages/StatsPage/StatsPage";

const App = () => {
  return (
    <Routes>
      {/* редиректим корень на основную страницу по ТЗ */}
      <Route path="/" element={<Navigate to="/list" replace />} />
      <Route path="/list" element={<ListingsPage />} />
      <Route path="/item/:id" element={<ListingDetailsPage />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
  );
};

export default App;
