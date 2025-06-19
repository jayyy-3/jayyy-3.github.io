import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Articles from './pages/Articles';
import WelcomePopup from "./components/WelcomePopup.tsx";

function App() {
    return (
        <>
            <WelcomePopup/>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/articles" element={<Articles />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
