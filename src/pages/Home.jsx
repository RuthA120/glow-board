import HomeNavBar from '../components/HomeNavBar'
import './Home.css'
import { useNavigate } from 'react-router-dom';
import welcome_image from '../assets/WelcomePage-IMG.png'

function Home(){

    const navigate = useNavigate();

    const directLogin = (event) => {
        event.preventDefault();
        navigate('/login'); 
    };

    const directRegister = (event) => {
        event.preventDefault();
        navigate('/register'); 
    };

    return (
       <div className="home-div">
            <HomeNavBar />
            <div className="welcome-div">
                <div className="container">
                    <h1 className="welcome-header">Welcome to</h1>
                    <h1 className="welcome-header">Glow Board!</h1>
                    <p className="bio-info">A welcoming space to ask questions, share advice, and build routines that work.<br></br>Discover new products and save your favorites all in one place.</p>
                </div>
                <div className="user-buttons-div">
                    <button onClick={directRegister} className="user-button">
                        Get Started!
                    </button>
                </div>
            </div>

       </div>
    )

}

export default Home;