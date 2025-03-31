import { GoogleLogin } from '@react-oauth/google';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const GoogleLoginButton = ({ onSuccess }: { onSuccess: () => void }) => {
  const {googleLogin} = useAuth()

  const handleSuccess = async (response: any) => {
    await googleLogin(response.credential)
    onSuccess()
  }
  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert('Login Failed')}
    />
  );
};

export default GoogleLoginButton;