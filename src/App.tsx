/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  User, 
  MessageSquare, 
  TrendingDown, 
  Shield, 
  BookOpen, 
  BarChart2, 
  Compass, 
  RefreshCw, 
  Send,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

import { Message, RecommendedJob, AnalysisResponse, TestContext, CattellScores, EysenckScores, AkhrarovaScores } from "./types";
import { cattellQuestions, cattellFactorInfo, akhrarovaQuestions, akhrarovaDomainDescriptions, eysenckQuestions } from "./data";
import { generateClientSideReport, generateClientSideChatMessage } from "./utils/aiSimulator";
import LandingHero from "./components/LandingHero";
import EysenckChart from "./components/EysenckChart";

export default function App() {
  // Navigation State
  // "landing" | "testing" | "analyzing" | "results"
  const [step, setStep] = useState<"landing" | "testing" | "analyzing" | "results">("landing");
  const [activeTab, setActiveTab] = useState<"advisor" | "psychology" | "jobs">("jobs");
  
  // User Onboarding context
  const [context, setContext] = useState<TestContext>({
    userType: "graduate",
    currentStatus: "",
    concerns: ""
  });

  // Diagnostic Test State
  // 1 = Cattell, 2 = Akhrarova, 3 = Eysenck
  const [testSubStep, setTestSubStep] = useState<number>(1);
  
  // Answers Storage
  const [cattellAnswers, setCattellAnswers] = useState<{ [key: number]: number }>({});
  const [akhrarovaAnswers, setAkhrarovaAnswers] = useState<{ [key: number]: number }>({});
  const [eysenckAnswers, setEysenckAnswers] = useState<{ [key: number]: number }>({});

  // Analysis & AI response
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat interface state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Load state from localStorage on startup if any exists
  useEffect(() => {
    try {
      const savedContext = localStorage.getItem("wayoflife_context");
      const savedCattell = localStorage.getItem("wayoflife_cattell");
      const savedAkhrarova = localStorage.getItem("wayoflife_akhrarova");
      const savedEysenck = localStorage.getItem("wayoflife_eysenck");
      const savedAnalysis = localStorage.getItem("wayoflife_analysis");
      const savedMessages = localStorage.getItem("wayoflife_messages");
      
      if (savedContext) setContext(JSON.parse(savedContext));
      if (savedCattell) setCattellAnswers(JSON.parse(savedCattell));
      if (savedAkhrarova) setAkhrarovaAnswers(JSON.parse(savedAkhrarova));
      if (savedEysenck) setEysenckAnswers(JSON.parse(savedEysenck));
      if (savedAnalysis) {
        setAnalysis(JSON.parse(savedAnalysis));
        setStep("results");
      }
      if (savedMessages) setChatMessages(JSON.parse(savedMessages));
    } catch (e) {
      console.error("Could not retrieve state from localStorage:", e);
    }
  }, []);

  // Save changes to localStorage helper
  const saveStateToLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Could not save to localStorage: ", e);
    }
  };

  // Compute test outcomes client-side
  const computedCattell = (): CattellScores => {
    const scores: CattellScores = {};
    cattellQuestions.forEach(q => {
      const val = cattellAnswers[q.id];
      // Normalize: if answer is 1-5, map to 1-10 to fit standard model
      const score = val ? (val - 1) * 2.25 + 1 : 5;
      scores[q.scale] = Math.round(score * 10) / 10;
    });
    return scores;
  };

  const computedAkhrarova = (): AkhrarovaScores => {
    // 8 scales. Each has 2 questions. Values are 1-5. Sum is 2-10 representing scale score.
    const totals: { [key: string]: number } = {
      "Digital / IT": 0,
      "Technical / Engineering": 0,
      "Science / Research": 0,
      "Artistic / Humanities": 0,
      "Communication / Social": 0,
      "Business / Entrepreneurship": 0,
      "Clerical / Administrative": 0,
      "Physical / Outdoor": 0,
    };
    akhrarovaQuestions.forEach(q => {
      const val = akhrarovaAnswers[q.id] || 3;
      totals[q.scale] = (totals[q.scale] || 0) + val;
    });
    return totals;
  };

  const computedEysenck = (): EysenckScores => {
    let extraversionRaw = 0;
    let extraCount = 0;
    let neuroticismRaw = 0;
    let neuroCount = 0;
    let lieRaw = 0;
    let lieCount = 0;

    eysenckQuestions.forEach(q => {
      const ans = eysenckAnswers[q.id];
      if (ans === undefined) return;
      if (q.scale === "E") {
        extraCount++;
        if (ans === 1) extraversionRaw++;
      } else if (q.scale === "I") {
        extraCount++;
        if (ans === 0) extraversionRaw++; // reverse items for introversion vs extraversion
      } else if (q.scale === "N") {
        neuroCount++;
        if (ans === 1) neuroticismRaw++;
      } else if (q.scale === "L") {
        lieCount++;
        if (ans === 1) lieRaw++;
      } else if (q.scale === "L_REV") {
        lieCount++;
        if (ans === 0) lieRaw++;
      }
    });

    // Normalize scale values to max 12 (EPI default)
    const extraversion = Math.round((extraversionRaw / (extraCount || 1)) * 12);
    const neuroticism = Math.round((neuroticismRaw / (neuroCount || 1)) * 12);
    const lie = Math.round((lieRaw / (lieCount || 1)) * 12);

    let personalityType = "Неизвестный";
    if (extraversion >= 6.5) {
      personalityType = neuroticism >= 6.5 ? "Холерик" : "Сангвиник";
    } else {
      personalityType = neuroticism >= 6.5 ? "Меланхолик" : "Флегматик";
    }

    return { extraversion, neuroticism, lie, personalityType };
  };

  // Submit results to local client-side generator for diagnostic/career recommendations
  const handleRunAnalysis = async () => {
    setStep("analyzing");
    setIsLoadingAnalysis(true);
    setAnalysisError(null);

    const cattellData = computedCattell();
    const akhrarovaData = computedAkhrarova();
    const eysenckData = computedEysenck();

    try {
      // Simulate highly thorough analytical computation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const responseData: AnalysisResponse = generateClientSideReport(
        cattellData,
        akhrarovaData,
        eysenckData,
        context
      );
      
      setAnalysis(responseData);
      
      // Save all tests and responses so that page refresh persists nicely
      saveStateToLocalStorage("wayoflife_context", context);
      saveStateToLocalStorage("wayoflife_cattell", cattellAnswers);
      saveStateToLocalStorage("wayoflife_akhrarova", akhrarovaAnswers);
      saveStateToLocalStorage("wayoflife_eysenck", eysenckAnswers);
      saveStateToLocalStorage("wayoflife_analysis", responseData);
      
      // Initialize welcome chat message
      const initialChat: Message[] = [
        {
          role: "assistant",
          content: `Здравствуйте! Я ваш профессиональный ИИ-профконсультант площадки **«Путь жизни»**.

Я подробно изучил ваши результаты:
- Вы доминируете в секторе темперамента **${eysenckData.personalityType}** по тесту Айзенка.
- Ваши ведущие профессиональные шкалы: **${Object.entries(akhrarovaData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(x => x[0])
            .join(" и ")}**.

Ниже вы видите список лучших рекомендованных вакансий. Спросите меня о любой из этих профессий! Я могу подсказать, какие навыки развивать, где учиться, как составить сильное резюме или поменять сферу без рисков.`
        }
      ];
      setChatMessages(initialChat);
      saveStateToLocalStorage("wayoflife_messages", initialChat);

      setStep("results");
      setActiveTab("jobs");
    } catch (e: any) {
      console.error(e);
      setAnalysisError(e.message || "Ошибка построения аналитического отчета.");
      setStep("testing");
      setTestSubStep(3); // return back to last wizard page
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Submit message to local client-side interactive advisor generator
  const handleSendChatMessage = async (textToSend?: string) => {
    const rawMessage = textToSend || userInput;
    if (!rawMessage.trim() || isSendingChat) return;

    const query = rawMessage.trim();
    if (!textToSend) setUserInput("");

    const newMessages: Message[] = [...chatMessages, { role: "user" as const, content: query }];
    setChatMessages(newMessages);

    setIsSendingChat(true);

    const cattellData = computedCattell();
    const akhrarovaData = computedAkhrarova();
    const eysenckData = computedEysenck();

    const summaryContext = `
Возрастная группа / Тип ситуации: ${context.userType === 'graduate' ? 'Выпускник школы/вуза' : 'Смена устоявшейся профессии'}
Нынешнее положение: ${context.currentStatus}
Основные боли и страхи: ${context.concerns}
Опросник Айзенка: экстраверсия ${eysenckData.extraversion}/12, нейротизм ${eysenckData.neuroticism}/12 (тип: ${eysenckData.personalityType})
Интересы Ахраровой: ${Object.entries(akhrarovaData).map(([k, v]) => `${k}=${v}`).join(", ")}
Характер по Кеттеллу: ${Object.entries(cattellData).slice(0, 5).map(([k, v]) => `${k}=${v}`).join(", ")}
Предыдущие рекомендации вакансий: ${analysis?.recommendedJobs.map(j => j.name).join(", ")}
`;

    try {
      // Simulate real-time consultant response latency
      await new Promise(resolve => setTimeout(resolve, 800));

      const replyText = generateClientSideChatMessage(
        query,
        newMessages,
        summaryContext,
        context,
        eysenckData,
        akhrarovaData
      );

      const updatedMessages: Message[] = [...newMessages, { role: "assistant" as const, content: replyText }];
      setChatMessages(updatedMessages);
      saveStateToLocalStorage("wayoflife_messages", updatedMessages);
    } catch (e: any) {
      console.error("Chat failure:", e);
      setChatMessages([...newMessages, { role: "assistant" as const, content: "Упс! Произошла техническая заминка. Пожалуйста, попробуйте повторить свой вопрос." }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Clear all states and restart diagnostic test tool
  const handleRestart = () => {
    if (confirm("Вы действительно хотите сбросить свои текущие результаты и начать тестирование заново?")) {
      setCattellAnswers({});
      setAkhrarovaAnswers({});
      setEysenckAnswers({});
      setAnalysis(null);
      setChatMessages([]);
      localStorage.removeItem("wayoflife_cattell");
      localStorage.removeItem("wayoflife_akhrarova");
      localStorage.removeItem("wayoflife_eysenck");
      localStorage.removeItem("wayoflife_analysis");
      localStorage.removeItem("wayoflife_messages");
      setStep("landing");
      setTestSubStep(1);
    }
  };

  // Helper validation to ensure active test categories are fully answered before advancing
  const isCattellComplete = cattellQuestions.every(q => cattellAnswers[q.id] !== undefined);
  const isAkhrarovaComplete = akhrarovaQuestions.every(q => akhrarovaAnswers[q.id] !== undefined);
  const isEysenckComplete = eysenckQuestions.every(q => eysenckAnswers[q.id] !== undefined);

  // Return to top of questions on subtest changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [testSubStep, step]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Platform Navigation Bar */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setStep("landing")}
            className="flex items-center gap-2.5 text-slate-800 hover:opacity-90 transition-all font-bold text-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              ПЖ
            </div>
            <span>Путь жизни</span>
          </button>
          
          <div className="flex items-center gap-3">
            {step === "results" && (
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-red-205 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Сбросить тест
              </button>
            )}
            
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors hidden sm:inline-block"
            >
              Powered by Google Gemini
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        
        {/* LANDING PAGE STEP */}
        {step === "landing" && (
          <LandingHero 
            context={context} 
            onUpdateContext={setContext}
            onStartDiagnostics={() => {
              setStep("testing");
              setTestSubStep(1);
            }} 
          />
        )}

        {/* ACTIVE MULTI-STAGE DIAGNOSTICS WIZARD */}
        {step === "testing" && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Horizontal progress steps indicators */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Психометрическая диагностика
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Шаг {testSubStep} из 3
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-1.5 rounded-full transition-all ${testSubStep >= 1 ? "bg-indigo-600" : "bg-slate-100"}`}></div>
                <div className={`h-1.5 rounded-full transition-all ${testSubStep >= 2 ? "bg-indigo-600" : "bg-slate-100"}`}></div>
                <div className={`h-1.5 rounded-full transition-all ${testSubStep >= 3 ? "bg-indigo-600" : "bg-slate-100"}`}></div>
              </div>

              <div className="flex justify-between items-center text-xs font-medium text-slate-500 pt-1">
                <span className={testSubStep === 1 ? "text-indigo-600 font-bold" : ""}>1. Кеттелл (16PF)</span>
                <span className={testSubStep === 2 ? "text-indigo-600 font-bold" : ""}>2. Проф-интересы</span>
                <span className={testSubStep === 3 ? "text-indigo-600 font-bold" : ""}>3. Айзенк (EPI)</span>
              </div>
            </div>

            {analysisError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-2.5 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="font-extrabold">Ошибка отправки данных:</span> {analysisError}
                </div>
              </div>
            )}

            {/* TEST SUBSTEP 1: CATTELL 16PF ADAPTED SHORTER VERSION */}
            {testSubStep === 1 && (
              <div className="bg-white rounded-3xl border border-slate-205/80 shadow-sm p-6 md:p-8 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800">
                    Методика 1: Личностный опросник Кеттелла (Short 16PF)
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Оцените, насколько указанные утверждения соответствуют вашему повседневному поведению и самоощущению. Нам важно ваше первое искреннее мнение.
                  </p>
                </div>

                <div className="space-y-6">
                  {cattellQuestions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-4 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-3">
                        <span className="text-xs font-mono font-bold text-indigo-500 bg-white w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-800">{q.text}</p>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const labels = ["Нет", "Скорее нет", "Иногда", "Скорее да", "Да"];
                          const isSelected = cattellAnswers[q.id] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setCattellAnswers({ ...cattellAnswers, [q.id]: val });
                              }}
                              className={`py-2 px-1 rounded-xl text-[10px] md:text-xs font-bold text-center border transition-all ${
                                isSelected
                                  ? "bg-indigo-650 text-white border-indigo-600 bg-indigo-600 shadow-sm scale-[1.02]"
                                  : "bg-white border-slate-100 text-slate-500 hover:bg-slate-100/70 hover:text-slate-700"
                              }`}
                            >
                              <div className="font-extrabold text-xs md:text-sm">{val}</div>
                              <div className="hidden md:block opacity-90 mt-0.5">{labels[val - 1]}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Substep navigation controls */}
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("landing")}
                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-650 font-bold text-sm transition-all flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад к целям
                  </button>

                  <button
                    type="button"
                    disabled={!isCattellComplete}
                    onClick={() => setTestSubStep(2)}
                    className={`px-7 py-3 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 ${
                      isCattellComplete
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                        : "bg-slate-200 text-slate-400 pointer-events-none"
                    }`}
                  >
                    Далее <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TEST SUBSTEP 2: AKHRAROVA 2024 VOCATIONAL INTEREST QUESTIONNAIRE */}
            {testSubStep === 2 && (
              <div className="bg-white rounded-3xl border border-slate-205/85 shadow-sm p-6 md:p-8 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800">
                    Методика 2: Опросник профессиональных интересов Ахраровой (2024)
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Определите степень вашей заинтересованности в следующих видах практической и интеллектуальной деятельности. Оценивайте объективный интерес, даже если у вас пока нет опыта в этой области.
                  </p>
                </div>

                <div className="space-y-6">
                  {akhrarovaQuestions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-4 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-3">
                        <span className="text-xs font-mono font-bold text-indigo-505 bg-white w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-emerald-650 border-emerald-100">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-800">
                          {q.text}
                        </p>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const labels = ["Чуждо", "Не очень", "Нейтрально", "Интересно", "Обожаю!"];
                          const isSelected = akhrarovaAnswers[q.id] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setAkhrarovaAnswers({ ...akhrarovaAnswers, [q.id]: val });
                              }}
                              className={`py-2 px-1 rounded-xl text-[10px] md:text-xs font-bold text-center border transition-all ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.02]"
                                  : "bg-white border-slate-100 text-slate-500 hover:bg-slate-100/75 hover:text-slate-755"
                              }`}
                            >
                              <div className="font-extrabold text-xs md:text-sm">{val}</div>
                              <div className="hidden md:block opacity-90 mt-0.5">{labels[val - 1]}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Substep navigation controls */}
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setTestSubStep(1)}
                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-655 font-bold text-sm transition-all flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад к Кеттеллу
                  </button>

                  <button
                    type="button"
                    disabled={!isAkhrarovaComplete}
                    onClick={() => setTestSubStep(3)}
                    className={`px-7 py-3 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 ${
                      isAkhrarovaComplete
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                        : "bg-slate-200 text-slate-400 pointer-events-none"
                    }`}
                  >
                    Далее <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TEST SUBSTEP 3: EYSENCK EPI TEST */}
            {testSubStep === 3 && (
              <div className="bg-white rounded-3xl border border-slate-206/80 shadow-sm p-6 md:p-8 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-800">
                      Методика 3: Личностный опросник Айзенка (EPI)
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Отвечайте «Да» или «Нет» быстро, не задумываясь слишком долго. Здесь нет правильных или неправильных суждений.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {eysenckQuestions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-3">
                        <span className="text-xs font-mono font-bold text-indigo-505 bg-white w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-violet-650 border-violet-100">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                          {q.text}
                        </p>
                      </div>

                      <div className="flex gap-3 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => setEysenckAnswers({ ...eysenckAnswers, [q.id]: 1 })}
                          className={`w-20 py-2.5 rounded-xl font-bold text-xs border tracking-wide transition-all ${
                            eysenckAnswers[q.id] === 1
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm scale-105"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          Да
                        </button>
                        <button
                          type="button"
                          onClick={() => setEysenckAnswers({ ...eysenckAnswers, [q.id]: 0 })}
                          className={`w-20 py-2.5 rounded-xl font-bold text-xs border tracking-wide transition-all ${
                            eysenckAnswers[q.id] === 0
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm scale-105"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          Нет
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Substep navigation controls and Submit */}
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setTestSubStep(2)}
                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-655 font-bold text-sm transition-all flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад к интересам
                  </button>

                  <button
                    type="button"
                    disabled={!isEysenckComplete}
                    onClick={handleRunAnalysis}
                    className={`px-8 py-4 font-extrabold rounded-xl text-white text-sm shadow-md transition-all flex items-center gap-2 ${
                      isEysenckComplete
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-700 hover:to-indigo-850 hover:shadow-lg"
                        : "bg-slate-200 text-slate-400 pointer-events-none shadow-none"
                    }`}
                  >
                    <Sparkles className="w-5 h-5" /> Сформировать ИИ-карту
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOADING ANALYSIS PROCESSING ANIMATION */}
        {step === "analyzing" && (
          <div className="max-w-md mx-auto py-16 text-center space-y-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin z-10"></div>
              <Sparkles className="w-8 h-8 text-indigo-500 absolute animate-pulse" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-slate-950">
                Запущена ИИ-аналитика рынка труда...
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Мы сопоставляем ваши 16 факторов Кеттелла, доминирующие интересы Ахраровой и темперамент Айзенка с актуальной базой рынка труда, вакансий, заработных плат и условий биопсихосоциальной модели психологии.
              </p>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-left text-xs font-mono text-slate-500 space-y-1 max-h-48 overflow-y-auto">
              <div>[ИНФО] Сбор данных Кеттелла 16PF: готово</div>
              <div>[ИНФО] Нормализация шкал EPI: готово ({computedEysenck().personalityType})</div>
              <div>[ИНФО] Расчет профилей Ахраровой: готово</div>
              <div className="text-indigo-600 animate-pulse">[АНАЛИЗ] Формирование персональной структуры в Gemini-3.5-flash...</div>
            </div>
          </div>
        )}

        {/* RESULTS RESULTS AND DETAILED AI RECOMMENDATION */}
        {step === "results" && analysis && (
          <div className="space-y-8">
            
            {/* Header context dashboard */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-550 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
              
              <div className="space-y-3 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ИИ Анализ завершен
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  Профессиональная траектория «Путь жизни»
                </h2>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Профиль адаптирован для роли: <span className="text-white font-bold">{context.userType === 'graduate' ? 'Выпускник' : 'Специалист, меняющий сферу'}</span>. 
                  Откалиброван под запросы рынка труда по состоянию на 2026 год.
                </p>
              </div>

              <div className="flex gap-3 z-10 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 md:flex-none px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold transition-all text-center"
                >
                  Пройти тест заново
                </button>
              </div>
            </div>

            {/* Tab navigation buttons */}
            <div className="flex border-b border-slate-205">
              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "jobs"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Compass className="w-4 h-4" /> 🎯 Вакансии и ИИ-Анализ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("psychology")}
                className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "psychology"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BarChart2 className="w-4 h-4" /> 📊 Психологический Портрет
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("advisor")}
                className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 relative ${
                  activeTab === "advisor"
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> 💬 Чат с Консультантом
                <span className="absolute top-2.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
            </div>

            {/* TAB CONTENT: RECOMMENDED VACANCIES & DETAILED MARKDOWN ASSESSMENT */}
            {activeTab === "jobs" && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Job recommendations list column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                      Ключевые ориентиры карьеры
                    </h3>
                    <p className="text-xs text-slate-500">
                      Профессии подобраны под ваши уникальные психологические метрики и рыночную ценность задач.
                    </p>
                  </div>

                  {analysis.recommendedJobs && analysis.recommendedJobs.map((job, idx) => {
                    const colors = [
                      "border-indigo-100 bg-indigo-50/40 text-indigo-700 hover:border-indigo-200",
                      "border-emerald-110 bg-emerald-50/40 text-emerald-700 hover:border-emerald-200",
                      "border-pink-100 bg-pink-50/40 text-pink-700 hover:border-pink-200"
                    ];
                    return (
                      <div 
                        key={idx} 
                        className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm hover:shadow-md bg-white`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-slate-900">{job.name}</h4>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                                <span className="font-bold text-slate-500">₽</span> {job.salary}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold">
                                Спрос: {job.demand}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-semibold text-slate-400">Совпадение</div>
                            <div className="text-lg font-black text-indigo-600">{job.fit || 85}%</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{job.info}</p>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("advisor");
                            handleSendChatMessage(`Расскажи подробнее, как мне устроиться и что именно изучить для направления "${job.name}"?`);
                          }}
                          className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-center text-xs font-bold text-slate-650 transition-all flex items-center justify-center gap-1.5"
                        >
                          Спросить ИИ про профессию <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* Competitive comparison footer card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-slate-550 text-xs">
                    <span className="font-extrabold text-slate-700 block">💡 Полезный совет:</span>
                    <span>Рекомендуемые зарплаты посчитаны на основе вакансий по всей России. Вы можете детализировать требования по региону в чате.</span>
                  </div>
                </div>

                {/* Detailed psychological portrait generated by Gemini markdown */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      Подробный ИИ-анализ личности
                    </h3>
                    <p className="text-xs text-slate-500">
                      Биопсихосоциальный отчет на основе трех скомбинированных шкал.
                    </p>
                  </div>

                  <div className="prose prose-slate max-w-none text-sm text-slate-750 space-y-4 whitespace-pre-wrap leading-relaxed">
                    {analysis.rawAnalysis}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: COMPREHENSIVE PSYCHOMETRIC TEST PORTRAIT */}
            {activeTab === "psychology" && (
              <div className="space-y-8">
                
                {/* 1. Eysenck coordinate quadrant Temperament chart */}
                <EysenckChart 
                  extraversion={computedEysenck().extraversion}
                  neuroticism={computedEysenck().neuroticism}
                  lieScore={computedEysenck().lie}
                />

                {/* 2. Akhrarova 2024 Interests Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-500" /> Спектр профессиональных интересов Ахраровой (2024)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Оценка вашей тяги к различным группам задач в по шкале от 2 до 10 баллов.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(computedAkhrarova())
                      .sort((a, b) => b[1] - a[1])
                      .map(([domain, score], idx) => {
                        const percent = score * 10;
                        const colors = [
                          "bg-emerald-500", "bg-emerald-400", "bg-indigo-500", "bg-indigo-400",
                          "bg-violet-500", "bg-slate-700", "bg-amber-500", "bg-rose-500"
                        ];
                        const barColor = colors[idx % colors.length];
                        return (
                          <div key={domain} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-slate-800">{domain}</span>
                              <span className="font-mono text-slate-500 font-bold">{score} / 10</span>
                            </div>
                            
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-snug">
                              {akhrarovaDomainDescriptions[domain] || ""}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 3. Cattell 16PF Factors interactive explorer */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-550 text-indigo-500" /> Личностный профиль Кеттелла 16PF (Трактовка)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Нажмите на любую психологическую шкалу факторов личности для ознакомления с расшифровкой низких и высоких значений.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(computedCattell()).map(([factor, score]) => {
                      const details = cattellFactorInfo[factor] || { title: factor, low: "Низкий уровень", high: "Высокий уровень" };
                      // Color weight based on score limits
                      let colorClass = "text-indigo-650 bg-indigo-50 border-indigo-100";
                      if (score <= 3.5) colorClass = "text-amber-700 bg-amber-50 border-amber-100";
                      else if (score >= 7.5) colorClass = "text-emerald-700 bg-emerald-50 border-emerald-100";

                      return (
                        <div key={factor} className={`p-4 rounded-xl border border-slate-100 space-y-3 bg-slate-50/40 hover:bg-slate-50 transition-colors`}>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-white rounded px-1.5 py-0.5 border">
                              Фактор {factor}
                            </span>
                            <span className="text-sm font-black text-slate-800">{score} из 10</span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-slate-800">{details.title}</h5>
                            <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed text-slate-500">
                              <div>
                                <span className="font-extrabold text-amber-705 block text-[9px] uppercase tracking-wider">При низком балле (1-3):</span>
                                {details.low}
                              </div>
                              <div>
                                <span className="font-extrabold text-emerald-705 block text-[9px] uppercase tracking-wider">При высоком балле (7-10):</span>
                                {details.high}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: ADVANCED AI CHAT ADVISOR HELPER */}
            {activeTab === "advisor" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden grid lg:grid-cols-12 min-h-[550px]">
                
                {/* Visual support panel context side */}
                <div className="lg:col-span-4 bg-slate-50 p-6 border-r border-slate-150 space-y-6">
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm">
                      ИИ
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Профориентолог</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Личный ментор для безопасного перехода на новую специальность. Поможет составить план развития.
                    </p>
                  </div>

                  {/* Ready template question clickers */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Популярные вопросы:</span>
                    
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("Какие 3 самых востребованных навыка мне нужно развить прямо сейчас для системного анализа?")}
                      className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-xs font-semibold text-slate-700 transition-all leading-snug"
                    >
                      Какие 3 навыка развить прямо сейчас?
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("Как мне правильно оформить свое резюме, если у меня совсем мало опыта работы по новой специальности?")}
                      className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-xs font-semibold text-slate-700 transition-all leading-snug"
                    >
                      Как правильно оформить резюме без опыта?
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("Существуют ли авторитетные бесплатные курсы или книги для старта по моим рекомендованным направлениям?")}
                      className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-xs font-semibold text-slate-700 transition-all leading-snug"
                    >
                      Порекомендуй бесплатные курсы/книги
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("Помоги детально спланировать переход в новую профессию за 6 месяцев. Какие шаги делать каждый месяц?")}
                      className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-xs font-semibold text-slate-700 transition-all leading-snug"
                    >
                      Пошаговый план перехода за 6 месяцев
                    </button>
                  </div>
                </div>

                {/* Messages feed & interactive form column */}
                <div className="lg:col-span-8 flex flex-col min-h-[450px]">
                  
                  {/* Messages container list */}
                  <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[420px]">
                    {chatMessages.map((msg, idx) => {
                      const isAI = msg.role === "assistant";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
                        >
                          {/* Mini avatar representation */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                            isAI ? "bg-indigo-650 bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {isAI ? "ИИ" : "Я"}
                          </div>
                          
                          <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                            isAI 
                              ? "bg-slate-50 border border-slate-100 text-slate-900 rounded-tl-none" 
                              : "bg-indigo-600 text-white rounded-tr-none shadow-sm font-medium"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}

                    {isSendingChat && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0 animate-pulse">
                          ИИ
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 text-slate-450 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 font-bold">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                          Подождите, ИИ анализирует ваш вопрос...
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef}></div>
                  </div>

                  {/* Submit message input field form bar */}
                  <div className="p-4 border-t border-slate-150 bg-slate-50/50">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Задайте свой вопрос карьерному наставнику..."
                        disabled={isSendingChat}
                        className="flex-grow px-4 py-3 bg-white rounded-xl border border-slate-205 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!userInput.trim() || isSendingChat}
                        className={`px-4 rounded-xl text-white font-bold transition-all flex items-center justify-center ${
                          userInput.trim() && !isSendingChat
                            ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow"
                            : "bg-slate-350 bg-slate-300 pointer-events-none"
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                      Наш консультант помнит все ваши ответы Кеттелла, Айзенка и Ахраровой при составлении индивидуального ответа.
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer footer */}
      <footer className="bg-slate-900 text-white/50 text-xs border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid gap-6 sm:grid-cols-2 md:grid-cols-12 items-baseline">
          
          <div className="md:col-span-5 space-y-3">
            <h5 className="font-extrabold text-white text-sm">«Путь жизни»</h5>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Профессиональный психологический классификатор карьеры. Наше призвание — снизить тревожность выбора, дать научно выверенные инструменты оценки характера и обеспечить плавный мост между устремлениями человека и финансовыми реалиями.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h6 className="font-bold text-white text-[11px] uppercase tracking-wider">Методологическая база</h6>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Психологическая шкала Р. Кеттелла 16PF</li>
              <li>• Опросник Айзенка (EPI Личностный)</li>
              <li>• Опросник О.Н. Ахраровой (Изд. 2024 г.)</li>
              <li>• Биопсихосоциальный подход здоровья</li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-1 text-right self-end">
            <div className="text-white font-semibold text-[11px]">Электронная служба самоопределения 2026</div>
            <p className="text-[10px] text-slate-500">Все права защищены. Все персональные данные обрабатываются локально без сохранения на серверах третьих лиц.</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
