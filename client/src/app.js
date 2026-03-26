import { BrowserRouter, Routes, Route } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import Editor from "./Editor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Redirect />} />
        <Route path="/documents/:id" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

function Redirect() {
  window.location = `/documents/${uuidV4()}`;
  return null;
}

export default App;