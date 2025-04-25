<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MainService } from '@/services/mainService';

interface RentalDetails {
  rentalId: number;
  userId: number;
  vehicleName: string;
  totalPrice: number;
}

const route = useRoute();
const router = useRouter();
const rentalId = route.params.rentalId as string;
const rentalDetails = ref<RentalDetails | null>(null);

const paymentDetails = ref({
  paymentMethod: 'credit_card',
  cardNumber: '',
  cardHolder: '',
  expirationDate: '',
  cvv: '',
  paypalEmail: '',
  bankAccountNumber: '',
  bankRoutingNumber: '',
  bankName: '',
  transcationId: '',
});

const fetchRentalDetails = async () => {
  try {
    const response = await MainService.useAxios<RentalDetails>(`/rentals/${rentalId}`);
    rentalDetails.value = response.data;
  } catch (error) {
    console.error('Failed to fetch rental details:', error);
    alert('Failed to load rental details. Please try again.');
  }
};

const confirmPayment = async () => {
  if (!rentalDetails.value) {
    alert('No rental details available.');
    return;
  }

  // Validate fields based on payment method
  if (paymentDetails.value.paymentMethod === 'credit_card' || paymentDetails.value.paymentMethod === 'debit_card') {
    if (!paymentDetails.value.cardNumber || !paymentDetails.value.cardHolder || !paymentDetails.value.expirationDate || !paymentDetails.value.cvv) {
      alert('Please fill in all card details.');
      return;
    }
  } else if (paymentDetails.value.paymentMethod === 'paypal') {
    if (!paymentDetails.value.paypalEmail) {
      alert('Please provide your PayPal email.');
      return;
    }
  } else if (paymentDetails.value.paymentMethod === 'bank_transfer') {
    if (!paymentDetails.value.bankAccountNumber || !paymentDetails.value.bankRoutingNumber || !paymentDetails.value.bankName) {
      alert('Please fill in all bank transfer details.');
      return;
    }
  }

  try {
    const paymentData = {
      rentalId: rentalDetails.value.rentalId,
      userId: rentalDetails.value.userId,
      amount: rentalDetails.value.totalPrice,
      ...paymentDetails.value,
      transactionId: paymentDetails.value.transcationId || `MOCK-${Date.now()}`,
    };

    await MainService.useAxios('/payments/mock', 'post', paymentData);
    alert('Payment confirmed successfully.');
    router.push({ name: 'profile' }); // Navigate to MyProfileView
  } catch (error) {
    console.error('Failed to confirm payment:', error);
    alert('Failed to confirm payment. Please try again.');
  }
};

onMounted(fetchRentalDetails);
</script>

<template>
  <div class="payment-container">
    <div class="modal-content">
      <h2>Confirm Payment</h2>
      <p><strong>Vehicle:</strong> {{ rentalDetails?.vehicleName }}</p>
      <p><strong>Total Amount:</strong> ${{ rentalDetails?.totalPrice }}</p>

      <label for="paymentMethod">Payment Method</label>
      <select id="paymentMethod" v-model="paymentDetails.paymentMethod">
        <option value="credit_card">Credit Card</option>
        <option value="debit_card">Debit Card</option>
        <option value="paypal">PayPal</option>
        <option value="bank_transfer">Bank Transfer</option>
      </select>

      <!-- Credit/Debit Card Fields -->
      <div v-if="paymentDetails.paymentMethod === 'credit_card' || paymentDetails.paymentMethod === 'debit_card'" class="card-details">
        <label for="cardHolder">Card Holder Name</label>
        <input
          id="cardHolder"
          type="text"
          v-model="paymentDetails.cardHolder"
          placeholder="Enter card holder name"
        />

        <label for="cardNumber">Card Number</label>
        <input
          id="cardNumber"
          type="text"
          v-model="paymentDetails.cardNumber"
          placeholder="Enter card number"
        />

        <div class="card-info">
          <div>
            <label for="expirationDate">Expiration Date</label>
            <input
              id="expirationDate"
              type="text"
              v-model="paymentDetails.expirationDate"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label for="cvv">CVV</label>
            <input
              id="cvv"
              type="text"
              v-model="paymentDetails.cvv"
              placeholder="CVV"
            />
          </div>
        </div>
      </div>

      <!-- PayPal Fields -->
      <div v-if="paymentDetails.paymentMethod === 'paypal'" class="paypal-details">
        <label for="paypalEmail">PayPal Email</label>
        <input
          id="paypalEmail"
          type="email"
          v-model="paymentDetails.paypalEmail"
          placeholder="Enter your PayPal email"
        />
      </div>

      <!-- Bank Transfer Fields -->
      <div v-if="paymentDetails.paymentMethod === 'bank_transfer'" class="bank-details">
        <label for="bankName">Bank Name</label>
        <input
          id="bankName"
          type="text"
          v-model="paymentDetails.bankName"
          placeholder="Enter bank name"
        />

        <label for="accountNumber">Account Number</label>
        <input
          id="accountNumber"
          type="text"
          v-model="paymentDetails.bankAccountNumber"
          placeholder="Enter account number"
        />

        <label for="routingNumber">Routing Number</label>
        <input
          id="routingNumber"
          type="text"
          v-model="paymentDetails.bankRoutingNumber"
          placeholder="Enter routing number"
        />
      </div>

      <label for="transactionId">Transaction ID (Optional)</label>
      <input
        id="transactionId"
        type="text"
        v-model="paymentDetails.transcationId"
        placeholder="Enter transaction ID"
      />

      <div class="modal-actions">
        <button class="confirm-btn" @click="confirmPayment">Pay</button>
        <router-link to="/profile" class="cancel-btn">Cancel</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
}

.modal-content {
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  text-align: center;
  color: #ffffff;
}

.modal-content h2 {
  margin-bottom: 1rem;
}

.modal-content label {
  display: block;
  margin-top: 1rem;
  text-align: left;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid #333333;
  background: #2a2a2a;
  color: #ffffff;
}

.card-details,
.paypal-details,
.bank-details {
  margin-top: 1rem;
}

.card-info {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.card-info div {
  flex: 1;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
}

.confirm-btn {
  background: #f39c12;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
}
</style>