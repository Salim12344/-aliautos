// Unified local storage manager - everything stored in localStorage
// No server needed, everything works locally

const STORAGE_PREFIX = 'aliAutos_';
const KEYS = {
  USERS: STORAGE_PREFIX + 'users',
  CARS: STORAGE_PREFIX + 'cars',
  VISITS: STORAGE_PREFIX + 'visits',
  CONTACT_MESSAGES: STORAGE_PREFIX + 'contact_messages',
  AUTH_TOKEN: STORAGE_PREFIX + 'auth_token',
  CURRENT_USER: STORAGE_PREFIX + 'current_user',
};

// Initialize with default data if needed
function initStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    // Seed admin user
    const adminUser = {
      id: 'admin-1',
      email: 'admin@ali-autos.com',
      password: 'admin123',
      display_name: 'Admin',
      role: 'admin',
      created_at: Date.now(),
    };
    localStorage.setItem(KEYS.USERS, JSON.stringify([adminUser]));
  }

  if (!localStorage.getItem(KEYS.CARS)) {
    // Seed sample cars
    const sampleCars = [
      {
        id: 'gwagon-2022',
        make: 'Mercedes-Benz',
        model: 'G-Wagon G63',
        year: 2022,
        price: 180000000,
        body: 'SUV',
        mileage: '5,000 km',
        location: 'Lekki Branch',
        shortDescription: 'Ultimate luxury and performance.',
        description: [
          'V8 Biturbo engine.',
          'Nappa leather interior.',
          'Brand new condition.',
        ],
        imageUrl: '/images/cars/Gwagon.webp',
      },
      {
        id: 'rangerover-2021',
        make: 'Land Rover',
        model: 'Range Rover Sport',
        year: 2021,
        price: 85000000,
        body: 'SUV',
        mileage: '12,000 km',
        location: 'Ikeja Showroom',
        shortDescription: 'Sporty dynamics and refined luxury.',
        description: [
          'Panoramic roof.',
          'Meridian sound system.',
          'Fully serviced.',
        ],
        imageUrl: '/images/cars/Rangerover.webp',
      },
      {
        id: 'lambo-urus-2023',
        make: 'Lamborghini',
        model: 'Urus',
        year: 2023,
        price: 350000000,
        body: 'SUV',
        mileage: '1,500 km',
        location: 'Lekki Branch',
        shortDescription: 'The world\'s first Super SUV.',
        description: [
          'Imported directly from Italy.',
          'Full option specs.',
          'Zero flaws.',
        ],
        imageUrl: '/images/cars/Lambo.webp',
      },
      {
        id: 'bmw-x6-2020',
        make: 'BMW',
        model: 'X6 M',
        year: 2020,
        price: 65000000,
        body: 'SUV',
        mileage: '25,000 km',
        location: 'Victoria Island',
        shortDescription: 'Powerful sports activity coupe.',
        description: [
          'M-Sport package.',
          'Heads-up display.',
          'Single owner.',
        ],
        imageUrl: '/images/cars/BMW.webp',
      },
      {
        id: 'audi-q8-2021',
        make: 'Audi',
        model: 'Q8',
        year: 2021,
        price: 55000000,
        body: 'SUV',
        mileage: '18,000 km',
        location: 'Lagos Mainland',
        shortDescription: 'Sophisticated design and technology.',
        description: [
          'Quattro all-wheel drive.',
          'Virtual cockpit.',
          'Ambient lighting.',
        ],
        imageUrl: '/images/cars/Audi.webp',
      },
      {
        id: 'benz-eclass-2020',
        make: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2020,
        price: 38000000,
        body: 'Sedan',
        mileage: '30,000 km',
        location: 'Ikeja Showroom',
        shortDescription: 'Intelligence driven luxury.',
        description: [
          'AMG Line.',
          'Driver assistance package.',
          'Immaculate interior.',
        ],
        imageUrl: '/images/cars/eclass.webp',
      },
      {
        id: 'benz-c300-2019',
        make: 'Mercedes-Benz',
        model: 'C300',
        year: 2019,
        price: 26000000,
        body: 'Sedan',
        mileage: '40,000 km',
        location: 'Lekki Branch',
        shortDescription: 'Compact executive sedan.',
        description: [
          'Burmester audio.',
          'Keyless Go.',
        ],
        imageUrl: '/images/cars/benz2.webp',
      },
      {
        id: 'benz-gle-2018',
        make: 'Mercedes-Benz',
        model: 'GLE 450',
        year: 2018,
        price: 32000000,
        body: 'SUV',
        mileage: '55,000 km',
        location: 'Lagos Mainland',
        shortDescription: 'Spacious and safe family SUV.',
        description: [
          'Third row seating.',
          '4MATIC.',
        ],
        imageUrl: '/images/cars/benz3.webp',
      },
      {
        id: 'benz-cla-2021',
        make: 'Mercedes-Benz',
        model: 'CLA 250',
        year: 2021,
        price: 29000000,
        body: 'Coupe',
        mileage: '15,000 km',
        location: 'Victoria Island',
        shortDescription: 'Style icon with latest tech.',
        description: [
          'MBUX infotainment.',
          'Panoramic sunroof.',
        ],
        imageUrl: '/images/cars/benz1.jpg',
      },
    ];
    localStorage.setItem(KEYS.CARS, JSON.stringify(sampleCars));
  }

  if (!localStorage.getItem(KEYS.VISITS)) {
    localStorage.setItem(KEYS.VISITS, JSON.stringify([]));
  }
}

