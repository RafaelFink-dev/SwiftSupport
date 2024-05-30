import avatarImg from '../../assets/avatar2.png';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiUser, FiSettings, FiUserX } from 'react-icons/fi';
import './header.css';

export default function Header(){

    const { user, logout } = useContext(AuthContext);

    function handleLogout(){
        logout();
    }

    return(
        <div className="sidebar">
            <div>
                <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt="Foto do usuário"/>
            </div>
            
            <Link to='/dashboard'>
                <FiHome color='#FFF' size={24}/>
                Chamados
            </Link>

            <Link to='/customers'>
                <FiUser color='#FFF' size={24}/>
                Clientes
            </Link>

            <Link to='/profile'>
                <FiSettings color='#FFF' size={24}/>
                Perfil
            </Link>

            <Link to='/' onClick={handleLogout}>
                <FiUserX color='#FFF' size={24}/>
                Logout
            </Link>

        </div>
    )
}