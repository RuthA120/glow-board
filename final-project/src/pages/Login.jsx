import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import './Login.css';
import HomeNavBar from '../components/HomeNavBar';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error.message);
            setErrorMsg(error.message);
            return;
        }

        const user = data?.user;
        if (!user) {
            setErrorMsg('Login successful, but user is null. Check email confirmation.');
            return;
        }

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code === 'PGRST116'){
            console.log('No profile found. Redirecting to username setup...');
            window.location.href = '/choose-username';
            return;
        }

        if (profileError) {
            console.error('Profile lookup error:', profileError.message);
            setErrorMsg('Something went wrong while checking profile.');
            return;
        }

        if (!profileData?.username) {
            console.log('Username missing. Redirecting to setup...');
            window.location.href = '/choose-username';
        } 
        else {
            console.log('Username exists. Redirecting to feed...');
            window.location.href = '/feed';
        }
    };


    return (
        <div className="login-div">
            <HomeNavBar />
            <div className="login-page">
                <h1 className="login-header">Login</h1>
                <div className="login-info-div">
                    <div className="userlogin-info-div">
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

                <button className="login-button" onClick={handleLogin}>Login</button>
                <p className="register-check-p">
                    Don't have an account?&ensp;&ensp;
                    <a href='/register'>Click here to register</a>
                </p>
            </div>
        </div>
    );
}

export default Login;
