'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  DollarSign, 
  TrendingUp, 
  Users, 
  BarChart3,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';

export default function HomePage() {
  // Landing Page
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/images/logo01.png"
              alt="eTE$OURO Logo"
              width={120}
              height={40}
              className="h-6 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
            >
              Cadastre-se
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 rounded-3xl py-12 lg:py-14 px-6 md:px-10 lg:px-14">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
                  Controle suas finanças com{' '}
                  <span className="text-yellow-600">eTE$OURO</span>
                </h1>
                <p className="text-base text-gray-600 mb-8">
                  A solução completa para gerenciar receitas, despesas e evitar endividamento.
                  Ideal para indivíduos, famílias e grupos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-7 py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-base"
                  >
                    Começar agora
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-7 py-3 rounded-lg transition-colors border-2 border-gray-300 text-base inline-flex items-center justify-center"
                  >
                    Já tenho conta
                  </Link>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/mockup-projeto.png"
                  alt="Mockups de versões mobile e web do eTE$OURO"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que é o eTE$OURO */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que é o eTE$OURO?
            </h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              Uma plataforma inteligente de controle financeiro que ajuda você a organizar suas finanças pessoais, 
              familiares ou de grupos de forma simples e eficiente.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Para quem é indicado?
              </h3>
              <ul className="space-y-4 text-base text-gray-600">
                <li className="flex items-start gap-3">
                  <Check className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                  <span><strong className="text-gray-900">Indivíduos</strong> que querem ter controle total sobre suas finanças</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                  <span><strong className="text-gray-900">Famílias</strong> que precisam organizar receitas e despesas coletivas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                  <span><strong className="text-gray-900">Grupos</strong> como amigos, colegas de trabalho ou investidores</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                  <span><strong className="text-gray-900">Qualquer pessoa</strong> que quer evitar endividamento e construir patrimônio</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Principais funcionalidades
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <DollarSign className="text-yellow-600" size={20} />
                  <span>Controle de receitas e despesas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Users className="text-yellow-600" size={20} />
                  <span>Gestão de grupos e membros</span>
                </li>
                <li className="flex items-center gap-3">
                  <BarChart3 className="text-yellow-600" size={20} />
                  <span>Relatórios e análises financeiras</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="text-yellow-600" size={20} />
                  <span>Limites de orçamento personalizados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="text-yellow-600" size={20} />
                  <span>Dados seguros e privados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-100 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o eTE$OURO?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Controle de Orçamento - Ocupa 2 colunas */}
            <div className="bg-white rounded-2xl p-8 sm:col-span-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Controle de Orçamento</h3>
              <p className="text-base text-gray-600 text-center">
                Defina limites personalizados por categoria e receba alertas para manter suas finanças sob controle.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Zap className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Simples e Intuitivo</h3>
              <p className="text-base text-gray-600 text-center">
                Interface amigável que qualquer pessoa consegue usar, sem complicações ou termos técnicos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Smartphone className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Multiplataforma</h3>
              <p className="text-base text-gray-600 text-center">
                Acesse pelo celular ou computador. Seus dados sincronizados em todos os dispositivos.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Users className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Gestão Colaborativa</h3>
              <p className="text-base text-gray-600 text-center">
                Crie grupos, adicione membros e gerencie finanças compartilhadas com controle total.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <BarChart3 className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Relatórios Completos</h3>
              <p className="text-base text-gray-600 text-center">
                Visualize gráficos, relatórios detalhados e análises para tomar decisões financeiras inteligentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Planos e Preços
          </h2>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-gray-900">R$ 19,90</span>
                <span className="text-2xl text-gray-600">/mês</span>
              </div>
              <p className="text-base text-gray-600 mb-8">
                Planos flexíveis e acessíveis para você e sua família.
              </p>
              <ul className="text-left max-w-md mx-auto space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-yellow-600 flex-shrink-0" size={24} />
                  <span className="text-gray-700">Todas as funcionalidades incluídas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-yellow-600 flex-shrink-0" size={24} />
                  <span className="text-gray-700">Sem limites de transações</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-yellow-600 flex-shrink-0" size={24} />
                  <span className="text-gray-700">Grupos ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-yellow-600 flex-shrink-0" size={24} />
                  <span className="text-gray-700">Suporte completo</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-yellow-600 flex-shrink-0" size={24} />
                  <span className="text-gray-700">Apenas R$ 19,90/mês</span>
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-4 rounded-lg transition-colors text-base"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </section>

      {/* Como Aderir */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Como aderir ao eTE$OURO?
            </h2>
            <p className="text-sm text-gray-600">
              É rápido, fácil e totalmente gratuito!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cadastre-se</h3>
              <p className="text-base text-gray-600">
                Crie sua conta em menos de 2 minutos. Basta informar nome, email e senha.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personalize</h3>
              <p className="text-base text-gray-600">
                Configure suas categorias preferidas e crie grupos se quiser compartilhar com outras pessoas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comece a usar</h3>
              <p className="text-base text-gray-600">
                Adicione suas receitas e despesas, acompanhe relatórios e mantenha suas finanças organizadas!
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="inline-flex bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-4 rounded-lg transition-colors text-base items-center justify-center gap-2 mx-auto"
            >
              Cadastrar-se agora
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <Image
            src="/images/logo01.png"
            alt="eTe$ouro Logo"
            width={160}
            height={50}
            className="h-12 w-auto mx-auto mb-6 brightness-0 invert"
          />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Pronto para transformar suas finanças?
          </h2>
          <p className="text-sm text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a dezenas de pessoas que já estão no controle das suas finanças com o eTE$OURO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base inline-flex items-center justify-center gap-2"
            >
              Criar conta gratuita
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base border-2 border-gray-700"
            >
              Fazer login
            </Link>
          </div>
          <p className="mt-8 text-gray-400">
            © 2025 eTE$OURO. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
