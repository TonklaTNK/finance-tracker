import React from 'react'
import { useState, useEffect } from 'react'

function TransactionForm({ transactions, setTransactions, editingId, setEditingId, categories, accounts, fetchTransactions }) {

    useEffect(() => {
        if (editingId === null) return

        const item = transactions.find((t) => t.id === editingId)
        if (item) {
            console.log('โหลดกลับ - to_account_id:', item.to_account_id, 'type:', typeof item.to_account_id)
            setAmount(item.amount)
            setType(item.transaction_type)
            setAccountId(item.account_id)
            setCategoryId(item.category_id)
            setToAccountId(item.to_account_id)
            setNote(item.note)
            setOccurredAt(item.occurred_at.slice(0, 10))
        }
    }, [editingId])

    const [note, setNote] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState('expense')
    const [categoryId, setCategoryId] = useState('')
    const [accountId, setAccountId] = useState('')
    const [toAccountId, setToAccountId] = useState('')
    const [occurredAt, setOccurredAt] = useState('')
    const filteredCategories = categories.filter((cat) => cat.category_type === type)
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    function handleAdd() {

        const newErrors = {}

        if (amount === '' || Number(amount) <= 0) {
            newErrors.amount = 'กรุณากรอกจำนวนเงินให้ถูกต้อง'
        }
        if (accountId === '') {
            newErrors.accountId = 'กรุณาเลือกบัญชี'
        }
        if (type === 'transfer' && toAccountId === '') {
            newErrors.toAccountId = 'กรุณาเลือกบัญชีปลายทาง'
        }
        if (occurredAt === '') {
            newErrors.occurredAt = 'กรุณาเลือกวันที่'
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            return
        }

        setSubmitting(true)

        const newItem = {
            transaction_type: type,
            amount: Number(amount),
            account_id: Number(accountId),
            category_id: type === 'transfer' ? null : Number(categoryId),
            to_account_id: type === 'transfer' ? Number(toAccountId) : null,
            note: note,
            occurred_at: occurredAt + "T00:00:00Z",
        }

        fetch('http://localhost:8080/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),
        })

            .then(res => {
                if (!res.ok) {
                    throw new Error('เพิ่มรายการไม่สำเร็จ')
                }
                return res.json()
            })
            .then(() => {
                fetchTransactions()

                setNote('')
                setAmount('')
                setType('expense')
                setCategoryId('')
                setAccountId('')
                setToAccountId('')
                setOccurredAt('')
            })
            .catch(err => {
                console.error(err.message);
                alert('เพิ่มรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
            })
            .finally(() => {
                setSubmitting(false)
            })

    }

    function handleEdit(item) {
        setEditingId(item.id)
    }

    function handleCancel() {
        setNote('')
        setAmount('')
        setType('expense')
        setCategoryId('')
        setAccountId('')
        setToAccountId('')
        setEditingId(null)
        setOccurredAt('')
    }

    function handleUpdate() {
        // if (amount === '') return
        if (amount === '' || Number(amount) <= 0) {
            alert('กรุณากรอกจำนวนเงินให้ถูกต้อง')
            return
        }
        if (accountId === '') {
            alert('กรุณาเลือกบัญชี')
            return
        }
        if (type === 'transfer' && toAccountId === '') {
            alert('กรุณาเลือกบัญชีปลายทาง')
            return
        }
        if (occurredAt === '') {
            alert('กรุณาเลือกวันที่')
            return
        }

        const updatedItem = {
            transaction_type: type,
            amount: Number(amount),
            account_id: Number(accountId),
            category_id: type === 'transfer' ? null : Number(categoryId),
            to_account_id: type === 'transfer' ? Number(toAccountId) : null,
            note: note,
            occurred_at: occurredAt + "T00:00:00Z",
        }

        setSubmitting(true)
        fetch(`http://localhost:8080/transactions/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem),
        })

            .then(() => {
                // setTransactions(
                //     transactions.map((item) =>
                //         item.id === editingId
                //             ? {
                //                 ...item, amount: Number(amount),
                //                 transaction_type: type,
                //                 account_id: Number(accountId),
                //                 category_id: type === 'transfer' ? null : Number(categoryId),
                //                 to_account_id: type === 'transfer' ? Number(toAccountId) : null,
                //                 occurred_at: occurredAt + "T00:00:00Z",
                //             }
                //             : item
                //     )
                // )
                fetchTransactions()

                setNote('')
                setAmount('')
                setType('expense')
                setCategoryId('')
                setAccountId('')
                setToAccountId('')
                setOccurredAt('')
                setEditingId(null)
            })
            .catch(err => {
                console.error(err.message);
                alert('แก้ไขรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
            })
            .finally(() => {
                setSubmitting(false)
            })

    }

    // return (
    //     <div>
    //         <input
    //             value={note}
    //             onChange={(e) => setNote(e.target.value)}
    //             placeholder='โน้ต (ไม่บังคับ)'
    //             className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-2'
    //         />

    //         <input
    //             type="number"
    //             value={amount}
    //             onChange={(e) => setAmount(e.target.value)}
    //             placeholder='จำนวน'
    //             className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-2'
    //         />{errors.amount && <p className='text-rose-400 text-xs mt-1'>{errors.amount}</p>}

    //         <select
    //             value={type}
    //             onChange={(e) => setType(e.target.value)}
    //             className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-4'
    //         >
    //             <option value="expense">รายจ่าย</option>
    //             <option value="income">รายรับ</option>
    //             <option value="transfer">รายการโอน</option>
    //         </select>

    //         {type !== 'transfer' && (
    //             <select
    //                 value={categoryId}
    //                 onChange={(e) => setCategoryId(e.target.value)}
    //                 className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-4'
    //             >
    //                 <option value="">เลือกหมวดหมู่</option>
    //                 {filteredCategories.map((cat) => (
    //                     <option key={cat.id} value={cat.id}>
    //                         {cat.category_name}
    //                     </option>
    //                 ))}
    //             </select>
    //         )}

    //         <select
    //             value={accountId}
    //             onChange={(e) => setAccountId(e.target.value)}
    //             className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-4'
    //         >
    //             <option value="">
    //                 {type === 'transfer' ? "เลือกบัญชีต้นทาง" : "เลือกบัญชี"}
    //             </option>
    //             {accounts.map((acc) => (
    //                 <option key={acc.id} value={acc.id}>
    //                     {acc.account_name}
    //                 </option>
    //             ))}
    //         </select>
    //         {errors.accountId && <p className='text-rose-400 text-xs mt-1'>{errors.accountId}</p>}

    //         {/* TODO: transfer มา เปลี่ยน placeholder ต้นทางเป็น "เลือกบัญชีต้นทาง" */}
    //         {type === 'transfer' && (
    //             <select
    //                 value={toAccountId}
    //                 onChange={(e) => setToAccountId(e.target.value)}
    //                 className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-4'
    //             >
    //                 <option value="">เลือกบัญชีปลายทาง</option>
    //                 {accounts.map((acc) => (
    //                     <option key={acc.id} value={acc.id}>
    //                         {acc.account_name}
    //                     </option>
    //                 ))}
    //             </select>
    //         )}
    //         {errors.toAccountId && <p className='text-rose-400 text-xs mt-1'>{errors.toAccountId}</p>}


    //         <input
    //             type="date"
    //             value={occurredAt}
    //             onChange={(e) => setOccurredAt(e.target.value)}
    //             className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 mb-4'
    //         />
    //         {errors.occurredAt && <p className='text-rose-400 text-xs mt-1'>{errors.occurredAt}</p>}

    //         <button
    //             onClick={editingId === null ? handleAdd : handleUpdate}
    //             disabled={submitting}
    //             className={`w-full text-white rounded-lg py-2 mb-4 
    //                 ${editingId === null ? 'bg-emerald-500' : 'bg-amber-500'}
    //                 disabled:opacity-50 disabled:cursor-not-allowed`}
    //         >
    //             {submitting
    //                 ? 'กำลังบันทึก...'
    //                 : (editingId === null ? 'เพิ่มรายการ' : 'บันทึกการแก้ไข')}
    //         </button>

    //         {editingId !== null && (
    //             <button
    //                 onClick={handleCancel}
    //                 className='w-full bg-slate-600 text-white rounded-lg py-2 mb-4'
    //             >
    //                 ยกเลิก
    //             </button>
    //         )}
    //     </div>
    // )

    return (
        <div>
            <div className='grid grid-cols-2 gap-3'>
                {/* จำนวน */}
                <div>
                    <input
                        type='number'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder='จำนวน'
                        className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                    />
                    {errors.amount && <p className='text-rose-400 text-xs mt-1'>{errors.amount}</p>}
                </div>

                {/* ประเภท */}
                <div>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                    >
                        <option value='expense'>รายจ่าย</option>
                        <option value='income'>รายรับ</option>
                        <option value='transfer'>รายการโอน</option>
                    </select>
                </div>

                {/* หมวดหมู่ (ถ้าไม่ใช่ transfer) */}
                {type !== 'transfer' && (
                    <div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                        >
                            <option value=''>เลือกหมวดหมู่</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* บัญชี */}
                <div>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                    >
                        <option value=''>
                            {type === 'transfer' ? 'เลือกบัญชีต้นทาง' : 'เลือกบัญชี'}
                        </option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                        ))}
                    </select>
                    {errors.accountId && <p className='text-rose-400 text-xs mt-1'>{errors.accountId}</p>}
                </div>

                {/* บัญชีปลายทาง (ถ้า transfer) */}
                {type === 'transfer' && (
                    <div>
                        <select
                            value={toAccountId}
                            onChange={(e) => setToAccountId(e.target.value)}
                            className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                        >
                            <option value=''>เลือกบัญชีปลายทาง</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                            ))}
                        </select>
                        {errors.toAccountId && <p className='text-rose-400 text-xs mt-1'>{errors.toAccountId}</p>}
                    </div>
                )}

                {/* วันที่ */}
                <div>
                    <input
                        type='date'
                        value={occurredAt}
                        onChange={(e) => setOccurredAt(e.target.value)}
                        className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                    />
                    {errors.occurredAt && <p className='text-rose-400 text-xs mt-1'>{errors.occurredAt}</p>}
                </div>
            </div>

            {/* โน้ต (เต็มบรรทัด) */}
            <div className='mt-3'>
                <input
                    type='text'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder='โน้ต (ไม่บังคับ)'
                    className='w-full bg-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500'
                />
            </div>

            {/* ปุ่ม submit */}
            <button
                onClick={editingId === null ? handleAdd : handleUpdate}
                disabled={submitting}
                className={`w-full text-white rounded-lg py-2 mt-4 font-semibold
                ${editingId === null ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
                {submitting
                    ? 'กำลังบันทึก...'
                    : (editingId === null ? 'เพิ่มรายการ' : 'บันทึกการแก้ไข')}
            </button>

            {/* ปุ่มยกเลิก (ตอนแก้ไข) */}
            {editingId !== null && (
                <button
                    onClick={handleCancel}
                    className='w-full bg-slate-600 hover:bg-slate-500 text-white rounded-lg py-2 mt-2 transition-colors'
                >
                    ยกเลิก
                </button>
            )}
        </div>
    )
}

export default TransactionForm