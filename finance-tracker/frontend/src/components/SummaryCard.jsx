import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import React from 'react'

function SummaryCard({ transactions }) {

    const totalIncome = transactions
        .filter((item) => item.transaction_type === 'income')
        .reduce((sum, item) => sum + item.amount, 0)

    const totalExpense = transactions
        .filter((item) => item.transaction_type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0)

    const balance = totalIncome - totalExpense

    return (
        <>
            <div className="p-4 text-left">
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center bg-sky-500/20'>
                        <Wallet size={25} className='text-sky-400' />
                    </div>

                    <div>
                        <p className="text-[var(--color-text-muted)] text-xs">คงเหลือ</p>
                        <p className="text-[var(--color-text-primary)] text-xl font-bold mt-1">฿{balance.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">

                <div className="bg-[var(--color-bg-input)] rounded-lg p-2 transition-colors border-t-3 border-emerald-500 shadow-md">
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/20'>
                            <TrendingUp size={20} className='text-emerald-400' />
                        </div>
                        <p className="text-[var(--color-text-muted)] text-xs">รายรับ</p>
                    </div>
                    <p className="text-emerald-400 text-xl font-bold mt-1">+฿{totalIncome.toLocaleString()}</p>
                </div>

                <div className="bg-[var(--color-bg-input)] rounded-lg p-2 transition-colors border-t-3 border-rose-500 shadow-md">
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/20'>
                             <TrendingDown size={20} className='text-rose-400' />
                        </div>
                         <p className="text-[var(--color-text-muted)] text-xs">รายจ่าย</p>
                    </div>
                    <p className="text-rose-400 text-xl font-bold mt-1">-฿{totalExpense.toLocaleString()}</p>
                </div>
            </div>
        </>
    )
}

export default SummaryCard