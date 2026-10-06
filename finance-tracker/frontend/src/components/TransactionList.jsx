import { useState } from 'react'
import React from 'react'
import { Utensils, Plane, ShoppingBag, Gamepad2, Wallet, Gift, TrendingUp, Receipt, Pencil, Trash2 } from 'lucide-react'

const categoryIcons = {
    'อาหาร': Utensils,
    'เดินทาง': Plane,
    'ช้อปปิ้ง': ShoppingBag,
    'บันเทิง': Gamepad2,
    'เงินเดือน': Wallet,
    'โบนัส': Gift,
    'ลงทุน': TrendingUp,
}

function TransactionList({ transactions, setTransactions, setEditingId, categories, accounts, page, total, setPage, totalPage, fetchTransactions }) {

    const [deletingId, setDeletingId] = useState(null)

    function handleDelete(id) {
        setDeletingId(id)
        fetch(`http://localhost:8080/transactions/${id}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (!res.ok) throw new Error('ลบไม่สำเร็จ')
                fetchTransactions()
            })
            .catch(err => {
                console.error(err)
                alert('ลบรายการไม่สำเร็จ')
            })
            .finally(() => {
                setDeletingId(null)
            })
    }

    return (
        <div className='bg-slate-800 rounded-xl p-6 mt-6'>
            <p className='text-slate-100 text-sm mb-4 text-left'>รายการล่าสุด</p>

            <div className='w-full text-sm space-y-2'>
                {transactions.map((item) => {
                    const category = categories.find((cat) => cat.id === Number(item.category_id))
                    const account = accounts.find((acc) => acc.id === Number(item.account_id))
                    const toAccount = accounts.find((acc) => acc.id === Number(item.to_account_id))
                    const Icon = categoryIcons[category?.category_name] || Receipt
                    return (
                        <div key={item.id} className='flex items-center gap-3 py-2 border-b border-slate-700/50'>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                 ${item.transaction_type === 'income' ? 'bg-emerald-500/20' :
                                    item.transaction_type === 'transfer' ? 'bg-amber-500/20' : 'bg-rose-500/20'}`}>
                                <Icon size={18} className={`${item.transaction_type === 'income' ? 'text-emerald-400' : item.transaction_type === 'transfer' ? 'text-amber-400' : 'text-rose-400'}`} />
                            </div>
                            <div className='flex-1 text-left'>
                                <div className='text-slate-200'>
                                    {item.transaction_type === 'transfer'
                                        ? `${account?.account_name} → ${toAccount?.account_name}`
                                        : (category ? category.category_name : '-')

                                    }
                                </div>
                                <div className='text-slate-400 text-xs mt-1'>
                                    {account ? account.account_name : '-'} · {item.occurred_at ? item.occurred_at.slice(0, 10) : '-'}
                                    {item.note && ` · ${item.note}`}
                                </div>
                            </div>
                            <div className={`font-medium ${item.transaction_type === 'income' ? 'text-emerald-400' : item.transaction_type === 'transfer' ? 'text-amber-400' : 'text-rose-400'}`}>
                                {item.transaction_type === 'income' ? '+' : item.transaction_type === 'transfer' ? '' : '-'}฿{item.amount.toLocaleString()}
                            </div>
                            <div>
                                <button onClick={() => setEditingId(item.id)} className='text-slate-400 hover:text-emerald-400 mr-3'>
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} 
                                disabled={deletingId === item.id}
                                className='text-slate-400 hover:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed'>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )
                })}
                <div className=''>
                    <button onClick={() => setPage(page - 1)} className='text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed mr-3' disabled={page === 1}>ก่อนหน้า</button>
                    <span>หน้า {page} / {totalPage} </span>
                    <button onClick={() => setPage(page + 1)} className='text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed' disabled={page === totalPage}>ถัดไป</button>
                </div>
            </div>
        </div >
    )
}

export default TransactionList