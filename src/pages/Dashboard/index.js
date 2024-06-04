import { useEffect, useState, useContext } from 'react';
import './dashboard.css';

import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, limit, startAfter, query, where, and } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import { AuthContext } from '../../contexts/auth';

const listRef = collection(db, 'tickets');

export default function Dashboard() {

    const { user } = useContext(AuthContext);


    const [chamados, setChamados] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEmpty, setIsEmpty] = useState(false);
    const [lastDocs, setLastDocs] = useState();
    const [loadingMore, setLoadingMore] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [detail, setDetail] = useState();
    const [status, setStatus] = useState('Todos');
    const [reset, setReset] = useState(false);

    const getBackgroundColor = (status) => {
        switch (status) {
            case 'Aberto':
                return '#5CB85C';
            case 'Progresso':
                return '#D9534F';
            case 'Atendido':
                return '#999';
        }
    };

    useEffect(() => {

        async function loadChamados() {

            const q = query(listRef, where('userId', '==', user.uid), limit(5));

            const querySnapshot = await getDocs(q)
            setChamados([]);
            await updateState(querySnapshot)
            setLoading(false);
        }

        loadChamados();

        return () => {

        } //quando desmontar o componente

    }, [reset])


    async function loadChamadosFiltrados() {

        if (status !== 'Todos') {
            const q = query(listRef, where('status', '==', status), where('userId', '==', user.uid), limit(5));

            const querySnapshot = await getDocs(q)

            if (querySnapshot.docs.length === 0) {
                toast.warn('Nenhum chamado encontrado com esse filtro!');
                return;
            }

            setChamados([]);
            await updateState(querySnapshot)
            console.log(querySnapshot.docs)
            return;
        }

        const q = query(listRef, where('userId', '==', user.uid), limit(5));

        const querySnapshot = await getDocs(q)
        setChamados([]);
        await updateState(querySnapshot)
        setIsEmpty(false);


    }

    function handleClearFiltro() {
        setStatus('Todos');
        setReset(!reset);
        setLoadingMore(false);
        toast.success('Filtro resetado!');
        setIsEmpty(false);
    }


    async function updateState(querySnapshot) {
        const isCollectionEmpty = querySnapshot.size === 0;

        if (!isCollectionEmpty) {
            let lista = [];

            querySnapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    clienteId: doc.data().clienteId,
                    created: doc.data().created,
                    createdFormat: format(doc.data().created.toDate(), 'dd/MM/yyy'),
                    status: doc.data().status,
                    complemento: doc.data().complemento
                })
            })

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] //Pegando o ultimo item
            setLastDocs(lastDoc)

            setChamados(chamados => [...chamados, ...lista]);


        } else {
            setIsEmpty(true);
        }

        setLoadingMore(false);
    }

    async function handleMore() {
        setLoadingMore(true);

        if (status !== 'Todos') {

            const q = query(listRef, where('status', '==', status), where('userId', '==', user.uid), startAfter(lastDocs), limit(5));
            //const q = query(listRef, orderBy('created', 'desc'), startAfter(lastDocs), limit(5));
            const querySnapshot = await getDocs(q);
            await updateState(querySnapshot);
            return;

        }

        const q = query(listRef, where('userId', '==', user.uid), startAfter(lastDocs), limit(5));
        //const q = query(listRef, orderBy('created', 'desc'), startAfter(lastDocs), limit(5));
        const querySnapshot = await getDocs(q);
        await updateState(querySnapshot);
    }

    function toggleModal(item) {
        setShowModal(!showModal);
        setDetail(item);
    }


    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    if (loading) {
        return (
            <div>
                <Header />

                <div className='content'>
                    <Title name='Tickets'>
                        <FiMessageSquare size={25} />
                    </Title>

                    <div className='container dashboard'>
                        <span>Buscando chamados...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Header />

            <div className='content'>
                <Title name='Tickets'>
                    <FiMessageSquare size={25} />
                </Title>

                <>
                    {chamados.length === 0 ? (
                        <div className='container dashboard'>
                            <span>Nenhum chamado encontrado...</span>
                            <Link to='/new' className='new'>
                                <FiPlus color='#FFF' size={25} />
                                Novo chamado
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className='dv-filtros'>
                                <div>
                                    <Link to='/new' className='new'>
                                        <FiPlus color='#FFF' size={25} />
                                        Novo chamado
                                    </Link>

                                </div>

                                <div className='container-filtros'>
                                    <h3>FILTROS:</h3>

                                    <div className='filtros'>
                                        <div className='filtros-cb'>
                                            <label>Status</label>
                                            <select value={status} onChange={handleOptionChange}>
                                                <option value='Todos'>Todos</option>
                                                <option value='Aberto'>Em Aberto</option>
                                                <option value='Progresso'>Progresso</option>
                                                <option value='Atendido'>Atendido</option>
                                            </select>
                                        </div>

                                        <button className='btn-more' style={{ marginLeft: 10 }} onClick={loadChamadosFiltrados}>Filtrar</button>
                                        <button className='btn-more' style={{ marginLeft: 10 }} onClick={handleClearFiltro}>Limpar filtro</button>
                                    </div>
                                </div>

                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th scope='col'>Cliente</th>
                                        <th scope='col'>Assunto</th>
                                        <th scope='col'>Status</th>
                                        <th scope='col'>Cadastrado em</th>
                                        <th scope='col'>#</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {chamados.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td data-label='Cliente'>{item.cliente}</td>
                                                <td data-label='Assunto'>{item.assunto}</td>
                                                <td data-label='Status'>
                                                    <span className='badge' style={{ backgroundColor: getBackgroundColor(item.status) }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td data-label='Cadastrado'>{item.createdFormat}</td>
                                                <td data-label='#'>
                                                    <button className='action' style={{ backgroundColor: '#3583F6' }} onClick={() => toggleModal(item)}>
                                                        <FiSearch color='#FFF' size={17} />
                                                    </button>

                                                    <Link to={`/new/${item.id}`} className='action' style={{ backgroundColor: '#f6a935' }}>
                                                        <FiEdit2 color='#FFF' size={17} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}

                                </tbody>
                            </table>


                            {loadingMore && <h3>Buscando mais chamados...</h3>}
                            {!loadingMore && !isEmpty && <button onClick={handleMore} className='btn-more'>Buscar mais chamados</button>}
                        </>
                    )}


                </>


            </div>

            {
                showModal && (
                    <Modal
                        conteudo={detail}
                        close={() => setShowModal(!showModal)}
                    />
                )
            }

        </div >
    )
}