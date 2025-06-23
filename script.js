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

    // --- ESTADO LOCAL DA APLICAÇÃO ---
    let localData = [];

    // --- LÓGICA DE RENDERIZAÇÃO ---
    const render = (data) => {
        localData = data;
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

    // --- LÓGICA PARA CRIAR O ELEMENTO CARD ---
    const createCardElement = (card, categoryId, isViewer) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
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

    // --- LÓGICA PARA ATUALIZAR O DROPDOWN ---
    const updateCategoryDropdown = (data) => {
        const hasCategories = data && data.length > 0;
        showCardModalBtn.style.display = hasCategories ? 'inline-block' : 'none';
        cardCategorySelect.innerHTML = '';

        if (!hasCategories) {
            cardCategorySelect.innerHTML = '<option disabled>Crie um ambiente primeiro</option>';
        } else {
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                cardCategorySelect.appendChild(option);
            });
        }
    };

    // --- LÓGICA DE MODAIS ---
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

    // --- MANIPULADORES DE EVENTOS ---

    addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryName = categoryNameInput.value.trim();
        if (categoryName) {
            database.ref('productData').push({ name: categoryName });
            categoryNameInput.value = '';
        }
    });

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
        database.ref(`productData/${categoryId}/cards/${cardId}`).set(cardData);
        closeFormModal();
    });

    categoriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cardElement = target.closest('.card');

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
    
    // --- VERSÃO DE DEPURAÇÃO: BOTÕES APROVAR/REPROVAR ---
    viewerView.addEventListener('click', (e) => {
        console.log("--- CLIQUE DETECTADO NA ÁREA DO CLIENTE ---");
        const target = e.target;
        console.log("Elemento exato que foi clicado (target):", target);

        const isApprove = target.classList.contains('approve-btn');
        const isReject = target.classList.contains('reject-btn');

        if (isApprove || isReject) {
            console.log("É um botão de APROVAR ou REPROVAR.");
            const cardElement = target.closest('.card');
            console.log("Tentando encontrar o 'card' pai...", cardElement);

            if (!cardElement) {
                console.error("ERRO: Não foi possível encontrar o elemento .card pai do botão. Encerrando.");
                return;
            }

            const cardId = cardElement.dataset.id;
            const categoryId = cardElement.dataset.categoryId;

            console.log(`ID do Card encontrado: '${cardId}' (tipo: ${typeof cardId})`);
            console.log(`ID da Categoria encontrado: '${categoryId}' (tipo: ${typeof categoryId})`);

            // MUDANÇA VISUAL IMEDIATA
            if (isApprove) {
                cardElement.classList.remove('rejected');
                cardElement.classList.add('approved');
            } else {
                cardElement.classList.remove('approved');
                cardElement.classList.add('rejected');
            }
            console.log("Aparência do card atualizada na tela.");

            // TENTATIVA DE SALVAR NO FIREBASE
            if (cardId && categoryId) {
                const newStatus = isApprove ? 'approved' : 'rejected';
                const updates = {};
                const path = `/productData/${categoryId}/cards/${cardId}/status`;
                updates[path] = newStatus;
                
                console.log("Preparando para enviar os seguintes dados para o Firebase:");
                console.log("Caminho (path):", path);
                console.log("Valor (status):", newStatus);
                
                database.ref().update(updates)
                    .then(() => {
                        console.log("SUCESSO: Firebase confirmou que os dados foram salvos!");
                    })
                    .catch((error) => {
                        console.error("FALHA: Ocorreu um erro ao tentar salvar no Firebase:", error);
                    });

            } else {
                console.error("ERRO CRÍTICO: ID do card ou da categoria está faltando. A atualização não pode ser enviada ao Firebase.");
            }
        } else if (target.tagName === 'IMG') {
            console.log("É uma imagem. Abrindo o modal.");
            openImageModal(target.src);
        } else {
            console.log("O clique não foi em um botão de ação nem na imagem.");
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

        database.ref('productData').on('value', (snapshot) => {
            const firebaseData = snapshot.val();
            const dataForRender = [];

            if (firebaseData) {
                for (const categoryId in firebaseData) {
                    const category = firebaseData[categoryId];
                    const cardsArray = [];
                    if (category.cards) {
                        for (const cardId in category.cards) {
                            const card = category.cards[cardId];
                            if (card && card.id) {
                                cardsArray.push(card);
                            }
                        }
                    }
                    dataForRender.push({
                        id: categoryId,
                        name: category.name,
                        cards: cardsArray
                    });
                }
            }
            render(dataForRender);
        });
    };

    init();
});