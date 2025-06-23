// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyD8sNfGilLum2rnN7Qt1fBRP4ONhzemWNE",
  authDomain: "guilherme-2a3f3.firebaseapp.com",
  databaseURL: "https://guilherme-2a3f3-default-rtdb.firebaseio.com",
  projectId: "guilherme-2a3f3",
  storageBucket: "guilherme-2a3f3.appspot.com",
  messagingSenderId: "60682599861",
  appId: "1:60682599861:web:c74a9aaa7651d14cbd2dfc",
  measurementId: "G-MZSHRPP56K"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


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
    let data = [];

    // --- FUNÇÕES ---

    // Salva a estrutura de dados completa no Firebase
    const saveData = () => {
        database.ref('productData').set(data);
    };

    // Renderiza a aplicação inteira
    const render = () => {
        categoriesContainer.innerHTML = '';
        viewerContainer.innerHTML = '';
        
        if (!data || data.length === 0) {
            data = [];
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

            const cards = category.cards || [];

            cards.forEach(card => {
                cardsGridEditor.appendChild(createCardElement(card, false));
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

        if (card.status === 'approved') {
            cardDiv.classList.add('approved');
        } else if (card.status === 'rejected') {
            cardDiv.classList.add('rejected');
        }

        cardDiv.innerHTML = `
            <img src="${card.image}" alt="${card.description}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f2eee9/5a7d7c?text=Imagem';">
            <div class="card-content">
                <h3>${card.description}</h3>
                <p>Quantidade: ${card.quantity}</p>
            </div>
        `;

        if (isViewer) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions-viewer';
            actionsDiv.innerHTML = `
                <button class="approve-btn">Aprovado</button>
                <button class="reject-btn">Reprovado</button>
            `;
            cardDiv.appendChild(actionsDiv);
        } else {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions-editor';
            actionsDiv.innerHTML = `
                <button class="edit-btn" title="Editar">&#9998;</button>
                <button class="delete-btn" title="Excluir">&times;</button>
            `;
            cardDiv.appendChild(actionsDiv);
        }
        return cardDiv;
    };
    
    // Atualiza o dropdown de categorias no modal de formulário
    const updateCategoryDropdown = () => {
        const hasCategories = data && data.length > 0;
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
            modalTitle.textContent = 'Editar Produto';
            saveCardBtn.textContent = 'Salvar Alterações';
            cardIdEditInput.value = cardId;

            let cardToEdit, categoryOfCard;
            for(const category of data) {
                const cards = category.cards || [];
                const foundCard = cards.find(c => c.id === cardId);
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

    const openImageModal = (src) => {
        modalImage.src = src;
        imageViewerModal.style.display = 'flex';
    };

    const closeImageModal = () => {
        imageViewerModal.style.display = 'none';
    };

    // --- MANIPULADORES DE EVENTOS ---

    addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryName = categoryNameInput.value.trim();
        if (categoryName && !data.some(cat => cat.name === categoryName)) {
            data.push({ name: categoryName, cards: [] });
            saveData();
            categoryNameInput.value = '';
        } else {
            alert('Nome de ambiente inválido ou já existente.');
        }
    });

    showCardModalBtn.addEventListener('click', () => openFormModal());

    cancelCardBtn.addEventListener('click', closeFormModal);

    addCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cardId = cardIdEditInput.value;
        const newCategoryName = document.getElementById('card-category').value;
        const cardData = {
            id: cardId || 'card-' + Date.now(),
            image: document.getElementById('card-image').value,
            quantity: document.getElementById('card-quantity').value,
            description: document.getElementById('card-description').value,
            status: 'pending'
        };

        if (cardId) {
            let oldStatus = 'pending';
            data.forEach(cat => {
                if (cat.cards) {
                    const cardIndex = cat.cards.findIndex(c => c.id === cardId);
                    if(cardIndex > -1) {
                        oldStatus = cat.cards[cardIndex].status;
                        cat.cards.splice(cardIndex, 1);
                    }
                }
            });
            cardData.status = oldStatus;
        } 
        
        const newCategory = data.find(cat => cat.name === newCategoryName);
        if (newCategory) {
            if (!newCategory.cards) {
                newCategory.cards = [];
            }
            newCategory.cards.push(cardData);
        }

        saveData();
        closeFormModal();
    });