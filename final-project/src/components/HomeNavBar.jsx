import './HomeNavBar.css';
import CreatePost from '../pages/CreatePost'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Feed from '../pages/Feed'
import PostProfile from '../pages/PostProfile'
import CreateUsername from '../pages/ChooseUsername'
import EditPost from '../pages/EditPost';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function HomeNavBar() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } 
        else {
            navigate('/login'); 
        }
    };

    return (
        <div className="home-navbar">
            <h2 className="home-navbar-logo">Glow Board</h2>
            <div className="home-navbar-links">
                <button className="home-nav-button">About Us</button>
                <button className="home-nav-button">FAQ</button>
                <Link to="/login">
                    <button className="home-nav-button">Login</button>
                </Link>
                <Link to="/register">
                    <button className="home-nav-button">Register</button>
                </Link>
            </div>
        </div>
    );
}

export default HomeNavBar;
