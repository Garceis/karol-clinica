// Manipulação do Formulário de Contato
document.getElementById('form-contato').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Exibe a mensagem de sucesso
    const successAlert = document.getElementById('mensagem-sucesso');
    successAlert.style.display = 'block';
    
    // Rola até a mensagem
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Reseta o formulário
    this.reset();
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 5000);
});

// Interação do Dropdown para Dispositivos Móveis (Toque)
document.addEventListener('DOMContentLoaded', function() {
    const dropbtn = document.querySelector('.dropbtn');
    const dropdown = document.querySelector('.dropdown');

    if (window.innerWidth <= 768) {
        dropbtn.addEventListener('click', function(e) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            const content = dropdown.querySelector('.dropdown-content');
            if (dropdown.classList.contains('active')) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    }
});
