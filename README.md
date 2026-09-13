# OFÍCIO Barbearia

Landing page conceito (portfólio Mirai) de uma barbearia de bairro em Pinheiros.
Nome, barbeiros, endereço, telefone, políticas e depoimentos são fictícios.

HTML, CSS e JS puros, sem build. Única dependência: [Lenis](https://github.com/darkroomengineering/lenis)
(rolagem suave), hospedada localmente em `assets/js/vendor/`.

## Estrutura

```
index.html
assets/css/style.css     sistema visual + motion (comentado)
assets/js/main.js        rolagem, menu, revelação no scroll, formulário → WhatsApp
assets/fonts/            Montserrat e Bebas Neue estáticas (self-hosted)
assets/img/              fotos em WebP, dois tamanhos cada
assets/img/film/         quadros da tira de filme
tools/                   geração e conversão das fotos (não precisa ir pro ar)
```

## Rodar localmente

```
python -m http.server 8765
```

e abrir `http://127.0.0.1:8765`. Abrir o `index.html` direto (`file://`) quebra as
fontes: o navegador bloqueia fonte local por CORS nesse modo.

## Fotos provisórias

Os quadros da tira de filme e a cópia impressa pequena ("A casa") ainda são
recortes das fotos principais, e alguns se repetem. Pra gerar as definitivas,
com o ComfyUI aberto:

```
node tools/fotos-salao.mjs
python tools/converter-fotos.py
```

Os nomes de arquivo se mantêm, então o HTML não muda. Depois de trocar,
revisar o `alt` de cada quadro no `index.html`.

## Antes de publicar

- Número de WhatsApp real: `data-whats` no formulário e os links `wa.me/5500000000000`.
- Endereço e telefone reais (faixa de informações, "Onde estamos", rodapé).
- `og:image` com URL absoluta do domínio final; criar `sitemap.xml`.
- Instalar analytics (GA4 ou similar) — sem isso não dá pra medir quantos clicam em agendar.
