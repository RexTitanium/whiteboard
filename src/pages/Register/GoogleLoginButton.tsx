import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import api from '../../api/api';

const GoogleLoginButton = ({ onSuccess }: { onSuccess: () => void }) => {
  const handleSuccess = async (response: any) => {
    try {
      await api.post('/auth/google-login', {
        credential: response.credential,
      }, { withCredentials: true });
      onSuccess(); // redirect or reload
    } catch (err) {
      console.error('Google login error:', err);
      alert('Google login failed');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert('Login Failed')}
    />
  );
};

export default GoogleLoginButton;