import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function SummaryChart({ theme }) {
    const [summary, setSummary] = useState([])

    useEffect(() => {
        fetch('http://localhost:8080/summary')
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error('โหลด summary ไม่สำเร็จ:', err))
    }, [])

    return (
        <div className='bg-[var(--color-bg-card)] rounded-xl p-4 mt-6 border-t-3 border-teal-500 shadow-md transition-colors'>
            <h2 className='text-lg font-semibold text-[var(--color-text-primary)] mb-4'>สรุปรายเดือน</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary}>
                    <XAxis dataKey="month" tick={{ fill: getCssVar('--color-text-muted'), fontSize: 12 }} />
                    <YAxis tick={{ fill: getCssVar('--color-text-muted'), fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: getCssVar('--color-tooltip-bg'), border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: getCssVar('--color-text-secondary') }}
                        labelStyle={{ color: getCssVar('--color-text-muted') }}
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
