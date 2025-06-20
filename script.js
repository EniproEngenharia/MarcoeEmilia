document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos principais das duas visões
    const gridView = document.getElementById('grid-view');
    const detailView = document.getElementById('detail-view');

    // Elementos da Visão de Grade
    const roomCards = document.querySelectorAll('.room-card');

    // Elementos da Visão de Detalhe
    const backToGridBtn = document.getElementById('back-to-grid-btn');
    const detailSlides = document.querySelectorAll('#presentation-container .slide');

    // Função para mostrar a visão de detalhes de um cômodo específico
    function showDetailView(roomIndex) {
        // Esconde a grade e mostra a tela de detalhes
        gridView.classList.remove('active-view');
        detailView.classList.add('active-view');

        // Mostra o slide de detalhe correto correspondente ao card clicado
        detailSlides.forEach(slide => {
            if (slide.dataset.slideIndex === roomIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Rola a página para o topo
        window.scrollTo(0, 0);
    }

    // Função para voltar à visão do painel
    function showGridView() {
        // Esconde os detalhes e mostra a grade
        detailView.classList.remove('active-view');
        gridView.classList.add('active-view');
    }

    // Adiciona o evento de clique para cada card de cômodo
    roomCards.forEach(card => {
        card.addEventListener('click', () => {
            const roomIndex = card.dataset.roomIndex;
            showDetailView(roomIndex);
        });
    });

    // Adiciona o evento de clique para o botão "Voltar"
    backToGridBtn.addEventListener('click', showGridView);
});