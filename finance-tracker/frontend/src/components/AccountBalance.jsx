import React from 'react'
import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Banknote, Landmark, CreditCard } from 'lucide-react'


function AccountBalance({ accounts }) {

    const accountIcons = {
        'เงินสด': Banknote,
        'กสิกร': Landmark,
        'บัตรเครดิต': CreditCard,
    }

    const [balance, setBalance] = useState([])

    useEffect(() => {
        fetch('http://localhost:8080/accounts/balance')
            .then(res => res.json())
            .then(data => setBalance(data))
            .catch(err => console.error('โหลด balance ไม่สำเร็จ:', err))
    }, [])

    return (

        <>
            <div>
                <div>
                    <h3 className='text-slate-100 mb-3'>คงเหลือแต่ละบัญชี</h3>
                </div>
                <div className='grid grid-cols-3 gap-3'>
                    {balance.map((b) => {
                        const account = accounts.find((acc) => acc.id === (b.account_id))
                        const Icon = accountIcons[account?.account_name] || Wallet
                        return (
                            <div key={b.account_id} className='bg-slate-700 rounded-lg p-3 mb-3'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-8 h-8 rounded-full flex items-center justify-center bg-sky-500/20'>
                                        <Icon size={16} className='text-sky-400' />
                                    </div>
                                    <p className='text-slate-400 text-xs'>{account?.account_name}</p>

                                </div>
                                <p className={`text-xl font-bold ${b.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    ฿{b.balance.toLocaleString()}.-
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default AccountBalance