/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Smile, AlertCircle, Info, Zap } from "lucide-react";

interface EysenckChartProps {
  extraversion: number; // 1 to 12
  neuroticism: number; // 1 to 12
  lieScore: number; // 0 to 2
}

export default function EysenckChart({ extraversion = 6, neuroticism = 6, lieScore = 0 }: EysenckChartProps) {
  // Determine dominant temperament name
  let temperament = "Неопределенный";
  let description = "";
  let color = "text-slate-700";
  let bgLight = "bg-slate-50";
  let borderCol = "border-slate-200";

  const isExtrovert = extraversion >= 6.5;
  const isNeurotic = neuroticism >= 6.5;

  if (isExtrovert && isNeurotic) {
    temperament = "Холерик (Choleric)";
    color = "text-rose-600";
    bgLight = "bg-rose-50/70";
    borderCol = "border-rose-200";
    description = "Вы энергичный, импульсивный, страстный и инициативный лидер. Быстро включаетесь в работу и зажигаете окружающих своей целеустремленностью, но можете быстро выгорать и терять терпение.";
  } else if (isExtrovert && !isNeurotic) {
    temperament = "Сангвиник (Sanguine)";
    color = "text-amber-600";
    bgLight = "bg-amber-50/70";
    borderCol = "border-amber-200";
    description = "Вы жизнерадостный, общительный, гибкий и открытый человек. Отлично чувствуете себя в командной среде, легко адаптируетесь к меняющимся требованиям и обладаете сильным эмоциональным интеллектом.";
  } else if (!isExtrovert && isNeurotic) {
    temperament = "Меланхолик (Melancholic)";
    color = "text-indigo-600";
    bgLight = "bg-indigo-50/70";
    borderCol = "border-indigo-200";
    description = "Вы глубокий, чувствительный, рефлексирующий и ответственный специалист. Склонны к детальному анализу, созданию креативных продуктов и индивидуальной работе. Чувствуете фальшь и требуете тишины.";
  } else {
    temperament = "Флегматик (Phlegmatic)";
    color = "text-emerald-600";
    bgLight = "bg-emerald-50/70";
    borderCol = "border-emerald-200";
    description = "Вы спокойный, уравновешенный, надежный и невероятно упорный человек. Обладаете хладнокровием в экстремальных кризисах, методично доводите до конца любые монотонные задачи любой сложности.";
  }

  // Calculate percentage positions for coordinate visualization (axes are 1 to 12)
  // Clamp boundaries to be safe
  const leftPercent = Math.min(Math.max(((extraversion - 1) / 11) * 100, 5), 95);
  const bottomPercent = Math.min(Math.max(((neuroticism - 1) / 11) * 100, 5), 95);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" /> Сетка темперамента Айзенка (EPI)
        </h4>
        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">
          Искренность: {lieScore >= 2 ? "Высокая" : lieScore === 1 ? "Приемлемая" : "Скрытая самооценка"}
        </span>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Visual 2D Grid Column */}
        <div className="md:col-span-6 flex justify-center">
          <div className="relative w-64 h-64 border border-slate-300 bg-slate-50 rounded-xl overflow-hidden shadow-inner font-sans text-[10px]">
            {/* Background quadrant indicators */}
            <div className="absolute top-2 left-2 text-indigo-400 font-semibold opacity-75">Меланхолик (М)</div>
            <div className="absolute top-2 right-2 text-rose-450 text-right font-semibold text-rose-400 opacity-75">Холерик (Х)</div>
            <div className="absolute bottom-2 left-2 text-emerald-500 font-semibold opacity-75">Флегматик (Ф)</div>
            <div className="absolute bottom-2 right-2 text-amber-500 text-right font-semibold opacity-75">Сангвиник (С)</div>

            {/* Inner axis markers */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-300"></div> {/* Y axis */}
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-300"></div> {/* X axis */}

            {/* Axis labels with rotated layout */}
            <div className="absolute left-1 top-[43%] translate-x-1 font-bold text-slate-500 uppercase tracking-tight text-[8px]">
              Интроверсия 
            </div>
            <div className="absolute right-1 top-[43%] -translate-x-1 font-bold text-slate-500 uppercase tracking-tight text-[8px] text-right">
              Экстраверсия
            </div>
            <div className="absolute left-[52%] top-1 font-bold text-slate-500 uppercase tracking-tight text-[8px]">
              Нейротизм (Тревожность)
            </div>
            <div className="absolute left-[52%] bottom-1 font-bold text-slate-500 uppercase tracking-tight text-[8px]">
              Стабильность
            </div>

            {/* The active marker with pulse animation */}
            <div
              className="absolute w-5 h-5 -ml-2.5 -mb-2.5 rounded-full bg-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-extrabold z-10 transition-all duration-700 ease-out animate-pulse"
              style={{
                left: `${leftPercent}%`,
                bottom: `${bottomPercent}%`,
              }}
              title={`Экстраверсия: ${extraversion}, Нейротизм: ${neuroticism}`}
            >
              ★
            </div>
          </div>
        </div>

        {/* Diagnostic description Column */}
        <div className="md:col-span-6 space-y-4">
          <div className={`${bgLight} border ${borderCol} p-4 rounded-xl space-y-2`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ваш доминирующий тип</span>
            <h5 className={`text-xl font-black ${color}`}>{temperament}</h5>
            <p className="text-xs text-slate-700 leading-relaxed">{description}</p>
          </div>

          <div className="text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              Показатели экстраверсии ({extraversion}/12) и эмоциональной устойчивости ({12 - neuroticism}/12) напрямую влияют на предпочтительное количество социальных контактов на рабочем месте и готовность к работе в обстановке жёстких дедлайнов.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
