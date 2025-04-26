<template>
  <div class="book-view">
    <div class="booking-panel">
      <h1 class="car-title">{{ car.name }}</h1>
      <div class="price-badge">{{ car.price }}</div>

      <!-- Availability Calendar -->
      <div class="availability-calendar">
        <h2>Check Availability</h2>
        <div class="mb-3">
          <label for="startDate" class="form-label">Start Date</label>
          <input
            type="date"
            id="startDate"
            class="form-control"
            v-model="startDate"
            :min="new Date().toISOString().split('T')[0]"
            :class="{ 'is-invalid': startDate && isDateUnavailable(startDate) }"
            @input="highlightUnavailableDates($event)"
          />
          <div class="invalid-feedback">This date is unavailable.</div>
        </div>
        <div class="mb-3">
          <label for="endDate" class="form-label">End Date</label>
          <input
            type="date"
            id="endDate"
            class="form-control"
            v-model="endDate"
            :min="startDate || new Date().toISOString().split('T')[0]"
            :class="{ 'is-invalid': endDate && isDateUnavailable(endDate) }"
            @input="highlightUnavailableDates($event)"
          />
          <div class="invalid-feedback">This date is unavailable.</div>
        </div>
        <div v-if="totalPrice > 0" class="total-price">
          <strong>Total Price:</strong> ${{ totalPrice }}
        </div>
      </div>

      <button
        class="book-now-btn"
        :disabled="!startDate || !endDate || isDateUnavailable(startDate) || isDateUnavailable(endDate)"
        @click="confirmBooking"
      >
        <i class="fas fa-calendar-check"></i> Book
      </button>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { MainService } from '@/services/mainService';
// Accept the `car` prop
const props = defineProps({
  car: {
    type: Object,
    required: true,
  },
});

// Emit a `close` event
defineEmits(['close']);

const startDate = ref('');
const endDate = ref('');

// Check if a date is unavailable
const isDateUnavailable = (date: string) => {
  return props.car?.unavailableDates?.includes(date) || false;
};

// Highlight unavailable dates in the input field
const highlightUnavailableDates = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const date = input.value;
  if (isDateUnavailable(date)) {
    input.classList.add('unavailable-date');
  } else {
    input.classList.remove('unavailable-date');
  }
};

// Calculate the total price based on the selected dates
const totalPrice = computed(() => {
  if (!startDate.value || !endDate.value) return 0;

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000  60  60 * 24)) + 1;

  return days > 0 ? days * parseInt(props.car.price.replace(/[^0-9]/g, '') || '0') : 0;
});

// Confirm the booking
const confirmBooking = async () => {
  if (!startDate.value || !endDate.value || isDateUnavailable(startDate.value) || isDateUnavailable(endDate.value)) {
    alert('Please select valid dates.');
    return;
  }

  try {
    const bookingData = {
      userId: parseInt(localStorage.getItem('userId') || '0'), // Retrieve user ID from localStorage
      vehicleId: props.car.vehicleId, // ID of the car being booked
      startDate: startDate.value, // Selected start date
      endDate: endDate.value, // Selected end date
      totalPrice: totalPrice.value, // Calculated total price
    };

    // Send booking data to the backend
    await MainService.useAxios('/rentals', 'post', bookingData);

    alert('Akmost done! Confirm booking in your profile.');
    
  } catch (error) {
    console.error('Error booking vehicle:', error);
    alert('Failed to book the vehicle. Please try again.');
  }
};
</script>

<style scoped>
.book-view {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #1e1e1e; / Dark background color /
  color: #ffffff; / Light text color /
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5); / Subtle shadow for depth /
  z-index: 1000;
}

.booking-panel {
  text-align: center;
}

.price-badge {
  background: #333333; / Darker badge background /
  color: #ffffff; / Light text color /
  padding: 5px 10px;
  border-radius: 5px;
  display: inline-block;
  margin-bottom: 20px;
}

.availability-calendar label {
  color: #ffffff; / Light label text /
}

.form-control {
  background: #2c2c2c; / Dark input background /
  color: #ffffff; / Light input text /
  border: 1px solid #444444; / Subtle border /
  border-radius: 5px;
  padding: 10px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff; / Highlight border on focus /
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); / Subtle glow /
}

.invalid-feedback {
  color: #ff6b6b; / Red for invalid feedback /
}

.book-now-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #007bff; / Primary button color /
  color: #ffffff; / Light text /
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.book-now-btn:hover {
  background: #0056b3; / Darker blue on hover /
}

.book-now-btn:disabled {
  background: #444444; / Disabled button background /
  color: #888888; / Disabled button text /
  cursor: not-allowed;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  background: #444444; / Secondary button background /
  color: #ffffff; / Light text /
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #555555; / Slightly lighter on hover /
}
</style>
