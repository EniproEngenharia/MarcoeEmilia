document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const editorView = document.getElementById('editor-view');
    const viewerView = document.getElementById('viewer-view');
    const categoriesContainer = document.getElementById('categories-container');
    const viewerContainer = document.getElementById('viewer-container');
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryNameInput = document.getElementById('category-name-input');
    
    // Elementos do Modal de Formulário
    const showCardModalBtn = document.getElementById('show-card-modal-btn');
    const addCardModal = document.getElementById('add-card-modal');
    const addCardForm = document.getElementById('add-card-form');
    const cancelCardBtn = document.getElementById('cancel-card-btn');
    const cardCategorySelect = document.getElementById('card-category');
    const modalTitle = document.getElementById('modal-title');
    const saveCardBtn = document.getElementById('save-card-btn');
    const cardIdEditInput = document.getElementById('card-id-edit');

    // Elementos do Modal de Imagem
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const modalImage = document.getElementById('modal-image');
    const closeImageModalBtn = document.querySelector('.close-image-modal');


    // --- ESTADO DA APLICAÇÃO ---
    let data = JSON.parse(localStorage.getItem('productData')) || [];

    // --- FUNÇÕES ---

    // Salva os dados no localStorage
    const saveData = () => {
        localStorage.setItem('productData', JSON.stringify(data));
    };

    // Renderiza a aplicação inteira
    const render = () => {
        categoriesContainer.innerHTML = '';
        viewerContainer.innerHTML = '';
        
        if (data.length === 0) {
            categoriesContainer.innerHTML = '<p>Nenhum ambiente criado ainda. Adicione um acima.</p>';
            viewerContainer.innerHTML = '<p>Nenhum produto para visualização no momento.</p>';
        }

        data.forEach(category => {
            // Cria seção da categoria para o EDITOR
            const categorySectionEditor = document.createElement('section');
            categorySectionEditor.className = 'category-section';
            categorySectionEditor.innerHTML = `<h2>${category.name}</h2><div class="cards-grid"></div>`;
            categoriesContainer.appendChild(categorySectionEditor);
            
            // Cria seção da categoria para o VISUALIZADOR
            const categorySectionViewer = document.createElement('section');
            categorySectionViewer.className = 'category-section';
            categorySectionViewer.innerHTML = `<h2>${category.name}</h2><div class="cards-grid"></div>`;
            viewerContainer.appendChild(categorySectionViewer);

            const cardsGridEditor = categorySectionEditor.querySelector('.cards-grid');
            const cardsGridViewer = categorySectionViewer.querySelector('.cards-grid');

            category.cards.forEach(card => {
                // Renderiza card no editor (com botões de editar/excluir)
                cardsGridEditor.appendChild(createCardElement(card, false));
                // Renderiza card no visualizador (com botões de aprovar/reprovar)
                cardsGridViewer.appendChild(createCardElement(card, true));
            });
        });

        updateCategoryDropdown();
    };

    // Cria o elemento HTML de um card
    const createCardElement = (card, isViewer) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.id = card.id;

        // Conteúdo principal do card (imagem, descrição)
        cardDiv.innerHTML = `
            <img src="${card.image}" alt="${card.description}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f2eee9/5a7d7c?text=Imagem';">
            <div class="card-content">
                <h3>${card.description}</h3>
                <p>Quantidade: ${card.quantity}</p>
            </div>
        `;

        // Adiciona botões específicos para cada visualização
        if (isViewer) {
            // Botões para o Cliente: Aprovar/Reprovar
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions-viewer';
            actionsDiv.innerHTML = `
                <button class="approve-btn">Aprovado</button>
                <button class="reject-btn">Reprovado</button>
            `;
            cardDiv.appendChild(actionsDiv);
        } else {
            // Botões para o Editor: Editar/Excluir
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions-editor';
            actionsDiv.innerHTML = `
                <button class="edit-btn" title="Editar">&#9998;</button> <!-- Lápis -->
                <button class="delete-btn" title="Excluir">&times;</button> <!-- X -->
            `;
            cardDiv.appendChild(actionsDiv);
        }
        return cardDiv;
    };
    
    // Atualiza o dropdown de categorias no modal de formulário
    const updateCategoryDropdown = () => {
        const hasCategories = data.length > 0;
        showCardModalBtn.style.display = hasCategories ? 'inline-block' : 'none';
        cardCategorySelect.innerHTML = '';

        if (!hasCategories) {
            cardCategorySelect.innerHTML = '<option disabled>Crie um ambiente primeiro</option>';
        } else {
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                cardCategorySelect.appendChild(option);
            });
        }
    };

    // Abre o modal de formulário
    const openFormModal = (cardId = null) => {
        addCardForm.reset();
        if (cardId) {
            // Modo de Edição
            modalTitle.textContent = 'Editar Produto';
            saveCardBtn.textContent = 'Salvar Alterações';
            cardIdEditInput.value = cardId;

            // Encontra o card e preenche o formulário
            let cardToEdit, categoryOfCard;
            for(const category of data) {
                const foundCard = category.cards.find(c => c.id === cardId);
                if (foundCard) {
                    cardToEdit = foundCard;
                    categoryOfCard = category;
                    break;
                }
            }

            if (cardToEdit) {
                document.getElementById('card-category').value = categoryOfCard.name;
                document.getElementById('card-image').value = cardToEdit.image;
                document.getElementById('card-quantity').value = cardToEdit.quantity;
                document.getElementById('card-description').value = cardToEdit.description;
            }
        } else {
            // Modo de Adição
            modalTitle.textContent = 'Adicionar Novo Produto';
            saveCardBtn.textContent = 'Salvar Produto';
            cardIdEditInput.value = '';
        }
        addCardModal.style.display = 'flex';
    };

    // Fecha o modal de formulário
    const closeFormModal = () => {
        addCardModal.style.display = 'none';
    };

    // --- Funções do Modal de Imagem ---
    const openImageModal = (src) => {
        modalImage.src = src;
        imageViewerModal.style.display = 'flex';
    };

    const closeImageModal = () => {
        imageViewerModal.style.display = 'none';
    };

    // --- MANIPULADORES DE EVENTOS ---

    // Adicionar nova categoria
    addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryName = categoryNameInput.value.trim();
        if (categoryName && !data.some(cat => cat.name === categoryName)) {
            data.push({ name: categoryName, cards: [] });
            saveData();
            render();
            categoryNameInput.value = '';
        } else {
            alert('Nome de ambiente inválido ou já existente.');
        }
    });

    // Abrir o modal para ADICIONAR card
    showCardModalBtn.addEventListener('click', () => openFormModal());

    // Fechar o modal de formulário
    cancelCardBtn.addEventListener('click', closeFormModal);

    // Salvar card (novo ou editado)
    addCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cardId = cardIdEditInput.value;
        const newCategoryName = document.getElementById('card-category').value;
        const cardData = {
            id: cardId || 'card-' + Date.now(),
            image: document.getElementById('card-image').value,
            quantity: document.getElementById('card-quantity').value,
            description: document.getElementById('card-description').value
        };

        if (cardId) {
            // Editando um card existente: remove o card da categoria antiga
            data.forEach(cat => {
                const cardIndex = cat.cards.findIndex(c => c.id === cardId);
                if(cardIndex > -1) {
                    cat.cards.splice(cardIndex, 1);
                }
            });
        } 
        
        // Adiciona o card (novo ou movido) à categoria correta
        const newCategory = data.find(cat => cat.name === newCategoryName);
        if (newCategory) {
            newCategory.cards.push(cardData);
        }

        saveData();
        render();
        closeFormModal();
    });

    // Ações no container do EDITOR (Editar/Excluir)
    categoriesContainer.addEventListener('click', (e) => {
        const cardElement = e.target.closest('.card');
        if (!cardElement) return;

        const cardId = cardElement.dataset.id;
        
        if (e.target.classList.contains('edit-btn')) {
            openFormModal(cardId);
        }

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                data.forEach(category => {
                    category.cards = category.cards.filter(card => card.id !== cardId);
                });
                saveData();
                render();
            }
        }
    });

    // Ações no container do CLIENTE (Aprovar/Reprovar/Ver Imagem)
    viewerView.addEventListener('click', (e) => {
        const cardElement = e.target.closest('.card');
        if (!cardElement) return;

        // Se clicar na IMAGEM do card, abre o modal de imagem
        if (e.target.tagName === 'IMG') {
            openImageModal(e.target.src);
            return; 
        }

        // Se clicar nos botões de ação
        if (e.target.classList.contains('approve-btn')) {
            cardElement.classList.remove('rejected');
            cardElement.classList.add('approved');
        } else if (e.target.classList.contains('reject-btn')) {
            cardElement.classList.remove('approved');
            cardElement.classList.add('rejected');
        }
    });

    // Eventos do Modal de Imagem
    closeImageModalBtn.addEventListener('click', closeImageModal);

    imageViewerModal.addEventListener('click', (e) => {
        // Fecha o modal se o clique for no fundo (overlay) e não na imagem
        if (e.target === imageViewerModal) {
            closeImageModal();
        }
    });


    // --- INICIALIZAÇÃO ---
    const init = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'true') {
            editorView.style.display = 'none';
            viewerView.style.display = 'block';
        } else {
            editorView.style.display = 'block';
            viewerView.style.display = 'none';
        }
        render();
    };

    init();
});
