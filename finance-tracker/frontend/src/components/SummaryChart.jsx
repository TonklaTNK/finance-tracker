import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function SummaryChart() {
    const [summary, setSummary] = useState([])

    useEffect(() => {
        fetch('http://localhost:8080/summary')
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error('โหลด summary ไม่สำเร็จ:', err))
    }, [])

    return (
        <div className='bg-slate-800 rounded-xl p-4 mt-6'>
            <h2 className='text-lg font-semibold text-slate-100 mb-4'>สรุปรายเดือน</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary}>
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default SummaryChart