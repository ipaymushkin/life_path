/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, AlertCircle, Compass, Users, Sparkles, BookOpen } from "lucide-react";
import { TestContext } from "../types";

interface LandingHeroProps {
  context: TestContext;
  onUpdateContext: (context: TestContext) => void;
  onStartDiagnostics: () => void;
}

export default function LandingHero({ context, onUpdateContext, onStartDiagnostics }: LandingHeroProps) {
  const isFormValid = context.currentStatus.trim().length > 2 && context.concerns.trim().length > 2;

  return (
    <div className="space-y-12">
      {/* 1. Header Hero section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Биопсихосоциальная модель профориентации
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Путь жизни
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Научно обоснованная карьерная навигация нового поколения. Сочетание трех проверенных психологических методик и передового искусственного интеллекта для точного карьерного самоопределения.
        </p>
      </div>

      {/* 2. Target Audience & Problems We Solve section */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Выпускникам школ и колледжей</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Поможем сориентироваться в хаосе предложений на рынке труда, оценить личную предрасположенность и выбрать востребованный университет или сферу обучения без сожалений.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Специалистам, меняющим карьеру</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Если нынешняя работа перестала приносить радость и достойный доход. Проанализируем ваши сильные стороны и порекомендуем безопасный мост в перспективное IT, научное или творческое русло.
          </p>
        </div>
      </div>

      {/* 3. Deep Competitive Comparison Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Почему традиционные тесты не работают?
          </h3>
          <p className="text-sm text-slate-600 max-w-3xl">
            Сравнение эффективности платформы «Путь жизни» с существующими на рынке психологическими порталами и карьерными центрами.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Платформа</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Научная база</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Качество рекомендаций</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Интерфейс</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-4 px-4 font-bold text-red-600">Psytest</td>
                <td className="py-4 px-4 text-slate-600">Огромный хаос разрозненных тестов без единой концепции</td>
                <td className="py-4 px-4 text-slate-600">Отсутствуют конкретные профессиональные траектории</td>
                <td className="py-4 px-4 text-slate-600 flex items-center gap-1"><AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> Крайне неудобная и устаревшая навигация</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-amber-600">Skillfactory (Clue)</td>
                <td className="py-4 px-4 text-slate-600">Поверхностные маркетинговые тесты без клинической основы</td>
                <td className="py-4 px-4 text-slate-600">Шаблонное навязывание платных долгосрочных курсов</td>
                <td className="py-4 px-4 text-slate-600 flex items-center gap-1"><AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> Фокус на продажах, а не на самовыражении человека</td>
              </tr>
              <tr className="bg-indigo-50/70">
                <td className="py-4 px-4 font-extrabold text-indigo-700">Путь жизни</td>
                <td className="py-4 px-4 font-medium text-slate-900">Комплекс Кеттелла 16PF, Айзенка (EPI) и Ахраровой 2024</td>
                <td className="py-4 px-4 font-medium text-slate-900">Индивидуальный ИИ-анализ рынка труда, зарплат и требований</td>
                <td className="py-4 px-4 text-indigo-700 font-extrabold flex items-center gap-1"><Check className="w-4 h-4 text-indigo-600" /> Минималистичный и адаптивный дизайн во всех деталях</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Onboarding Form Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 max-w-2xl mx-auto space-y-6">
        <h3 className="text-xl font-extrabold text-slate-900 text-center">
          Настройка психологического профиля
        </h3>
        <p className="text-xs text-slate-500 text-center">
          Для персонализации искусственного интеллекта поделитесь информацией о вашем текущем этапе.
        </p>

        <div className="space-y-4">
          {/* User Type toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ваша текущая роль:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateContext({ ...context, userType: "graduate" })}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                  context.userType === "graduate"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Выпускник</span>
                <span className="text-[10px] font-normal opacity-80">Школа / ВУЗ / Колледж</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateContext({ ...context, userType: "changer" })}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                  context.userType === "changer"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Смена профессии</span>
                <span className="text-[10px] font-normal opacity-80">Уже есть рабочий стаж</span>
              </button>
            </div>
          </div>

          {/* Current Position / Education */}
          <div className="space-y-1">
            <label htmlFor="currentStatus" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {context.userType === 'graduate' ? 'Где вы учитесь или какое направление закончили?' : 'Кем вы работаете сейчас и какое у вас базовое образование?'}
            </label>
            <input
              type="text"
              id="currentStatus"
              value={context.currentStatus}
              onChange={(e) => onUpdateContext({ ...context, currentStatus: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              placeholder={context.userType === 'graduate' ? 'Пример: Выпускник 11-го класса химико-биологического профиля' : 'Пример: Менеджер по логистике, 5 лет опыта'}
            />
          </div>

          {/* Concerns and challenges */}
          <div className="space-y-1">
            <label htmlFor="concerns" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              С какими трудностями профессионального выбора вы столкнулись?
            </label>
            <textarea
              id="concerns"
              rows={3}
              value={context.concerns}
              onChange={(e) => onUpdateContext({ ...context, concerns: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              placeholder={context.userType === 'graduate' ? 'Пример: Боюсь ошибиться выбором, у родителей одно мнение, у меня другое. Хочу ИТ, но не знаю, потяну ли.' : 'Пример: Полное эмоциональное выгорание в текущей сфере. Не чувствую развития, хочу уйти на удаленку, но боюсь потерять в зарплате в ноль.'}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!isFormValid}
          onClick={onStartDiagnostics}
          className={`w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
            isFormValid
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:translate-y-[-1px]"
              : "bg-slate-300 pointer-events-none"
          }`}
        >
          <span>Запустить комплексную диагностику</span>
          <Compass className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
