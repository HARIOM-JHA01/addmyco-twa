import WebApp from '@twa-dev/sdk'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Notifications from './pages/Notifications';
import ProfilePage from './pages/ProfilePage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import SubCompanyPage from './pages/SubCompany';
import ChamberPage from './pages/ChamberPage';
import SearchPage from './pages/SearchPage';
import MyQRPage from './pages/MyQRPage';

function App() {
  useEffect(() => {
    WebApp.ready();
    // WebApp.MainButton.setText("Click me");
    // WebApp.MainButton.show();
    // WebApp.MainButton.onClick(() => {
    //   WebApp.showAlert('Button clicked, but WebApp stays open!');
    // });
  }, []);
  return (
    <>
      <BrowserRouter basename='/addmyco'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/update-profile" element={<UpdateProfilePage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/sub-company" element={<SubCompanyPage />} />
          <Route path="/chamber" element={<ChamberPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/my-qr" element={<MyQRPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
