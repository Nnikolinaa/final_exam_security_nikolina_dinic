import { createRouter, createWebHistory } from 'vue-router';
import { AuthService } from '@/services/authService'; // Import AuthService
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue';
import FleetView from '@/views/FleetView.vue';
import CarDetailsView from '@/views/CarDetailsView.vue';
import MyProfileView from '@/views/MyProfileView.vue';
import SignUpView from '@/views/SignUpView.vue';
import PaymentView from '@/views/PaymentView.vue'; // Import PaymentView

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login', // Redirect root path to login
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: {
        title: 'Signup'
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/fleet',
      name: 'fleet',
      component: FleetView,
      meta: { requiresAuth: true },
    },
    {
      path: '/car/:id',
      name: 'car-details',
      component: CarDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: MyProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/payment/:rentalId',
      name: 'payment',
      component: PaymentView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/about',
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to the top of the page
    return { top: 0 };
  },
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.hasAuth(); // Use AuthService to check authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' }); // Redirect to login if not authenticated
  } else {
    next();
  }
});

export default router;