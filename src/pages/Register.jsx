import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import './Register.css';
import HomeNavBar from '../components/HomeNavBar';

function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [enteredUsername, setEnteredUsername] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleRegister = async (event) => {
        event.preventDefault();
        setErrorMsg('');

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            console.error('Signup error:', signUpError);
            setErrorMsg(signUpError.message);
            return;
        }
        
        alert('Registration successful! Please check your email for confirmation.');
        navigate('/login');
    };



    return (
        <div className="register-div">
            <HomeNavBar />
            <div className="register-page">
                <h1 className="register-header">Register</h1>
                <div className="register-info-div">
                    <div className="info-div">
                        <input 
                            className="info-input" 
                            placeholder="Email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="info-div">
                        <input 
                            className="info-input" 
                            placeholder="Password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                </div>

                {errorMsg && <p className="error-text">{errorMsg}</p>}

                <button className="register-button" onClick={handleRegister}>Register</button>
                <p className="login-check-p">
                    Have an account?&ensp;&ensp;
                    <a href='/login'>Click here to login</a>
                </p>
            </div>
        </div>
    );
}

export default Register;
