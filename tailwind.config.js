/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}",
        "./index.html"
    ],
    theme: {
        extend: {
            colors: {
                fundo: '#16161a',
                card: '#dfcdbb',
                logo:"#3b51e3",
                "logo-hover": "#6587ff",
                texto: '#009dfb',
                detalhe: '#94a1b2',
                primaria: '#7f5af0',
                operacao: '#3b82f6',
                sucesso: '#2cb67d'
            }
        }
    },
    plugins: [],
}

