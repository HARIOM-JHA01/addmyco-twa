import WebApp from '@twa-dev/sdk'
import { useEffect } from 'react'
import HomePage from './pages/HomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
