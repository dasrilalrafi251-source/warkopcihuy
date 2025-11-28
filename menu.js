// Mobile Optimized Cart System with WhatsApp and Receipt Image
class CartSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('warkopCart')) || [];
        this.orderNumber = this.generateOrderNumber();
        this.kasirWhatsAppNumber = "6288223959773";
        this.isMobile = this.checkMobile();
        this.init();
    }

    init() {
        console.log('CartSystem initialized');
        // Pastikan elemen yang diperlukan ada sebelum binding events
        if (this.requiredElementsExist()) {
            this.bindEvents();
            this.updateCartDisplay();
            this.setupMobileFeatures();
            this.setupNavbar(); // Tambahkan setup navbar
        } else {
            console.warn('Some required elements are missing');
        }
    }

    requiredElementsExist() {
        const required = [
            'clear-cart',
            'checkout-btn', 
            'close-payment',
            'close-receipt',
            'send-whatsapp',
            'print-receipt',
            'payment-modal'
        ];
        
        return required.every(id => {
            const exists = !!document.getElementById(id);
            if (!exists) {
                console.warn(`Required element not found: ${id}`);
            }
            return exists;
        });
    }

    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    setupMobileFeatures() {
        const floatingCart = document.getElementById('floating-cart');
        const cartPanel = document.querySelector('.cart-panel');
        
        if (floatingCart && cartPanel) {
            floatingCart.addEventListener('click', () => {
                cartPanel.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                floatingCart.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    floatingCart.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }

    // Tambahkan setup navbar untuk halaman menu
    setupNavbar() {
        const btn = document.querySelector('.hamburger');
        const nav = document.querySelector('.nav-center');
        const mobileTitle = document.querySelector('.mobile-title');
        
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
            if (!mobileTitle) return;
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
    }

    generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORDER-${timestamp}${random}`;
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Order buttons - FIXED: Gunakan event delegation untuk handle click di semua platform
        document.addEventListener('click', (e) => {
            // Cek jika yang diklik adalah menu-order-btn atau child-nya
            const button = e.target.closest('.menu-order-btn');
            if (button) {
                console.log('Menu order button clicked:', button);
                this.handleOrderButtonClick(button);
                return;
            }
        });

        // Touch events untuk feedback visual di mobile
        document.addEventListener('touchstart', (e) => {
            const button = e.target.closest('.menu-order-btn');
            if (button) {
                button.style.opacity = '0.7';
            }
        });

        document.addEventListener('touchend', (e) => {
            const button = e.target.closest('.menu-order-btn');
            if (button) {
                button.style.opacity = '1';
            }
        });

        // Mouse events untuk feedback visual di desktop
        document.addEventListener('mousedown', (e) => {
            const button = e.target.closest('.menu-order-btn');
            if (button) {
                button.style.opacity = '0.7';
            }
        });

        document.addEventListener('mouseup', (e) => {
            const button = e.target.closest('.menu-order-btn');
            if (button) {
                button.style.opacity = '1';
            }
        });

        // Bind events dengan pengecekan null dan error handling
        try {
            const clearCartBtn = document.getElementById('clear-cart');
            const checkoutBtn = document.getElementById('checkout-btn');
            const closePaymentBtn = document.getElementById('close-payment');
            const closeReceiptBtn = document.getElementById('close-receipt');
            const whatsappBtn = document.getElementById('send-whatsapp');
            const printBtn = document.getElementById('print-receipt');
            const paymentModal = document.getElementById('payment-modal');

            if (clearCartBtn) {
                clearCartBtn.addEventListener('click', () => this.clearCart());
                console.log('Clear cart button bound');
            }

            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => this.showOrderModal());
                console.log('Checkout button bound');
            }

            if (closePaymentBtn) {
                closePaymentBtn.addEventListener('click', () => this.closeOrderModal());
                console.log('Close payment button bound');
            }

            if (closeReceiptBtn) {
                closeReceiptBtn.addEventListener('click', () => this.closeOrderModal());
                console.log('Close receipt button bound');
            }

            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', () => this.sendViaWhatsApp());
                console.log('WhatsApp button bound');
            }

            if (printBtn) {
                printBtn.addEventListener('click', () => this.generateReceiptImage());
                console.log('Print receipt button bound');
            }

            if (paymentModal) {
                paymentModal.addEventListener('click', (e) => {
                    if (e.target.id === 'payment-modal') {
                        this.closeOrderModal();
                    }
                });
                console.log('Payment modal bound');
            }

        } catch (error) {
            console.error('Error binding events:', error);
        }

        // Form validation
        const customerName = document.getElementById('customer-name');
        const tableNumber = document.getElementById('table-number');
        
        if (customerName) {
            customerName.addEventListener('input', this.validateForm.bind(this));
            customerName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') e.preventDefault();
            });
        }
        if (tableNumber) {
            tableNumber.addEventListener('input', this.validateForm.bind(this));
        }

        console.log('All events bound successfully');
    }

    handleOrderButtonClick(button) {
        console.log('Handling order button click:', button);
        
        // Validasi data attributes sebelum digunakan
        if (!button || !button.dataset) {
            console.error('Button or button.dataset is undefined');
            this.showNotification('❌ Error: Tombol tidak valid', 'error');
            return;
        }

        const itemData = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: button.dataset.price,
            desc: button.dataset.desc
        };

        console.log('Item data from button:', itemData);

        // Validasi data attributes
        if (!itemData.id || !itemData.name || !itemData.price) {
            console.error('Missing required data attributes:', itemData);
            this.showNotification('❌ Error: Data menu tidak lengkap', 'error');
            return;
        }

        // Parse price dengan error handling
        let price;
        try {
            price = parseFloat(itemData.price);
            if (isNaN(price)) {
                throw new Error('Invalid price format');
            }
        } catch (error) {
            console.error('Error parsing price:', error, 'Price value:', itemData.price);
            this.showNotification('❌ Error: Format harga tidak valid', 'error');
            return;
        }

        const item = {
            id: itemData.id.toString(),
            name: itemData.name.toString(),
            price: price,
            desc: itemData.desc || 'Tidak ada deskripsi',
            quantity: 1
        };

        console.log('Processed item:', item);

        // Validasi data item final
        if (!item.id || !item.name || isNaN(item.price) || item.price <= 0) {
            console.error('Invalid item data after processing:', item);
            this.showNotification('❌ Error: Data menu tidak valid', 'error');
            return;
        }

        this.addToCart(item);
        
        // Haptic feedback untuk mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    validateForm() {
        const customerName = document.getElementById('customer-name');
        const tableNumber = document.getElementById('table-number');
        const whatsappBtn = document.getElementById('send-whatsapp');
        const printBtn = document.getElementById('print-receipt');
        
        if (!customerName || !tableNumber || !whatsappBtn || !printBtn) {
            console.warn('Form elements not found for validation');
            return false;
        }
        
        const isValid = customerName.value.trim().length >= 2 && 
                       tableNumber.value && 
                       tableNumber.value > 0;
        
        whatsappBtn.disabled = !isValid;
        printBtn.disabled = !isValid;
        
        if (isValid) {
            whatsappBtn.style.opacity = '1';
            printBtn.style.opacity = '1';
        } else {
            whatsappBtn.style.opacity = '0.6';
            printBtn.style.opacity = '0.6';
        }
        
        return isValid;
    }

    addToCart(item) {
        try {
            console.log('Adding to cart:', item);
            
            const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
                console.log('Increased quantity for existing item:', existingItem);
            } else {
                this.cart.push(item);
                console.log('Added new item to cart:', item);
            }

            this.saveCart();
            this.updateCartDisplay();
            this.showNotification(`✅ ${item.name} ditambahkan`, 'success');
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('❌ Gagal menambahkan item ke keranjang', 'error');
        }
    }

    removeFromCart(itemId) {
        console.log('Removing item from cart:', itemId);
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(itemId, change) {
        console.log('Updating quantity for item:', itemId, 'change:', change);
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Hapus semua item dari keranjang?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            this.showNotification('🛒 Keranjang dikosongkan', 'success');
        }
    }

    getTotalPrice() {
        const total = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        console.log('Calculated total price:', total);
        return total;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }

    updateCartDisplay() {
        console.log('Updating cart display');
        
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const checkoutBtn = document.getElementById('checkout-btn');
        const floatingCartCount = document.getElementById('floating-cart-count');

        if (!cartItemsContainer || !cartTotalPrice || !checkoutBtn) {
            console.error('Cart display elements not found');
            return;
        }

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Total items in cart:', totalItems);
        
        if (floatingCartCount) {
            floatingCartCount.textContent = totalItems;
            floatingCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty">Keranjang kosong</div>';
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.6';
            cartTotalPrice.textContent = 'Rp 0';
            console.log('Cart is empty');
            return;
        }

        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';

        // Render cart items dengan error handling
        try {
            cartItemsContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
                        <div class="cart-item-details">${this.formatPrice(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="cartSystem.updateQuantity('${this.escapeHtml(item.id)}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartSystem.updateQuantity('${this.escapeHtml(item.id)}', 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-price">${this.formatPrice(item.price * item.quantity)}</div>
                        <button class="cart-item-remove" onclick="cartSystem.removeFromCart('${this.escapeHtml(item.id)}')">Hapus</button>
                    </div>
                </div>
            `).join('');

            cartTotalPrice.textContent = this.formatPrice(this.getTotalPrice());
            console.log('Cart display updated successfully');
            
        } catch (error) {
            console.error('Error updating cart display:', error);
            cartItemsContainer.innerHTML = '<div class="cart-empty">Error menampilkan keranjang</div>';
        }
    }

    // Helper function untuk escape HTML
    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showOrderModal() {
        console.log('Showing order modal');
        
        if (this.cart.length === 0) {
            this.showNotification('❌ Keranjang masih kosong', 'error');
            return;
        }

        const modal = document.getElementById('payment-modal');
        const receiptItems = document.getElementById('receipt-items');
        const receiptTotal = document.getElementById('receipt-total');
        const receiptTime = document.getElementById('receipt-time');

        if (!modal || !receiptItems || !receiptTotal || !receiptTime) {
            console.error('Order modal elements not found');
            return;
        }

        // Reset form
        const customerName = document.getElementById('customer-name');
        const tableNumber = document.getElementById('table-number');
        if (customerName) customerName.value = '';
        if (tableNumber) tableNumber.value = '';
        this.validateForm();

        // Populate receipt items dengan error handling
        try {
            receiptItems.innerHTML = this.cart.map(item => `
                <div class="receipt-item">
                    <div>
                        <span class="receipt-item-quantity">${item.quantity}x</span>
                        ${this.escapeHtml(item.name)}
                    </div>
                    <div>${this.formatPrice(item.price * item.quantity)}</div>
                </div>
            `).join('');

            receiptTotal.textContent = this.formatPrice(this.getTotalPrice());
            receiptTime.textContent = new Date().toLocaleString('id-ID');

            modal.classList.add('show');
            
            setTimeout(() => {
                const customerNameInput = document.getElementById('customer-name');
                if (customerNameInput) customerNameInput.focus();
            }, 300);
            
            console.log('Order modal shown successfully');
            
        } catch (error) {
            console.error('Error showing order modal:', error);
            this.showNotification('❌ Error menampilkan modal pesanan', 'error');
        }
    }

    closeOrderModal() {
        console.log('Closing order modal');
        const modal = document.getElementById('payment-modal');
        if (modal) modal.classList.remove('show');
    }

    generateWhatsAppMessage(customerName, tableNumber) {
        const itemsText = this.cart.map(item => 
            `• ${item.quantity}x ${item.name} - ${this.formatPrice(item.price * item.quantity)}`
        ).join('%0A');
        
        const total = this.formatPrice(this.getTotalPrice());
        
        return `📋 *PESANAN BARU - WARKOP CIHUYY*%0A%0A` +
               `No. Pesanan: *${this.orderNumber}*%0A` +
               `Nama Pemesan: *${customerName}*%0A` +
               `Nomor Meja: *${tableNumber}*%0A%0A` +
               `*DETAIL PESANAN:*%0A${itemsText}%0A%0A` +
               `*TOTAL: ${total}*%0A%0A` +
               `⏰ Waktu Pesan: ${new Date().toLocaleString('id-ID')}%0A` +
               `_Silakan proses pesanan ini_`;
    }

    sendViaWhatsApp() {
        console.log('Sending via WhatsApp');
        
        if (!this.validateForm()) {
            this.showNotification('❌ Harap isi nama dan nomor meja', 'error');
            return;
        }

        const customerName = document.getElementById('customer-name');
        const tableNumber = document.getElementById('table-number');
        
        if (!customerName || !tableNumber) {
            console.error('Customer form elements not found');
            return;
        }

        try {
            const message = this.generateWhatsAppMessage(customerName.value.trim(), tableNumber.value);
            const whatsappLink = `https://wa.me/${this.kasirWhatsAppNumber}?text=${message}`;
            
            if (this.isMobile) {
                window.location.href = whatsappLink;
            } else {
                window.open(whatsappLink, '_blank');
            }
            
            this.showNotification(`✅ Mengirim pesanan ke kasir...`, 'success');
            this.saveOrderToLocal(customerName.value.trim(), tableNumber.value);
            
            setTimeout(() => {
                this.cart = [];
                this.saveCart();
                this.updateCartDisplay();
                this.closeOrderModal();
                this.orderNumber = this.generateOrderNumber();
            }, 2000);
            
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            this.showNotification('❌ Gagal mengirim pesan WhatsApp', 'error');
        }
    }

    generateReceiptImage() {
        console.log('Generating receipt image');
        
        if (!this.validateForm()) {
            this.showNotification('❌ Harap isi nama dan nomor meja', 'error');
            return;
        }

        const customerName = document.getElementById('customer-name');
        const tableNumber = document.getElementById('table-number');
        
        if (!customerName || !tableNumber) {
            console.error('Customer form elements not found');
            return;
        }

        try {
            // Buat canvas untuk struk
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set ukuran canvas
            canvas.width = 400;
            canvas.height = 600;
            
            // Background putih
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Header struk
            ctx.fillStyle = '#cb8c0d';
            ctx.fillRect(0, 0, canvas.width, 80);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('WARKOP CIHUYY', canvas.width / 2, 35);
            
            ctx.font = '12px Arial';
            ctx.fillText('Struk Pesanan', canvas.width / 2, 55);
            
            // Informasi pesanan
            ctx.fillStyle = '#333333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`No. Pesanan: ${this.orderNumber}`, 20, 110);
            ctx.fillText(`Nama: ${customerName.value.trim()}`, 20, 125);
            ctx.fillText(`Meja: ${tableNumber.value}`, 20, 140);
            ctx.fillText(`Waktu: ${new Date().toLocaleString('id-ID')}`, 20, 155);
            
            // Garis pemisah
            ctx.strokeStyle = '#cccccc';
            ctx.beginPath();
            ctx.moveTo(20, 170);
            ctx.lineTo(canvas.width - 20, 170);
            ctx.stroke();
            
            // Header item
            ctx.font = 'bold 11px Arial';
            ctx.fillText('ITEM', 20, 190);
            ctx.fillText('QTY', 250, 190);
            ctx.fillText('HARGA', 320, 190);
            
            // Items
            let yPosition = 210;
            this.cart.forEach(item => {
                ctx.font = '10px Arial';
                // Potong teks jika terlalu panjang
                const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
                ctx.fillText(itemName, 20, yPosition);
                ctx.fillText(item.quantity.toString(), 250, yPosition);
                ctx.fillText(this.formatPrice(item.price * item.quantity), 320, yPosition);
                yPosition += 20;
            });
            
            // Garis pemisah total
            ctx.beginPath();
            ctx.moveTo(20, yPosition + 10);
            ctx.lineTo(canvas.width - 20, yPosition + 10);
            ctx.stroke();
            
            // Total
            ctx.font = 'bold 12px Arial';
            ctx.fillText('TOTAL:', 20, yPosition + 30);
            ctx.fillText(this.formatPrice(this.getTotalPrice()), 320, yPosition + 30);
            
            // Footer
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#666666';
            ctx.fillText('Terima kasih atas kunjungan Anda', canvas.width / 2, yPosition + 60);
            ctx.fillText('Silakan tunjukkan struk ini ke kasir', canvas.width / 2, yPosition + 75);
            
            // Konversi canvas ke gambar
            const receiptImage = canvas.toDataURL('image/png');
            
            // Tampilkan gambar struk dalam modal
            this.showReceiptImage(receiptImage, customerName.value.trim(), tableNumber.value);
            
            this.saveOrderToLocal(customerName.value.trim(), tableNumber.value);
            
        } catch (error) {
            console.error('Error generating receipt image:', error);
            this.showNotification('❌ Gagal membuat struk', 'error');
        }
    }

    showReceiptImage(imageData, customerName, tableNumber) {
        console.log('Showing receipt image');
        
        try {
            // Buat modal baru untuk menampilkan struk
            const receiptModal = document.createElement('div');
            receiptModal.className = 'modal show';
            receiptModal.innerHTML = `
                <div class="modal-content" style="max-width: 450px;">
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                    <div class="receipt-header">
                        <h2>Struk Pesanan</h2>
                        <p class="receipt-time">${new Date().toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div class="receipt-image-container">
                        <img src="${imageData}" alt="Struk Pesanan" class="receipt-image">
                        <p style="color: #666; font-size: 12px; margin: 10px 0;">Screenshot gambar ini untuk menunjukkan ke kasir</p>
                    </div>
                    
                    <div class="receipt-footer">
                        <div class="delivery-options">
                            <button class="receipt-btn download-btn" onclick="cartSystem.downloadReceiptImage('${imageData}')">
                                <span class="btn-icon">💾</span>
                                <span class="btn-text">Download Struk</span>
                            </button>
                            <button class="receipt-btn secondary" onclick="this.closest('.modal').remove()">
                                <span class="btn-text">Tutup</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(receiptModal);
            
            // Tutup modal pesanan asli
            this.closeOrderModal();
            
            this.showNotification(`✅ Struk berhasil dibuat!`, 'success');
            
            // Kosongkan keranjang setelah delay
            setTimeout(() => {
                this.cart = [];
                this.saveCart();
                this.updateCartDisplay();
                this.orderNumber = this.generateOrderNumber();
            }, 2000);
            
        } catch (error) {
            console.error('Error showing receipt image:', error);
            this.showNotification('❌ Gagal menampilkan struk', 'error');
        }
    }

    downloadReceiptImage(imageData) {
        console.log('Downloading receipt image');
        
        try {
            // Buat link download untuk gambar struk
            const link = document.createElement('a');
            link.download = `struk-${this.orderNumber}.png`;
            link.href = imageData;
            link.click();
            
            this.showNotification('✅ Struk berhasil diunduh!', 'success');
            
        } catch (error) {
            console.error('Error downloading receipt image:', error);
            this.showNotification('❌ Gagal mengunduh struk', 'error');
        }
    }

    saveOrderToLocal(customerName, tableNumber) {
        console.log('Saving order to local storage');
        
        try {
            const orderData = {
                order_number: this.orderNumber,
                customer_name: customerName,
                table_number: tableNumber,
                items: [...this.cart],
                total_price: this.getTotalPrice(),
                order_time: new Date().toISOString()
            };
            
            const existingOrders = JSON.parse(localStorage.getItem('warkopOrders')) || [];
            existingOrders.push(orderData);
            localStorage.setItem('warkopOrders', JSON.stringify(existingOrders));
            
            return orderData;
            
        } catch (error) {
            console.error('Error saving order to local storage:', error);
            return null;
        }
    }

    saveCart() {
        console.log('Saving cart to local storage');
        
        try {
            localStorage.setItem('warkopCart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to local storage:', error);
        }
    }

    showNotification(message, type = 'info') {
        console.log(`Showing notification: ${message} (${type})`);
        
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) {
            console.warn('Notification area not found');
            return;
        }
        
        try {
            const toast = document.createElement('div');
            toast.className = `toast-notification ${type}`;
            toast.innerHTML = message;
            
            notificationArea.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            const hideTime = this.isMobile ? 4000 : 5000;
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (notificationArea.contains(toast)) {
                        notificationArea.removeChild(toast);
                    }
                }, 300);
            }, hideTime);
            
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
}

// Initialize cart system hanya jika di halaman menu
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Cart System');
    
    // Cek apakah kita di halaman menu dengan melihat adanya elemen cart
    const cartPanel = document.querySelector('.cart-panel');
    const menuItems = document.querySelectorAll('.menu-order-btn');
    
    console.log('Cart panel found:', !!cartPanel);
    console.log('Menu items found:', menuItems.length);
    
    if (cartPanel && menuItems.length > 0) {
        console.log('Initializing CartSystem on menu page');
        
        // Prevent zoom on input focus for mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            document.addEventListener('focus', function(event) {
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                    window.setTimeout(function() {
                        event.target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 100);
                }
            }, true);
        }

        // Initialize cart system dengan error handling
        try {
            window.cartSystem = new CartSystem();
            console.log('CartSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing CartSystem:', error);
            // Fallback: Show error message to user
            const notificationArea = document.getElementById('notification-area');
            if (notificationArea) {
                const errorToast = document.createElement('div');
                errorToast.className = 'toast-notification error';
                errorToast.innerHTML = '❌ Error memuat sistem keranjang';
                notificationArea.appendChild(errorToast);
                setTimeout(() => errorToast.classList.add('show'), 10);
            }
        }
    } else {
        console.log('Not on menu page, skipping CartSystem initialization');
    }
});

// Global error handler untuk menangkap error yang tidak tertangkap
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});