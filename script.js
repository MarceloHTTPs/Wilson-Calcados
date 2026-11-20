// =========================================================
// Wilson Calçados - Scripts
// =========================================================

(function () {
    'use strict';

    var corpo = document.body;
    var cabecalho = document.getElementById('cabecalho');
    var botaoMenu = document.querySelector('.botao-menu');
    var menuPrincipal = document.getElementById('menu-principal');
    var secaoInicio = document.getElementById('inicio');
    var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----- Ano atual no rodapé -----
    var anoAtual = document.getElementById('ano-atual');
    if (anoAtual) anoAtual.textContent = new Date().getFullYear();

    // ----- Animação de entrada do topo -----
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            corpo.classList.add('pagina-carregada');
        });
    });

    // ----- Fotos que ainda não existem na pasta Imagem -----
    // Mostra a moldura com o nome da categoria no lugar da foto quebrada.
    document.querySelectorAll('.moldura-imagem img:not(.carrossel-fotos__imagem)').forEach(function (imagem) {
        var marcarAusente = function () {
            imagem.closest('.moldura-imagem').classList.add('imagem-ausente');
        };
        if (imagem.complete && imagem.naturalWidth === 0) {
            marcarAusente();
        } else {
            imagem.addEventListener('error', marcarAusente, { once: true });
        }
    });

    // ----- Menu do celular -----
    function abrirFecharMenu(abrir) {
        botaoMenu.setAttribute('aria-expanded', String(abrir));
        botaoMenu.querySelector('.texto-leitor').textContent = abrir ? 'Fechar menu' : 'Abrir menu';
        menuPrincipal.classList.toggle('menu-principal--aberto', abrir);
        corpo.style.overflow = abrir ? 'hidden' : '';
    }

    botaoMenu.addEventListener('click', function () {
        abrirFecharMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
    });

    menuPrincipal.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { abrirFecharMenu(false); });
    });

    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && menuPrincipal.classList.contains('menu-principal--aberto')) {
            abrirFecharMenu(false);
            botaoMenu.focus();
        }
    });

    // ----- Cabeçalho: some ao descer, volta ao subir -----
    var ultimaPosicao = 0;
    var aguardandoQuadro = false;
    var midiaInicio = document.querySelectorAll('.secao-inicio__midia img');

    function aoRolar() {
        var posicao = window.scrollY;
        var menuAberto = menuPrincipal.classList.contains('menu-principal--aberto');

        cabecalho.classList.toggle('cabecalho--rolado', posicao > 10);

        if (!menuAberto) {
            var descendo = posicao > ultimaPosicao && posicao > 400;
            cabecalho.classList.toggle('cabecalho--oculto', descendo);
        }

        // Leve efeito de profundidade na foto principal (só no computador)
        if (midiaInicio.length && !menosMovimento && window.innerWidth > 960 && posicao < window.innerHeight) {
            var deslocamento = 'translateY(' + (posicao * 0.12).toFixed(1) + 'px) scale(1.06)';
            midiaInicio.forEach(function (imagem) { imagem.style.transform = deslocamento; });
        }

        ultimaPosicao = posicao;
        aguardandoQuadro = false;
    }

    window.addEventListener('scroll', function () {
        if (!aguardandoQuadro) {
            aguardandoQuadro = true;
            requestAnimationFrame(aoRolar);
        }
    }, { passive: true });
    aoRolar();

    // ----- Link do menu ativo conforme a seção na tela -----
    var linksMenu = document.querySelectorAll('.menu-principal__link');
    var secoesMenu = Array.prototype.map.call(linksMenu, function (link) {
        return document.querySelector(link.getAttribute('href'));
    });

    if ('IntersectionObserver' in window) {
        var observadorMenu = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) return;
                linksMenu.forEach(function (link, indice) {
                    link.classList.toggle('menu-principal__link--ativo', secoesMenu[indice] === entrada.target);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        secoesMenu.forEach(function (secao) { if (secao) observadorMenu.observe(secao); });
    }

    // ----- Revelar conteúdo ao rolar -----
    var elementosTexto = document.querySelectorAll(
        '.secao__topo, .secao-sobre__texto, .secao-avaliacoes__resumo, .cartao-avaliacao, .secao-localizacao__info, .cartao-produto'
    );
    elementosTexto.forEach(function (elemento) { elemento.classList.add('revelar'); });

    // Pequeno atraso em sequência para itens lado a lado
    document.querySelectorAll('.grade-categorias .revelar-imagem').forEach(function (elemento, indice) {
        elemento.style.setProperty('--atraso', (indice % 3) * 0.08 + 's');
    });
    document.querySelectorAll('.cartao-produto').forEach(function (elemento, indice) {
        elemento.style.setProperty('--atraso', Math.min(indice, 4) * 0.07 + 's');
    });
    document.querySelectorAll('.cartao-avaliacao').forEach(function (elemento, indice) {
        elemento.style.setProperty('--atraso', (indice % 2) * 0.08 + 's');
    });

    var elementosRevelar = document.querySelectorAll('.revelar, .revelar-imagem');

    if (!('IntersectionObserver' in window) || menosMovimento) {
        elementosRevelar.forEach(function (elemento) { elemento.classList.add('visivel'); });
    } else {
        // As imagens começam recortadas (clip-path), e um elemento recortado pode não ser
        // detectado na tela. Por isso observamos o elemento "pai" (o cartão) no lugar delas.
        var alvoDe = new Map();
        elementosRevelar.forEach(function (elemento) {
            var alvo = elemento.classList.contains('revelar-imagem')
                ? (elemento.closest('.cartao-categoria') || elemento.parentElement)
                : elemento;
            if (!alvoDe.has(alvo)) alvoDe.set(alvo, []);
            alvoDe.get(alvo).push(elemento);
        });

        var observadorRevelar = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    alvoDe.get(entrada.target).forEach(function (elemento) { elemento.classList.add('visivel'); });
                    observadorRevelar.unobserve(entrada.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

        alvoDe.forEach(function (lista, alvo) { observadorRevelar.observe(alvo); });
    }

    // ----- Carrossel automático nos cartões de categoria -----
    var TEMPO_SLIDE = 3800; // tempo de cada foto, em milissegundos

    document.querySelectorAll('.carrossel-fotos').forEach(function (moldura, indiceCartao) {
        var imagens = Array.prototype.slice.call(moldura.querySelectorAll('.carrossel-fotos__imagem'));

        // Tira do carrossel qualquer foto que não carregar
        imagens.forEach(function (imagem) {
            imagem.addEventListener('error', function () {
                imagem.remove();
                imagens = imagens.filter(function (item) { return item !== imagem; });
            }, { once: true });
        });

        if (imagens.length < 2) return;

        // As barrinhas ficam no cartão da categoria, ou na própria foto (no topo do site)
        var cartao = moldura.closest('.cartao-categoria') || moldura;
        var indicadores = document.createElement('div');
        indicadores.className = 'carrossel-fotos__indicadores';
        indicadores.setAttribute('aria-hidden', 'true');
        indicadores.style.setProperty('--tempo-slide', TEMPO_SLIDE / 1000 + 's');
        imagens.forEach(function () {
            var barra = document.createElement('span');
            barra.className = 'carrossel-fotos__indicador';
            indicadores.appendChild(barra);
        });
        cartao.appendChild(indicadores);

        var atual = 0;
        var temporizador = null;

        function mostrar(indice) {
            imagens[atual].classList.remove('ativa');
            atual = indice % imagens.length;
            imagens[atual].classList.add('ativa');

            var barras = indicadores.children;
            for (var i = 0; i < barras.length; i++) {
                barras[i].classList.toggle('carrossel-fotos__indicador--visto', i < atual);
                barras[i].classList.remove('carrossel-fotos__indicador--atual');
            }
            // força o navegador a reiniciar a animação da barra atual
            void barras[atual].offsetWidth;
            barras[atual].classList.add('carrossel-fotos__indicador--atual');
        }

        function iniciar() {
            if (temporizador || menosMovimento) return;
            indicadores.classList.remove('carrossel-fotos__indicadores--pausado');
            mostrar(atual);
            temporizador = setInterval(function () { mostrar(atual + 1); }, TEMPO_SLIDE);
        }

        function parar() {
            clearInterval(temporizador);
            temporizador = null;
            indicadores.classList.add('carrossel-fotos__indicadores--pausado');
        }

        mostrar(0);
        indicadores.classList.add('carrossel-fotos__indicadores--pausado');

        // Cada cartão começa num momento diferente, para não trocarem todos juntos
        var atrasoInicial = indiceCartao * 450;

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entradas) {
                entradas.forEach(function (entrada) {
                    if (entrada.isIntersecting) {
                        setTimeout(iniciar, atrasoInicial);
                        atrasoInicial = 0;
                    } else {
                        parar();
                    }
                });
            }, { threshold: 0.2 }).observe(cartao);
        } else {
            iniciar();
        }
    });

    // ----- Botão "Ver mais novidades" (celular) -----
    var botaoMais = document.querySelector('.vitrine-novidades__mais');
    if (botaoMais) {
        botaoMais.addEventListener('click', function () {
            var vitrineNovidades = document.querySelector('.vitrine-novidades');
            vitrineNovidades.classList.add('vitrine-novidades--aberta');
            botaoMais.setAttribute('aria-expanded', 'true');
            // os cartões que aparecem agora já entram visíveis
            vitrineNovidades.querySelectorAll('.cartao-produto').forEach(function (cartao) { cartao.classList.add('visivel'); });
        });
    }

    // ----- Setas da vitrine de novidades -----
    var vitrine = document.querySelector('.vitrine-novidades');
    document.querySelectorAll('.controles-vitrine__botao').forEach(function (botao) {
        botao.addEventListener('click', function () {
            var cartao = vitrine.querySelector('.cartao-produto');
            var passo = cartao ? cartao.offsetWidth + 18 : 300;
            vitrine.scrollBy({ left: passo * Number(botao.dataset.direcao), behavior: menosMovimento ? 'auto' : 'smooth' });
        });
    });
})();
