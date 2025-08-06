import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';

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
      navigate('/feed');
    }
  };

  return (
    <div className="choose-username-div">
      <h2>Choose your username</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Continue</button>
        {errorMsg && <p>{errorMsg}</p>}
      </form>
    </div>
  );
}

export default ChooseUsername;