// Users
export const users = {
  getAll: () => {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  findByEmail: (email) => {
    const allUsers = users.getAll();
    return allUsers.find((u) => u.email?.toLowerCase() === email?.toLowerCase()) || null;
  },
  findById: (id) => {
    const allUsers = users.getAll();
    return allUsers.find((u) => u.id === id) || null;
  },
  create: (userData) => {
    const allUsers = users.getAll();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      created_at: Date.now(),
    };
    allUsers.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(allUsers));
    return newUser;
  },
  update: (id, updates) => {
    const allUsers = users.getAll();
    const index = allUsers.findIndex((u) => u.id === id);
    if (index >= 0) {
      allUsers[index] = { ...allUsers[index], ...updates };
      localStorage.setItem(KEYS.USERS, JSON.stringify(allUsers));
      return allUsers[index];
    }
    return null;
  },
  delete: (id) => {
    const allUsers = users.getAll();
    const filtered = allUsers.filter((u) => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(filtered));
  },
};

// Cars
export const cars = {
  getAll: () => {
    try {
      const data = localStorage.getItem(KEYS.CARS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  findById: (id) => {
    const allCars = cars.getAll();
    return allCars.find((c) => c.id === id) || null;
  },
  create: (carData) => {
    const allCars = cars.getAll();
    const newCar = {
      id: carData.id || Date.now().toString(),
      ...carData,
    };
    allCars.push(newCar);
    try {
      localStorage.setItem(KEYS.CARS, JSON.stringify(allCars));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        throw new Error('Storage quota exceeded. Please delete some cars or use smaller images. Images are automatically compressed, but you may have too many cars stored.');
      }
      throw error;
    }
    return newCar;
  },
  update: (id, updates) => {
    const allCars = cars.getAll();
    const index = allCars.findIndex((c) => c.id === id);
    if (index >= 0) {
      allCars[index] = { ...allCars[index], ...updates };
      try {
        localStorage.setItem(KEYS.CARS, JSON.stringify(allCars));
      } catch (error) {
        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please delete some cars or use smaller images.');
        }
        throw error;
      }
      return allCars[index];
    }
    return null;
  },
  delete: (id) => {
    const allCars = cars.getAll();
    const filtered = allCars.filter((c) => c.id !== id);
    localStorage.setItem(KEYS.CARS, JSON.stringify(filtered));
  },
};

// Visits
export const visits = {
  getAll: () => {
    try {
      const data = localStorage.getItem(KEYS.VISITS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  findById: (id) => {
    const allVisits = visits.getAll();
    return allVisits.find((v) => v.id === id) || null;
  },
  create: (visitData) => {
    const allVisits = visits.getAll();
    const newVisit = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      ...visitData,
    };
    allVisits.push(newVisit);
    localStorage.setItem(KEYS.VISITS, JSON.stringify(allVisits));
    return newVisit;
  },
  update: (id, updates) => {
    const allVisits = visits.getAll();
    const index = allVisits.findIndex((v) => v.id === id);
    if (index >= 0) {
      allVisits[index] = { ...allVisits[index], ...updates };
      localStorage.setItem(KEYS.VISITS, JSON.stringify(allVisits));
      return allVisits[index];
    }
    return null;
  },
  delete: (id) => {
    const allVisits = visits.getAll();
    const filtered = allVisits.filter((v) => v.id !== id);
    localStorage.setItem(KEYS.VISITS, JSON.stringify(filtered));
  },
};

// Contact Messages
export const contactMessages = {
  getAll: () => {
    try {
      const data = localStorage.getItem(KEYS.CONTACT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  findById: (id) => {
    const allMessages = contactMessages.getAll();
    return allMessages.find((m) => m.id === id) || null;
  },
  create: (messageData) => {
    const allMessages = contactMessages.getAll();
    const newMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
      ...messageData,
    };
    allMessages.push(newMessage);
    localStorage.setItem(KEYS.CONTACT_MESSAGES, JSON.stringify(allMessages));
    return newMessage;
  },
  update: (id, updates) => {
    const allMessages = contactMessages.getAll();
    const index = allMessages.findIndex((m) => m.id === id);
    if (index >= 0) {
      allMessages[index] = { ...allMessages[index], ...updates };
      localStorage.setItem(KEYS.CONTACT_MESSAGES, JSON.stringify(allMessages));
      return allMessages[index];
    }
    return null;
  },
  delete: (id) => {
    const allMessages = contactMessages.getAll();
    const filtered = allMessages.filter((m) => m.id !== id);
    localStorage.setItem(KEYS.CONTACT_MESSAGES, JSON.stringify(filtered));
  },
  markAsRead: (id) => {
    return contactMessages.update(id, { read: true });
  },
};

// Auth
export const auth = {
  getToken: () => {
    try {
      return localStorage.getItem(KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      localStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.warn('Failed to save token:', e);
    }
  },
  removeToken: () => {
    try {
      localStorage.removeItem(KEYS.AUTH_TOKEN);
      localStorage.removeItem(KEYS.CURRENT_USER);
    } catch (e) {
      console.warn('Failed to remove token:', e);
    }
  },
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setCurrentUser: (user) => {
    try {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user:', e);
    }
  },
  login: (email, password) => {
    const user = users.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    // Support both password and password_hash for backward compatibility
    const storedPassword = user.password || user.password_hash || '';
    if (password !== storedPassword) {
      throw new Error('Invalid credentials');
    }
    // Create simple token (just user ID for local storage)
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    auth.setToken(token);
    auth.setCurrentUser({ id: user.id, email: user.email, displayName: user.display_name, role: user.role });
    return { token, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } };
  },
  register: (email, password, displayName) => {
    const existing = users.findByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }
    const newUser = users.create({
      email: email.toLowerCase(),
      password,
      display_name: displayName || '',
      role: 'user',
    });
    // Auto-login after registration
    return auth.login(email, password);
  },
  logout: () => {
    auth.removeToken();
  },
  verifyToken: () => {
    const token = auth.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token));
      const user = users.findById(payload.id);
      if (!user) return null;
      return { id: user.id, email: user.email, displayName: user.display_name, role: user.role };
    } catch {
      return null;
    }
  },
};

// Initialize on first load
if (typeof window !== 'undefined') {
  initStorage();
}

export default { users, cars, visits, contactMessages, auth, initStorage };

