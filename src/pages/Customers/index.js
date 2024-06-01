import './customers.css';

import Header from '../../components/Header';
import Title from '../../components/Title';
import { useState, useEffect } from 'react';
import { FiUser, FiSearch, FiEdit2, FiXCircle } from 'react-icons/fi';

import { db } from '../../services/firebaseConnection';
import { addDoc, collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';



const listRef = collection(db, 'customers');

export default function Customers() {

    const [nome, setNome] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [endereco, setEndereco] = useState('')
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [editing, setEditing] = useState(false);
    const [ativo, setAtivo] = useState('Ativo');
    const [idCustomer, setIdCustomer] = useState();

    const getBackgroundColor = (ativo) => {
        switch (ativo) {
            case 'Ativo':
                return '#5CB85C';
            case 'Desativado':
                return '#D9534F';

        }
    };

    function handleOptionChange(e) {
        setAtivo(e.target.value);
    }

    function handleEdit(item) {
        setEditing(true);
        setNome(item.nomeFantasia);
        setCnpj(item.cnpj);
        setEndereco(item.endereco);
        setAtivo(item.ativo);
        setIdCustomer(item.id);
    }

    function handleCancelInsert() {
        setEditing(false);
        setNome('');
        setCnpj('');
        setEndereco('')
        setAtivo('Ativo');
        toast.warn('Alterações canceladas')
    }


    //Função com OnSnapShot pois como a tabela é na mesma tela, a cada inserção nova tem que aparecer embaixo
    useEffect(() => {

        async function loadTarefas() {

            onSnapshot(listRef, (snapshot) => {
                let lista = [];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia,
                        endereco: doc.data().endereco,
                        cnpj: doc.data().cnpj,
                        ativo: doc.data().ativo,
                    })

                    setClientes(lista);
                    setLoading(false);
                })
            })

        }

        loadTarefas();
        setLoading(false);

    }, [])

    async function handleRegister(e) {
        e.preventDefault();

        if (editing) {

            //Atualizando chamado

            const docRef = doc(db, 'customers', idCustomer)
            await updateDoc(docRef, {
                nomeFantasia: nome,
                cnpj: cnpj,
                endereco: endereco,
                ativo, ativo
            })
                .then(() => {
                    toast.success("Cliente atualizado com sucesso!")
                    setEditing(false);
                    setNome('');
                    setCnpj('');
                    setEndereco('')
                    setAtivo('Ativo');

                })
                .catch((e) => {
                    toast.error('Ops! erro ao atualizar este chamado!')
                    console.log(e);
                })

            return;
        }

        if (nome !== '' && cnpj !== '' && endereco !== '') {
            await addDoc(collection(db, "customers"), {
                nomeFantasia: nome,
                cnpj: cnpj,
                endereco: endereco,
                ativo, ativo
            })
                .then(() => {
                    setNome('');
                    setCnpj('');
                    setEndereco('');
                    toast.success('Empresa registrada!')
                })
                .catch((e) => {
                    console.log(e)
                    toast.error('Erro ao fazer cadastro!')
                })
        } else {
            toast.error('Preencha todos os campos!')
        }
    }



    if (loading) {
        return (
            <div>
                <Header />

                <div className='content'>
                    <Title name='Clientes'>
                        <FiUser size={25} />
                    </Title>

                    <div className='container dashboard'>
                        <span>Buscando clientes...</span>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div>
            <Header />

            <div className='content'>
                <Title name='Clientes'>
                    <FiUser size={25} />
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegister}>

                        <label>Nome fantasia</label>
                        <input
                            type='text'
                            placeholder='Nome da empresa'
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />

                        <label>CNPJ</label>
                        <input
                            type='number'
                            placeholder='Digite o CNPJ'
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            maxLength={14}
                        />

                        <label>Endereço</label>
                        <input
                            type='text'
                            placeholder='Digite o endereço'
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />

                        <label>Status do cliente</label>
                        <div className='status'>
                            <input
                                type='radio'
                                name='radio'
                                value='Ativo'
                                onChange={handleOptionChange}
                                checked={ativo === 'Ativo'}
                            />

                            <span>Ativo</span>

                            <input
                                type='radio'
                                name='radio'
                                value='Desativado'
                                onChange={handleOptionChange}
                                checked={ativo === 'Desativado'}
                            />

                            <span>Desativado</span>
                        </div>



                        {editing ? (
                            <div className='btn-editing'>
                                <button type='submit'>SALVAR ALTERAÇÕES</button>
                                <button className='btn-cancel' onClick={handleCancelInsert}>CANCELAR ALTERAÇÕES</button>
                            </div>
                        ) : (
                            <button type='submit'>SALVAR</button>
                        )}

                    </form>
                </div>

                <>

                    {clientes.length === 0 ? (
                        <div className='container dashboard'>
                            <span>Nenhum cliente encontrado...</span>
                        </div>
                    ) : (
                        <>
                            <div className='container' style={{ fontWeight: 'bold' }}>
                                <h3>CLIENTES CADASTRADOS:</h3>
                            </div>
                            <div className='container'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th scope='col'>Cliente</th>
                                            <th scope='col'>Endereço</th>
                                            <th scope='col'>CNPJ</th>
                                            <th scope='col'>ATIVO</th>
                                            <th scope='col'>#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientes.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td data-label='Cliente'>{item.nomeFantasia}</td>
                                                    <td data-label='Assunto'>{item.endereco}</td>
                                                    <td data-label='Cadastrado'>{item.cnpj}</td>
                                                    <td data-label='Ativo'>
                                                        <span className='badge' style={{ backgroundColor: getBackgroundColor(item.ativo) }}>
                                                            {item.ativo}
                                                        </span>
                                                    </td>
                                                    <td data-label='#'>
                                                        <button className='action' style={{ backgroundColor: '#f6a935' }} onClick={() => handleEdit(item)}>
                                                            <FiEdit2 color='#FFF' size={17} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}


                </>
            </div>

        </div>
    )
}