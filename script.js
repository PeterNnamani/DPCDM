const PAYSTACK_PUBLIC_KEY = 'PASTE_YOUR_PAYSTACK_PUBLIC_KEY_HERE';

const yearNode = document.getElementById('year');
if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
}

const amountButtons = document.querySelectorAll('.amount');
const donateButton = document.querySelector('.donate-btn');
const modal = document.getElementById('paystackModal');
const donationForm = document.getElementById('donationForm');
const amountInput = document.getElementById('donationAmount');
const currencyInput = document.getElementById('currencyCode');
const cancelDonation = document.getElementById('cancelDonation');
const closeModalButton = document.querySelector('.close-modal');

function setModalState(isOpen) {
    if (!modal) return;
    modal.classList.toggle('active', isOpen);
    modal.inert = !isOpen;
    modal.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function getSelectedAmount() {
    const selected = document.querySelector('.amount.selected');
    return selected ? Number(selected.dataset.amount) : 20;
}

function openDonationModal() {
    if (!modal) return;
    const selectedAmount = getSelectedAmount();
    if (amountInput) amountInput.value = selectedAmount;
    if (currencyInput) currencyInput.value = currencyInput.value || 'USD';
    setModalState(true);
}

function closeDonationModal() {
    setModalState(false);
}

amountButtons.forEach((button) => {
    button.addEventListener('click', () => {
        amountButtons.forEach((btn) => btn.classList.remove('selected'));
        button.classList.add('selected');
        const value = Number(button.dataset.amount || 20);
        if (amountInput) amountInput.value = value;
    });
});

if (donateButton) {
    donateButton.addEventListener('click', openDonationModal);
}

if (cancelDonation) {
    cancelDonation.addEventListener('click', closeDonationModal);
}

if (closeModalButton) {
    closeModalButton.addEventListener('click', closeDonationModal);
}

if (modal) {
    modal.addEventListener('click', (event) => {
        if (event.target && event.target.dataset.closeModal === 'true') {
            closeDonationModal();
        }
    });
}

if (donationForm) {
    donationForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email')?.value.trim();
        const firstName = document.getElementById('firstName')?.value.trim() || '';
        const lastName = document.getElementById('lastName')?.value.trim() || '';
        const amount = Number(amountInput?.value || 0);
        const currency = (currencyInput?.value || 'USD').toUpperCase();

        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!amount || amount <= 0) {
            alert('Please select a valid donation amount greater than 0.');
            return;
        }

        if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'PASTE_YOUR_PAYSTACK_PUBLIC_KEY_HERE' || !PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
            alert('Please paste a valid Paystack public key starting with pk_ in script.js before testing the payment flow.');
            return;
        }

        if (!window.PaystackPop) {
            alert('Paystack script did not load. Please refresh the page and try again.');
            return;
        }

        closeDonationModal();

        const payment = window.PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email,
            amount: Math.round(amount * 100),
            currency,
            ref: `DPCDM_${Date.now()}`,
            firstname: firstName,
            lastname: lastName,
            metadata: {
                custom_fields: [
                    {
                        display_name: 'Ministry',
                        variable_name: 'ministry',
                        value: 'Divine Power of Christ Deliverance Ministry'
                    },
                    {
                        display_name: 'Project',
                        variable_name: 'project',
                        value: 'Orphanage Donation'
                    }
                ]
            },
            callback: function (response) {
                alert(`Payment successful! Reference: ${response.reference}`);
            },
            onClose: function () {
                alert('Donation window closed. No charge was made.');
            }
        });

        payment.openIframe();
    });
}

if (amountInput) {
    amountInput.value = getSelectedAmount();
}

if (currencyInput) {
    currencyInput.value = 'USD';
}
