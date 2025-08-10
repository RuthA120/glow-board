import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import HomeNavBar from '../components/HomeNavBar'
import './ChooseUsername.css'

function ChooseUsername() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
    .from('profiles')
    .upsert({
        id: user.id,
        username: username,
    });

    if (error) {
    console.error("Error upserting profile:", error.message);
    }
    else {
      navigate('/feed')
    }
  };

  return (
    <div className="body-div">
      <HomeNavBar />
      <div className="login-div">
            <div className="choose-username-page">
                <h1 className="choose-username-header">Create a Username!</h1>
                <form onSubmit={handleSubmit}>
                <div className="login-info-div">
                    <div className="userlogin-info-div">
                        <input
                          type="text"
                          className="info-input"
                          id="username-input"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                    </div>
                    <button type="submit" className="choose-username-button">Continue</button>
                    {errorMsg && <p>{errorMsg}</p>}
                </div>
                </form>
                <p className="user-check-p">
                    Thank you for joining Glow Board!
                </p>
            </div>
        </div>
    </div>
  );
}

export default ChooseUsername;
