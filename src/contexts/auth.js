import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

function AuthProvider({ children }){

    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadUser(){
            const storageUser = localStorage.getItem('@userDetail')

            if (storageUser){
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }

            setLoading(false);
        };

        loadUser();

    }, [])

    function signIn(email, password){
        console.log(email)
        console.log(password)
    }

    //Cadastrar user
    async function signUp(email, password, name){
        setLoadingAuth(true);

        await createUserWithEmailAndPassword(auth, email, password)
        .then( async (value) => {

            let uid = value.user.uid;

            await setDoc(doc(db, 'users', uid), {
                nome: name,
                avatarUrl: null
            })
            .then(() =>{
                let data = {
                    uid: uid,
                    nome: name,
                    email: value.user.email,
                    avatarUrl: null
                };

                setUser(data);
                storageUser(data);
                setLoadingAuth(false);
                toast.success('Seja bem-vindo ao sistema!')
                navigate('/dashboard');
                
            })

        })
        .catch((error) =>{
            console.log(error);
            setLoadingAuth(false);
        })

    }

    async function signIn(email, password){
        setLoadingAuth(true);

        await signInWithEmailAndPassword(auth, email, password)
        .then( async (value) =>{
            let uid = value.user.uid;

            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            let data = {
                uid: uid,
                nome: docSnap.data().nome,
                email: value.user.email,
                avatarUrl: docSnap.data().avatarUrl
            };

            setUser(data);
            storageUser(data);
            setLoadingAuth(false);
            toast.success('Bem-vindo(a) de volta!')
            navigate('/dashboard');
        })
        .catch((error) => {
            console.log(error);
            setLoadingAuth(false);
            toast.error('Ops! algo deu errado!')
        })
    }

    function storageUser(data){
        localStorage.setItem('@userDetail', JSON.stringify(data));
    }

    async function logout(){
        await signOut(auth);
        localStorage.removeItem('@userDetail');
        setUser(null);
        toast.success('Deslogado com sucesso!')
    }

    return(
        <AuthContext.Provider 
        value={{
            signed: !!user, //Se tem usuário ou não fica false ou true
            user,
            signIn,
            signUp,
            logout,
            loadingAuth,
            loading,
            storageUser,
            setUser,

        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;