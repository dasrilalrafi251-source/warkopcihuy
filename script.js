document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pendaftaranForm');
    
    // Jika form tidak ada (di halaman menu), hentikan eksekusi
    if (!form) return;
    
    const pesanError = document.getElementById('pesanError');
    const notificationArea = document.getElementById('notification-area');
    const inputNama = document.getElementById('nama');
    const inputEmail = document.getElementById('email');
    const inputTelepon = document.getElementById('telepon');
    
    // --- FUNGSI NOTIFIKASI BARU (TOAST) ---
    function showNotification(message, type = 'info') {
        // Pastikan notificationArea ada
        if (!notificationArea) return;
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = message;
        
        notificationArea.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (notificationArea.contains(toast)) {
                    notificationArea.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
    
    function clearErrors() {
        if (inputNama) inputNama.classList.remove('input-error');
        if (inputEmail) inputEmail.classList.remove('input-error');
        if (inputTelepon) inputTelepon.classList.remove('input-error');
        if (pesanError) {
            pesanError.textContent = '';
            pesanError.classList.remove('error-message', 'success-message');
        }
    }

    function clearErrorOnInput() {
        if (this) this.classList.remove('input-error');
        if (pesanError) {
            pesanError.textContent = '';
            pesanError.classList.remove('error-message', 'success-message');
        }
    }

    function validateField(inputElement) {
        if (!inputElement) return '';
        
        const value = inputElement.value.trim();
        let errorMessage = '';
        
        if (inputElement.id === 'nama') {
            if (value === '') {
                errorMessage = 'Nama Lengkap wajib diisi.';
            } else if (value.length < 4) {
                errorMessage = 'Nama Lengkap minimal harus 4 karakter.';
            }
        } else if (inputElement.id === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value === '') {
                errorMessage = 'Email wajib diisi.';
            } else if (!emailPattern.test(value)) {
                errorMessage = 'Format Email tidak valid.';
            }
        } else if (inputElement.id === 'telepon') {
            const phonePattern = /^[0-9]{10,14}$/;
            if (value === '') {
                errorMessage = 'Nomor Telepon wajib diisi.';
            } else if (!phonePattern.test(value)) {
                errorMessage = 'Nomor Telepon tidak valid (10-14 digit angka).';
            }
        }

        if (errorMessage && inputElement) {
            inputElement.classList.add('input-error');
        } else if (inputElement) {
            inputElement.classList.remove('input-error');
        }

        return errorMessage;
    }
    
    function showRealTimeError() {
        clearErrors();
        const inputElements = [inputNama, inputEmail, inputTelepon].filter(Boolean);
        let currentError = '';
        
        for (const input of inputElements) {
            const error = validateField(input);
            if (error) {
                currentError = error;
                break;
            }
        }

        if (currentError && pesanError) {
            pesanError.innerHTML = '⚠️ Error: ' + currentError;
            pesanError.classList.add('error-message');
            showNotification('Gagal: ' + currentError, 'error');
        }
    }

    // --- MENAMBAHKAN EVENT LISTENERS FORM ---
    if (inputNama) {
        inputNama.addEventListener('input', clearErrorOnInput);
        inputNama.addEventListener('blur', showRealTimeError);
    }
    if (inputEmail) {
        inputEmail.addEventListener('input', clearErrorOnInput);
        inputEmail.addEventListener('blur', showRealTimeError);
    }
    if (inputTelepon) {
        inputTelepon.addEventListener('input', clearErrorOnInput);
        inputTelepon.addEventListener('blur', showRealTimeError);
    }

    // --- VALIDASI SAAT SUBMIT ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        clearErrors();
        
        let isValidForm = true;
        let allErrors = [];
        
        [inputNama, inputEmail, inputTelepon].filter(Boolean).forEach(input => {
            const error = validateField(input);
            if (error) {
                isValidForm = false;
                allErrors.push(error);
            }
        });

        if (!isValidForm) {
            const finalErrorMessage = allErrors.join('<br>⚠️ Error: ');
            if (pesanError) {
                pesanError.innerHTML = '⚠️ Error: ' + finalErrorMessage;
                pesanError.classList.add('error-message');
            }
            showNotification('Pesan gagal dikirim! Cek semua kolom.', 'error');
            return;
        }
        
        const telepon = inputTelepon ? inputTelepon.value.trim() : '';
        const email = inputEmail ? inputEmail.value.trim() : '';

        if (pesanError) {
            const successMsg = '✅ Pesan Berhasil Dikirim! Kami akan menghubungi Anda di nomor ' + telepon + ' atau Email ' + email + ' segera.';
            pesanError.innerHTML = successMsg;
            pesanError.classList.add('success-message');
        }
        
        showNotification('Pesan Berhasil Dikirim! Silakan Tunggu Balasan Kami.', 'success');

        if (inputNama) inputNama.value = '';
        if (inputEmail) inputEmail.value = '';
        if (inputTelepon) inputTelepon.value = '';
    });
    
    // --- FUNGSIONALITAS NAVBAR/HAMBURGER ---
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-center');
    const mobileTitle = document.querySelector('.mobile-title');
    const navbar = document.querySelector('.navbar');
    
    if (btn && nav) {
        btn.addEventListener('click', function () {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const willOpen = !expanded;
            btn.setAttribute('aria-expanded', String(willOpen));
            nav.classList.toggle('active');
            btn.classList.toggle('open', willOpen);
        });
    
        nav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', function () {
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    btn.setAttribute('aria-expanded', 'false');
                    btn.classList.remove('open');
                }
            });
        });
    }

    function updateMobileTitle() {
        if (!mobileTitle || !navbar) return;
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            if (!mobileTitle.classList.contains('show')) {
                mobileTitle.classList.add('show');
                setTimeout(() => mobileTitle.classList.add('visible'), 20);
            }
        } else {
            if (mobileTitle.classList.contains('show')) {
                mobileTitle.classList.remove('visible');
                setTimeout(() => mobileTitle.classList.remove('show'), 260);
            }
        }
    }
    
    updateMobileTitle();
    window.addEventListener('resize', updateMobileTitle);
    window.addEventListener('orientationchange', updateMobileTitle);
});