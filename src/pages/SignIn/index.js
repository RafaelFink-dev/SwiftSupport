import './signin.css';
import { useState, useContext } from 'react';

import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';

export default function SignIn() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signIn, loadingAuth } = useContext(AuthContext);

    async function handleSignIn(e) {
        e.preventDefault();

        if (email !== '' && password !== '') {
            await signIn(email, password);
        } else {
            toast.warn('Preencha todos os campos!')
        }
    }

    return (
        <div className='container-center'>
            <div className='login'>
                <div className='login-area'>
                    <img src={logo} alt='Logo sistema de chamados' />
                </div>

                <form onSubmit={handleSignIn}>
                    <h1>ENTRAR</h1>
                    <input
                        type='email'
                        placeholder='email@email.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type='password'
                        placeholder='*******'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type='submit' className='btn-acessar'>
                        {loadingAuth ? 'Carregando...' : 'ACESSAR'}
                    </button>

                </form>

                <Link to='/register'>Criar uma conta</Link>

            </div>
        </div>
    )
}