import { useState, useEffect } from "react";
import { useVisits } from "./VisitsContext.jsx";
import { contactMessages } from "./storage";
import { FaTimes, FaRegCommentDots } from "react-icons/fa";
import "./FrontDeskPage.css";

export default function FrontDeskPage() {
  const { visits, cars, markCompleted } = useVisits();
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [carDetails, setCarDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("visits"); // "visits" or "messages"

  useEffect(() => {
    // Build car details map
    const map = {};
    cars.forEach(c => { if (c.id) map[c.id] = c; });
    setCarDetails(map);
    
    // Load contact messages, sorted by date (newest first)
    const allMessages = contactMessages.getAll();
    const sortedMessages = allMessages.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Newest first
    });
    setMessages(sortedMessages);
  }, [cars]);

  // Listen for new contact messages
  useEffect(() => {
    const onStorage = (ev) => {
      if (ev.key === 'aliAutos_contact_messages') {
        const allMessages = contactMessages.getAll();
        const sortedMessages = allMessages.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });
        setMessages(sortedMessages);
      }
    };
    window.addEventListener('storage', onStorage);
    // Also check periodically for same-tab updates
    const interval = setInterval(() => {
      const allMessages = contactMessages.getAll();
      const sortedMessages = allMessages.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      setMessages(sortedMessages);
    }, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const handleSelectVisit = (visit) => {
    setSelectedVisit(visit);
    setSelectedMessage(null);
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setSelectedVisit(null);
    // Mark as read when viewed
    if (!message.read) {
      contactMessages.markAsRead(message.id);
      const allMessages = contactMessages.getAll();
      const sortedMessages = allMessages.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      setMessages(sortedMessages);
    }
  };

  const handleCloseDetails = () => {
    setSelectedVisit(null);
    setSelectedMessage(null);
  };

  const handleMarkCompleted = (visitId) => {
    if (window.confirm('Are you sure you want to mark this visit as completed?')) {
      markCompleted(visitId);
      // Update the selected visit status immediately
      setSelectedVisit({ ...selectedVisit, status: 'completed' });
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="front-desk-page">
      <h1>Front Desk - Management</h1>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => { setActiveTab('visits'); setSelectedVisit(null); setSelectedMessage(null); }}
        >
          Visits ({visits.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => { setActiveTab('messages'); setSelectedVisit(null); setSelectedMessage(null); }}
        >
          Contact Messages ({messages.length}) {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      </div>

      <div className="visits-container">
        {activeTab === 'visits' && (
          <div className="visits-list">
            <h2>All Visits ({visits.length})</h2>
            {visits.length === 0 ? (
              <p>No visits scheduled yet</p>
            ) : (
              <div className="visits-scroll">
                {visits.map(visit => (
                  <div
                    key={visit.id}
                    className={`visit-item ${selectedVisit?.id === visit.id ? "active" : ""}`}
                    onClick={() => handleSelectVisit(visit)}
                  >
                    <p className="visit-date">{visit.visitDate} @ {visit.visitTime}</p>
                    <p className="visit-user">{visit.userEmail || visit.email || 'N/A'}</p>
                    <p className="visit-status">{visit.status}</p>
                    {visit.message && (
                      <div className="visit-message-preview" title={visit.message}>
                        <FaRegCommentDots style={{ marginRight: '5px' }} />
                        <i>{visit.message.length > 50 ? visit.message.substring(0, 50) + '...' : visit.message}</i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="visits-list">
            <h2>Contact Messages ({messages.length})</h2>
            {messages.length === 0 ? (
              <p>No contact messages yet</p>
            ) : (
              <div className="visits-scroll">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`visit-item ${selectedMessage?.id === message.id ? "active" : ""} ${!message.read ? "unread" : ""}`}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <p className="visit-date">{new Date(message.createdAt).toLocaleString()}</p>
                    <p className="visit-user">{message.name} - {message.email}</p>
                    <p className="visit-status">{message.read ? 'Read' : 'Unread'}</p>
                    {message.message && (
                      <div className="visit-message-preview" title={message.message}>
                        <FaRegCommentDots style={{ marginRight: '5px' }} />
                        <i>{message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message}</i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedVisit && (
          <div className="visit-details">
            <button className="close-btn" onClick={handleCloseDetails}><FaTimes /></button>
            <h2>Visit Details</h2>
            
            <div className="detail-section">
              <h3>Visit Information</h3>
              <p><strong>Date:</strong> {selectedVisit.date || selectedVisit.visitDate || 'N/A'}</p>
              <p><strong>Time:</strong> {selectedVisit.time || selectedVisit.visitTime || 'N/A'}</p>
              <p><strong>Status:</strong> <span className={`status-${selectedVisit.status}`}>{selectedVisit.status}</span></p>
              <p><strong>Scheduled On:</strong> {selectedVisit.createdAt ? new Date(selectedVisit.createdAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> {selectedVisit.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedVisit.email || selectedVisit.userEmail || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedVisit.phone || 'N/A'}</p>
            </div>

            {selectedVisit.message && (
              <div className="detail-section">
                <h3>Customer Message</h3>
                <p>{selectedVisit.message}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Car Information</h3>
              <p><strong>Car:</strong> {selectedVisit.carName || 'General Visit'}</p>
              {selectedVisit.carId && <p><strong>Car ID:</strong> {selectedVisit.carId}</p>}
            </div>

            {carDetails[selectedVisit.carId] && (
              <div className="detail-section">
                <h3>Car Details</h3>
                <p><strong>Make:</strong> {carDetails[selectedVisit.carId].make}</p>
                <p><strong>Model:</strong> {carDetails[selectedVisit.carId].model}</p>
                <p><strong>Year:</strong> {carDetails[selectedVisit.carId].year}</p>
                <p><strong>Price:</strong> ₦{carDetails[selectedVisit.carId].price?.toLocaleString('en-NG')}</p>
                <p><strong>Body:</strong> {carDetails[selectedVisit.carId].body}</p>
                <p><strong>Mileage:</strong> {carDetails[selectedVisit.carId].mileage}</p>
              </div>
            )}

            {selectedVisit.status === 'scheduled' && (
              <div className="detail-section">
                <button 
                  className="btn-mark-completed" 
                  onClick={() => handleMarkCompleted(selectedVisit.id)}
                >
                  Mark as Completed
                </button>
              </div>
            )}
          </div>
        )}

        {selectedMessage && (
          <div className="visit-details">
            <button className="close-btn" onClick={handleCloseDetails}><FaTimes /></button>
            <h2>Contact Message</h2>
            
            <div className="detail-section">
              <h3>Message Information</h3>
              <p><strong>Received:</strong> {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Status:</strong> <span className={selectedMessage.read ? 'status-read' : 'status-unread'}>{selectedMessage.read ? 'Read' : 'Unread'}</span></p>
            </div>

            <div className="detail-section">
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> {selectedMessage.name || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedMessage.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedMessage.phone || 'N/A'}</p>
            </div>

            <div className="detail-section">
              <h3>Message</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.message || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
