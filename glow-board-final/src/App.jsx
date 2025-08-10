import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import Register from './pages/Register'
import Login from './pages/Login'
import Feed from './pages/Feed'
import PostProfile from './pages/PostProfile'
import CreateUsername from './pages/ChooseUsername'
import './index.css'
import EditPost from './pages/EditPost';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/post/:id" element={<PostProfile />} />
        <Route path="/choose-username" element={<CreateUsername />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
