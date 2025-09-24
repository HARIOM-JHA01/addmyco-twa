import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Notifications from './pages/Notifications';
import ProfilePage from './pages/ProfilePage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import SubCompanyPage from './pages/SubCompany';
import ChamberPage from './pages/ChamberPage';
import ContactPage from './pages/ContactPage';
import MyQRPage from './pages/MyQRPage';
import CreateProfile from './pages/createProfile';
import LoginHandler from './components/LoginHandler';

function App() {
  return (
    <BrowserRouter basename='/addmyco'>
      <LoginHandler />
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/update-profile" element={<UpdateProfilePage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/sub-company" element={<SubCompanyPage />} />
        <Route path="/chamber" element={<ChamberPage />} />
        <Route path="/search" element={<ContactPage />} />
        <Route path="/my-qr" element={<MyQRPage />} />
        <Route path="/create-profile" element={<CreateProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
