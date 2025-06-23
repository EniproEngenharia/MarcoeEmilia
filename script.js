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
    const showCardModalBtn = document.getElementById('show-card-modal-btn');
    const addCardModal = document.getElementById('add-card-modal');
    const addCardForm = document.getElementById('add-card-form');
    const cancelCardBtn = document.getElementById('cancel-card-btn');
    const cardCategorySelect = document.getElementById('card-category');
    const modalTitle = document.getElementById('modal-title');
    const saveCardBtn = document.getElementById('save-card-btn');
    const cardIdEditInput = document.getElementById('card-id-edit');
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const modalImage = document.getElementById('modal-image');
    const closeImageModalBtn = document.querySelector('.close-image-modal');

    // --- ESTADO LOCAL DA APLICAÇÃO (será um espelho dos dados do Firebase) ---
    let localData = [];

    // --- NOVA LÓGICA DE RENDERIZAÇÃO ---
    const render = (data) => {
        localData = data; // Atualiza o estado local
        categoriesContainer.innerHTML = '';
        viewerContainer.innerHTML = '';

        if (data.length === 0) {
            categoriesContainer.innerHTML = '<p>Nenhum ambiente criado ainda. Adicione um acima.</p>';
            viewerContainer.innerHTML = '<p>Nenhum produto para visualização no momento.</p>';
        }

        data.forEach(category => {
            const categorySectionEditor = document.createElement('section');
            categorySectionEditor.className = 'category-section';
            categorySectionEditor.innerHTML = `<h2>${category.name} <button class="delete-category-btn" data-category-id="${category.id}" title="Excluir Ambiente">&times;</button></h2><div class="cards-grid"></div>`;
            categoriesContainer.appendChild(categorySectionEditor);

            const categorySectionViewer = document.createElement('section');
            categorySectionViewer.className = 'category-section';
            categorySectionViewer.innerHTML = `<h2>${category.name}</h2><div class="cards-grid"></div>`;
            viewerContainer.appendChild(categorySectionViewer);

            const cardsGridEditor = categorySectionEditor.querySelector('.cards-grid');
            const cardsGridViewer = categorySectionViewer.querySelector('.cards-grid');

            if (category.cards && category.cards.length > 0) {
                category.cards.forEach(card => {
                    cardsGridEditor.appendChild(createCardElement(card, category.id, false));
                    cardsGridViewer.appendChild(createCardElement(card, category.id, true));
                });
            }
        });
        updateCategoryDropdown(data);
    };
    
    // --- NOVA LÓGICA PARA CRIAR O ELEMENTO CARD ---
    const createCardElement = (card, categoryId, isViewer) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        // Armazena o ID da categoria e do card no próprio elemento
        cardDiv.dataset.id = card.id;
        cardDiv.dataset.categoryId = categoryId;

        if (card.status === 'approved') cardDiv.classList.add('approved');
        if (card.status === 'rejected') cardDiv.classList.add('rejected');

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
            actionsDiv.innerHTML = `<button class="approve-btn">Aprovado</button><button class="reject-btn">Reprovado</button>`;
            cardDiv.appendChild(actionsDiv);
        } else {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions-editor';
            actionsDiv.innerHTML = `<button class="edit-btn" title="Editar">&#9998;</button><button class="delete-btn" title="Excluir">&times;</button>`;
            cardDiv.appendChild(actionsDiv);
        }
        return cardDiv;
    };

    // --- NOVA LÓGICA PARA ATUALIZAR O DROPDOWN ---
    const updateCategoryDropdown = (data) => {
        const hasCategories = data && data.length > 0;
        showCardModalBtn.style.display = hasCategories ? 'inline-block' : 'none';
        cardCategorySelect.innerHTML = '';

        if (!hasCategories) {
            cardCategorySelect.innerHTML = '<option disabled>Crie um ambiente primeiro</option>';
        } else {
            data.forEach(category => {
                const option = document.createElement('option');
                // O valor da opção agora é o ID único da categoria
                option.value = category.id;
                option.textContent = category.name;
                cardCategorySelect.appendChild(option);
            });
        }
    };
    
    // --- LÓGICA DE MODAIS (sem grandes alterações) ---
    const openFormModal = (cardToEdit = null, categoryId = null) => {
        addCardForm.reset();
        if (cardToEdit && categoryId) {
            modalTitle.textContent = 'Editar Produto';
            saveCardBtn.textContent = 'Salvar Alterações';
            cardIdEditInput.value = cardToEdit.id;
            document.getElementById('card-category').value = categoryId;
            document.getElementById('card-image').value = cardToEdit.image;
            document.getElementById('card-quantity').value = cardToEdit.quantity;
            document.getElementById('card-description').value = cardToEdit.description;
        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
            saveCardBtn.textContent = 'Salvar Produto';
            cardIdEditInput.value = '';
        }
        addCardModal.style.display = 'flex';
    };
    const closeFormModal = () => addCardModal.style.display = 'none';
    const openImageModal = (src) => { imageViewerModal.style.display = 'flex'; modalImage.src = src; };
    const closeImageModal = () => imageViewerModal.style.display = 'none';

    // --- NOVOS MANIPULADORES DE EVENTOS (MAIS ROBUSTOS) ---

    // Adicionar novo ambiente
    addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryName = categoryNameInput.value.trim();
        if (categoryName) {
            // Usa o método push() do Firebase para criar um ID único
            database.ref('productData').push({
                name: categoryName
            });
            categoryNameInput.value = '';
        }
    });

    // Salvar (adicionar ou editar) um produto
    addCardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = document.getElementById('card-category').value;
        const cardId = cardIdEditInput.value || `card-${Date.now()}`;
        const cardData = {
            id: cardId,
            image: document.getElementById('card-image').value,
            quantity: document.getElementById('card-quantity').value,
            description: document.getElementById('card-description').value,
            status: 'pending'
        };
        // Define o card usando seu ID único dentro da categoria correta
        database.ref(`productData/${categoryId}/cards/${cardId}`).set(cardData);
        closeFormModal();
    });

    // Ações no container do EDITOR (Editar, Excluir Card, Excluir Categoria)
    categoriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cardElement = target.closest('.card');
        
        // Excluir Categoria Inteira
        if (target.classList.contains('delete-category-btn')) {
            const categoryId = target.dataset.categoryId;
            if (confirm('Tem certeza que deseja excluir este ambiente e TODOS os seus produtos?')) {
                database.ref(`productData/${categoryId}`).remove();
            }
            return;
        }

        if (!cardElement) return;
        const cardId = cardElement.dataset.id;
        const categoryId = cardElement.dataset.categoryId;

        // Encontra o card nos dados locais para edição
        const category = localData.find(c => c.id === categoryId);
        const card = category?.cards?.find(c => c.id === cardId);

        if (target.classList.contains('edit-btn') && card) {
            openFormModal(card, categoryId);
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                database.ref(`productData/${categoryId}/cards/${cardId}`).remove();
            }
        }
    });

    // Ações no container do CLIENTE (Aprovar, Reprovar)
    viewerView.addEventListener('click', (e) => {
        const cardElement = e.target.closest('.card');
        if (!cardElement) return;

        if (e.target.tagName === 'IMG') {
            openImageModal(e.target.src);
            return;
        }
        
        const cardId = cardElement.dataset.id;
        const categoryId = cardElement.dataset.categoryId;
        const isApprove = e.target.classList.contains('approve-btn');
        const isReject = e.target.classList.contains('reject-btn');

        if (isApprove || isReject) {
            const newStatus = isApprove ? 'approved' : 'rejected';
            // Atualiza diretamente o status do card no Firebase
            database.ref(`productData/${categoryId}/cards/${cardId}/status`).set(newStatus);
        }
    });

    // Demais eventos
    showCardModalBtn.addEventListener('click', () => openFormModal());
    cancelCardBtn.addEventListener('click', closeFormModal);
    closeImageModalBtn.addEventListener('click', closeImageModal);
    imageViewerModal.addEventListener('click', (e) => {
        if (e.target === imageViewerModal) closeImageModal();
    });

    // --- INICIALIZAÇÃO E SINCRONIZAÇÃO COM FIREBASE ---
    const init = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'true') {
            editorView.style.display = 'none';
            viewerView.style.display = 'block';
        } else {
            editorView.style.display = 'block';
            viewerView.style.display = 'none';
        }

        // Listener principal que sincroniza a aplicação com o Firebase
        database.ref('productData').on('value', (snapshot) => {
            const firebaseData = snapshot.val();
            const dataForRender = [];
            
            // Converte o objeto do Firebase em um array para renderização
            if (firebaseData) {
                for (const categoryId in firebaseData) {
                    const category = firebaseData[categoryId];
                    const cardsArray = [];
                    if (category.cards) {
                        for (const cardId in category.cards) {
                            cardsArray.push(category.cards[cardId]);
                        }
                    }
                    dataForRender.push({
                        id: categoryId,
                        name: category.name,
                        cards: cardsArray
                    });
                }
            }
            // Chama a função de renderização com os dados convertidos e atualizados
            render(dataForRender);
        });
    };

    init();
});