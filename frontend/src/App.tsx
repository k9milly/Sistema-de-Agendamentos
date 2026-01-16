import { useState, useEffect } from 'react'
import { Calendar, Clock, UserCheck, UserPlus } from 'lucide-react'

interface User {
    id: string;
    name: string;
}

function App() {
    const [users, setUsers] = useState<User[]>([])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [clientId, setClientId] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    async function loadUsers() {
        const response = await fetch('http://localhost:3333/users')
        const data = await response.json()
        setUsers(data)
    }

    useEffect(() => { loadUsers() }, [])

    // FUNÇÃO PARA CRIAR CLIENTE PELA TELA
    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault()
        console.log("Botão clicado! Tentando enviar dados...")
        if (!name || !email) return alert("Preencha nome e e-mail!")

        const response = await fetch('http://localhost:3333/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, role: 'CLIENT' })
        })

        if (response.ok) {
            setName(''); setEmail('');
            loadUsers(); // Recarrega a lista para o novo cliente aparecer no select
            alert("Cliente cadastrado com sucesso!")
        }
    }

    async function handleSchedule(e: React.FormEvent) {
        e.preventDefault()
        if (!clientId || !date || !time) return alert("Preencha todos os campos!")

        const startsAt = new Date(`${date}T${time}:00`).toISOString()
        const endsAt = new Date(new Date(startsAt).getTime() + 60 * 60 * 1000).toISOString()

        const response = await fetch('http://localhost:3333/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startsAt,
                endsAt,
                clientId,
                providerId: "66402c41-b385-4b2e-964f-5be617b20019" //
            })
        })

        if (response.ok) alert("Agendamento realizado!")
        else {
            const error = await response.json()
            alert(error.error)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Calendar size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Agendamento</h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* FORMULÁRIO DE CADASTRO DE CLIENTE */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <UserPlus size={20} className="text-blue-600" /> Novo Cliente
                        </h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input
                                type="text" placeholder="Nome do cliente" value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email" placeholder="E-mail" value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all">
                                Salvar Cliente
                            </button>
                        </form>

                        <hr className="my-6 border-slate-100" />

                        <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Clientes Cadastrados</h2>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {users.map(u => (
                                <div key={u.id} className="text-sm p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
                                    {u.name}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FORMULÁRIO DE AGENDAMENTO */}
                    <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4">Marcar Horário</h2>
                        <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">Cliente</label>
                                <select
                                    value={clientId} onChange={e => setClientId(e.target.value)}
                                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecione o cliente...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Data</label>
                                <input type="date" onChange={e => setDate(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600">Horário</label>
                                <input type="time" onChange={e => setTime(e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <button className="md:col-span-2 mt-4 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                                Confirmar Agendamento
                            </button>
                        </form>
                    </section>

                </div>
            </div>
        </div>
    )
}

export default App