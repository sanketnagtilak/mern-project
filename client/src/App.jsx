import {BrowserRouter, Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';

export default function App() {
  return(
    <BrowserRouter>
    <Header />
      <Routes>
        <Route  path='/' element={<Home/>} />
        <Route  path='/Sign-in' element={<SignIn/>} />
        <Route  path='/Sign-up' element={<SignUp/>} />
        <Route  path='/About' element={<About/>} />
        <Route  path='/Profile' element={<Profile/>} />
      </Routes>
  </BrowserRouter>
  )
}