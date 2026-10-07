import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { Loader } from 'lucide-react'
import './App.css'
import TransactionList from './components/TransactionList'
import SummaryCard from './components/SummaryCard'
import TransactionForm from './components/TransactionForm'
import SummaryChart from './components/SummaryChart'
import AccountBalance from './components/AccountBalance'
import ThemeToggle from './components/ThemeToggle'

function App() {

  const [editingId, setEditingId] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [month, setMonth] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [filterType, setFilterType] = useState('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')



  function fetchTransactions() {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.append('page', page)

    if (filterType !== '') {
      params.append('type', filterType)
    }

    if (filterAccount !== '') {
      params.append('account_id', filterAccount)
    }

    if (filterMonth !== '') {
      params.append('month', filterMonth)
    }
    fetch(`http://localhost:8080/transactions?${params.toString()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('โหลดข้อมูลไม่สำเร็จ')
        }
        return res.json()
      })
      .then(data => {
        setTransactions(data.data)
        setTotal(data.total)
        setTotalPage(data.total_pages)
      })
      .catch(err => {
        console.error(err)
        setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
  }, [theme])

  useEffect(() => {
    fetch('http://localhost:8080/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('โหลด categories ไม่สำเร็จ:', err))

    fetch('http://localhost:8080/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(err => console.error('โหลด accounts ไม่สำเร็จ:', err))

    fetch('http://localhost:8080/months')
      .then(res => res.json())
      .then(data => setMonth(data))
      .catch(err => console.error('โหลด months ไม่สำเร็จ:', err))
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [page, filterType, filterAccount, filterMonth])

  useEffect(() => {
    setPage(1)
  }, [filterType, filterAccount, filterMonth])

  // return (
  //   <>
  //     <div className="min-h-screen bg-slate-900 p-8">
  //       <div className="max-w-xl mx-auto">
  //         <SummaryCard transactions={transactions} />
  //         <AccountBalance accounts={accounts} />
  //         <TransactionForm
  //           transactions={transactions}
  //           setTransactions={setTransactions}
  //           editingId={editingId}
  //           setEditingId={setEditingId}
  //           categories={categories}
  //           accounts={accounts}
  //           fetchTransactions={fetchTransactions}
  //         />

  //         <select value={filterType} onChange={(e) => {
  //           setFilterType(e.target.value)
  //         }} >
  //           <option value="">ทั้งหมด</option>
  //           <option value="income">รายรับ</option>
  //           <option value="expense">รายจ่าย</option>
  //           <option value="transfer">รายการโอน</option>
  //         </select>

  //         <select value={filterAccount} onChange={(e) => {
  //           setFilterAccount(e.target.value)
  //         }} >
  //           <option value="">ทั้งหมด</option>
  //           {accounts.map((acc) => (
  //             <option key={acc.id} value={acc.id}>{acc.account_name}</option>
  //           ))}
  //         </select>

  //         <select value={filterMonth} onChange={(e) => {
  //           setFilterMonth(e.target.value)
  //         }} >
  //           <option value="">เลือกเดือน</option>
  //           {month.map((m) => (
  //             <option key={m} value={m}>{m}</option>
  //           ))}
  //         </select>
  //         {loading && (
  //           <div className='flex items-center justify-center gap-2 py-4 text-slate-400'>
  //             <Loader className='animate-spin' size={20} />
  //             <span>กำลังโหลด...</span>
  //           </div>
  //         )}
  //         {error && <p>{error}</p>}
  //         {!loading && !error && transactions.length === 0 && <p>ยังไม่มีรายการ</p>}
  //         {!loading && !error && <TransactionList
  //           transactions={transactions}
  //           setTransactions={setTransactions}
  //           setEditingId={setEditingId}
  //           categories={categories}
  //           accounts={accounts}
  //           page={page}
  //           total={total}
  //           setPage={setPage}
  //           totalPage={totalPage}
  //           fetchTransactions={fetchTransactions}
  //         />}

  //         <SummaryChart />
  //       </div>
  //     </div>
  //   </>
  // )

  return (
    <div className='min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] transition-colors'>
      <div className='max-w-5xl mx-auto px-4 py-6'>

        <div className='flex items-center justify-between mb-6'>
          <h2 className='bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent'>Personal Finance Tracker</h2>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        {/* ===== Summary + Balance (เต็มจอ) ===== */}
        <SummaryCard transactions={transactions} />
        <AccountBalance accounts={accounts} />

        {/* ===== 2 คอลัมน์: ฟอร์ม | filter+list ===== */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>

          {/* ===== ซ้าย: ฟอร์ม ===== */}
          <div className={`bg-[var(--color-bg-card)] rounded-xl p-4 h-fit transition-colors border-t-3 shadow-md
    ${editingId === null ? 'border-emerald-500' : 'border-amber-500'}`}>
            <h2 className='text-lg font-semibold text-[var(--color-text-primary)] mb-4'>
              {editingId === null ? 'เพิ่มรายการ' : 'แก้ไขรายการ'}
            </h2>
            <TransactionForm
              transactions={transactions}
              setTransactions={setTransactions}
              editingId={editingId}
              setEditingId={setEditingId}
              categories={categories}
              accounts={accounts}
              fetchTransactions={fetchTransactions}
            />
          </div>

          {/* ===== ขวา: filter + list ===== */}
          <div className='bg-[var(--color-bg-card)] rounded-xl p-4 border-t-3 border-sky-500 shadow-md transition-colors'>
            {/* filter */}
            <div className='flex gap-2 mb-4 '>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className='flex-1 w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500'>
                <option value=''>ทั้งหมด</option>
                <option value='income'>รายรับ</option>
                <option value='expense'>รายจ่าย</option>
                <option value='transfer'>รายการโอน</option>
              </select>
              <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}
                className='flex-1 w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500'>
                <option value=''>ทั้งหมด</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                ))}
              </select>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
                className='flex-1 w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500'>
                <option value=''>เลือกเดือน</option>
                {month.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* loading / error / empty / list */}
            {loading && (
              <div className='flex items-center justify-center gap-2 py-8 text-[var(--color-text-muted)]'>
                <Loader className='animate-spin' size={20} />
                <span>กำลังโหลด...</span>
              </div>
            )}
            {error && (
              <div className='text-center py-8 text-rose-400'>{error}</div>
            )}
            {!loading && !error && transactions.length === 0 && (
              <div className='text-center py-8 text-[var(--color-text-muted)]'>ยังไม่มีรายการ</div>
            )}
            {!loading && !error && <TransactionList
              transactions={transactions}
              setTransactions={setTransactions}
              setEditingId={setEditingId}
              categories={categories}
              accounts={accounts}
              page={page}
              total={total}
              setPage={setPage}
              totalPage={totalPage}
              fetchTransactions={fetchTransactions}
            />}
          </div>
        </div>

        {/* ===== กราฟ (เต็มจอ ล่างสุด) ===== */}
        <div className='mt-6'>
          <SummaryChart theme={theme} />
        </div>

      </div>
    </div>
  )

}

export default App
