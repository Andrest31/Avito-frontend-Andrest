import { Routes, Route } from "react-router-dom";
import { ListingsPage } from "../pages/ListingsPage/ListingsPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ListingsPage />} />
      
    </Routes>
  );
};

export default App;
