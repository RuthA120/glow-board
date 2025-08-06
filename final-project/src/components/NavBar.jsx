// NavBar.jsx
import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import CreatePost from '../pages/CreatePost'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Feed from '../pages/Feed'
import PostProfile from '../pages/PostProfile'
import CreateUsername from '../pages/ChooseUsername'
import EditPost from '../pages/EditPost';

function NavBar({ searchTerm, setSearchTerm, searchContext = 'posts' }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } 
        else {
            navigate('/'); 
        }
    };


    return (
        <div className="home-navbar">
        <h2 className="home-navbar-logo">Glow Board</h2>
        <input
            className="navbar-search"
            type="text"
            placeholder={`Search ${searchContext}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="home-navbar-links">
            <button className="home-nav-button" onClick={Feed}>Home</button>
            <button className="home-nav-button">Create a Post</button>
            <button className="home-nav-button">Product Pins</button>
            <button className="home-nav-button">My Page</button>
            <button className="home-nav-button" onClick={handleLogout}>Logout</button>
        </div>
        </div>
    );
}

export default NavBar;
