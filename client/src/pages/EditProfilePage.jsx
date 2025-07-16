import { useState, useEffect } from 'react';

const EditProfilePage = () => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🤖');

  useEffect(() => {
    // Fetch current profile
  }, []);

  const saveProfile = async () => {
    // Call backend to update profile
  };

  return (
    <div className="dashboard-container">
      <h2>Edit Profile</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" />
      <select value={avatar} onChange={e => setAvatar(e.target.value)}>
        {['🤖','🧠','👾','🐉','🚀'].map(a => <option key={a}>{a}</option>)}
      </select>
      <button onClick={saveProfile}>Save Changes</button>
    </div>
  );
};

export default EditProfilePage;
