"use client";
import React, { useState, useMemo } from 'react';
import styles from './dashboard.module.css';
import { usePathname, useRouter } from 'next/navigation';

// Chart.js
// configuración e importación de componentes necesarios de Chart.js y react-chartjs-2  
//con esto se podrá mostrar gráficos en el panel de control
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage(){
  const pathname = usePathname();
  const router = useRouter();



  return (
    <>
   
    <main className={styles.content}>
      <section>
        <div className={styles.panelHeader}>
          <h1>Panel</h1>
          <p>Resumen rápido: métricas, actividad reciente y atajos.</p>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total facturas emitidas</div>
            <div className={styles.cardValue}>1,248</div>
            <div className={styles.cardSubtitle}>Por el usuario (último año)</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Ventas</div>
            <div className={styles.cardValue}>Q 4,350</div>
            <div className={styles.cardSubtitle}>Hoy / Semana / Mes: Q 150 / Q 1,200 / Q 8,900</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Facturas</div>
            <div className={styles.cardValue}>Certificadas 1,200 • Anuladas 48</div>
            <div className={styles.cardSubtitle}>Estado general</div>
          </div>
          <div className={styles.cardChart}>
            <div className={styles.cardTitleRow}>
              <div className={styles.cardTitle}>Rendimiento personal</div>
              <div className={styles.rangeControls} role="tablist" aria-label="Rango de tiempo">
                <button type="button" className={`${styles.rangeButton} ${styles.activeRange}`} data-range="day">Día</button>
                <button type="button" className={`${styles.rangeButton}`} data-range="week">Semana</button>
                <button type="button" className={`${styles.rangeButton}`} data-range="month">Mes</button>
              </div>
            </div>

            <div className={styles.chartWrap} aria-hidden>
              <InteractiveChart />
            </div>
            <div className={styles.cardSubtitle}>Progreso</div>
          </div>
        </div>
      </section>
      

      
    </main>

   
    </>
  );
}


function InteractiveChart(){
  const [range, setRange] = useState('week');

  // cuadros de datos simulados aqui se conectara a datos reales con la api
  const datasets = {
    day: { labels: ['00:00','04:00','08:00','12:00','16:00','20:00'], data:[5,8,12,9,14,10] },
    week: { labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], data:[50,65,80,70,95,110,120] },
    month: { labels: Array.from({length:8}, (_,i)=>`Sem ${i+1}`), data:[200,230,260,280,300,330,360,400] }
  };

  const current = datasets[range] || datasets.week;

  const data = {
    labels: current.labels,
    datasets: [
      {
        label: 'Facturas emitidas',
        data: current.data,
        fill: true,
        backgroundColor: 'rgba(11,96,214,0.08)',
        borderColor: '#0b60d6',
        tension: 0.3,
        pointRadius: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display:false }, ticks: { color: '#6b7280' } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#6b7280' } }
    }
  };

  // botones de rango manejo de eventos
  React.useEffect(()=>{
    const handler = (e)=>{
      const btn = e.target.closest && e.target.closest('button[data-range]');
      if(btn && btn.dataset.range){
        setRange(btn.dataset.range);
        // actualizar clases activas
        document.querySelectorAll(`.${styles.rangeButton}`).forEach(b=>b.classList.remove(styles.activeRange));
        btn.classList.add(styles.activeRange);
      }
    };
    document.addEventListener('click', handler);
    return ()=> document.removeEventListener('click', handler);
  },[]);

  return (
    <div style={{height:170}}>
      <Line data={data} options={options} />
    </div>
  );
}
