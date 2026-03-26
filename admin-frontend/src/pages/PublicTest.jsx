import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, AlertCircle, Loader2, Send, ClipboardCheck } from 'lucide-react';

const QUESTIONS = [
  "Parece muito mais inquieta em situações sociais do que quando está sozinha.",
  "As expressões em seu rosto não combinam com o que está dizendo.",
  "Parece confiante (ou segura) quando está interagindo com outras pessoas.",
  "Quando há sobrecarga de estímulos, apresenta padrões rígidos ou inflexíveis de comportamento.",
  "Não percebe quando os outros estão tentando tirar vantagem dela.",
  "Prefere estar sozinha do que com os outros.",
  "Demonstra perceber o que os outros estão pensando ou sentindo.",
  "Se comporta de maneira estranha ou bizarra.",
  "Fica próxima a adultos, parece ser muito dependente deles.",
  "Leva as coisas muito 'ao pé da letra' e não compreende o real significado.",
  "É autoconfiante.",
  "É capaz de comunicar seus sentimentos para as outras pessoas.",
  "É estranha na 'tomada de vez' das interações (reciprocidade).",
  "Não tem boa coordenação.",
  "É capaz de entender o tom de voz e as expressões faciais.",
  "Evita o contato visual ou tem contato visual diferente.",
  "Reconhece quando algo é injusto.",
  "Tem dificuldade em fazer amigos, mesmo tentando dar o melhor de si.",
  "Fica frustrada quando não consegue expressar suas ideias.",
  "Mostra interesses sensoriais incomuns ou formas estranhas de brincar.",
  "É capaz de imitar as ações de outras pessoas.",
  "Brinca adequadamente com crianças da sua idade.",
  "Não participa de atividades em grupo a menos que seja convidada.",
  "Tem mais dificuldade do que outras crianças com mudanças na rotina.",
  "Não parece se importar em estar fora de sintonia ou em um 'mundo' diferente.",
  "Oferece conforto para os outros quando estão tristes.",
  "Evita iniciar interações sociais com seus colegas ou adultos.",
  "Pensa ou fala sobre a mesma coisa repetidamente."
];

export default function PublicTest() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [respondente, setRespondente] = useState('');
  const [answers, setAnswers] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const questionRefs = useRef([]);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.get(`/api/testes/validar/${token}`);
        if (response.data.success) {
          setValid(true);
          setPaciente(response.data.link);
        } else {
          setError(response.data.message || 'Link inválido');
        }
      } catch (err) {
        setError('Erro ao validar o link. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleAnswer = (qIdx, value) => {
    setAnswers(prev => ({ ...prev, [`q${qIdx + 1}`]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!respondente) {
      setSubmitError('Por favor, informe seu nome antes de enviar.');
      return;
    }
    if (Object.keys(answers).length < QUESTIONS.length) {
      // Encontrar a primeira questão não respondida e rolar até ela
      const firstMissing = QUESTIONS.findIndex((_, idx) => !answers[`q${idx + 1}`]);
      if (firstMissing !== -1 && questionRefs.current[firstMissing]) {
        questionRefs.current[firstMissing].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setSubmitError(`Você respondeu ${Object.keys(answers).length} de ${QUESTIONS.length} questões. Por favor, responda todas.`);
      return;
    }

    // Ordenar respostas pela numeração da questão (q1, q2, ... q34)
    const answersOrdenados = Object.fromEntries(
      Object.entries(answers)
        .sort(([a], [b]) => parseInt(a.replace('q', '')) - parseInt(b.replace('q', '')))
    );

    setSubmitting(true);
    try {
      await axios.post('/api/testes/submeter', {
        token,
        paciente_id: paciente.paciente_id,
        dados_json: { ...answersOrdenados, respondente_nome: respondente }
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError('Erro ao enviar. Verifique sua conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium tracking-wide">Validando seu acesso...</p>
      </div>
    );
  }

  if (error || !valid) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-rose-100 max-w-md w-full">
          <AlertCircle className="h-20 w-20 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Ops! Problema no Link</h2>
          <p className="text-slate-500 leading-relaxed mb-8">{error || 'Este link expirou ou já foi utilizado.'}</p>
          <p className="text-sm text-slate-400">Por favor, entre em contato com a <b>Dra. Karol Silva</b> para um novo link.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full animate-in zoom-in duration-500">
          <div className="bg-teal-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Concluído!</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            Muito obrigado por preencher a avaliação de <b>{paciente?.paciente_nome}</b>. As informações foram enviadas com segurança para a clínica.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Você já pode fechar esta aba</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-1">Avaliação SRS-2</p>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Paciente: <span className="text-teal-600">{paciente?.paciente_nome}</span>
              </h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-300 tracking-tighter">{progress}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        {/* Intro */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-sky-100 p-3 rounded-2xl">
              <ClipboardCheck className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Instruções</h2>
              <p className="text-slate-500 text-sm leading-relaxed mt-1">
                Por favor, descreva o comportamento da criança nos <b>últimos 6 meses</b>. 
                Selecione o nível de verdade para cada afirmação abaixo.
              </p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Seu Nome Completo (Respondente)</label>
            <input 
              type="text" 
              value={respondente}
              onChange={(e) => setRespondente(e.target.value)}
              placeholder="Ex: Maria Oliveira"
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all bg-slate-50/50"
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div 
              key={idx}
              ref={el => questionRefs.current[idx] = el}
              className={`group bg-white p-8 rounded-[2rem] border transition-all duration-300 ${
                answers[`q${idx + 1}`] ? 'border-teal-200 shadow-teal-500/5' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex gap-4">
                <span className="text-xs font-black text-slate-300 mt-1">{String(idx + 1).padStart(2, '0')}</span>
                <p className="text-slate-700 font-medium leading-relaxed">{q}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {[
                  { v: 1, l: "Não é verdade" },
                  { v: 2, l: "Às vezes verdade" },
                  { v: 3, l: "Muitas vezes" },
                  { v: 4, l: "Sempre verdade" }
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => handleAnswer(idx, opt.v)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      parseInt(answers[`q${idx + 1}`]) === opt.v
                        ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105'
                        : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-lg font-black">{opt.v}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-center">{opt.l}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Erro de submissão inline */}
        {submitError && (
          <div className="mt-6 flex items-start gap-4 p-5 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertCircle className="h-6 w-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-rose-700 font-semibold text-sm leading-relaxed">{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 group">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 ${
              submitting 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-teal-500 text-white shadow-teal-500/30 hover:bg-teal-600 hover:-translate-y-1'
            }`}
          >
            {submitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Send className="h-6 w-6" />
                Finalizar e Enviar
              </>
            )}
          </button>
          <p className="text-center text-slate-400 text-xs mt-6 font-medium uppercase tracking-[0.2em]">
            Sua resposta será enviada para Dra. Karol Silva
          </p>
        </div>
      </div>
    </div>
  );
}
