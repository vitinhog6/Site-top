// Lista de documentos (pode ser carregada de um JSON)
const documents = [
    {
        id: 1,
        title: "XEROX AUTENTICADA DO CERTIFICADO DE ESCOLARIDADE (6ª SÉRIE PARA MAC / 9ª SÉRIE PARA MOC)",
        file: null,
        preview: null
    },
    {
        id: 2,
        title: "XEROX AUTENTICADA DO CERTIFICADO DE ALISTAMENTO / RESERVISTA",
        file: null,
        preview: null
    },
    {
        id: 3,
        title: "XEROX AUTENTICADA DE COMPROVANTE DE RESIDÊNCIA RECENTE",
        file: null,
        preview: null
    },
    {
        id: 4,
        title: "XEROX AUTENTICADA DO TÍTULO DE ELEITOR",
        file: null,
        preview: null
    },
    {
        id: 5,
        title: "XEROX AUTENTICADA DO RG OU CNH",
        file: null,
        preview: null
    },
    {
        id: 6,
        title: "GRU",
        file: null,
        preview: null
    },
    {
        id: 7,
        title: "PROCURAÇÃO",
        file: null,
        preview: null
    },
    {
        id: 8,
        title: "INFORMAÇÕES PESSOAIS (EMAIL, SITUAÇÃO CIVIL, PROFISSÃO, CIDADE E ESTADO DE NASCIMENTO)",
        file: null,
        preview: null,
        isForm: true
    }
];

// Dados pessoais
let personalInfo = {};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderDocumentList();
    setupModal();
    setupGeneratePDF();
});

// Renderiza a lista de documentos
function renderDocumentList() {
    const listContainer = document.getElementById('documentList');
    listContainer.innerHTML = '';

    documents.forEach(doc => {
        const docElement = document.createElement('div');
        docElement.className = 'document-item';
        docElement.innerHTML = `
            <strong>${doc.id}. ${doc.title}</strong>
            <div class="upload-area">
                ${doc.isForm ? 
                    `<button class="upload-btn" onclick="openPersonalInfoModal()">Preencher Informações</button>` :
                    `<input type="file" id="file-${doc.id}" accept="image/*,.pdf" style="display: none;" onchange="handleFileUpload(${doc.id}, this)">
                     <button class="upload-btn" onclick="document.getElementById('file-${doc.id}').click()">Enviar Documento</button>`
                }
                <span id="status-${doc.id}" class="uploaded">${doc.file ? '✓ Enviado' : ''}</span>
            </div>
            ${doc.preview ? `<img src="${doc.preview}" class="preview" id="preview-${doc.id}">` : ''}
        `;
        listContainer.appendChild(docElement);
    });
}

// Manipula upload de arquivos
function handleFileUpload(docId, input) {
    const file = input.files[0];
    if (!file) return;

    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex === -1) return;

    documents[docIndex].file = file;

    // Gera pré-visualização para imagens
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            documents[docIndex].preview = e.target.result;
            renderDocumentList();
        };
        reader.readAsDataURL(file);
    } else {
        documents[docIndex].preview = null;
        renderDocumentList();
    }

    document.getElementById(`status-${docId}`).textContent = '✓ Enviado';
}

// Modal de informações pessoais
function setupModal() {
    const modal = document.getElementById('personalInfoModal');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('personalInfoForm');

    window.openPersonalInfoModal = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => e.target === modal ? modal.style.display = 'none' : null;

    form.onsubmit = (e) => {
        e.preventDefault();
        personalInfo = {
            email: form.email.value,
            civilStatus: form.civilStatus.value,
            profession: form.profession.value,
            city: form.city.value,
            state: form.state.value
        };
        
        const docIndex = documents.findIndex(d => d.id === 8);
        if (docIndex !== -1) {
            documents[docIndex].file = "Informações preenchidas";
            document.getElementById(`status-8`).textContent = '✓ Preenchido';
        }
        
        modal.style.display = 'none';
    };
}

// Gera PDF
function setupGeneratePDF() {
    document.getElementById('generatePDF').onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("DOCUMENTOS ENVIADOS", 10, 15);
        doc.setFontSize(12);
        
        let y = 30;
        documents.forEach(item => {
            if (item.file) {
                doc.text(`${item.id}. ${item.title}: ✓`, 10, y);
                y += 10;
            }
        });
        
        if (Object.keys(personalInfo).length > 0) {
            y += 10;
            doc.text("INFORMAÇÕES PESSOAIS:", 10, y);
            y += 10;
            Object.entries(personalInfo).forEach(([key, value]) => {
                doc.text(`- ${key}: ${value}`, 15, y);
                y += 10;
            });
        }
        
        doc.save("documentos_enviados.pdf");
    };
}