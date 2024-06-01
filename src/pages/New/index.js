import Header from '../../components/Header';
import Title from '../../components/Title';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { FiPlusCircle } from 'react-icons/fi';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import './new.css'
import { toast } from 'react-toastify';

const listRef = collection(db, 'customers');

export default function New() {

    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const [clientes, setClientes] = useState([]);
    const [clienteSelect, setClienteSelect] = useState(0);
    const navigate = useNavigate();

    const [complemento, setComplemento] = useState('');
    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [loadClientes, setLoadClientes] = useState(true);
    const [idCustomer, setIdCustomer] = useState(false);

    useEffect(() => {

        async function loadClientes() {
            const querySnapshot = await getDocs(listRef)
                .then((snapshot) => {
                    let lista = [];
                    snapshot.forEach((doc) => {
                        lista.push({
                            id: doc.id,
                            nomeFantasia: doc.data().nomeFantasia
                        })
                    })

                    if (snapshot.docs.size === 0) {
                        setClientes([{ id: 1, nomeFantasia: 'FREELA' }]);
                        setLoadClientes(false);
                        return;
                    }

                    setClientes(lista);
                    setLoadClientes(false);

                    if (id) {
                        loadId(lista);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    setLoadClientes(false);
                    setClientes([{ id: 1, nomeFantasia: 'FREELA' }]);
                })
        }

        loadClientes();

    }, [id])

    async function loadId(lista) {
        const docRef = doc(db, 'tickets', id);
        await getDoc(docRef)
            .then((snapshot) => {
                setAssunto(snapshot.data().assunto)
                setStatus(snapshot.data().status)
                setComplemento(snapshot.data().complemento)

                let index = lista.findIndex(item => item.id === snapshot.data().clienteId)
                setClienteSelect(index);
                setIdCustomer(true);
            })
            .catch((e) => {
                console.log(e);
                setIdCustomer(false);
            })
    }

    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    function handleChangeSelect(e) {
        setAssunto(e.target.value);
    }

    function handleChangeCustomer(e) {
        setClienteSelect(e.target.value);
    }

    async function handleRegisterTicket(e) {
        e.preventDefault();

        if (idCustomer) {

            //Atualizando chamado

            const docRef = doc(db, 'tickets', id)
            await updateDoc(docRef, {
                cliente: clientes[clienteSelect].nomeFantasia,
                clienteId: clientes[clienteSelect].id,
                assunto: assunto,
                complemento: complemento,
                status: status,
                userId: user.uid,
            })
            .then(() => {
                toast.success("Chamado atualizado com sucesso!")
                setClienteSelect(0)
                setComplemento('');
                navigate('/dashboard');
            })
            .catch((e) => {
                toast.error('Ops! erro ao atualizar este chamado!')
                console.log(e);
            })

            return;
        }

        await addDoc(collection(db, 'tickets'), {
            created: new Date(),
            cliente: clientes[clienteSelect].nomeFantasia,
            clienteId: clientes[clienteSelect].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid,
        })
            .then(() => {
                toast.success('Chamado registrado!')
                setComplemento('');
                setClienteSelect(0);
                setStatus('Aberto')
                setAssunto(0);
            })
            .catch((e) => {
                console.log(e)
                toast.error('Ops! ocorreu um erro ao registrar');
            })


    }

    return (
        <div>
            <Header />

            <div className='content'>
                
                <Title name={id ? 'Editando chamado' : 'Novo chamado'}>
                    <FiPlusCircle size={25} />
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegisterTicket}>

                        <label>Clientes</label>
                        {
                            loadClientes ? (
                                <input
                                    type='text'
                                    disabled={true}
                                    value='Carregando...'
                                />
                            ) : (
                                <select value={clienteSelect} onChange={handleChangeCustomer}>
                                    {clientes.map((item, index) => {
                                        return (
                                            <option key={index} value={index}>
                                                {item.nomeFantasia}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value='Suporte'>Suporte</option>
                            <option value='Visita Tecnica'>Visita Tecnica</option>
                            <option value='Financeiro'>Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>

                            <input
                                type='radio'
                                name='radio'
                                value='Aberto'
                                onChange={handleOptionChange}
                                checked={status === 'Aberto'}
                            />
                            <span>Em aberto</span>

                            <input
                                type='radio'
                                name='radio'
                                value='Progresso'
                                onChange={handleOptionChange}
                                checked={status === 'Progresso'}
                            />
                            <span>Progresso</span>

                            <input
                                type='radio'
                                name='radio'
                                value='Atendido'
                                onChange={handleOptionChange}
                                checked={status === 'Atendido'}
                            />
                            <span>Atendido</span>

                        </div>

                        <label>Complemento</label>
                        <textarea
                            type='text'
                            placeholder='Descreve seu problema (opcional).'
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        {idCustomer ? (
                            <button type='submit'>SALVAR ALTERAÇÕES</button>
                        ) : (
                            <button type='submit'>REGISTRAR</button>
                        )}

                    </form>
                </div>

            </div>
        </div>
    )
}