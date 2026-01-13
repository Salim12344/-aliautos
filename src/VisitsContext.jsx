import React, { createContext, useContext, useEffect, useState } from "react";
import { cars, visits, auth } from './storage';

const VisitsContext = createContext();
export const useVisits = () => useContext(VisitsContext);

export function VisitsProvider({ children }) {
  const [visitsList, setVisitsList] = useState([]);
  const [carsList, setCarsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user
  useEffect(() => {
    const user = auth.verifyToken() || auth.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    setCarsList(cars.getAll());
    const allVisits = visits.getAll();
    
    // Filter visits by current user (unless admin/front_desk who see all)
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'front_desk') {
        // Admin and front desk see all visits
        setVisitsList(allVisits);
      } else {
        // Regular users only see their own visits
        const userVisits = allVisits.filter(v => 
          v.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
          v.userId === currentUser.id
        );
        setVisitsList(userVisits);
      }
    } else {
      // Not logged in - no visits
      setVisitsList([]);
    }
  }, [currentUser]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const onStorage = (ev) => {
      if (ev.key?.startsWith('aliAutos_')) {
        setCarsList(cars.getAll());
        const allVisits = visits.getAll();
        
        // Re-check user in case it changed
        const user = auth.verifyToken() || auth.getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          if (user.role === 'admin' || user.role === 'front_desk') {
            setVisitsList(allVisits);
          } else {
            const userVisits = allVisits.filter(v => 
              v.userEmail?.toLowerCase() === user.email?.toLowerCase() ||
              v.userId === user.id
            );
            setVisitsList(userVisits);
          }
        } else {
          setVisitsList([]);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const onAuthTokenChanged = () => {
      const user = auth.verifyToken() || auth.getCurrentUser();
      setCurrentUser(user);
    };
    window.addEventListener('auth_token_changed', onAuthTokenChanged);
    return () => window.removeEventListener('auth_token_changed', onAuthTokenChanged);
  }, []);

  const scheduleVisit = (form, car) => {
    // Get current user to associate visit with them
    const user = auth.verifyToken() || auth.getCurrentUser();
    if (!user) {
      throw new Error('Must be logged in to schedule a visit');
    }

    const newVisit = visits.create({
      carId: car?.id ?? null,
      carName: car ? `${car.make} ${car.model} ${car.year}` : form.carName || "General Visit",
      ...form,
      date: form.visitDate || form.date || '',
      time: form.visitTime || form.time || '',
      visitDate: form.visitDate || form.date || '',
      visitTime: form.visitTime || form.time || '',
      userEmail: user.email, // Always use logged-in user's email
      userId: user.id, // Store user ID for filtering
    });
    
    // Update visits list with filtering
    const allVisits = visits.getAll();
    if (user.role === 'admin' || user.role === 'front_desk') {
      setVisitsList(allVisits);
    } else {
      const userVisits = allVisits.filter(v => 
        v.userEmail?.toLowerCase() === user.email?.toLowerCase() ||
        v.userId === user.id
      );
      setVisitsList(userVisits);
    }
    return newVisit;
  };

  const cancelVisit = (id) => {
    visits.update(id, { status: "cancelled" });
    
    // Refresh visits list with filtering
    const allVisits = visits.getAll();
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'front_desk') {
        setVisitsList(allVisits);
      } else {
        const userVisits = allVisits.filter(v => 
          v.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
          v.userId === currentUser.id
        );
        setVisitsList(userVisits);
      }
    }
  };

  const markCompleted = (id) => {
    visits.update(id, { status: "completed" });
    
    // Refresh visits list with filtering
    const allVisits = visits.getAll();
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'front_desk') {
        setVisitsList(allVisits);
      } else {
        const userVisits = allVisits.filter(v => 
          v.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
          v.userId === currentUser.id
        );
        setVisitsList(userVisits);
      }
    }
  };

  // Car management (admin)
  const addCar = (carData) => {
    const newCar = cars.create(carData);
    setCarsList(cars.getAll());
    return newCar;
  };

  const deleteCar = (id) => {
    cars.delete(id);
    setCarsList(cars.getAll());
  };

  return (
    <VisitsContext.Provider value={{ 
      visits: visitsList, 
      cars: carsList,
      scheduleVisit, 
      cancelVisit, 
      markCompleted, 
      addCar, 
      deleteCar 
    }}>
      {children}
    </VisitsContext.Provider>
  );
}
