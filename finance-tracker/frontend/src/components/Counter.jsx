import React from 'react'
import { useState } from 'react'


function Counter() {
    const [count, setCount] = useState(0)

    function handleDecrease() {
        if (count > 0){
            setCount(count - 1)
        }
    }

  return (
    <div className="bg-slate-800 rounded-xl p-6 text-center">
      <p className="text-slate-400 text-sm">ทดลอง state</p>
      <p className="text-emerald-400 text-4xl font-bold my-4">{count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
      >
        กดเพิ่ม
      </button>
      <button
        onClick={handleDecrease}
        className="bg-rose-500 text-white px-4 py-2 rounded-lg ml-2"
      >
        กดลบ
      </button>
    </div>
  )
}

export default Counter