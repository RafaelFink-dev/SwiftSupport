import { useState, useContext } from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { AuthContext } from '../../contexts/auth';

export default function SignUp() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signUp, loadingAuth } = useContext(AuthContext);

    async function handleSubmit(e){
        e.preventDefault(); //Previni att pagina ou enviar dados para outra

        if (name !== '' && email !== '' && password !== ''){
            await signUp(email, password, name)
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

                <form onSubmit={handleSubmit}>
                    <h1>NOVA CONTA</h1>

                    <input
                        type='text'
                        placeholder='Seu nome'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

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

                    <button type='submit'>
                        {loadingAuth ? 'Carregando...' : 'CADASTRAR'}
                    </button>

                </form>

                <Link to='/'>Já tem uma conta ? Faça login!</Link>

            </div>
        </div>
    )
}